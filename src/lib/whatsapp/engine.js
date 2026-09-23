'use strict';

/**
 * Motor de disparo: grupos de interesse, importação de listas, kits de mídia,
 * fila de campanhas e tratamento do webhook (status e respostas).
 *
 * Regra da Meta que orienta o desenho: fora da janela de 24h de atendimento só
 * é possível iniciar conversa com um MODELO (template) aprovado, que aceita no
 * máximo UMA mídia no cabeçalho. Por isso o kit funciona assim:
 *   1. o modelo aprovado é enviado (com uma imagem ou vídeo do kit no cabeçalho);
 *   2. quando o contato responde / toca no botão, a janela de 24h abre e o
 *      sistema entrega automaticamente as demais imagens, vídeo e texto do kit.
 */

const fs = require('fs');
const path = require('path');
const store = require('../store');
const api = require('./api');
const log = require('./log');
const phone = require('./phone');
const csv = require('./csv');

const MEDIA_DIR = path.join(store.DATA_DIR, 'uploads', 'whatsapp');
const MEDIA_TTL_MS = 25 * 24 * 60 * 60 * 1000; // media id da Meta vale 30 dias
const OPT_OUT_WORDS = ['sair', 'parar', 'pare', 'stop', 'cancelar', 'descadastrar', 'remover'];

/** Tipos e limites aceitos pela Cloud API. */
const MEDIA_TYPES = {
  'image/jpeg': { type: 'image', max: 5 * 1024 * 1024 },
  'image/png': { type: 'image', max: 5 * 1024 * 1024 },
  'video/mp4': { type: 'video', max: 16 * 1024 * 1024 },
  'video/3gpp': { type: 'video', max: 16 * 1024 * 1024 },
  'application/pdf': { type: 'document', max: 100 * 1024 * 1024 },
};

const CAMPAIGN_STATUS = {
  draft: 'Rascunho',
  scheduled: 'Agendada',
  running: 'Enviando',
  paused: 'Pausada',
  done: 'Concluída',
  canceled: 'Cancelada',
};

// ---------- Contatos e grupos ----------

function groupCounts() {
  const counts = {};
  for (const c of store.waContacts.all()) {
    for (const g of c.groups || []) counts[g] = (counts[g] || 0) + 1;
  }
  return counts;
}

/**
 * Importa contatos (já lidos do CSV ou digitados) para um grupo.
 * Contatos já existentes (mesmo telefone) são mesclados e ganham o grupo.
 */
function importContacts(groupId, rows, { source = 'csv' } = {}) {
  const contacts = store.waContacts.all();
  const index = new Map();
  contacts.forEach((c) => phone.variants(c.phone).forEach((v) => index.set(v, c)));
  const now = new Date().toISOString();
  const result = { added: 0, updated: 0, invalid: [], duplicates: 0 };
  const seen = new Set();

  for (const row of rows) {
    const number = phone.normalize(row.phone);
    if (!number) {
      if (row.phone || row.name) result.invalid.push(row.phone || row.name);
      continue;
    }
    if (seen.has(number)) {
      result.duplicates += 1;
      continue;
    }
    phone.variants(number).forEach((v) => seen.add(v));
    const existing = index.get(number);
    if (existing) {
      if (!existing.groups.includes(groupId)) existing.groups.push(groupId);
      if (row.name && !existing.name) existing.name = row.name;
      existing.fields = { ...(existing.fields || {}), ...(row.fields || {}) };
      existing.updatedAt = now;
      result.updated += 1;
    } else {
      const contact = {
        id: store.newId(),
        phone: number,
        name: row.name || '',
        fields: row.fields || {},
        groups: [groupId],
        optOut: false,
        source,
        createdAt: now,
        updatedAt: now,
      };
      contacts.push(contact);
      phone.variants(number).forEach((v) => index.set(v, contact));
      result.added += 1;
    }
  }
  store.waContacts.replaceAll(contacts);
  return result;
}

function importCsv(groupId, content) {
  return importContacts(groupId, csv.parseContacts(content));
}

function removeFromGroup(groupId, contactIds) {
  const ids = new Set(contactIds);
  const contacts = store.waContacts.all().map((c) => (ids.has(c.id) ? { ...c, groups: (c.groups || []).filter((g) => g !== groupId) } : c));
  store.waContacts.replaceAll(contacts);
}

/** Exclui o grupo; contatos que ficarem sem grupo algum também são excluídos. */
function deleteGroup(groupId) {
  const contacts = store.waContacts
    .all()
    .map((c) => ({ ...c, groups: (c.groups || []).filter((g) => g !== groupId) }))
    .filter((c) => c.groups.length || c.optOut);
  store.waContacts.replaceAll(contacts);
  store.waGroups.remove(groupId);
}

function findContactByPhone(number) {
  return store.waContacts.all().find((c) => phone.same(c.phone, number)) || null;
}

function setOptOut(contactId, optOut) {
  const c = store.waContacts.findById(contactId);
  if (!c) return null;
  return store.waContacts.save({ ...c, optOut, optOutAt: optOut ? new Date().toISOString() : null });
}

/** Destinatários de uma campanha: união dos grupos, sem duplicados e sem descadastrados. */
function recipientsFor(groupIds) {
  const wanted = new Set(groupIds);
  const seen = new Set();
  const out = [];
  let optedOut = 0;
  for (const c of store.waContacts.all()) {
    if (!(c.groups || []).some((g) => wanted.has(g))) continue;
    if (c.optOut) {
      optedOut += 1;
      continue;
    }
    if (phone.variants(c.phone).some((v) => seen.has(v))) continue;
    phone.variants(c.phone).forEach((v) => seen.add(v));
    out.push(c);
  }
  return { recipients: out, optedOut };
}

// ---------- Kits de mídia ----------

function kitDir(kitId) {
  return path.join(MEDIA_DIR, kitId);
}

function mediaPath(kit, item) {
  return path.join(kitDir(kit.id), item.file);
}

/** Registra um arquivo enviado pelo painel (multer) como item do kit. */
function addKitItem(kit, file, caption) {
  const spec = MEDIA_TYPES[file.mimetype];
  if (!spec) throw new Error(`Formato não aceito (${file.mimetype}). Use JPG ou PNG para imagens, MP4 para vídeo ou PDF.`);
  if (file.size > spec.max) {
    throw new Error(`"${file.originalname}" excede o limite do WhatsApp para ${spec.type === 'video' ? 'vídeo (16 MB)' : spec.type === 'image' ? 'imagem (5 MB)' : 'documento (100 MB)'}.`);
  }
  const dir = kitDir(kit.id);
  fs.mkdirSync(dir, { recursive: true });
  const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '') || '';
  const name = `${store.newId()}${ext}`;
  // copia em vez de mover: o temporário pode estar em outro disco que DATA_DIR
  fs.copyFileSync(file.path, path.join(dir, name));
  fs.rmSync(file.path, { force: true });
  const item = {
    id: store.newId(),
    type: spec.type,
    file: name,
    originalName: file.originalname,
    mime: file.mimetype,
    size: file.size,
    caption: String(caption || '').trim(),
  };
  kit.items = [...(kit.items || []), item];
  return item;
}

function removeKitItem(kit, itemId) {
  const item = (kit.items || []).find((i) => i.id === itemId);
  if (!item) return;
  fs.rmSync(mediaPath(kit, item), { force: true });
  kit.items = kit.items.filter((i) => i.id !== itemId);
  if (kit.headerItemId === itemId) kit.headerItemId = '';
}

function deleteKit(kitId) {
  fs.rmSync(kitDir(kitId), { recursive: true, force: true });
  store.waKits.remove(kitId);
}

/** Garante que cada mídia do kit está hospedada na Meta (media id válido). */
async function ensureMedia(kit) {
  let changed = false;
  for (const item of kit.items || []) {
    const fresh = item.mediaId && Date.now() - new Date(item.mediaUploadedAt).getTime() < MEDIA_TTL_MS;
    const simulated = String(item.mediaId || '').includes('SIMULADO');
    if (fresh && simulated === api.config().dryRun) continue;
    item.mediaId = await api.uploadMedia(mediaPath(kit, item), item.mime);
    item.mediaUploadedAt = new Date().toISOString();
    changed = true;
  }
  if (changed) store.waKits.save(kit);
  return kit;
}

/** Substitui {nome}, {telefone} e colunas extras da lista. Aceita padrão: {nome|cliente}. */
function renderVars(template, contact) {
  return String(template || '').replace(/\{([a-z0-9_]+)(?:\|([^}]*))?\}/gi, (m, key, fallback) => {
    const k = key.toLowerCase();
    let v = '';
    if (k === 'nome') v = String(contact.name || '').split(/\s+/)[0];
    else if (k === 'nome_completo') v = contact.name;
    else if (k === 'telefone') v = phone.format(contact.phone);
    else v = contact.fields?.[k];
    return String(v || fallback || '').trim();
  });
}

function templateComponents(kit, contact) {
  const components = [];
  const header = (kit.items || []).find((i) => i.id === kit.headerItemId);
  if (header) {
    components.push({ type: 'header', parameters: [{ type: header.type, [header.type]: { id: header.mediaId } }] });
  }
  const params = (kit.bodyParams || []).map((p) => renderVars(p, contact) || '-');
  if (params.length) {
    components.push({ type: 'body', parameters: params.map((t) => ({ type: 'text', text: t })) });
  }
  return components;
}

/** Itens entregues depois da resposta (o cabeçalho do modelo não é repetido). */
function followupItems(kit) {
  return (kit.items || []).filter((i) => i.id !== kit.headerItemId || kit.repeatHeader);
}

async function deliverKit(record, kit) {
  kit = kit || store.waKits.findById(record.kitId);
  if (!kit) return;
  log.update(record, { kitStatus: 'sending' });
  const contact = { name: record.name, phone: record.phone, fields: record.fields };
  const to = record.waId || record.phone;
  try {
    await ensureMedia(kit);
    const ids = [];
    for (const item of followupItems(kit)) {
      const r = await api.sendMedia(to, item.type, item.mediaId, renderVars(item.caption, contact));
      ids.push(r.messageId);
    }
    if (kit.followupText) {
      const r = await api.sendText(to, renderVars(kit.followupText, contact));
      ids.push(r.messageId);
    }
    log.update(record, { kitStatus: 'delivered', kitDeliveredAt: new Date().toISOString(), kitMessageIds: ids, kitError: '' });
  } catch (err) {
    log.update(record, { kitStatus: 'failed', kitError: describeError(err) });
  }
}

function describeError(err) {
  const hints = {
    131047: 'Fora da janela de 24h: só é possível enviar modelo aprovado.',
    131026: 'Número não tem WhatsApp ou não pode receber a mensagem.',
    132001: 'Modelo não existe ou não está aprovado neste idioma.',
    132000: 'Quantidade de variáveis diferente da definida no modelo.',
    131056: 'Muitas mensagens para o mesmo número em pouco tempo.',
    130429: 'Limite de envio por segundo atingido.',
    131049: 'A Meta não entregou para manter a qualidade do ecossistema (limite de marketing por usuário).',
    133010: 'Número ainda não registrado na Cloud API.',
    190: 'Token de acesso inválido ou expirado.',
  };
  const hint = hints[err.code];
  return [err.code ? `[${err.code}]` : '', err.message, err.details, hint ? `— ${hint}` : ''].filter(Boolean).join(' ');
}

// ---------- Campanhas ----------

function campaignStats(campaignId) {
  return log.stats(log.byCampaign(campaignId));
}

/** Monta a fila de destinatários e coloca a campanha para enviar. */
async function startCampaign(campaignId) {
  const campaign = store.waCampaigns.findById(campaignId);
  if (!campaign) throw new Error('Campanha não encontrada.');
  const kit = store.waKits.findById(campaign.kitId);
  if (!kit) throw new Error('Kit da campanha não encontrado.');
  if (!kit.templateName) throw new Error('O kit precisa de um modelo (template) aprovado.');

  if (campaign.status === 'paused') {
    store.waCampaigns.save({ ...campaign, status: 'running' });
    kick();
    return campaign;
  }
  if (!['draft', 'scheduled'].includes(campaign.status)) throw new Error('Esta campanha já foi iniciada.');

  await ensureMedia(kit);
  const { recipients, optedOut } = recipientsFor(campaign.groupIds || []);
  if (!recipients.length) throw new Error('Nenhum destinatário válido nos grupos selecionados.');
  log.add(
    recipients.map((c) => ({
      campaignId,
      kitId: kit.id,
      contactId: c.id,
      phone: c.phone,
      name: c.name,
      fields: c.fields,
      status: 'queued',
      kitStatus: 'none',
    }))
  );
  store.waCampaigns.save({
    ...campaign,
    status: 'running',
    startedAt: new Date().toISOString(),
    total: recipients.length,
    optedOut,
    simulated: api.config().dryRun,
  });
  kick();
  return campaign;
}

function pauseCampaign(id) {
  const c = store.waCampaigns.findById(id);
  if (c && c.status === 'running') store.waCampaigns.save({ ...c, status: 'paused' });
}

function cancelCampaign(id) {
  const c = store.waCampaigns.findById(id);
  if (!c || ['done', 'canceled'].includes(c.status)) return;
  for (const r of log.byCampaign(id)) if (r.status === 'queued') log.update(r, { status: 'canceled' });
  store.waCampaigns.save({ ...c, status: 'canceled', finishedAt: new Date().toISOString() });
}

function deleteCampaign(id) {
  cancelCampaign(id);
  log.removeCampaign(id);
  store.waCampaigns.remove(id);
}

async function sendOne(record, kit) {
  const contact = { name: record.name, phone: record.phone, fields: record.fields };
  try {
    const r = await api.sendTemplate(record.phone, kit.templateName, kit.templateLanguage || 'pt_BR', templateComponents(kit, contact));
    log.update(record, {
      status: 'sent',
      messageId: r.messageId,
      waId: r.waId,
      sentAt: new Date().toISOString(),
      kitStatus: kit.delivery === 'on_reply' && followupItems(kit).length + (kit.followupText ? 1 : 0) > 0 ? 'pending' : 'none',
    });
    if (kit.delivery === 'immediate') await deliverKit(record, kit);
  } catch (err) {
    log.update(record, { status: 'failed', error: describeError(err), failedAt: new Date().toISOString() });
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let running = null;

/** Processa a fila de todas as campanhas em andamento, respeitando o limite por segundo. */
async function drain() {
  const interval = 1000 / api.config().rate;
  for (;;) {
    const active = store.waCampaigns.all().filter((c) => c.status === 'running');
    if (!active.length) return;
    let sentAny = false;
    for (const campaign of active) {
      const kit = store.waKits.findById(campaign.kitId);
      const queue = log.byCampaign(campaign.id).filter((r) => r.status === 'queued');
      if (!queue.length || !kit) {
        store.waCampaigns.save({ ...campaign, status: 'done', finishedAt: new Date().toISOString() });
        continue;
      }
      // envia em blocos para poder reagir a pausa/cancelamento
      for (const record of queue.slice(0, 20)) {
        const fresh = store.waCampaigns.findById(campaign.id);
        if (!fresh || fresh.status !== 'running') break;
        const started = Date.now();
        await sendOne(record, kit);
        sentAny = true;
        const wait = interval - (Date.now() - started);
        if (wait > 0 && !api.config().dryRun) await sleep(wait);
      }
    }
    log.flush();
    if (!sentAny) return;
  }
}

function kick() {
  if (!running) {
    running = drain()
      .catch((err) => console.error('[whatsapp] erro na fila:', err))
      .finally(() => {
        running = null;
      });
  }
  return running;
}

/** Inicia campanhas agendadas cujo horário chegou. */
async function checkSchedule() {
  const now = Date.now();
  for (const c of store.waCampaigns.all()) {
    if (c.status === 'scheduled' && c.scheduledAt && new Date(c.scheduledAt).getTime() <= now) {
      try {
        await startCampaign(c.id);
      } catch (err) {
        store.waCampaigns.save({ ...c, status: 'draft', lastError: err.message });
      }
    }
  }
}

/** Liga o agendador e retoma campanhas que estavam enviando antes de um reinício. */
function startWorker() {
  kick();
  const timer = setInterval(() => {
    checkSchedule();
    kick();
  }, 30 * 1000);
  if (timer.unref) timer.unref();
}

/** Envia o modelo do kit para um único número (teste antes da campanha). */
async function sendTest(kit, number, name) {
  const to = phone.normalize(number);
  if (!to) throw new Error('Telefone inválido.');
  await ensureMedia(kit);
  const [record] = log.add([
    { campaignId: 'teste', kitId: kit.id, phone: to, name: name || 'Teste', fields: {}, status: 'queued', kitStatus: 'none' },
  ]);
  await sendOne(record, kit);
  log.flush();
  if (record.status === 'failed') throw new Error(record.error);
  return record;
}

// ---------- Webhook ----------

function handleStatus(st) {
  const record = log.findByMessageId(st.id);
  if (!record) return;
  const patch = {};
  if (log.applyStatus(record, st.status)) patch.status = st.status;
  const at = st.timestamp ? new Date(Number(st.timestamp) * 1000).toISOString() : new Date().toISOString();
  if (st.status === 'delivered') patch.deliveredAt = record.deliveredAt || at;
  if (st.status === 'read') patch.readAt = record.readAt || at;
  if (st.status === 'failed') patch.error = describeError({ code: st.errors?.[0]?.code, message: st.errors?.[0]?.title || st.errors?.[0]?.message, details: st.errors?.[0]?.error_data?.details });
  if (st.pricing?.category) patch.pricingCategory = st.pricing.category;
  log.update(record, patch);
}

function inboundText(msg) {
  if (msg.type === 'text') return msg.text?.body || '';
  if (msg.type === 'button') return msg.button?.text || msg.button?.payload || '';
  if (msg.type === 'interactive') return msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
  return `[${msg.type}]`;
}

async function handleMessage(msg, profileName) {
  const from = msg.from;
  const body = inboundText(msg);
  const normalized = body
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();

  const contact = findContactByPhone(from);
  if (contact) {
    store.waContacts.save({ ...contact, lastInboundAt: new Date().toISOString(), profileName: profileName || contact.profileName });
  }

  if (OPT_OUT_WORDS.includes(normalized)) {
    if (contact) setOptOut(contact.id, true);
    try {
      await api.sendText(from, 'Pronto! Você não receberá mais nossas mensagens por aqui. Se mudar de ideia, é só responder VOLTAR.');
    } catch (err) {
      console.error('[whatsapp] falha ao confirmar descadastro:', err.message);
    }
    return;
  }
  if (normalized === 'voltar' && contact && contact.optOut) setOptOut(contact.id, false);

  const record = log.latestFor((r) => r.status !== 'queued' && (phone.same(r.phone, from) || (r.waId && phone.same(r.waId, from))));
  if (!record) return;
  log.update(record, { repliedAt: record.repliedAt || new Date().toISOString(), lastReply: body.slice(0, 500) });
  if (record.kitStatus === 'pending') await deliverKit(record);
}

/** Processa o corpo do webhook enviado pela Meta. */
async function handleWebhook(payload) {
  for (const entry of payload?.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      for (const st of value.statuses || []) handleStatus(st);
      const profiles = Object.fromEntries((value.contacts || []).map((c) => [c.wa_id, c.profile?.name]));
      for (const msg of value.messages || []) await handleMessage(msg, profiles[msg.from]);
    }
  }
  log.flush();
}

module.exports = {
  MEDIA_TYPES,
  CAMPAIGN_STATUS,
  groupCounts,
  importContacts,
  importCsv,
  removeFromGroup,
  deleteGroup,
  findContactByPhone,
  setOptOut,
  recipientsFor,
  addKitItem,
  removeKitItem,
  deleteKit,
  mediaPath,
  ensureMedia,
  renderVars,
  templateComponents,
  followupItems,
  campaignStats,
  startCampaign,
  pauseCampaign,
  cancelCampaign,
  deleteCampaign,
  drain,
  kick,
  checkSchedule,
  startWorker,
  sendTest,
  handleWebhook,
  describeError,
};
