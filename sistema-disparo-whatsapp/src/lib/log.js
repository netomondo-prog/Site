'use strict';

/**
 * Registro de envios (um item por destinatário de campanha), guardado em
 * data/envios.json. Fica em memória e é gravado em disco com atraso curto,
 * para não reescrever o arquivo a cada mensagem enviada.
 */

const store = require('./store');

const FILE = 'envios';
const STATUS_RANK = { queued: 0, sent: 1, delivered: 2, read: 3 };

let cache = null;
let timer = null;

function load() {
  if (!cache) cache = store.read(FILE, []);
  return cache;
}

function flush() {
  if (timer) clearTimeout(timer);
  timer = null;
  if (cache) store.write(FILE, cache);
}

function scheduleFlush() {
  if (timer) return;
  timer = setTimeout(flush, 1000);
  if (timer.unref) timer.unref();
}

function add(records) {
  const all = load();
  for (const r of records) {
    r.id = r.id || store.newId();
    r.createdAt = r.createdAt || new Date().toISOString();
    all.push(r);
  }
  scheduleFlush();
  return records;
}

function update(record, patch) {
  Object.assign(record, patch, { updatedAt: new Date().toISOString() });
  scheduleFlush();
  return record;
}

function byCampaign(campaignId) {
  return load().filter((r) => r.campaignId === campaignId);
}

function findByMessageId(messageId) {
  return load().find((r) => r.messageId === messageId) || null;
}

/** Envio mais recente para um telefone (considerando wa_id e variações). */
function latestFor(matchFn) {
  const all = load();
  for (let i = all.length - 1; i >= 0; i -= 1) {
    if (matchFn(all[i])) return all[i];
  }
  return null;
}

function stats(records) {
  const s = { total: records.length, queued: 0, sent: 0, delivered: 0, read: 0, failed: 0, canceled: 0, replied: 0, kitDelivered: 0, kitPending: 0 };
  for (const r of records) {
    if (r.status in s) s[r.status] += 1;
    if (r.repliedAt) s.replied += 1;
    if (r.kitStatus === 'delivered') s.kitDelivered += 1;
    if (r.kitStatus === 'pending') s.kitPending += 1;
  }
  // "enviadas" inclui as que já avançaram para entregue/lida
  s.sentTotal = s.sent + s.delivered + s.read;
  s.deliveredTotal = s.delivered + s.read;
  return s;
}

/** Só avança o status (sent → delivered → read); falha sempre prevalece. */
function applyStatus(record, status) {
  if (status === 'failed') return true;
  if (record.status === 'failed') return false;
  return (STATUS_RANK[status] ?? -1) > (STATUS_RANK[record.status] ?? -1);
}

function removeCampaign(campaignId) {
  cache = load().filter((r) => r.campaignId !== campaignId);
  scheduleFlush();
}

/** Usado nos testes para recarregar do disco. */
function reset() {
  flush();
  cache = null;
}

module.exports = { add, update, byCampaign, findByMessageId, latestFor, stats, applyStatus, removeCampaign, flush, reset, all: load };
