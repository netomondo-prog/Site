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
  const p = await b.newPage();
  await p.goto('file://' + file, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: path.join(dir, 'out', `${name}.pdf`), width, height, printBackground: true, preferCSSPageSize: true });
  if (previews.length) {
    const px = (v) => Math.round(parseFloat(v) * (v.endsWith('mm') ? 3.7795 : 1));
    const W = px(width), H = px(height);
    await p.setViewportSize({ width: W, height: H });
    for (const i of previews) {
      const el = (await p.$$('.page'))[i];
      if (el) await el.screenshot({ path: path.join(dir, 'prev', `${name}-${String(i + 1).padStart(2, '0')}.png`) });
    }
  }
  await b.close();
}
module.exports = { render };
