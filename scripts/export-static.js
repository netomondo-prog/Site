#!/usr/bin/env node
'use strict';

/**
 * Exporta o site como arquivos estáticos (HTML/CSS/JS/imagens) em ./dist,
 * prontos para hospedagem simples por FTP (aprovação do cliente, hospedagem
 * compartilhada, etc.).
 *
 * Uso:
 *   node scripts/export-static.js                    # caminhos relativos (funciona em qualquer pasta)
 *   BASE_PATH=/jtec node scripts/export-static.js    # caminhos absolutos a partir de /jtec
 *   SITE_URL=https://exemplo.com.br node scripts/export-static.js   # URL usada em og:url e compartilhamento
 *
 * Diferenças em relação ao site dinâmico:
 *  - o formulário de contato envia a mensagem pelo WhatsApp (não há servidor);
 *  - a busca de produtos filtra na própria página;
 *  - o painel administrativo não existe na versão estática.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const BASE = String(process.env.BASE_PATH || '').replace(/\/$/, '');
const SITE_URL = String(process.env.SITE_URL || '').replace(/\/$/, '');

const app = require('../src/app');
const store = require('../src/lib/store');

function rimraf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function fetchText(base, urlPath) {
  return new Promise((resolve, reject) => {
    http
      .get(base + urlPath, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      })
      .on('error', reject);
  });
}

/** Converte "/produtos?categoria=x" e "/blog?tag=T" em pastas estáticas. */
function staticPath(urlPath) {
  const [p, query = ''] = urlPath.split('?');
  const params = new URLSearchParams(query);
  if (p === '/produtos' && params.get('categoria')) return `/produtos/categoria/${params.get('categoria')}/`;
  if (p === '/blog' && params.get('tag')) return `/blog/tag/${store.slugify(params.get('tag'))}/`;
  return p === '/' ? '/' : `${p}/`;
}

function transform(html, pagePath) {
  let out = html;

  // URLs absolutas do servidor local (og:url, compartilhamento, JSON-LD)
  out = out.replace(/http:\/\/127\.0\.0\.1:\d+/g, SITE_URL);
  out = out.replace(/http%3A%2F%2F127\.0\.0\.1%3A\d+/g, encodeURIComponent(SITE_URL));

  // Links com query string viram pastas
  out = out.replace(/href="\/produtos\?categoria=([^"&]+)(?:&amp;[^"]*)?"/g, (m, c) => `href="/produtos/categoria/${c}/"`);
  out = out.replace(/href="\/blog\?tag=([^"]+)"/g, (m, t) => `href="/blog/tag/${store.slugify(decodeURIComponent(t))}/"`);
  out = out.replace(/href="\/produtos\?q=[^"]*"/g, 'href="/produtos/"');

  // Links internos ganham barra final (pastas com index.html)
  out = out.replace(/href="\/(empresa|servicos|produtos|blog|contato)(\/[^"?#]*)?(\?[^"#]*)?(#[^"]*)?"/g, (m, a, b = '', q = '', h = '') => {
    const p = `/${a}${b}`.replace(/\/$/, '');
    return `href="${p}/${q}${h}"`;
  });

  // Área restrita não existe na versão estática
  out = out.replace(/<span><a href="\/admin"[^>]*>[^<]*<\/a><\/span>/, '<span></span>');

  // Script de comportamento estático (formulário → WhatsApp, busca local)
  out = out.replace('</body>', '<script src="/js/static.js" defer></script>\n</body>');

  if (BASE) {
    // Caminhos absolutos a partir da subpasta informada
    out = out.replace(/(href|src|action)="\/(?!\/)/g, `$1="${BASE}/`);
  } else {
    // Caminhos relativos: funcionam na raiz do domínio ou em qualquer subpasta
    const depth = pagePath.split('/').filter(Boolean).length;
    const prefix = depth ? '../'.repeat(depth) : './';
    out = out.replace(/(href|src|action)="\/(?!\/)([^"]*)"/g, (m, attr, rest) => `${attr}="${prefix}${rest}"`);
  }
  return out;
}

const STATIC_JS = `/* JTEC - comportamento da versão estática (hospedagem sem Node.js) */
(function () {
  'use strict';
  var params = new URLSearchParams(location.search);

  // Pré-seleciona o assunto vindo da URL (?assunto=...)
  var subject = document.getElementById('subject');
  if (subject && params.get('assunto')) subject.value = params.get('assunto');

  // Formulário de contato → WhatsApp
  var form = document.querySelector('form.form[action$="/contato/"], form.form[action$="/contato"]');
  var wa = document.querySelector('.whatsapp-float');
  if (form && wa) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (id) { var el = form.querySelector('#' + id); return el ? el.value.trim() : ''; };
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (el) {
        var f = el.closest('.field');
        var valid = el.value.trim().length > 0;
        if (f) f.classList.toggle('has-error', !valid);
        if (!valid) ok = false;
      });
      if (!ok) return;
      var text = 'Olá! Contato pelo site JTEC.\\n' +
        'Nome: ' + v('name') + '\\nE-mail: ' + v('email') + '\\nEmpresa: ' + (v('company') || '-') +
        '\\nTelefone: ' + v('phone') + '\\nCidade/UF: ' + (v('city') || '-') + '/' + (v('state') || '-') +
        '\\nAssunto: ' + v('subject') + '\\n\\n' + v('message');
      var number = (wa.getAttribute('href').match(/wa\\.me\\/(\\d+)/) || [])[1];
      window.open('https://wa.me/' + number + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      var alert = document.createElement('div');
      alert.className = 'alert alert--success';
      alert.setAttribute('role', 'status');
      alert.innerHTML = '<strong>Abrimos o WhatsApp com a sua mensagem.</strong> Basta confirmar o envio na janela que se abriu.';
      form.parentNode.insertBefore(alert, form);
      form.reset();
      window.scrollTo({ top: alert.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
    });
  }

  // Busca de produtos na própria página
  var search = document.querySelector('form.search');
  if (search) {
    var input = search.querySelector('input[name=q]');
    var filter = function () {
      var q = input.value.trim().toLowerCase();
      var visible = 0;
      document.querySelectorAll('.product-card').forEach(function (card) {
        var show = !q || card.textContent.toLowerCase().indexOf(q) >= 0;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      var count = document.querySelector('.results-count');
      if (count) count.textContent = visible + (visible === 1 ? ' produto' : ' produtos') + (q ? ' para "' + input.value.trim() + '"' : '');
    };
    search.addEventListener('submit', function (e) { e.preventDefault(); filter(); });
    input.addEventListener('input', filter);
    if (params.get('q')) { input.value = params.get('q'); filter(); }
  }
})();
`;

(async () => {
  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;

  const site = store.settings.get();
  const paths = ['/', '/empresa', '/servicos', '/produtos', '/blog', '/contato'];
  store.services.published().forEach((s) => paths.push(`/servicos/${s.slug}`));
  store.products.published().forEach((p) => paths.push(`/produtos/${p.slug}`));
  store.posts.published().forEach((p) => paths.push(`/blog/${p.slug}`));
  (site.productCategories || []).forEach((c) => paths.push(`/produtos?categoria=${c.slug}`));
  [...new Set(store.posts.published().flatMap((p) => p.tags || []))].forEach((t) => paths.push(`/blog?tag=${encodeURIComponent(t)}`));

  rimraf(DIST);
  copyDir(path.join(ROOT, 'public'), DIST);
  fs.writeFileSync(path.join(DIST, 'js', 'static.js'), STATIC_JS);

  let count = 0;
  for (const p of paths) {
    const { status, body } = await fetchText(base, p);
    if (status !== 200) throw new Error(`Falha ao renderizar ${p}: HTTP ${status}`);
    const sp = staticPath(p);
    const target = path.join(DIST, sp, 'index.html');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, transform(body, sp));
    count++;
  }

  const notFound = await fetchText(base, '/pagina-inexistente');
  fs.writeFileSync(path.join(DIST, '404.html'), transform(notFound.body, '/'));
  fs.writeFileSync(path.join(DIST, '.htaccess'), `DirectoryIndex index.html\n${BASE ? `ErrorDocument 404 ${BASE}/404.html\n` : ''}`);
  fs.writeFileSync(path.join(DIST, 'robots.txt'), 'User-agent: *\nAllow: /\n');

  server.close();
  console.log(`Exportadas ${count} páginas para ${path.relative(ROOT, DIST)}/ (${BASE ? `base: ${BASE}` : 'caminhos relativos'})`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
