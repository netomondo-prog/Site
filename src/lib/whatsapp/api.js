'use strict';

/**
 * Cliente da WhatsApp Cloud API (API oficial da Meta, via Graph API).
 * Documentação: https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * Sem WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID (ou com WHATSAPP_DRY_RUN=true)
 * o cliente funciona em "modo simulação": nenhuma chamada é feita à Meta e as
 * respostas são fictícias. Útil para montar listas, kits e testar campanhas
 * enquanto o número ainda não foi cadastrado.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function config() {
  const env = process.env;
  const token = env.WHATSAPP_TOKEN || '';
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID || '';
  return {
    token,
    phoneNumberId,
    businessAccountId: env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    appSecret: env.WHATSAPP_APP_SECRET || '',
    verifyToken: env.WHATSAPP_VERIFY_TOKEN || '',
    version: env.WHATSAPP_API_VERSION || 'v23.0',
    rate: Math.max(1, Number(env.WHATSAPP_RATE_PER_SECOND) || 10),
    dryRun: env.WHATSAPP_DRY_RUN === 'true' || !token || !phoneNumberId,
  };
}

class WhatsAppError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = 'WhatsAppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function graph(method, endpoint, { json, form } = {}) {
  const cfg = config();
  const url = `https://graph.facebook.com/${cfg.version}/${endpoint}`;
  const headers = { Authorization: `Bearer ${cfg.token}` };
  let body;
  if (json) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (form) {
    body = form;
  }
  const res = await fetch(url, { method, headers, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const e = data.error || {};
    throw new WhatsAppError(e.error_user_msg || e.message || `HTTP ${res.status}`, {
      status: res.status,
      code: e.code,
      details: e.error_data?.details,
    });
  }
  return data;
}

let fakeSeq = 0;
function fakeId(prefix) {
  fakeSeq += 1;
  return `${prefix}.SIMULADO.${Date.now().toString(36)}${fakeSeq}`;
}

/** Envia qualquer payload de mensagem (texto, mídia, template). */
async function sendMessage(to, payload) {
  const cfg = config();
  if (cfg.dryRun) {
    return { messageId: fakeId('wamid'), waId: to, simulated: true };
  }
  const data = await graph('POST', `${cfg.phoneNumberId}/messages`, {
    json: { messaging_product: 'whatsapp', recipient_type: 'individual', to, ...payload },
  });
  return { messageId: data.messages?.[0]?.id, waId: data.contacts?.[0]?.wa_id || to };
}

function sendText(to, body) {
  return sendMessage(to, { type: 'text', text: { body, preview_url: true } });
}

function sendMedia(to, type, mediaId, caption) {
  const media = { id: mediaId };
  if (caption && type !== 'audio') media.caption = caption;
  return sendMessage(to, { type, [type]: media });
}

function sendTemplate(to, name, language, components) {
  const template = { name, language: { code: language } };
  if (components && components.length) template.components = components;
  return sendMessage(to, { type: 'template', template });
}

/** Sobe um arquivo local para a Meta e retorna o media id (válido por 30 dias). */
async function uploadMedia(filePath, mimeType) {
  const cfg = config();
  if (cfg.dryRun) return fakeId('media');
  const form = new FormData();
  form.append('messaging_product', 'whatsapp');
  form.append('type', mimeType);
  form.append('file', new Blob([fs.readFileSync(filePath)], { type: mimeType }), path.basename(filePath));
  const data = await graph('POST', `${cfg.phoneNumberId}/media`, { form });
  return data.id;
}

/** Dados do número cadastrado (nome verificado, qualidade, limite). */
async function phoneInfo() {
  const cfg = config();
  if (cfg.dryRun) return null;
  return graph(
    'GET',
    `${cfg.phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,code_verification_status,name_status,platform_type,throughput`
  );
}

/** Modelos de mensagem (templates) da conta WhatsApp Business. */
async function listTemplates() {
  const cfg = config();
  if (cfg.dryRun || !cfg.businessAccountId) return [];
  const data = await graph(
    'GET',
    `${cfg.businessAccountId}/message_templates?fields=name,language,status,category,components&limit=200`
  );
  return data.data || [];
}

/** Confere a assinatura X-Hub-Signature-256 enviada pela Meta no webhook. */
function verifySignature(rawBody, header) {
  const { appSecret } = config();
  if (!appSecret) return true; // sem segredo configurado não há como validar
  if (!rawBody || !header || !header.startsWith('sha256=')) return false;
  const expected = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const got = header.slice(7);
  return got.length === expected.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

module.exports = {
  config,
  WhatsAppError,
  sendMessage,
  sendText,
  sendMedia,
  sendTemplate,
  uploadMedia,
  phoneInfo,
  listTemplates,
  verifySignature,
};
