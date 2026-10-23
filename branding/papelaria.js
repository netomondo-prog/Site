'use strict';
const L = require('./lib');
const { render } = require('./render');
const { C } = L;

/* ---------- utilitários de cena ---------- */
function place(inner, w, h, { left, top, scale = 1, rotate = 0, shadow = true, radius = 0, z = 1, origin = 'center' }) {
  const sh = shadow ? 'box-shadow:0 2mm 4mm rgba(10,25,50,.18),0 10mm 22mm rgba(10,25,50,.22);' : '';
  return `<div style="position:absolute;left:${left}mm;top:${top}mm;width:${w * scale}mm;height:${h * scale}mm;transform:rotate(${rotate}deg);transform-origin:${origin};z-index:${z}">
    <div style="width:${w}mm;height:${h}mm;transform:scale(${scale});transform-origin:top left;${sh}border-radius:${radius}mm;overflow:hidden">${inner}</div></div>`;
}
const BG = {
  claro: 'radial-gradient(circle at 50% 42%,#ffffff 0%,#f3f4f6 45%,#dfe2e6 100%)',
  azul: `radial-gradient(circle at 50% 35%,#1a4f93 0%,${C.blueDeep} 55%,${C.blueNight} 100%)`,
  mesa: 'linear-gradient(160deg,#e9e7e2 0%,#d8d5ce 100%)',
  parede: 'linear-gradient(180deg,#d9dadc 0%,#c4c6c9 100%)',
};
function scene(bg, content, label, { dark = false, artefacto = true } = {}) {
  return `<section class="page" style="background:${bg}">
    ${content}
    ${artefacto ? `<div style="position:absolute;left:50%;bottom:8mm;width:30mm;transform:translateX(-50%);opacity:${dark ? 0.9 : 1};${dark ? 'filter:brightness(0) invert(1);' : ''}">${L.artefacto()}</div>` : ''}
    <div style="position:absolute;right:9mm;bottom:9.5mm;font-family:Montserrat;font-weight:500;font-size:7pt;letter-spacing:.2em;color:${dark ? 'rgba(255,255,255,.75)' : '#7a7f87'}">${label}</div>
  </section>`;
}
const note = (txt, dark = false) => `<div style="position:absolute;left:12mm;top:12mm;max-width:80mm;font-size:6.6pt;line-height:1.55;color:${dark ? 'rgba(255,255,255,.7)' : '#7a7f87'}">${txt}</div>`;

/* ---------- cenas ---------- */
const pages = [];

// Capa
pages.push(`<section class="page" style="background:${BG.claro}">
  <div style="position:absolute;left:50%;top:76mm;width:74mm;transform:translateX(-50%)">${L.artefacto()}</div>
  <div style="position:absolute;left:0;right:0;top:120mm;text-align:center;font-family:Montserrat">
    <div style="font-weight:700;font-size:13pt;letter-spacing:.24em;color:${C.blueDeep}">PAPELARIA JTECK</div>
    <div style="font-weight:400;font-size:9pt;letter-spacing:.18em;color:#7a7f87;margin-top:3mm">MOCKUPS PARA APROVAÇÃO</div>
  </div>
</section>`);

// Cartão de visitas
pages.push(scene(BG.claro, `
  ${note('Cartão 90 × 50 mm · couché 300 g · laminação fosca nas duas faces · verniz localizado no logotipo do verso.')}
  ${place(L.cardBack(), 90, 50, { left: 26, top: 40, scale: 1.4 })}
  ${place(L.cardFront(), 90, 50, { left: 58, top: 96, scale: 1.4, z: 2 })}
`, 'CARTÃO DE VISITAS'));

// Cartão em detalhe (plano, escala maior)
pages.push(scene(BG.mesa, `
  ${place(L.cardFront(), 90, 50, { left: 37.5, top: 26, scale: 1.5 })}
  ${place(L.cardBack(), 90, 50, { left: 37.5, top: 106, scale: 1.5 })}
`, 'CARTÃO DE VISITAS · FRENTE E VERSO'));

// Assinatura de e-mail
const win = `<div style="width:170mm;background:#fff;border-radius:2mm;overflow:hidden;font-family:Inter;box-shadow:0 10mm 24mm rgba(10,25,50,.25)">
  <div style="background:#eef2f8;padding:3mm 4mm;display:flex;justify-content:space-between;font-size:8pt;color:#1f2937;font-weight:500">Nova mensagem<span style="color:#6b7280">— ⤢ ✕</span></div>
  <div style="padding:2.6mm 4mm;border-bottom:0.2mm solid #e5e7eb;font-size:7.5pt;color:#6b7280">Para</div>
  <div style="padding:2.6mm 4mm;border-bottom:0.2mm solid #e5e7eb;font-size:7.5pt;color:#6b7280">Assunto: Proposta técnica — manutenção de PSVs</div>
  <div style="padding:4mm;font-size:7pt;line-height:1.6;color:#4b5563">Prezado cliente,<br><br>Segue em anexo a proposta para teste, calibração e emissão de RTS das válvulas de segurança listadas na sua solicitação. Ficamos à disposição para alinhar o cronograma da parada.<br><br>Atenciosamente,</div>
  <div style="padding:0 4mm 4mm"><div style="width:600px;height:170px;transform:scale(.75);transform-origin:top left;margin-bottom:-42px">${L.emailSignature()}</div></div>
</div>`;
pages.push(scene(BG.claro, `<div style="position:absolute;left:20mm;top:42mm">${win}</div>`, 'ASSINATURA DE E-MAIL'));

// Papel timbrado
pages.push(scene(BG.claro, `
  ${note('Papel timbrado A4 · offset 90 g · impressão 4×0.')}
  ${place(L.letterhead(), 210, 297, { left: 53, top: 22, scale: 0.5 })}
`, 'PAPEL TIMBRADO A4'));

// Envelope carta
pages.push(scene(BG.azul, `
  ${place(L.envelopeCartaVerso(), 229, 114, { left: 24, top: 30, scale: 0.7 })}
  ${place(L.envelopeCartaFrente(), 229, 114, { left: 24, top: 118, scale: 0.7 })}
`, 'ENVELOPE CARTA', { dark: true }));

// Envelope saco A4
pages.push(scene(BG.claro, `
  ${place(L.envelopeA4Verso(), 240, 340, { left: 16, top: 34, scale: 0.4 })}
  ${place(L.envelopeA4Frente(), 240, 340, { left: 108, top: 34, scale: 0.4 })}
`, 'ENVELOPE SACO A4'));

// Pasta A4
pages.push(scene(BG.mesa, `
  ${place(L.pastaCapa(), 220, 310, { left: 13, top: 38, scale: 0.4, radius: 1.5 })}
  ${place(`<div style="width:220mm;height:310mm;background:#f4f5f7;position:relative"><div style="position:absolute;left:0;right:0;bottom:0">${L.pastaBolso()}</div></div>`, 220, 310, { left: 109, top: 38, scale: 0.4, radius: 1.5 })}
`, 'PASTA A4'));

// Caderno
pages.push(scene(BG.mesa, `
  ${place(L.cadernoCapa(), 148, 210, { left: 22, top: 36, scale: 0.6, radius: 1.5 })}
  ${place(L.cadernoContracapa(), 148, 210, { left: 110, top: 36, scale: 0.6, radius: 1.5 })}
`, 'CADERNO A5 · CAPA E CONTRACAPA'));

// Crachá
const cord = (x, rot) => `<div style="position:absolute;left:${x}mm;top:-4mm;width:7mm;height:66mm;background:linear-gradient(90deg,${C.blueDeep},#163f7c,${C.blueDeep});transform:rotate(${rot}deg);transform-origin:top center;box-shadow:0 2mm 4mm rgba(0,0,0,.15)">${L.pattern({ opacity: 0.12, size: 4 })}</div>`;
pages.push(scene(BG.claro, `
  ${cord(96, 0)}${cord(107, 0)}
  <div style="position:absolute;left:99mm;top:56mm;width:12mm;height:8mm;border:1.2mm solid #b9bec5;border-radius:2mm;z-index:3"></div>
  ${place(L.cracha('Jean Pierre P. Silva', 'Diretor'), 54, 86, { left: 70, top: 62, scale: 1.3, radius: 3, z: 2 })}
`, 'CRACHÁ DE IDENTIFICAÇÃO'));

// Caneca
const mug = (art, flip = false) => `<div style="position:relative;width:62mm;height:74mm">
  <div style="position:absolute;${flip ? 'left' : 'right'}:-13mm;top:16mm;width:22mm;height:36mm;border:5mm solid #f2f3f5;border-radius:12mm;box-shadow:inset 0 0 2mm rgba(0,0,0,.12),0 2mm 4mm rgba(0,0,0,.15)"></div>
  <div style="position:absolute;inset:0;border-radius:2mm 2mm 7mm 7mm;background:linear-gradient(90deg,#d9dce0 0%,#ffffff 30%,#ffffff 55%,#e6e8eb 85%,#c9cdd2 100%);box-shadow:0 10mm 18mm rgba(0,0,0,.3);overflow:hidden">
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">${art}</div>
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.08),transparent 25%,transparent 70%,rgba(0,0,0,.1))"></div>
  </div>
  <div style="position:absolute;left:0;right:0;top:-2.5mm;height:5mm;border-radius:50%;background:radial-gradient(ellipse at center,#b8bcc2 0%,#eef0f2 70%)"></div>
</div>`;
pages.push(scene(BG.azul, `
  <div style="position:absolute;left:30mm;top:64mm">${mug(`<div style="width:46mm">${L.logo('cor')}</div>`, true)}</div>
  <div style="position:absolute;left:118mm;top:64mm">${mug(`<div style="width:26mm">${L.icon({ radius: 14, style: 'width:26mm;height:26mm' })}</div>`)}</div>
`, 'CANECAS', { dark: true }));

// Placa de recepção
pages.push(scene(BG.parede, `
  <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 59mm,rgba(0,0,0,.06) 59mm 59.4mm),repeating-linear-gradient(90deg,transparent 0 69mm,rgba(0,0,0,.05) 69mm 69.4mm)"></div>
  <div style="position:absolute;left:22mm;top:58mm;width:166mm;height:84mm;border-radius:2mm;background:linear-gradient(135deg,rgba(255,255,255,.85),rgba(255,255,255,.62));box-shadow:0 8mm 16mm rgba(0,0,0,.18),inset 0 0 0 0.6mm rgba(255,255,255,.9)">
    ${[[6, 6], [154, 6], [6, 72], [154, 72]].map(([x, y]) => `<div style="position:absolute;left:${x}mm;top:${y}mm;width:6mm;height:6mm;border-radius:50%;background:radial-gradient(circle at 35% 35%,#f4f5f6,#9ea3a9);box-shadow:0 1mm 1.5mm rgba(0,0,0,.25)"></div>`).join('')}
    <div style="position:absolute;left:50%;top:50%;width:122mm;transform:translate(-50%,-50%)">${L.logo('cor')}</div>
  </div>
`, 'PLACA DE RECEPÇÃO · ACRÍLICO'));

// Redes sociais
const banner = `<div style="width:198mm;height:50mm;position:relative;overflow:hidden;background:linear-gradient(120deg,#134887,${C.blueDeep} 60%,${C.blueNight})">
  ${L.pattern({ opacity: 0.06, size: 10 })}
  <div style="position:absolute;right:-6mm;top:-18mm;width:70mm;opacity:.16">${L.jFold({ blue: '#fff', flap: '#fff', flapOpacity: .6, style: 'width:70mm;height:auto' })}</div>
  <div style="position:absolute;left:60mm;top:15mm;font-family:Montserrat;color:#fff">
    <div style="font-weight:700;font-size:12pt">Precisão aplicada ao que mantém a indústria em movimento.</div>
    <div style="font-size:7pt;letter-spacing:.24em;color:rgba(255,255,255,.7);margin-top:2.5mm">MANUTENÇÃO · TESTES · CERTIFICAÇÃO DE VÁLVULAS</div>
  </div></div>`;
pages.push(scene(BG.claro, `
  ${note('Avatar com o ícone reduzido e capa para LinkedIn / Facebook. O avatar deve sempre usar o ícone, nunca o logotipo horizontal.')}
  <div style="position:absolute;left:6mm;top:44mm;border-radius:3mm;overflow:hidden;box-shadow:0 8mm 18mm rgba(10,25,50,.2);background:#fff">
    ${banner}
    <div style="height:46mm;position:relative;font-family:Inter">
      <div style="position:absolute;left:12mm;top:-16mm;width:34mm;height:34mm;border-radius:50%;overflow:hidden;border:1.6mm solid #fff;box-shadow:0 2mm 4mm rgba(0,0,0,.15)">${L.icon({ radius: 0, style: 'width:100%;height:100%' })}</div>
      <div style="position:absolute;left:52mm;top:5mm">
        <div style="font-family:Montserrat;font-weight:700;font-size:12pt;color:${C.ink}">JTECK Valve Service</div>
        <div style="font-size:7.5pt;color:#6b7280;margin-top:1mm">Manutenção, testes e certificação de válvulas industriais · Campinas, SP</div>
        <div style="display:flex;gap:3mm;margin-top:4mm"><span style="background:${C.blue};color:#fff;font-size:7pt;font-weight:600;padding:1.6mm 5mm;border-radius:5mm">Seguir</span><span style="border:0.3mm solid ${C.blue};color:${C.blue};font-size:7pt;font-weight:600;padding:1.3mm 5mm;border-radius:5mm">Mensagem</span></div>
      </div>
    </div>
  </div>
  <div style="position:absolute;left:150mm;top:150mm;display:flex;gap:6mm;align-items:center">
    <div style="width:16mm;height:16mm;border-radius:50%;overflow:hidden;box-shadow:0 2mm 4mm rgba(0,0,0,.15)">${L.icon({ radius: 0, style: 'width:100%;height:100%' })}</div>
    <div style="width:16mm;height:16mm;border-radius:50%;overflow:hidden;box-shadow:0 2mm 4mm rgba(0,0,0,.15)">${L.icon({ bg: '#fff', j: C.blue, radius: 0, style: 'width:100%;height:100%' })}</div>
  </div>
`, 'REDES SOCIAIS'));

// Contracapa
pages.push(`<section class="page" style="background:${BG.claro}">
  <div style="position:absolute;left:50%;top:70mm;width:80mm;transform:translateX(-50%)">${L.artefacto()}</div>
  <div style="position:absolute;left:0;right:0;top:122mm;text-align:center;font-family:Montserrat;font-size:9pt;color:#7a7f87;line-height:1.9">19 99675.8920<br>contato@artefacto.art.br</div>
</section>`);

const mockHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${L.baseCss('210mm', '210mm')}</style></head><body>${pages.join('\n')}</body></html>`;

/* ---------- arquivos de impressão ---------- */
const printDoc = (w, h, inner) => `<!doctype html><html><head><meta charset="utf-8"><style>${L.baseCss(w + 'mm', h + 'mm')}</style></head><body>${inner.map((x) => `<section class="page">${x}</section>`).join('')}</body></html>`;

(async () => {
  const only = process.argv[2];
  if (!only || only === 'mock') {
    await render({ name: 'papelaria-jteck-mockups', html: mockHtml, width: '210mm', height: '210mm', previews: process.argv.includes('--prev') ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [] });
  }
  if (!only || only === 'print') {
    await render({ name: 'impressao-cartao-de-visita-96x56mm-com-sangria', html: printDoc(96, 56, [L.cardFront(3), L.cardBack(3)]), width: '96mm', height: '56mm' });
    await render({ name: 'impressao-papel-timbrado-a4', html: printDoc(210, 297, [L.letterhead()]), width: '210mm', height: '297mm' });
    await render({ name: 'impressao-envelope-carta-229x114mm', html: printDoc(229, 114, [L.envelopeCartaFrente(), L.envelopeCartaVerso()]), width: '229mm', height: '114mm' });
    await render({ name: 'impressao-envelope-saco-a4-240x340mm', html: printDoc(240, 340, [L.envelopeA4Frente(), L.envelopeA4Verso()]), width: '240mm', height: '340mm' });
    await render({ name: 'impressao-pasta-a4-capa-e-bolso', html: printDoc(220, 310, [L.pastaCapa(), `<div style="position:absolute;left:0;bottom:0">${L.pastaBolso()}</div>`]), width: '220mm', height: '310mm' });
    await render({ name: 'impressao-caderno-a5-capa-e-contracapa', html: printDoc(148, 210, [L.cadernoCapa(), L.cadernoContracapa()]), width: '148mm', height: '210mm' });
    await render({ name: 'impressao-cracha-54x86mm', html: printDoc(54, 86, [L.cracha()]), width: '54mm', height: '86mm' });
    // assinatura de e-mail: PNG 2x e HTML
    const fs = require('fs');
    const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    const sigHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${L.baseCss('600px', '170px')}</style></head><body><section class="page">${L.emailSignature()}</section></body></html>`;
    fs.writeFileSync(__dirname + '/_sig.html', sigHtml);
    const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
    const p = await b.newPage({ viewport: { width: 600, height: 170 }, deviceScaleFactor: 2 });
    await p.goto('file://' + __dirname + '/_sig.html');
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: __dirname + '/out/assinatura-email-jteck.png' });
    await b.close();
  }
  console.log('papelaria ok');
})();
