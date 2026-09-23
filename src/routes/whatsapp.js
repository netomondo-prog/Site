'use strict';

/**
 * Painel de disparo de WhatsApp (/admin/whatsapp) e webhook público
 * (/webhooks/whatsapp) da API oficial.
 */

const os = require('os');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const store = require('../lib/store');
const api = require('../lib/whatsapp/api');
const engine = require('../lib/whatsapp/engine');
const log = require('../lib/whatsapp/log');
const phone = require('../lib/whatsapp/phone');
const { verifyCsrf } = require('../middleware/auth');

const upload = multer({ dest: os.tmpdir(), limits: { fileSize: 100 * 1024 * 1024, files: 20 } });

function flash(req, type, message) {
  req.session.flash = { type, message };
}

/** Executa o upload e transforma erros do multer em mensagem no painel. */
function withUpload(middleware) {
  return (req, res, next) =>
    middleware(req, res, (err) => {
      if (!err) return next();
      flash(req, 'error', err.code === 'LIMIT_FILE_SIZE' ? 'Arquivo grande demais.' : `Falha no envio do arquivo: ${err.message}`);
      return res.redirect(req.get('referer') || '/admin/whatsapp');
    });
}

function cleanupFiles(req) {
  const files = req.files || (req.file ? [req.file] : []);
  files.forEach((f) => fs.rmSync(f.path, { force: true }));
}

function csvCell(v) {
  const s = String(v ?? '');
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function sendCsv(res, filename, header, rows) {
  const body = [header, ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(`﻿${body}`);
}

const admin = express.Router();

admin.use((req, res, next) => {
  res.locals.wa = { config: api.config(), phone, statusLabels: engine.CAMPAIGN_STATUS };
  next();
});

// ---------- Visão geral ----------

admin.get('/', async (req, res) => {
  const cfg = api.config();
  let info = null;
  let templates = [];
  let apiError = null;
  if (!cfg.dryRun) {
    try {
      [info, templates] = await Promise.all([api.phoneInfo(), api.listTemplates()]);
    } catch (err) {
      apiError = engine.describeError(err);
    }
  }
  const contacts = store.waContacts.all();
  res.render('admin/whatsapp/index', {
    title: 'WhatsApp',
    info,
    templates,
    apiError,
    counts: {
      groups: store.waGroups.all().length,
      contacts: contacts.length,
      optOut: contacts.filter((c) => c.optOut).length,
      kits: store.waKits.all().length,
      campaigns: store.waCampaigns.all().length,
    },
    campaigns: store.waCampaigns.all().slice().reverse().slice(0, 5).map((c) => ({ ...c, stats: engine.campaignStats(c.id) })),
    webhookUrl: `${req.protocol}://${req.get('host')}/webhooks/whatsapp`,
  });
});

// ---------- Grupos de interesse ----------

admin.get('/grupos', (req, res) => {
  const counts = engine.groupCounts();
  const groups = store.waGroups.all().map((g) => ({ ...g, count: counts[g.id] || 0 }));
  res.render('admin/whatsapp/groups', { title: 'Grupos de interesse', groups });
});

admin.post('/grupos', verifyCsrf, (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) {
    flash(req, 'error', 'Informe o nome do grupo.');
    return res.redirect('/admin/whatsapp/grupos');
  }
  const group = store.waGroups.save({ name, description: String(req.body.description || '').trim() });
  flash(req, 'success', 'Grupo criado. Agora importe a lista de contatos.');
  return res.redirect(`/admin/whatsapp/grupos/${group.id}`);
});

admin.get('/grupos/:id', (req, res, next) => {
  const group = store.waGroups.findById(req.params.id);
  if (!group) return next();
  const q = String(req.query.q || '').trim().toLowerCase();
  let contacts = store.waContacts.all().filter((c) => (c.groups || []).includes(group.id));
  const total = contacts.length;
  const optOut = contacts.filter((c) => c.optOut).length;
  if (q) contacts = contacts.filter((c) => c.phone.includes(q.replace(/\D/g, '') || '§') || String(c.name || '').toLowerCase().includes(q));
  const limit = 500;
  const importResult = req.session.importResult || null;
  delete req.session.importResult;
  return res.render('admin/whatsapp/group', {
    title: group.name,
    group,
    contacts: contacts.slice(0, limit),
    shown: Math.min(contacts.length, limit),
    matched: contacts.length,
    total,
    optOut,
    q: req.query.q || '',
    importResult,
  });
});

admin.post('/grupos/:id', verifyCsrf, (req, res, next) => {
  const group = store.waGroups.findById(req.params.id);
  if (!group) return next();
  store.waGroups.save({ ...group, name: String(req.body.name || group.name).trim(), description: String(req.body.description || '').trim() });
  flash(req, 'success', 'Grupo atualizado.');
  return res.redirect(`/admin/whatsapp/grupos/${group.id}`);
});

admin.post('/grupos/:id/importar', withUpload(upload.single('lista')), verifyCsrf, (req, res, next) => {
  const group = store.waGroups.findById(req.params.id);
  if (!group) {
    cleanupFiles(req);
    return next();
  }
  let content = String(req.body.colar || '');
  if (req.file) content = fs.readFileSync(req.file.path, 'utf8');
  cleanupFiles(req);
  if (!content.trim()) {
    flash(req, 'error', 'Envie um arquivo CSV ou cole a lista.');
    return res.redirect(`/admin/whatsapp/grupos/${group.id}`);
  }
  const result = engine.importCsv(group.id, content);
  req.session.importResult = { ...result, invalid: result.invalid.slice(0, 50), invalidCount: result.invalid.length };
  flash(req, 'success', `Importação concluída: ${result.added} novos, ${result.updated} já existentes adicionados ao grupo.`);
  return res.redirect(`/admin/whatsapp/grupos/${group.id}`);
});

admin.post('/grupos/:id/contato', verifyCsrf, (req, res, next) => {
  const group = store.waGroups.findById(req.params.id);
  if (!group) return next();
  const r = engine.importContacts(group.id, [{ phone: req.body.phone, name: String(req.body.name || '').trim() }], { source: 'manual' });
  flash(req, r.added || r.updated ? 'success' : 'error', r.added || r.updated ? 'Contato adicionado.' : 'Telefone inválido.');
  return res.redirect(`/admin/whatsapp/grupos/${group.id}`);
});

admin.post('/grupos/:id/remover', verifyCsrf, (req, res) => {
  const ids = [].concat(req.body.ids || []);
  engine.removeFromGroup(req.params.id, ids);
  flash(req, 'success', `${ids.length} contato(s) removido(s) do grupo.`);
  res.redirect(`/admin/whatsapp/grupos/${req.params.id}`);
});

admin.post('/grupos/:id/excluir', verifyCsrf, (req, res) => {
  engine.deleteGroup(req.params.id);
  flash(req, 'success', 'Grupo excluído.');
  res.redirect('/admin/whatsapp/grupos');
});

admin.get('/grupos/:id/exportar', (req, res, next) => {
  const group = store.waGroups.findById(req.params.id);
  if (!group) return next();
  const contacts = store.waContacts.all().filter((c) => (c.groups || []).includes(group.id));
  const extra = [...new Set(contacts.flatMap((c) => Object.keys(c.fields || {})))];
  return sendCsv(
    res,
    `${store.slugify(group.name) || 'grupo'}.csv`,
    ['telefone', 'nome', ...extra, 'descadastrado'],
    contacts.map((c) => [c.phone, c.name, ...extra.map((k) => c.fields?.[k] || ''), c.optOut ? 'sim' : 'não'])
  );
});

admin.post('/contatos/:id/optout', verifyCsrf, (req, res) => {
  const c = engine.setOptOut(req.params.id, req.body.optOut === 'true');
  flash(req, 'success', c && c.optOut ? 'Contato descadastrado: não receberá campanhas.' : 'Contato reativado.');
  res.redirect(req.get('referer') || '/admin/whatsapp/grupos');
});

// ---------- Kits de mídia ----------

function kitFromForm(body) {
  return {
    name: String(body.name || '').trim(),
    description: String(body.description || '').trim(),
    templateName: String(body.templateName || '').trim(),
    templateLanguage: String(body.templateLanguage || 'pt_BR').trim(),
    bodyParams: String(body.bodyParams || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean),
    headerItemId: String(body.headerItemId || ''),
    delivery: ['on_reply', 'immediate', 'template_only'].includes(body.delivery) ? body.delivery : 'on_reply',
    repeatHeader: body.repeatHeader === 'on',
    followupText: String(body.followupText || '').trim(),
  };
}

async function templatesSafe() {
  try {
    return await api.listTemplates();
  } catch (err) {
    return [];
  }
}

admin.get('/kits', (req, res) => {
  res.render('admin/whatsapp/kits', { title: 'Kits de mídia', kits: store.waKits.all() });
});

admin.get('/kits/novo', async (req, res) => {
  res.render('admin/whatsapp/kit', {
    title: 'Novo kit',
    kit: null,
    values: { templateLanguage: 'pt_BR', delivery: 'on_reply', bodyParams: ['{nome|cliente}'] },
    templates: await templatesSafe(),
  });
});

admin.post('/kits/novo', verifyCsrf, (req, res) => {
  const values = kitFromForm(req.body);
  if (!values.name) {
    flash(req, 'error', 'Informe o nome do kit.');
    return res.redirect('/admin/whatsapp/kits/novo');
  }
  const kit = store.waKits.save({ ...values, items: [] });
  flash(req, 'success', 'Kit criado. Agora envie as imagens e o vídeo.');
  return res.redirect(`/admin/whatsapp/kits/${kit.id}`);
});

admin.get('/kits/:id', async (req, res, next) => {
  const kit = store.waKits.findById(req.params.id);
  if (!kit) return next();
  return res.render('admin/whatsapp/kit', { title: kit.name, kit, values: kit, templates: await templatesSafe() });
});

admin.post('/kits/:id', verifyCsrf, (req, res, next) => {
  const kit = store.waKits.findById(req.params.id);
  if (!kit) return next();
  const values = kitFromForm(req.body);
  const captions = req.body.captions || {};
  const items = (kit.items || []).map((i) => (i.id in captions ? { ...i, caption: String(captions[i.id]).trim() } : i));
  const order = String(req.body.order || '').split(',').filter(Boolean);
  if (order.length) items.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  store.waKits.save({ ...kit, ...values, name: values.name || kit.name, items });
  flash(req, 'success', 'Kit salvo.');
  return res.redirect(`/admin/whatsapp/kits/${kit.id}`);
});

admin.post('/kits/:id/midia', withUpload(upload.array('arquivos', 20)), verifyCsrf, (req, res, next) => {
  const kit = store.waKits.findById(req.params.id);
  if (!kit) {
    cleanupFiles(req);
    return next();
  }
  const errors = [];
  let added = 0;
  for (const file of req.files || []) {
    try {
      const item = engine.addKitItem(kit, file, req.body.caption);
      if (!kit.headerItemId && (item.type === 'image' || item.type === 'video')) kit.headerItemId = item.id;
      added += 1;
    } catch (err) {
      errors.push(err.message);
    }
  }
  cleanupFiles(req);
  store.waKits.save(kit);
  flash(req, errors.length ? 'error' : 'success', errors.length ? errors.join(' ') : `${added} arquivo(s) adicionado(s) ao kit.`);
  return res.redirect(`/admin/whatsapp/kits/${kit.id}`);
});

admin.post('/kits/:id/midia/:itemId/excluir', verifyCsrf, (req, res, next) => {
  const kit = store.waKits.findById(req.params.id);
  if (!kit) return next();
  engine.removeKitItem(kit, req.params.itemId);
  store.waKits.save(kit);
  flash(req, 'success', 'Arquivo removido do kit.');
  return res.redirect(`/admin/whatsapp/kits/${kit.id}`);
});

admin.post('/kits/:id/testar', verifyCsrf, async (req, res, next) => {
  const kit = store.waKits.findById(req.params.id);
  if (!kit) return next();
  try {
    if (!kit.templateName) throw new Error('Defina o nome do modelo aprovado antes de testar.');
    const r = await engine.sendTest(kit, req.body.phone, req.body.name);
    const extra = r.kitStatus === 'pending' ? ' Responda a mensagem no celular para receber o restante do kit.' : '';
    flash(req, 'success', `${api.config().dryRun ? '[Simulação] ' : ''}Modelo enviado para ${phone.format(r.phone)}.${extra}`);
  } catch (err) {
    flash(req, 'error', `Falha no teste: ${err.message}`);
  }
  return res.redirect(`/admin/whatsapp/kits/${kit.id}`);
});

admin.post('/kits/:id/excluir', verifyCsrf, (req, res) => {
  const inUse = store.waCampaigns.all().some((c) => c.kitId === req.params.id && ['running', 'scheduled', 'paused'].includes(c.status));
  if (inUse) {
    flash(req, 'error', 'Este kit está em uma campanha ativa ou agendada.');
    return res.redirect(`/admin/whatsapp/kits/${req.params.id}`);
  }
  engine.deleteKit(req.params.id);
  flash(req, 'success', 'Kit excluído.');
  return res.redirect('/admin/whatsapp/kits');
});

admin.get('/midia/:kitId/:itemId', (req, res, next) => {
  const kit = store.waKits.findById(req.params.kitId);
  const item = kit && (kit.items || []).find((i) => i.id === req.params.itemId);
  if (!item) return next();
  res.type(item.mime);
  return res.sendFile(engine.mediaPath(kit, item));
});

// ---------- Campanhas ----------

admin.get('/campanhas', (req, res) => {
  const kits = Object.fromEntries(store.waKits.all().map((k) => [k.id, k]));
  const campaigns = store.waCampaigns
    .all()
    .slice()
    .reverse()
    .map((c) => ({ ...c, kit: kits[c.kitId], stats: engine.campaignStats(c.id) }));
  res.render('admin/whatsapp/campaigns', { title: 'Campanhas', campaigns });
});

admin.get('/campanhas/nova', (req, res) => {
  const counts = engine.groupCounts();
  res.render('admin/whatsapp/campaign-form', {
    title: 'Nova campanha',
    kits: store.waKits.all(),
    groups: store.waGroups.all().map((g) => ({ ...g, count: counts[g.id] || 0 })),
    values: { groupIds: [].concat(req.query.grupo || []), kitId: req.query.kit || '' },
  });
});

admin.post('/campanhas/nova', verifyCsrf, async (req, res) => {
  const groupIds = [].concat(req.body.groupIds || []).filter((id) => store.waGroups.findById(id));
  const kit = store.waKits.findById(req.body.kitId);
  const name = String(req.body.name || '').trim();
  if (!name || !kit || !groupIds.length) {
    flash(req, 'error', 'Informe o nome, escolha o kit e pelo menos um grupo.');
    return res.redirect('/admin/whatsapp/campanhas/nova');
  }
  const when = String(req.body.scheduledAt || '').trim();
  const scheduledAt = when ? new Date(when) : null;
  if (scheduledAt && Number.isNaN(scheduledAt.getTime())) {
    flash(req, 'error', 'Data de agendamento inválida.');
    return res.redirect('/admin/whatsapp/campanhas/nova');
  }
  const campaign = store.waCampaigns.save({
    name,
    kitId: kit.id,
    groupIds,
    status: scheduledAt ? 'scheduled' : 'draft',
    scheduledAt: scheduledAt ? scheduledAt.toISOString() : null,
  });
  if (req.body.action === 'start' && !scheduledAt) {
    try {
      await engine.startCampaign(campaign.id);
      flash(req, 'success', 'Campanha iniciada.');
    } catch (err) {
      flash(req, 'error', err.message);
    }
  } else {
    flash(req, 'success', scheduledAt ? 'Campanha agendada.' : 'Campanha salva como rascunho.');
  }
  return res.redirect(`/admin/whatsapp/campanhas/${campaign.id}`);
});

admin.get('/campanhas/:id', (req, res, next) => {
  const campaign = store.waCampaigns.findById(req.params.id);
  if (!campaign) return next();
  const records = log.byCampaign(campaign.id);
  const filter = String(req.query.filtro || '');
  const filters = {
    falhas: (r) => r.status === 'failed',
    responderam: (r) => r.repliedAt,
    kit: (r) => r.kitStatus === 'delivered',
    pendentes: (r) => r.kitStatus === 'pending',
  };
  const list = filters[filter] ? records.filter(filters[filter]) : records;
  const counts = engine.groupCounts();
  const preview = ['draft', 'scheduled'].includes(campaign.status) ? engine.recipientsFor(campaign.groupIds || []) : null;
  return res.render('admin/whatsapp/campaign', {
    title: campaign.name,
    campaign,
    kit: store.waKits.findById(campaign.kitId),
    groups: store.waGroups.all().filter((g) => (campaign.groupIds || []).includes(g.id)).map((g) => ({ ...g, count: counts[g.id] || 0 })),
    stats: log.stats(records),
    records: list.slice(-500).reverse(),
    matched: list.length,
    filter,
    preview: preview ? { total: preview.recipients.length, optedOut: preview.optedOut } : null,
  });
});

admin.post('/campanhas/:id/iniciar', verifyCsrf, async (req, res) => {
  try {
    await engine.startCampaign(req.params.id);
    flash(req, 'success', 'Envio iniciado.');
  } catch (err) {
    flash(req, 'error', err.message);
  }
  res.redirect(`/admin/whatsapp/campanhas/${req.params.id}`);
});

admin.post('/campanhas/:id/pausar', verifyCsrf, (req, res) => {
  engine.pauseCampaign(req.params.id);
  flash(req, 'success', 'Campanha pausada.');
  res.redirect(`/admin/whatsapp/campanhas/${req.params.id}`);
});

admin.post('/campanhas/:id/cancelar', verifyCsrf, (req, res) => {
  engine.cancelCampaign(req.params.id);
  flash(req, 'success', 'Campanha cancelada. Mensagens ainda na fila não serão enviadas.');
  res.redirect(`/admin/whatsapp/campanhas/${req.params.id}`);
});

admin.post('/campanhas/:id/excluir', verifyCsrf, (req, res) => {
  engine.deleteCampaign(req.params.id);
  flash(req, 'success', 'Campanha excluída.');
  res.redirect('/admin/whatsapp/campanhas');
});

admin.get('/campanhas/:id/relatorio.csv', (req, res, next) => {
  const campaign = store.waCampaigns.findById(req.params.id);
  if (!campaign) return next();
  return sendCsv(
    res,
    `campanha-${store.slugify(campaign.name) || campaign.id}.csv`,
    ['telefone', 'nome', 'status', 'enviada', 'entregue', 'lida', 'respondeu', 'resposta', 'kit', 'erro'],
    log.byCampaign(campaign.id).map((r) => [
      r.phone, r.name, r.status, r.sentAt || '', r.deliveredAt || '', r.readAt || '', r.repliedAt || '', r.lastReply || '', r.kitStatus, r.error || r.kitError || '',
    ])
  );
});

// ---------- Webhook público ----------

const webhook = express.Router();

// Verificação feita pela Meta ao cadastrar a URL do webhook
webhook.get('/', (req, res) => {
  const { verifyToken } = api.config();
  if (req.query['hub.mode'] === 'subscribe' && verifyToken && req.query['hub.verify_token'] === verifyToken) {
    return res.status(200).send(String(req.query['hub.challenge'] || ''));
  }
  return res.sendStatus(403);
});

webhook.post('/', (req, res) => {
  if (!api.verifySignature(req.rawBody, req.get('x-hub-signature-256'))) return res.sendStatus(401);
  // Responde logo (a Meta reenvia se demorar) e processa em seguida
  res.sendStatus(200);
  engine.handleWebhook(req.body).catch((err) => console.error('[whatsapp] erro no webhook:', err));
  return undefined;
});

module.exports = { admin, webhook };
