'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

/** Gera PDF (vetorial) de um HTML completo. Opcionalmente salva PNG de páginas para conferência. */
async function render({ name, html, width, height, previews = [] }) {
  const dir = __dirname;
  const file = path.join(dir, `_${name}.html`);
  fs.writeFileSync(file, html);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const px = (v) => Math.round(parseFloat(v) * (v.endsWith('mm') ? 3.7795275591 : 1));
  // A janela precisa ter exatamente o tamanho da página; senão o Chrome reduz o conteúdo ao imprimir.
  const p = await b.newPage({ viewport: { width: px(width), height: px(height) } });
  await p.goto('file://' + file, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  // Gera cada página isolada e junta no fim: evita que o Chrome reduza o documento
  // inteiro quando alguma página tem elementos girados ou recortados.
  const total = await p.$$eval('section.page', (s) => s.length);
  const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'pg-'));
  const files = [];
  for (let i = 0; i < total; i++) {
    const q = await b.newPage({ viewport: { width: px(width), height: px(height) } });
    await q.goto('file://' + file, { waitUntil: 'load' });
    await q.evaluate((k) => document.querySelectorAll('section.page').forEach((s, j) => { if (j !== k) s.remove(); }), i);
    await q.evaluate(() => document.fonts.ready);
    const out = path.join(tmpDir, `p${String(i).padStart(3, '0')}.pdf`);
    await q.pdf({ path: out, width, height, printBackground: true, preferCSSPageSize: true });
    files.push(out);
    await q.close();
  }
  const dest = path.join(dir, 'out', `${name}.pdf`);
  if (files.length === 1) fs.copyFileSync(files[0], dest);
  else require('child_process').execFileSync('pdfunite', [...files, dest]);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  if (previews.length) {
    for (const i of previews) {
      const el = (await p.$$('.page'))[i];
      if (el) await el.screenshot({ path: path.join(dir, 'prev', `${name}-${String(i + 1).padStart(2, '0')}.png`) });
    }
  }
  await b.close();
}
module.exports = { render };
