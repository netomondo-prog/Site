'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Usa um diretório de dados temporário para não sujar data/messages.json
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'jtec-test-'));
process.env.SESSION_SECRET = 'test';
process.env.ADMIN_PASSWORD = 'secret';

const app = require('../src/app');
const text = require('../src/lib/text');
const store = require('../src/lib/store');

let server;
let base;

function request(method, url, { body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(base + url, { method, headers }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

test.before(async () => {
  server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

test('páginas públicas respondem 200', async () => {
  for (const url of ['/', '/empresa', '/servicos', '/produtos', '/blog', '/contato', '/sitemap.xml', '/robots.txt']) {
    const res = await request('GET', url);
    assert.strictEqual(res.status, 200, url);
  }
});

test('páginas de detalhe usam os dados', async () => {
  const service = store.services.published()[0];
  const product = store.products.published()[0];
  const post = store.posts.published()[0];
  const s = await request('GET', `/servicos/${service.slug}`);
  assert.ok(s.body.includes(service.title));
  const p = await request('GET', `/produtos/${product.slug}`);
  assert.ok(p.body.includes(product.name));
  const b = await request('GET', `/blog/${post.slug}`);
  assert.ok(b.body.includes(post.title));
});

test('home contém botão de WhatsApp e logotipo', async () => {
  const res = await request('GET', '/');
  assert.ok(res.body.includes('whatsapp-float'));
  assert.ok(res.body.includes('wa.me/'));
  assert.ok(res.body.includes('JTEC'));
});

test('404 para rotas inexistentes', async () => {
  const res = await request('GET', '/nao-existe');
  assert.strictEqual(res.status, 404);
});

test('filtro de produtos por categoria', async () => {
  const res = await request('GET', '/produtos?categoria=instrumentacao');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.includes('JT-REC 550'));
  assert.ok(!res.body.includes('Válvula globo JT-G'));
});

test('API devolve JSON', async () => {
  const res = await request('GET', '/api/products');
  assert.strictEqual(res.status, 200);
  const items = JSON.parse(res.body);
  assert.ok(Array.isArray(items) && items.length > 0);
});

test('formulário de contato valida e grava a mensagem', async () => {
  const page = await request('GET', '/contato');
  const cookie = page.headers['set-cookie'][0].split(';')[0];
  const csrf = page.body.match(/name="_csrf" value="([^"]+)"/)[1];
  const form = (obj) => new URLSearchParams(obj).toString();
  const headers = { cookie, 'content-type': 'application/x-www-form-urlencoded' };

  const bad = await request('POST', '/contato', { headers, body: form({ _csrf: csrf, name: 'A', email: 'x', subject: 'Outros assuntos', message: 'oi' }) });
  assert.strictEqual(bad.status, 422);

  const ok = await request('POST', '/contato', {
    headers,
    body: form({ _csrf: csrf, name: 'Maria Silva', email: 'maria@empresa.com', phone: '(19) 99999-0000', subject: 'Solicitar orçamento', message: 'Preciso de teste em 3 PSVs para a parada de outubro.' }),
  });
  assert.strictEqual(ok.status, 302);
  assert.strictEqual(ok.headers.location, '/contato?enviado=1');
  assert.strictEqual(store.messages.all().length, 1);
});

test('painel exige login e aceita credenciais', async () => {
  const anon = await request('GET', '/admin');
  assert.strictEqual(anon.status, 302);
  const login = await request('GET', '/admin/login');
  const cookie = login.headers['set-cookie'][0].split(';')[0];
  const csrf = login.body.match(/name="_csrf" value="([^"]+)"/)[1];
  const headers = { cookie, 'content-type': 'application/x-www-form-urlencoded' };
  const wrong = await request('POST', '/admin/login', { headers, body: new URLSearchParams({ _csrf: csrf, user: 'admin', password: 'nope' }).toString() });
  assert.strictEqual(wrong.status, 401);
  const right = await request('POST', '/admin/login', { headers, body: new URLSearchParams({ _csrf: csrf, user: 'admin', password: 'secret' }).toString() });
  assert.strictEqual(right.status, 302);
  const newCookie = right.headers['set-cookie'][0].split(';')[0];
  const dash = await request('GET', '/admin', { headers: { cookie: newCookie } });
  assert.strictEqual(dash.status, 200);
  assert.ok(dash.body.includes('Mensagens não lidas'));
});

test('richText converte formatação simples', () => {
  const html = text.richText('## Título\n\nParágrafo com **negrito**.\n\n- item 1\n- item 2');
  assert.ok(html.includes('<h3>Título</h3>'));
  assert.ok(html.includes('<strong>negrito</strong>'));
  assert.ok(html.includes('<ul><li>item 1</li><li>item 2</li></ul>'));
  assert.strictEqual(text.richText('<p>x</p>'), '<p>x</p>');
});
