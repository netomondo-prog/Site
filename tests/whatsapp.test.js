'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'jtec-wa-test-'));
process.env.SESSION_SECRET = 'test';
process.env.ADMIN_PASSWORD = 'secret';
process.env.WHATSAPP_VERIFY_TOKEN = 'verifica123';
process.env.WHATSAPP_APP_SECRET = 'appsecret';
delete process.env.WHATSAPP_TOKEN; // modo simulação

const app = require('../src/app');
const store = require('../src/lib/store');
const phone = require('../src/lib/whatsapp/phone');
const csv = require('../src/lib/whatsapp/csv');
const engine = require('../src/lib/whatsapp/engine');
const log = require('../src/lib/whatsapp/log');

let server;
let base;
let cookie;
let csrf;

async function req(method, url, { body, headers = {} } = {}) {
  const res = await fetch(base + url, { method, body, headers: { cookie, ...headers }, redirect: 'manual' });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  const text = await res.text();
  const m = text.match(/name="_csrf" value="([^"]+)"/);
  if (m) csrf = m[1];
  return { status: res.status, location: res.headers.get('location'), body: text };
}

function form(obj) {
  return { body: new URLSearchParams({ _csrf: csrf, ...obj }).toString(), headers: { 'content-type': 'application/x-www-form-urlencoded' } };
}

function signed(payload) {
  const raw = JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', 'appsecret').update(raw).digest('hex');
  return { body: raw, headers: { 'content-type': 'application/json', 'x-hub-signature-256': `sha256=${sig}` } };
}

const settle = () => new Promise((r) => setTimeout(r, 50));

test.before(async () => {
  server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
  await req('GET', '/admin/login');
  await req('POST', '/admin/login', form({ user: 'admin', password: 'secret' }));
});

test.after(() => server.close());

test('normaliza telefones brasileiros e reconhece o nono dígito', () => {
  assert.strictEqual(phone.normalize('(19) 99999-0000'), '5519999990000');
  assert.strictEqual(phone.normalize('+55 11 3333-4444'), '551133334444');
  assert.strictEqual(phone.normalize('123'), '');
  assert.ok(phone.same('5519999990000', '551999990000'));
  assert.strictEqual(phone.format('5519999990000'), '+55 (19) 99999-0000');
});

test('lê CSV com ponto e vírgula, aspas e colunas extras', () => {
  const rows = csv.parseContacts('﻿Nome;Telefone;Empresa\n"Silva; Maria";(19) 99999-0000;Usina X\nJoão;11988887777;\n');
  assert.strictEqual(rows.length, 2);
  assert.deepStrictEqual(rows[0], { phone: '(19) 99999-0000', name: 'Silva; Maria', fields: { empresa: 'Usina X' } });
  const noHeader = csv.parseContacts('19999990000,Ana\n');
  assert.strictEqual(noHeader[0].name, 'Ana');
});

test('webhook: verificação e assinatura', async () => {
  const ok = await req('GET', '/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=verifica123&hub.challenge=42');
  assert.strictEqual(ok.status, 200);
  assert.strictEqual(ok.body, '42');
  const bad = await req('GET', '/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=errado&hub.challenge=42');
  assert.strictEqual(bad.status, 403);
  const unsigned = await req('POST', '/webhooks/whatsapp', { body: '{}', headers: { 'content-type': 'application/json' } });
  assert.strictEqual(unsigned.status, 401);
});

test('fluxo completo: grupo, lista, kit, campanha, resposta e descadastro', async () => {
  const page = await req('GET', '/admin/whatsapp');
  assert.strictEqual(page.status, 200);
  assert.ok(page.body.includes('Modo simulação'));

  // Grupos e importação
  let r = await req('POST', '/admin/whatsapp/grupos', form({ name: 'Usinas' }));
  const usinas = store.waGroups.all().find((g) => g.name === 'Usinas');
  assert.strictEqual(r.location, `/admin/whatsapp/grupos/${usinas.id}`);
  await req('GET', r.location);

  const fd = new FormData();
  fd.append('_csrf', csrf);
  fd.append('lista', new Blob(['telefone;nome;empresa\n19999990000;Maria Silva;Usina X\n(11) 98888-7777;João;Usina Y\n19999990000;Repetido;\nabc;Inválido;\n'], { type: 'text/csv' }), 'lista.csv');
  r = await req('POST', `/admin/whatsapp/grupos/${usinas.id}/importar`, { body: fd });
  assert.strictEqual(r.status, 302);
  const detail = await req('GET', `/admin/whatsapp/grupos/${usinas.id}`);
  assert.ok(detail.body.includes('Maria Silva'));
  assert.ok(detail.body.includes('<strong>2</strong> novos'));

  await req('POST', '/admin/whatsapp/grupos', form({ name: 'Químicas' }));
  const quimicas = store.waGroups.all().find((g) => g.name === 'Químicas');
  engine.importContacts(quimicas.id, [{ phone: '19999990000', name: 'Maria' }, { phone: '21977776666', name: 'Paula' }]);
  assert.strictEqual(store.waContacts.all().length, 3);
  assert.strictEqual(engine.recipientsFor([usinas.id, quimicas.id]).recipients.length, 3);

  // Kit com imagem e vídeo
  await req('GET', '/admin/whatsapp/kits/novo');
  r = await req('POST', '/admin/whatsapp/kits/novo', form({
    name: 'Lançamento', templateName: 'lancamento_jtg', templateLanguage: 'pt_BR', bodyParams: '{nome|cliente}\n{empresa|sua empresa}',
    delivery: 'on_reply', followupText: 'Obrigado, {nome}!',
  }));
  const kit = store.waKits.all()[0];
  assert.strictEqual(r.location, `/admin/whatsapp/kits/${kit.id}`);
  await req('GET', r.location);
  const media = new FormData();
  media.append('_csrf', csrf);
  media.append('arquivos', new Blob([Buffer.from('fakepng')], { type: 'image/png' }), 'foto1.png');
  media.append('arquivos', new Blob([Buffer.from('fakepng2')], { type: 'image/jpeg' }), 'foto2.jpg');
  media.append('arquivos', new Blob([Buffer.from('fakevideo')], { type: 'video/mp4' }), 'video.mp4');
  media.append('arquivos', new Blob([Buffer.from('x')], { type: 'text/plain' }), 'nao.txt');
  r = await req('POST', `/admin/whatsapp/kits/${kit.id}/midia`, { body: media });
  const saved = store.waKits.findById(kit.id);
  assert.strictEqual(saved.items.length, 3);
  assert.strictEqual(saved.headerItemId, saved.items[0].id);
  const preview = await req('GET', `/admin/whatsapp/midia/${kit.id}/${saved.items[2].id}`);
  assert.strictEqual(preview.body, 'fakevideo');

  const components = engine.templateComponents(saved, { name: 'Maria Silva', fields: { empresa: 'Usina X' } });
  assert.strictEqual(components[0].type, 'header');
  assert.deepStrictEqual(components[1].parameters.map((p) => p.text), ['Maria', 'Usina X']);
  assert.deepStrictEqual(engine.templateComponents(saved, { name: '', fields: {} })[1].parameters.map((p) => p.text), ['cliente', 'sua empresa']);

  // Campanha para os dois grupos
  await req('GET', '/admin/whatsapp/campanhas/nova');
  const body = new URLSearchParams({ _csrf: csrf, name: 'Teste', kitId: kit.id, action: 'start' });
  body.append('groupIds', usinas.id);
  body.append('groupIds', quimicas.id);
  r = await req('POST', '/admin/whatsapp/campanhas/nova', { body: body.toString(), headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  const campaign = store.waCampaigns.all()[0];
  await engine.kick();
  const records = log.byCampaign(campaign.id);
  assert.strictEqual(records.length, 3);
  assert.ok(records.every((x) => x.status === 'sent' && x.kitStatus === 'pending'));
  assert.strictEqual(store.waCampaigns.findById(campaign.id).status, 'done');

  // Status de entrega e resposta (wa_id sem o nono dígito) → kit entregue
  const maria = records.find((x) => x.phone === '5519999990000');
  r = await req('POST', '/webhooks/whatsapp', signed({
    entry: [{ changes: [{ value: {
      statuses: [{ id: maria.messageId, status: 'delivered', timestamp: '1700000000' }],
      contacts: [{ wa_id: '551999990000', profile: { name: 'Maria S.' } }],
      messages: [{ from: '551999990000', id: 'in1', type: 'button', button: { text: 'Quero receber', payload: 'Quero receber' } }],
    } }] }],
  }));
  assert.strictEqual(r.status, 200);
  await settle();
  assert.strictEqual(maria.status, 'delivered');
  assert.ok(maria.repliedAt);
  assert.strictEqual(maria.kitStatus, 'delivered');
  assert.strictEqual(maria.kitMessageIds.length, 3); // 2 mídias (sem repetir o cabeçalho) + texto

  // Descadastro por palavra-chave
  await req('POST', '/webhooks/whatsapp', signed({
    entry: [{ changes: [{ value: { messages: [{ from: '5521977776666', id: 'in2', type: 'text', text: { body: 'SAIR' } }] } }] }],
  }));
  await settle();
  assert.strictEqual(engine.findContactByPhone('5521977776666').optOut, true);
  assert.strictEqual(engine.recipientsFor([quimicas.id]).recipients.length, 1);

  const view = await req('GET', `/admin/whatsapp/campanhas/${campaign.id}`);
  assert.strictEqual(view.status, 200);
  assert.ok(view.body.includes('Quero receber'));
  const report = await req('GET', `/admin/whatsapp/campanhas/${campaign.id}/relatorio.csv`);
  assert.ok(report.body.includes('5519999990000;Maria Silva;delivered'));
});
