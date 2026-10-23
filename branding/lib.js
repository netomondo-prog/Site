'use strict';
/* Biblioteca compartilhada da identidade JTECK: tokens, logotipos, ícones e peças em tamanho real. */
const fs = require('fs');
const path = require('path');

const A = path.join(__dirname, 'assets');
const read = (f) => fs.readFileSync(path.join(A, f), 'utf8');
const parts = JSON.parse(read('parts.json'));

/* ---------- Tokens ---------- */
const C = {
  blue: '#064590',
  blueDeep: '#0b2347',
  blueNight: '#061631',
  blueSoft: '#e7eef8',
  gray: '#7d7d7e',
  grayLight: '#d9d8d3',
  graySoft: '#f1f2f4',
  solar: '#e6af39',
  ink: '#1c2430',
  muted: '#6b7280',
  white: '#ffffff',
};

const DATA = {
  nome: 'Jean Pierre Pinheiro Silva',
  cargo: 'Diretor',
  email: 'jean@jteck.com.br',
  emailGeral: 'contato@jteck.com.br',
  site: 'www.jteck.com.br',
  tel: '+55 19 3245.2758',
  end1: 'R. Antônio Haddad, Nº 76',
  end2: 'Parque Via Norte, Campinas - SP',
};

/* ---------- SVGs ---------- */
const clean = (svg) => svg.replace(/<\?xml[^>]*>/, '').replace(/\swidth="[^"]*"\s+height="[^"]*"/, '');
const LOGO = {
  cor: clean(read('jteck-logo.svg')),
  negativo: clean(read('jteck-logo-negativo.svg')),
  preto: clean(read('jteck-logo-preto.svg')),
  branco: clean(read('jteck-logo-branco.svg')),
};
const ARTEFACTO = clean(read('artefacto.svg'));
const QR = { site: clean(read('qr-site.svg')), whats: clean(read('qr-whats.svg')) };

const logo = (v = 'cor', style = '') => LOGO[v].replace('<svg ', `<svg style="display:block;width:100%;height:auto;${style}" `);
const artefacto = (style = '') => ARTEFACTO.replace('<svg ', `<svg style="display:block;width:100%;height:auto;${style}" `);
const qr = (k = 'site', style = '') => QR[k].replace('<svg ', `<svg style="display:block;width:100%;height:auto;${style}" `);

/** J com a dobra (elemento gráfico). */
function jFold({ blue = C.blue, flap = C.grayLight, flapOpacity = 1, style = '' } = {}) {
  return `<svg viewBox="30 0 205 238" style="display:block;${style}" xmlns="http://www.w3.org/2000/svg">
    <path fill="${blue}" d="${parts.J}"/>
    <path fill="${flap}" fill-opacity="${flapOpacity}" d="${parts.FLAP}"/>
  </svg>`;
}

/** Ícone reduzido: J com dobra dentro de um quadrado, com o acento solar. */
function icon({ bg = C.blue, j = '#fff', flap = C.grayLight, radius = 18, style = '' } = {}) {
  return `<svg viewBox="0 0 100 100" style="display:block;${style}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="${radius}" fill="${bg}"/>
    <g transform="translate(24 18) scale(0.25) translate(-35 -2)">
      <path fill="${j}" d="${parts.J}"/>
      <path fill="${flap}" d="${parts.FLAP}"/>
    </g>
    <rect x="58" y="68" width="20" height="5" rx="2.5" fill="${C.solar}"/>
  </svg>`;
}

/** Módulo do "E" (três barras) — base do padrão gráfico. */
function eModule({ top = C.gray, mid = C.blue, bot = C.gray, style = '' } = {}) {
  return `<svg viewBox="558 33.5 241.5 200" style="display:block;${style}" xmlns="http://www.w3.org/2000/svg">
    <path fill="${top}" d="${parts.E_TOP}"/><path fill="${mid}" d="${parts.E_MID}"/><path fill="${bot}" d="${parts.E_BOT}"/>
  </svg>`;
}

/** Padrão modular (barras do E) para fundos. */
function pattern({ color = '#ffffff', opacity = 0.06, size = 14, id = 'p' + Math.random().toString(36).slice(2, 7) } = {}) {
  const w = size * 2.4;
  const h = size * 2;
  return `<svg width="100%" height="100%" style="position:absolute;inset:0" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <defs><pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">
      <g fill="${color}" fill-opacity="${opacity}">
        <rect x="0" y="0" width="${size}" height="${size * 0.2}"/>
        <rect x="0" y="${size * 0.39}" width="${size}" height="${size * 0.2}" fill-opacity="${opacity * 1.6}"/>
        <rect x="0" y="${size * 0.78}" width="${size}" height="${size * 0.2}"/>
        <rect x="${w / 2}" y="${h / 2}" width="${size}" height="${size * 0.2}"/>
        <rect x="${w / 2}" y="${h / 2 + size * 0.39}" width="${size}" height="${size * 0.2}" fill-opacity="${opacity * 1.6}"/>
        <rect x="${w / 2}" y="${h / 2 + size * 0.78}" width="${size}" height="${size * 0.2}"/>
      </g></pattern></defs>
    <rect width="100%" height="100%" fill="url(#${id})"/>
  </svg>`;
}

/* ---------- Ícones de contato ---------- */
const ICONS = {
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  pin: '<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  whats: '<path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.4-4.2A8.5 8.5 0 1 1 20.5 11.7z"/>',
};
const ic = (n, color = C.blue, size = '1em') =>
  `<svg viewBox="0 0 24 24" style="width:${size};height:${size};flex:none" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg>`;

/* ---------- CSS base ---------- */
function baseCss(pageW, pageH) {
  const f = (fam, w) => `@font-face{font-family:'${fam}';font-weight:${w};src:url('fonts/${fam.toLowerCase()}-${w}.ttf')}`;
  return `
  ${[300, 400, 500, 600, 700, 800].map((w) => f('Montserrat', w)).join('\n')}
  ${[300, 400, 500, 600].map((w) => f('Inter', w)).join('\n')}
  @page{size:${pageW} ${pageH};margin:0}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{font-family:'Inter',sans-serif;color:${C.ink}}
  .page{width:${pageW};height:${pageH};position:relative;overflow:hidden;page-break-after:always;break-after:page}
  .page:last-child{page-break-after:auto;break-after:auto}
  .mont{font-family:'Montserrat',sans-serif}
  `;
}

/* ================= PEÇAS EM TAMANHO REAL ================= */

/** Cartão de visita frente (90x50 mm + sangria). */
function cardFront(b = 0) {
  const W = 90 + 2 * b, H = 50 + 2 * b;
  return `<div style="width:${W}mm;height:${H}mm;background:#fff;position:relative;overflow:hidden;font-family:Inter">
    <div style="position:absolute;right:${-7 + b}mm;top:${-15 + b}mm;width:40mm;transform:rotate(0deg)">
      ${jFold({ blue: C.blue, flap: C.grayLight, style: 'width:40mm;height:auto' })}
    </div>
    <div style="position:absolute;left:${7 + b}mm;top:${7 + b}mm;width:40mm">${logo('cor')}</div>
    <div style="position:absolute;left:${7 + b}mm;top:${25 + b}mm">
      <div style="display:flex;align-items:center;gap:1.6mm">
        <span style="display:block;width:4mm;height:0.9mm;border-radius:0.45mm;background:${C.solar}"></span>
        <span class="mont" style="font-weight:700;font-size:8.4pt;color:${C.blueDeep};letter-spacing:.01em">${DATA.nome}</span>
      </div>
      <div style="font-size:6.6pt;color:${C.gray};margin:0.6mm 0 0 5.6mm;letter-spacing:.04em">${DATA.cargo}</div>
    </div>
    <div style="position:absolute;left:${7 + b}mm;right:${7 + b}mm;top:${33 + b}mm;height:0.25mm;background:linear-gradient(90deg,${C.blue},${C.gray})"></div>
    <div style="position:absolute;left:${7 + b}mm;top:${35.6 + b}mm;font-size:5.8pt;line-height:1.8;color:${C.ink}">
      <div style="display:flex;align-items:center;gap:1.3mm">${ic('mail', C.blue, '2.3mm')}${DATA.email}</div>
      <div style="display:flex;align-items:center;gap:1.3mm">${ic('globe', C.blue, '2.3mm')}${DATA.site}</div>
    </div>
    <div style="position:absolute;right:${7 + b}mm;top:${35.6 + b}mm;font-size:5.8pt;line-height:1.8;color:${C.ink};text-align:right">
      <div style="display:flex;align-items:center;gap:1.3mm;justify-content:flex-end">${DATA.tel}${ic('phone', C.blue, '2.3mm')}</div>
      <div style="display:flex;align-items:flex-start;gap:1.3mm;justify-content:flex-end;line-height:1.45;margin-top:.4mm"><span>${DATA.end1}<br>${DATA.end2}</span>${ic('pin', C.blue, '2.3mm')}</div>
    </div>
  </div>`;
}

/** Cartão de visita verso. */
function cardBack(b = 0) {
  const W = 90 + 2 * b, H = 50 + 2 * b;
  return `<div style="width:${W}mm;height:${H}mm;background:linear-gradient(160deg,#0f3a78 0%,${C.blueDeep} 55%,${C.blueNight} 100%);position:relative;overflow:hidden">
    ${pattern({ color: '#ffffff', opacity: 0.05, size: 11 })}
    <div style="position:absolute;left:50%;top:50%;width:46mm;transform:translate(-50%,-58%)">${logo('negativo')}</div>
    <div style="position:absolute;left:0;right:0;bottom:${6 + b}mm;text-align:center;font-family:Montserrat;font-weight:500;font-size:6pt;letter-spacing:.32em;color:rgba(255,255,255,.7)">${DATA.site.toUpperCase()}</div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:${1.6 + b}mm;background:linear-gradient(90deg,${C.blue} 0 62%,${C.gray} 62% 92%,${C.solar} 92%)"></div>
  </div>`;
}

/** Papel timbrado A4. */
function letterhead() {
  return `<div style="width:210mm;height:297mm;background:#fff;position:relative;overflow:hidden;font-family:Inter">
    <div style="position:absolute;left:20mm;top:18mm;width:58mm">${logo('cor')}</div>
    <div style="position:absolute;right:20mm;top:22mm;text-align:right;font-size:7.5pt;line-height:1.6;color:${C.muted}">
      <div style="font-family:Montserrat;font-weight:600;color:${C.blueDeep};letter-spacing:.18em;font-size:7pt">MANUTENÇÃO · TESTES · CERTIFICAÇÃO</div>
      <div>Válvulas de segurança, alívio e controle</div>
    </div>
    <div style="position:absolute;left:20mm;right:20mm;top:42mm;height:0.3mm;background:linear-gradient(90deg,${C.blue},${C.grayLight})"></div>
    <div style="position:absolute;right:-38mm;bottom:22mm;width:150mm;opacity:.06">${jFold({ blue: C.blue, flap: C.gray, style: 'width:150mm;height:auto' })}</div>
    <div style="position:absolute;left:20mm;right:20mm;bottom:14mm;display:flex;justify-content:space-between;align-items:flex-end;font-size:7.3pt;color:${C.ink};line-height:1.55">
      <div style="display:flex;gap:6mm">
        <span style="display:flex;align-items:center;gap:1.5mm">${ic('phone', C.blue, '3mm')}${DATA.tel}</span>
        <span style="display:flex;align-items:center;gap:1.5mm">${ic('mail', C.blue, '3mm')}${DATA.emailGeral}</span>
        <span style="display:flex;align-items:center;gap:1.5mm">${ic('globe', C.blue, '3mm')}${DATA.site}</span>
      </div>
      <span style="display:flex;align-items:center;gap:1.5mm">${ic('pin', C.blue, '3mm')}${DATA.end1} · ${DATA.end2}</span>
    </div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:5mm;background:linear-gradient(90deg,${C.blue} 0 64%,${C.gray} 64% 93%,${C.solar} 93%)"></div>
  </div>`;
}

/** Envelope carta (229 x 114 mm) — frente e verso. */
function envelopeCartaFrente() {
  return `<div style="width:229mm;height:114mm;background:#fff;position:relative;overflow:hidden;font-family:Inter">
    <div style="position:absolute;left:14mm;top:12mm;width:52mm">${logo('cor')}</div>
    <div style="position:absolute;left:14mm;top:31mm;font-size:7pt;line-height:1.6;color:${C.muted}">${DATA.end1}<br>${DATA.end2}<br>${DATA.tel} · ${DATA.site}</div>
    <div style="position:absolute;right:14mm;top:58mm;width:96mm;height:36mm;border:0.25mm dashed ${C.grayLight};border-radius:2mm;display:flex;align-items:flex-start;padding:4mm;font-family:Montserrat;font-size:6.5pt;letter-spacing:.2em;color:${C.gray}">DESTINATÁRIO</div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:4mm;background:linear-gradient(90deg,${C.blue} 0 64%,${C.gray} 64% 93%,${C.solar} 93%)"></div>
  </div>`;
}
function envelopeCartaVerso() {
  return `<div style="width:229mm;height:114mm;background:#fff;position:relative;overflow:hidden;font-family:Inter">
    <div style="position:absolute;left:0;top:0;width:229mm;height:40mm;background:linear-gradient(170deg,#0f3a78,${C.blueDeep});clip-path:polygon(0 0,100% 0,100% 38%,52% 100%,48% 100%,0 38%)">${pattern({ opacity: 0.06, size: 9 })}</div>
    <div style="position:absolute;right:-10mm;bottom:-30mm;width:86mm;opacity:.07">${jFold({ blue: C.blue, flap: C.gray, style: 'width:86mm;height:auto' })}</div>
    <div style="position:absolute;left:50%;top:58mm;width:58mm;transform:translateX(-50%)">${logo('cor')}</div>
    <div style="position:absolute;left:0;right:0;top:80mm;text-align:center;font-size:7pt;color:${C.muted}">${DATA.tel} · ${DATA.site}</div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:4mm;background:linear-gradient(90deg,${C.blue} 0 64%,${C.gray} 64% 93%,${C.solar} 93%)"></div>
  </div>`;
}

/** Envelope saco A4 (240 x 340 mm). */
function envelopeA4Frente() {
  return `<div style="width:240mm;height:340mm;background:#fff;position:relative;overflow:hidden;font-family:Inter">
    <div style="position:absolute;left:0;right:0;top:0;height:6mm;background:linear-gradient(90deg,${C.blue} 0 64%,${C.gray} 64% 93%,${C.solar} 93%)"></div>
    <div style="position:absolute;left:50%;top:120mm;width:120mm;transform:translateX(-50%)">${logo('cor')}</div>
    <div style="position:absolute;right:22mm;bottom:40mm;width:110mm;height:44mm;border:0.3mm dashed ${C.grayLight};border-radius:2.5mm;padding:5mm;font-family:Montserrat;font-size:8pt;letter-spacing:.2em;color:${C.gray}">DESTINATÁRIO</div>
    <div style="position:absolute;left:22mm;bottom:20mm;font-size:8pt;line-height:1.6;color:${C.muted}">
      <b style="color:${C.blueDeep};font-family:Montserrat;letter-spacing:.14em;font-size:7.5pt">REMETENTE</b><br>${DATA.end1} · ${DATA.end2}<br>${DATA.tel} · ${DATA.site}</div>
  </div>`;
}
function envelopeA4Verso() {
  return `<div style="width:240mm;height:340mm;background:#fff;position:relative;overflow:hidden">
    <div style="position:absolute;left:0;top:0;right:0;height:70mm;background:linear-gradient(170deg,#0f3a78,${C.blueDeep});border-radius:0 0 18mm 18mm">${pattern({ opacity: 0.05, size: 12 })}</div>
    <div style="position:absolute;left:50%;bottom:62mm;width:44mm;transform:translateX(-50%)">${jFold({ style: 'width:44mm;height:auto' })}</div>
    <div style="position:absolute;left:0;right:0;bottom:30mm;text-align:center;font-family:Inter;font-size:8pt;color:${C.muted};line-height:1.6">${DATA.tel} · ${DATA.site}<br>${DATA.end1} · ${DATA.end2}</div>
  </div>`;
}

/** Pasta A4 — capa (220 x 310 mm) e bolso interno. */
function pastaCapa() {
  return `<div style="width:220mm;height:310mm;background:linear-gradient(165deg,#134887 0%,${C.blueDeep} 50%,${C.blueNight} 100%);position:relative;overflow:hidden">
    ${pattern({ opacity: 0.045, size: 16 })}
    <div style="position:absolute;right:-30mm;top:-34mm;width:150mm;opacity:.16">${jFold({ blue: '#fff', flap: '#fff', flapOpacity: 0.6, style: 'width:150mm;height:auto' })}</div>
    <div style="position:absolute;left:24mm;top:150mm;width:120mm">${logo('negativo')}</div>
    <div style="position:absolute;left:24mm;bottom:24mm;font-family:Montserrat;font-weight:500;font-size:9pt;letter-spacing:.3em;color:rgba(255,255,255,.75)">${DATA.site.toUpperCase()}</div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:6mm;background:linear-gradient(90deg,${C.blue} 0 64%,${C.gray} 64% 93%,${C.solar} 93%)"></div>
  </div>`;
}
function pastaBolso() {
  return `<div style="width:220mm;height:110mm;background:#fff;position:relative;overflow:hidden;font-family:Inter;clip-path:polygon(0 18%,62% 0,100% 0,100% 100%,0 100%)">
    <div style="position:absolute;left:0;right:0;top:0;height:6mm;background:linear-gradient(90deg,${C.solar},${C.gray})"></div>
    <div style="position:absolute;left:16mm;top:40mm;width:80mm">${logo('cor')}</div>
    <div style="position:absolute;left:16mm;top:68mm;font-size:8pt;line-height:1.75;color:${C.ink}">
      <div style="display:flex;gap:2mm;align-items:center">${ic('phone', C.blue, '3.4mm')}${DATA.tel}</div>
      <div style="display:flex;gap:2mm;align-items:center">${ic('mail', C.blue, '3.4mm')}${DATA.emailGeral}</div>
      <div style="display:flex;gap:2mm;align-items:center">${ic('pin', C.blue, '3.4mm')}${DATA.end1} · ${DATA.end2}</div>
    </div>
    <div style="position:absolute;right:16mm;top:46mm;width:30mm">${qr('site')}</div>
    <div style="position:absolute;right:16mm;top:79mm;width:30mm;text-align:center;font-size:6pt;letter-spacing:.2em;color:${C.gray};font-family:Montserrat">ACESSE O SITE</div>
  </div>`;
}

/** Caderno A5 — capa e contracapa. */
function cadernoCapa() {
  return `<div style="width:148mm;height:210mm;background:linear-gradient(170deg,#134887 0%,${C.blueDeep} 55%,${C.blueNight} 100%);position:relative;overflow:hidden">
    ${pattern({ opacity: 0.05, size: 12 })}
    <div style="position:absolute;left:50%;top:50%;width:70mm;transform:translate(-50%,-62%);opacity:.18">${jFold({ blue: '#fff', flap: '#fff', flapOpacity: .6, style: 'width:70mm;height:auto' })}</div>
    <div style="position:absolute;right:12mm;bottom:14mm;width:44mm">${logo('negativo')}</div>
  </div>`;
}
function cadernoContracapa() {
  return `<div style="width:148mm;height:210mm;background:#fff;position:relative;overflow:hidden;font-family:Inter">
    <div style="position:absolute;left:50%;top:62mm;width:76mm;transform:translateX(-50%)">${logo('cor')}</div>
    <div style="position:absolute;left:12mm;right:12mm;top:138mm;height:0.4mm;background:linear-gradient(90deg,${C.blue},transparent)"></div>
    <div style="position:absolute;left:12mm;top:146mm;font-size:7.5pt;line-height:2;color:${C.ink}">
      <div style="display:flex;gap:2mm;align-items:center">${ic('phone', C.blue, '3.2mm')}${DATA.tel}</div>
      <div style="display:flex;gap:2mm;align-items:center">${ic('mail', C.blue, '3.2mm')}${DATA.emailGeral}</div>
      <div style="display:flex;gap:2mm;align-items:center">${ic('pin', C.blue, '3.2mm')}<span>${DATA.end1}<br>${DATA.end2}</span></div>
    </div>
    <div style="position:absolute;right:12mm;top:146mm;width:24mm">${qr('site')}</div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:5mm;background:linear-gradient(90deg,${C.blue} 0 64%,${C.gray} 64% 93%,${C.solar} 93%)"></div>
  </div>`;
}

/** Crachá 54 x 86 mm. */
function cracha(nome = 'Nome do Colaborador', funcao = 'Técnico de Válvulas') {
  return `<div style="width:54mm;height:86mm;background:#fff;position:relative;overflow:hidden;border-radius:3mm;font-family:Inter">
    <div style="position:absolute;left:0;right:0;top:0;height:30mm;background:linear-gradient(165deg,#134887,${C.blueDeep})">${pattern({ opacity: 0.06, size: 8 })}
      <div style="position:absolute;left:50%;top:7mm;width:6mm;height:2mm;border-radius:1mm;background:rgba(255,255,255,.35);transform:translateX(-50%)"></div>
      <div style="position:absolute;left:50%;top:14mm;width:34mm;transform:translateX(-50%)">${logo('negativo')}</div></div>
    <div style="position:absolute;left:50%;top:24mm;width:26mm;height:30mm;transform:translateX(-50%);border-radius:2mm;background:linear-gradient(180deg,#e9ecf0,#cfd4da);border:0.8mm solid #fff;display:flex;align-items:center;justify-content:center;color:#9aa3ad;font-size:5pt;letter-spacing:.2em">FOTO</div>
    <div style="position:absolute;left:0;right:0;top:58mm;text-align:center">
      <div class="mont" style="font-family:Montserrat;font-weight:700;font-size:8pt;color:${C.blueDeep}">${nome}</div>
      <div style="font-size:6pt;color:${C.gray};margin-top:1mm;letter-spacing:.06em">${funcao}</div>
      <div style="width:6mm;height:0.9mm;background:${C.solar};border-radius:.45mm;margin:2.5mm auto 0"></div>
    </div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:3mm;background:linear-gradient(90deg,${C.blue} 0 64%,${C.gray} 64% 93%,${C.solar} 93%)"></div>
  </div>`;
}

/** Assinatura de e-mail (600 x 170 px). */
function emailSignature() {
  return `<div style="width:600px;height:170px;background:#fff;position:relative;overflow:hidden;font-family:Inter">
    <div style="position:absolute;left:0;top:0;bottom:0;width:150px;background:linear-gradient(165deg,#134887,${C.blueDeep});clip-path:polygon(0 0,100% 0,72% 100%,0 100%)">${pattern({ opacity: 0.07, size: 9 })}
      <div style="position:absolute;left:24px;top:38px;width:62px">${jFold({ blue: '#fff', flap: C.grayLight, style: 'width:62px;height:auto' })}</div></div>
    <div style="position:absolute;left:150px;top:22px">
      <div style="display:flex;align-items:center;gap:8px"><span style="display:block;width:16px;height:4px;border-radius:2px;background:${C.solar}"></span>
      <span style="font-family:Montserrat;font-weight:700;font-size:16px;color:${C.blueDeep}">${DATA.nome}</span></div>
      <div style="font-size:12px;color:${C.gray};margin:2px 0 10px 24px;letter-spacing:.04em">${DATA.cargo}</div>
      <div style="font-size:11.5px;line-height:1.7;color:${C.ink};margin-left:24px">
        <div style="display:flex;gap:6px;align-items:center">${ic('phone', C.blue, '13px')}${DATA.tel}</div>
        <div style="display:flex;gap:6px;align-items:center">${ic('mail', C.blue, '13px')}${DATA.email}</div>
        <div style="display:flex;gap:6px;align-items:center">${ic('pin', C.blue, '13px')}${DATA.end1} · ${DATA.end2}</div>
      </div>
    </div>
    <div style="position:absolute;right:22px;top:26px;width:130px">${logo('cor')}</div>
    <div style="position:absolute;right:22px;top:70px;width:130px;text-align:center;font-family:Montserrat;font-weight:600;font-size:9px;letter-spacing:.22em;color:${C.blue}">${DATA.site.toUpperCase()}</div>
    <div style="position:absolute;left:150px;right:0;bottom:0;height:5px;background:linear-gradient(90deg,${C.blue} 0 64%,${C.gray} 64% 93%,${C.solar} 93%)"></div>
  </div>`;
}

/** Logotipo como grupo SVG em coordenadas originais (viewBox 30 0 1348 350). */
function logoPaths({ blue = C.blue, gray = C.gray, flap = C.grayLight, flapOpacity = 1, gold = C.solar } = {}) {
  return `<g fill="${blue}"><path d="${parts.J}"/><path d="${parts.T}"/><path d="${parts.E_MID}"/><path d="${parts.TEXT}"/></g>
    <path fill="${flap}" fill-opacity="${flapOpacity}" d="${parts.FLAP}"/>
    <g fill="${gray}"><path d="${parts.E_TOP}"/><path d="${parts.E_BOT}"/><path d="${parts.C}"/><path d="${parts.K}"/></g>
    <rect fill="${gold}" x="945" y="126" width="82.5" height="14" rx="7"/>`;
}

/* ---------- Elementos de página dos documentos A4 deitados ---------- */
function tab(label) {
  return `<div style="position:absolute;right:14mm;top:0;width:76mm;height:21mm;background:${C.blueDeep};border-radius:0 0 7mm 7mm;display:flex;align-items:flex-end;justify-content:center;padding-bottom:4.6mm;gap:2.2mm">
    <span style="display:block;width:4mm;height:1mm;border-radius:.5mm;background:${C.solar};margin-bottom:1.3mm"></span>
    <span style="font-family:Montserrat;font-weight:700;font-size:11.5pt;letter-spacing:.04em;color:#d6dbe3">${label}</span></div>`;
}
function folio(n, doc, dark = false) {
  const c = dark ? 'rgba(255,255,255,.55)' : '#9aa0a8';
  return `<div style="position:absolute;left:18mm;right:18mm;bottom:9mm;display:flex;justify-content:space-between;font-family:Montserrat;font-size:6.5pt;letter-spacing:.18em;color:${c}">
    <span>JTECK VALVE SERVICE · ${doc}</span><span style="font-weight:700">${String(n).padStart(2, '0')}</span></div>`;
}

module.exports = {
  logoPaths, tab, folio,
  C, DATA, parts, logo, artefacto, qr, jFold, icon, eModule, pattern, ic, baseCss,
  cardFront, cardBack, letterhead, envelopeCartaFrente, envelopeCartaVerso, envelopeA4Frente, envelopeA4Verso,
  pastaCapa, pastaBolso, cadernoCapa, cadernoContracapa, cracha, emailSignature,
};
