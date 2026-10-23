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
/** Fundo institucional único: Azul JTECK → Azul profundo. */
C.bgInst = `linear-gradient(165deg,${C.blue} 0%,${C.blueDeep} 70%)`;

const DATA = {
  nome: 'Jean Pierre Pinheiro Silva',
  cargo: 'Diretor',
  email: 'jean@jteck.com.br',
  emailGeral: 'contato@jteck.com.br',
  site: 'www.jteck.com.br',
  tel: '+55 19 3245.2758',
  end1: 'R. Antônio Haddad, Nº 76',
  end2: 'Parque Via Norte, Campinas – SP',
};

/* ---------- SVGs ---------- */
const clean = (svg) => svg.replace(/<\?xml[^>]*>/, '').replace(/\swidth="[^"]*"\s+height="[^"]*"/, '');
const LOGO = {
  cor: clean(read('jteck-logo.svg')),
  'preto-sem-dobra': clean(read('jteck-logo-preto-sem-dobra.svg')),
  negativo: clean(read('jteck-logo-negativo.svg')),
  preto: clean(read('jteck-logo-preto.svg')),
  branco: clean(read('jteck-logo-branco.svg')),
};
const ARTEFACTO = clean(read('artefacto.svg'));
const QR = { site: clean(read('qr-site.svg')), whats: clean(read('qr-whats.svg')) };

const logo = (v = 'cor', style = '') => LOGO[v].replace('<svg ', `<svg style="display:block;width:100%;height:auto;${style}" `);
const artefacto = (style = '') => ARTEFACTO.replace('<svg ', `<svg style="display:block;width:100%;height:auto;${style}" `);
const qr = (k = 'site', style = '') => QR[k].replace('<svg ', `<svg viewBox="0 0 250 250" style="display:block;width:100%;height:auto;${style}" `);

/** J com a dobra (elemento gráfico). A dobra vem antes, por baixo do J. */
function jFold({ blue = C.blue, flap = C.grayLight, flapOpacity = 1, style = '' } = {}) {
  return `<svg viewBox="30 0 205 238" style="display:block;${style}" xmlns="http://www.w3.org/2000/svg">
    <path fill="${flap}" fill-opacity="${flapOpacity}" d="${parts.FLAP}"/>
    <path fill="${blue}" d="${parts.J}"/>
  </svg>`;
}

const ICON_TF = (([k, x, y, ox, oy]) => `translate(${x} ${y}) scale(${k}) translate(${-ox} ${-oy})`)(parts.icon.tf);
/** Ícone reduzido: J com dobra num quadrado de raio 14, com o acento solar (mesma geometria do arquivo jteck-icone.svg). */
function icon({ bg = C.blue, j = '#fff', flap = C.grayLight, radius = 14, style = '' } = {}) {
  return `<svg viewBox="0 0 100 100" style="display:block;${style}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="${radius}" fill="${bg}"/>
    <g transform="${ICON_TF}">
      <path fill="${flap}" d="${parts.FLAP}"/>
      <path fill="${j}" d="${parts.J}"/>
    </g>
    <path fill="${C.solar}" d="${parts.icon.dash}"/>
  </svg>`;
}

/** Módulo do "E" (três barras) — base do padrão gráfico. */
function eModule({ top = C.gray, mid = C.blue, bot = C.gray, style = '' } = {}) {
  return `<svg viewBox="558 33.5 241.5 200" style="display:block;${style}" xmlns="http://www.w3.org/2000/svg">
    <path fill="${top}" d="${parts.E_TOP}"/><path fill="${mid}" d="${parts.E_MID}"/><path fill="${bot}" d="${parts.E_BOT}"/>
  </svg>`;
}

/**
 * Padrão modular (barras do E) em vetor puro: retângulos explícitos, sem <pattern>,
 * para não ser rasterizado no PDF. w/h = área em mm; size = largura do módulo em mm.
 * Barra do meio limitada a 8% (regra do manual: 4–8%).
 */
function pattern({ w, h, color = '#ffffff', opacity = 0.05, size = 3.7 } = {}) {
  const cw = size * 2.4, ch = size * 2, bh = size * 0.2, mid = Math.min(opacity * 1.6, 0.08);
  const out = [], hi = [];
  for (let y = -ch; y < h + ch; y += ch) {
    for (let x = -cw; x < w + cw; x += cw) {
      for (const [dx, dy] of [[0, 0], [cw / 2, ch / 2]]) {
        const X = (x + dx).toFixed(2), Y = y + dy;
        out.push(`M${X} ${Y.toFixed(2)}h${size}v${bh}h${-size}Z`, `M${X} ${(Y + size * 0.78).toFixed(2)}h${size}v${bh}h${-size}Z`);
        hi.push(`M${X} ${(Y + size * 0.39).toFixed(2)}h${size}v${bh}h${-size}Z`);
      }
    }
  }
  return `<svg viewBox="0 0 ${w} ${h}" style="position:absolute;left:0;top:0;width:${w}mm;height:${h}mm" xmlns="http://www.w3.org/2000/svg">
    <path fill="${color}" fill-opacity="${opacity}" d="${out.join('')}"/><path fill="${color}" fill-opacity="${mid}" d="${hi.join('')}"/></svg>`;
}

/** Faixa tricolor oficial 64/29/7, calculada sobre o formato final (w mm) com sangria b. */
function tri(w = 100, b = 0) {
  const p = (x) => (b + x * w).toFixed(2) + 'mm';
  return `linear-gradient(90deg,${C.blue} 0 ${p(0.64)},${C.gray} ${p(0.64)} ${p(0.93)},${C.solar} ${p(0.93)})`;
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
  html,body{background:#fff;width:${pageW};-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{font-family:'Inter',sans-serif;color:${C.ink}}
  .page{width:${pageW};height:${pageH};position:relative;overflow:hidden;page-break-after:always;break-after:page}
  .page:last-child{page-break-after:auto;break-after:auto}
  .mont{font-family:'Montserrat',sans-serif}
  `;
}

/* ================= PEÇAS EM TAMANHO REAL =================
   Todas aceitam b = sangria em mm (0 nos mockups, 3 nos arquivos de impressão).
   O conteúdo é deslocado +b; fundos e faixas avançam até a borda da sangria. */
const box = (W, H, bg, extra = '') => `width:${W}mm;height:${H}mm;background:${bg};position:relative;overflow:hidden;font-family:Inter;${extra}`;
const stripe = (w, h, b, where = 'bottom') => `<div style="position:absolute;left:0;right:0;${where}:0;height:${h + b}mm;background:${tri(w, b)}"></div>`;
const RULE = (w = 0.25, color = C.blue) => `height:${w}mm;background:${color}`;

/** Cartão de visita frente (90x50 mm). */
function cardFront(b = 0) {
  const W = 90 + 2 * b, H = 50 + 2 * b;
  return `<div style="${box(W, H, '#fff')}">
    <div style="position:absolute;right:${-2 + b}mm;top:${3 + b}mm;width:22mm">
      ${jFold({ blue: C.blue, flap: C.grayLight, style: 'width:22mm;height:auto' })}
    </div>
    <div style="position:absolute;left:${7 + b}mm;top:${7 + b}mm;width:40mm">${logo('cor')}</div>
    <div style="position:absolute;left:${7 + b}mm;top:${22.5 + b}mm">
      <div style="display:flex;align-items:center;gap:1.6mm">
        <span style="display:block;width:4mm;height:0.9mm;border-radius:0.45mm;background:${C.solar}"></span>
        <span class="mont" style="font-weight:700;font-size:8.4pt;color:${C.blueDeep};letter-spacing:.01em">${DATA.nome}</span>
      </div>
      <div style="font-size:6.6pt;color:${C.gray};margin:0.6mm 0 0 5.6mm;letter-spacing:.04em">${DATA.cargo}</div>
    </div>
    <div style="position:absolute;left:${7 + b}mm;right:${7 + b}mm;top:${30.5 + b}mm;${RULE(0.25)}"></div>
    <div style="position:absolute;left:${7 + b}mm;top:${32.6 + b}mm;font-size:6.3pt;line-height:1.7;color:${C.ink}">
      <div style="display:flex;align-items:center;gap:1.3mm">${ic('mail', C.blue, '2.4mm')}${DATA.email}</div>
      <div style="display:flex;align-items:center;gap:1.3mm">${ic('globe', C.blue, '2.4mm')}${DATA.site}</div>
    </div>
    <div style="position:absolute;right:${7 + b}mm;top:${32.6 + b}mm;font-size:6.3pt;line-height:1.7;color:${C.ink};text-align:right">
      <div style="display:flex;align-items:center;gap:1.3mm;justify-content:flex-end">${DATA.tel}${ic('phone', C.blue, '2.4mm')}</div>
      <div style="display:flex;align-items:flex-start;gap:1.3mm;justify-content:flex-end;line-height:1.45;margin-top:.4mm"><span>${DATA.end1}<br>${DATA.end2}</span><span style="margin-top:.3mm">${ic('pin', C.blue, '2.4mm')}</span></div>
    </div>
  </div>`;
}

/** Cartão de visita verso. */
function cardBack(b = 0) {
  const W = 90 + 2 * b, H = 50 + 2 * b;
  return `<div style="${box(W, H, C.bgInst)}">
    ${pattern({ w: W, h: H, opacity: 0.05, size: 2.9 })}
    <div style="position:absolute;left:50%;top:${b + 22}mm;width:46mm;transform:translate(-50%,-50%)">${logo('negativo')}</div>
    <div style="position:absolute;left:0;right:0;bottom:${8 + b}mm;text-align:center;font-family:Montserrat;font-weight:600;font-size:6.5pt;letter-spacing:.24em;color:#fff">${DATA.site.toUpperCase()}</div>
    ${stripe(90, 3, b)}
  </div>`;
}

/** Máscara de verniz localizado do verso: preto 100% = área com verniz. */
function cardBackVerniz(b = 0) {
  const W = 90 + 2 * b, H = 50 + 2 * b;
  return `<div style="${box(W, H, '#fff')}">
    <div style="position:absolute;left:50%;top:${b + 22}mm;width:46mm;transform:translate(-50%,-50%)">${logo('preto-sem-dobra').replace(/fill="#[0-9a-fA-F]{3,6}"/g, 'fill="#000"')}</div>
    <div style="position:absolute;left:${b + 3}mm;bottom:${b + 3}mm;font-family:Inter;font-size:5pt;color:#999">MÁSCARA DE VERNIZ LOCALIZADO · preto 100% = verniz · não imprimir</div>
  </div>`;
}

/** Papel timbrado A4. */
function letterhead(b = 0) {
  const W = 210 + 2 * b, H = 297 + 2 * b;
  return `<div style="${box(W, H, '#fff')}">
    <div style="position:absolute;left:${20 + b}mm;top:${18 + b}mm;width:58mm">${logo('cor')}</div>
    <div style="position:absolute;right:${20 + b}mm;top:${22 + b}mm;text-align:right;font-size:7.5pt;line-height:1.6;color:${C.muted}">
      <div style="font-family:Montserrat;font-weight:600;color:${C.blueDeep};letter-spacing:.18em;font-size:7pt">MANUTENÇÃO · TESTES · CERTIFICAÇÃO</div>
      <div>Válvulas de segurança, alívio e controle</div>
    </div>
    <div style="position:absolute;left:${20 + b}mm;right:${20 + b}mm;top:${42 + b}mm;${RULE(0.25)}"></div>
    <div style="position:absolute;right:${-38 + b}mm;bottom:${32 + b}mm;width:140mm">${jFold({ blue: '#e8eef6', flap: '#ededeb', style: 'width:140mm;height:auto' })}</div>
    <div style="position:absolute;left:${20 + b}mm;right:${20 + b}mm;bottom:${11 + b}mm;font-size:7.3pt;color:${C.ink};line-height:1;white-space:nowrap">
      <div style="${RULE(0.2, C.gray)};margin-bottom:4mm"></div>
      <div style="display:flex;justify-content:center;gap:7mm">
        <span style="display:flex;align-items:center;gap:1.5mm">${ic('phone', C.blue, '3mm')}${DATA.tel}</span>
        <span style="display:flex;align-items:center;gap:1.5mm">${ic('mail', C.blue, '3mm')}${DATA.emailGeral}</span>
        <span style="display:flex;align-items:center;gap:1.5mm">${ic('globe', C.blue, '3mm')}${DATA.site}</span>
      </div>
      <div style="display:flex;justify-content:center;margin-top:2.6mm"><span style="display:flex;align-items:center;gap:1.5mm">${ic('pin', C.blue, '3mm')}${DATA.end1} · ${DATA.end2}</span></div>
    </div>
    ${stripe(210, 5, b)}
  </div>`;
}

const destinatario = (style, fs) => `<div style="position:absolute;${style};border:0.3mm solid #b4b4b5;border-radius:2mm;padding:4mm;font-family:Montserrat;font-size:${fs};letter-spacing:.2em;color:${C.gray}">DESTINATÁRIO</div>`;

/** Envelope carta (229 x 114 mm) — frente e verso. */
function envelopeCartaFrente(b = 0) {
  return `<div style="${box(229 + 2 * b, 114 + 2 * b, '#fff')}">
    <div style="position:absolute;left:${14 + b}mm;top:${12 + b}mm;width:52mm">${logo('cor')}</div>
    <div style="position:absolute;left:${14 + b}mm;top:${31 + b}mm;font-size:7pt;line-height:1.6;color:${C.muted}">${DATA.end1}<br>${DATA.end2}<br>${DATA.tel} · ${DATA.site}</div>
    ${destinatario(`right:${14 + b}mm;top:${58 + b}mm;width:96mm;height:36mm`, '6.5pt')}
    ${stripe(229, 4, b)}
  </div>`;
}
function envelopeCartaVerso(b = 0) {
  const W = 229 + 2 * b;
  return `<div style="${box(W, 114 + 2 * b, '#fff')}">
    <div style="position:absolute;left:0;top:0;width:${W}mm;height:${40 + b}mm;background:${C.bgInst};clip-path:polygon(0 0,100% 0,100% 38%,52% 100%,48% 100%,0 38%)">${pattern({ w: W, h: 40 + b, opacity: 0.05, size: 2.4 })}</div>
    <div style="position:absolute;right:${-6 + b}mm;bottom:${8 + b}mm;width:60mm">${jFold({ blue: '#e8eef6', flap: '#ededeb', style: 'width:60mm;height:auto' })}</div>
    <div style="position:absolute;left:50%;top:${58 + b}mm;width:58mm;transform:translateX(-50%)">${logo('cor')}</div>
    <div style="position:absolute;left:0;right:0;top:${80 + b}mm;text-align:center;font-size:7pt;color:${C.muted}">${DATA.tel} · ${DATA.site}</div>
    ${stripe(229, 4, b)}
  </div>`;
}

/** Envelope saco A4 (240 x 340 mm). */
function envelopeA4Frente(b = 0) {
  return `<div style="${box(240 + 2 * b, 340 + 2 * b, '#fff')}">
    <div style="position:absolute;left:50%;top:${120 + b}mm;width:120mm;transform:translateX(-50%)">${logo('cor')}</div>
    ${destinatario(`right:${22 + b}mm;bottom:${44 + b}mm;width:110mm;height:44mm`, '8pt')}
    <div style="position:absolute;left:${22 + b}mm;bottom:${20 + b}mm;font-size:8pt;line-height:1.6;color:${C.muted}">
      <b style="color:${C.blueDeep};font-family:Montserrat;letter-spacing:.14em;font-size:7.5pt">REMETENTE</b><br>${DATA.end1} · ${DATA.end2}<br>${DATA.tel} · ${DATA.site}</div>
    ${stripe(240, 6, b)}
  </div>`;
}
function envelopeA4Verso(b = 0) {
  const W = 240 + 2 * b;
  return `<div style="${box(W, 340 + 2 * b, '#fff')}">
    <div style="position:absolute;left:0;top:0;right:0;height:${70 + b}mm;background:${C.bgInst};border-radius:0 0 18mm 18mm">${pattern({ w: W, h: 70 + b, opacity: 0.05, size: 3.2 })}</div>
    <div style="position:absolute;left:50%;bottom:${58 + b}mm;width:60mm;transform:translateX(-50%)">${logo('cor')}</div>
    <div style="position:absolute;left:0;right:0;bottom:${30 + b}mm;text-align:center;font-family:Inter;font-size:8pt;color:${C.muted};line-height:1.6">${DATA.tel} · ${DATA.site}<br>${DATA.end1} · ${DATA.end2}</div>
    ${stripe(240, 6, b)}
  </div>`;
}

/** Pasta A4 — capa (220 x 310 mm) e bolso interno. */
function pastaCapa(b = 0) {
  const W = 220 + 2 * b, H = 310 + 2 * b;
  return `<div style="${box(W, H, C.bgInst)}">
    ${pattern({ w: W, h: H, opacity: 0.05, size: 4.2 })}
    <div style="position:absolute;right:${-30 + b}mm;top:${-34 + b}mm;width:150mm">${jFold({ blue: '#25518d', flap: '#3c639a', style: 'width:150mm;height:auto' })}</div>
    <div style="position:absolute;left:${24 + b}mm;top:${150 + b}mm;width:120mm">${logo('negativo')}</div>
    <div style="position:absolute;left:${24 + b}mm;bottom:${24 + b}mm;font-family:Montserrat;font-weight:600;font-size:9pt;letter-spacing:.3em;color:#fff">${DATA.site.toUpperCase()}</div>
    ${stripe(220, 6, b)}
  </div>`;
}
function pastaBolso(b = 0) {
  const W = 220 + 2 * b, H = 110 + 2 * b;
  /* diagonal da faca: de (0, 18% de 110 = 19,8 mm) até (62% de 220 = 136,4 mm, 0) */
  const y0 = 19.8 + b, x1 = 136.4 + b, t = 4;
  const clip = `polygon(0 ${y0}mm,${x1}mm ${b}mm,${W}mm ${b}mm,${W}mm ${H}mm,0 ${H}mm)`;
  const band = `polygon(0 ${y0 - b}mm,${x1}mm ${0}mm,${W}mm 0,${W}mm ${b + t}mm,${x1 + 0.6}mm ${b + t}mm,0 ${y0 + t}mm)`;
  return `<div style="${box(W, H, 'transparent')}">
    <div style="position:absolute;inset:0;background:#fff;clip-path:${clip}"></div>
    <div style="position:absolute;inset:0;background:${tri(220, b)};clip-path:${band}"></div>
    <div style="position:absolute;left:${16 + b}mm;top:${40 + b}mm;width:80mm">${logo('cor')}</div>
    <div style="position:absolute;left:${16 + b}mm;top:${68 + b}mm;font-size:8pt;line-height:1.75;color:${C.ink}">
      <div style="display:flex;gap:2mm;align-items:center">${ic('phone', C.blue, '3.4mm')}${DATA.tel}</div>
      <div style="display:flex;gap:2mm;align-items:center">${ic('mail', C.blue, '3.4mm')}${DATA.emailGeral}</div>
      <div style="display:flex;gap:2mm;align-items:center">${ic('pin', C.blue, '3.4mm')}${DATA.end1} · ${DATA.end2}</div>
    </div>
    <div style="position:absolute;right:${16 + b}mm;top:${41.5 + b}mm;width:34.5mm">${qr('site')}</div>
    <div style="position:absolute;right:${16 + b}mm;top:${81.5 + b}mm;width:34.5mm;text-align:center;font-size:6pt;letter-spacing:.2em;color:${C.gray};font-family:Montserrat">ACESSE O SITE</div>
  </div>`;
}

/** Caderno A5 — capa e contracapa. */
function cadernoCapa(b = 0) {
  const W = 148 + 2 * b, H = 210 + 2 * b;
  return `<div style="${box(W, H, C.bgInst)}">
    ${pattern({ w: W, h: H, opacity: 0.05, size: 3.2 })}
    <div style="position:absolute;left:50%;top:${b + 95}mm;width:70mm;transform:translate(-50%,-62%)">${jFold({ blue: '#25518d', flap: '#3c639a', style: 'width:70mm;height:auto' })}</div>
    <div style="position:absolute;right:${12 + b}mm;bottom:${16 + b}mm;width:44mm">${logo('negativo')}</div>
    ${stripe(148, 5, b)}
  </div>`;
}
function cadernoContracapa(b = 0) {
  return `<div style="${box(148 + 2 * b, 210 + 2 * b, '#fff')}">
    <div style="position:absolute;left:50%;top:${62 + b}mm;width:76mm;transform:translateX(-50%)">${logo('cor')}</div>
    <div style="position:absolute;left:${12 + b}mm;right:${12 + b}mm;top:${138 + b}mm;${RULE(0.25)}"></div>
    <div style="position:absolute;left:${12 + b}mm;top:${146 + b}mm;font-size:7.5pt;line-height:2;color:${C.ink}">
      <div style="display:flex;gap:2mm;align-items:center">${ic('phone', C.blue, '3.2mm')}${DATA.tel}</div>
      <div style="display:flex;gap:2mm;align-items:center">${ic('mail', C.blue, '3.2mm')}${DATA.emailGeral}</div>
      <div style="display:flex;gap:2mm;align-items:center">${ic('pin', C.blue, '3.2mm')}<span style="line-height:1.45">${DATA.end1}<br>${DATA.end2}</span></div>
    </div>
    <div style="position:absolute;right:${12 + b}mm;top:${146 + b}mm;width:24mm">${qr('site')}</div>
    <div style="position:absolute;right:${12 + b}mm;top:${172 + b}mm;width:24mm;text-align:center;font-size:5pt;letter-spacing:.2em;color:${C.gray};font-family:Montserrat">ACESSE O SITE</div>
    ${stripe(148, 5, b)}
  </div>`;
}

/** Crachá CR80 (53,98 x 85,6 mm). print=true: sem cantos nem furo (vão na faca do fornecedor). */
function cracha(nome = 'Nome do Colaborador', funcao = 'Técnico de Válvulas', b = 0, print = false) {
  const W = 53.98 + 2 * b, H = 85.6 + 2 * b;
  return `<div style="${box(W, H, '#fff', print ? '' : 'border-radius:3.18mm')}">
    <div style="position:absolute;left:0;right:0;top:0;height:${30 + b}mm;background:${C.bgInst}">${pattern({ w: W, h: 30 + b, opacity: 0.05, size: 2.1 })}
      ${print ? '' : `<div style="position:absolute;left:50%;top:${3.5 + b}mm;width:13mm;height:3mm;border-radius:1.5mm;background:#fff;transform:translateX(-50%);box-shadow:inset 0 .3mm .6mm rgba(0,0,0,.35)"></div>`}
      <div style="position:absolute;left:50%;top:${12 + b}mm;width:32mm;transform:translateX(-50%)">${logo('negativo')}</div></div>
    <div style="position:absolute;left:50%;top:${25 + b}mm;width:26mm;height:30mm;transform:translateX(-50%);border-radius:2mm;background:#e3e6ea;border:0.8mm solid #fff;display:flex;align-items:center;justify-content:center;color:#9aa3ad;font-size:6pt;letter-spacing:.2em">FOTO</div>
    <div style="position:absolute;left:0;right:0;top:${61 + b}mm;text-align:center">
      <div class="mont" style="font-family:Montserrat;font-weight:700;font-size:8pt;color:${C.blueDeep}">${nome}</div>
      <div style="font-size:6.3pt;color:${C.gray};margin-top:1mm;letter-spacing:.06em">${funcao}</div>
      <div style="width:6mm;height:0.9mm;background:${C.solar};border-radius:.45mm;margin:2.5mm auto 0"></div>
    </div>
    ${stripe(53.98, 3, b)}
  </div>`;
}

/** Assinatura de e-mail (600 x 170 px) — versão imagem. */
function emailSignature() {
  return `<div style="width:600px;height:170px;background:#fff;position:relative;overflow:hidden;font-family:Inter">
    <div style="position:absolute;left:0;top:0;bottom:0;width:150px;background:${C.bgInst};clip-path:polygon(0 0,100% 0,72% 100%,0 100%)">
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
    <div style="position:absolute;right:22px;top:30px;width:120px">${logo('cor')}</div>
    <div style="position:absolute;right:22px;top:68px;width:120px;text-align:center;font-family:Montserrat;font-weight:600;font-size:9px;letter-spacing:.2em;color:${C.blue}">${DATA.site.toUpperCase()}</div>
    <div style="position:absolute;left:150px;right:0;bottom:0;height:5px;background:linear-gradient(90deg,${C.blue} 0 64%,${C.gray} 64% 93%,${C.solar} 93%)"></div>
  </div>`;
}

/** Assinatura de e-mail em HTML de tabela (texto vivo e links clicáveis). logoUrl = PNG hospedado. */
function emailSignatureHtml(logoUrl = 'https://www.jteck.com.br/img/brand/jteck-logo-assinatura.png') {
  const tel = DATA.tel.replace(/[^\d+]/g, '');
  const a = (href, t) => `<a href="${href}" style="color:${C.ink};text-decoration:none">${t}</a>`;
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Inter,Arial,Helvetica,sans-serif;color:${C.ink};border-collapse:collapse">
  <tr>
    <td style="padding:0 18px 0 0;vertical-align:middle;border-right:3px solid ${C.blue}">
      <a href="https://${DATA.site}"><img src="${logoUrl}" width="130" alt="JTECK Valve Service" style="display:block;border:0;width:130px;height:auto"></a>
    </td>
    <td style="padding:0 0 0 18px;vertical-align:middle;font-size:12px;line-height:18px">
      <div style="font-family:Montserrat,Arial,sans-serif;font-weight:700;font-size:15px;line-height:20px;color:${C.blueDeep}">${DATA.nome}</div>
      <div style="color:${C.gray};margin-bottom:6px">${DATA.cargo} · JTECK Valve Service</div>
      <div>${a('tel:' + tel, DATA.tel)}</div>
      <div>${a('mailto:' + DATA.email, DATA.email)} · ${a('https://' + DATA.site, DATA.site)}</div>
      <div style="color:${C.muted}">${DATA.end1} · ${DATA.end2}</div>
    </td>
  </tr>
  <tr><td colspan="2" style="padding-top:10px"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
    <td width="64%" height="4" style="background:${C.blue};font-size:0;line-height:0">&nbsp;</td>
    <td width="29%" height="4" style="background:${C.gray};font-size:0;line-height:0">&nbsp;</td>
    <td width="7%" height="4" style="background:${C.solar};font-size:0;line-height:0">&nbsp;</td></tr></table></td></tr>
</table>`;
}

/** Logotipo como grupo SVG em coordenadas originais (viewBox = parts.viewBox). flap=null remove a dobra. */
function logoPaths({ blue = C.blue, gray = C.gray, flap = C.grayLight, flapOpacity = 1, gold = C.solar } = {}) {
  return `${flap ? `<path fill="${flap}" fill-opacity="${flapOpacity}" d="${parts.FLAP}"/>` : ''}
    <g fill="${blue}"><path d="${parts.J}"/><path d="${parts.T}"/><path d="${parts.E_MID}"/><path d="${parts.TEXT}"/></g>
    <g fill="${gray}"><path d="${parts.E_TOP}"/><path d="${parts.E_BOT}"/><path d="${parts.C}"/><path d="${parts.K}"/></g>
    <path fill="${gold}" d="${parts.DASH}"/>`;
}
const svgLogo = (opts = {}, style = '') =>
  `<svg viewBox="${parts.viewBox}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;${style}">${logoPaths(opts)}</svg>`;

/* ---------- Elementos de página dos documentos A4 deitados ---------- */
function tab(label) {
  return `<div style="position:absolute;right:14mm;top:0;width:76mm;height:21mm;background:${C.blueDeep};border-radius:0 0 7mm 7mm;display:flex;align-items:flex-end;justify-content:center;padding-bottom:4.6mm;gap:2.2mm">
    <span style="display:block;width:4mm;height:1mm;border-radius:.5mm;background:${C.solar};margin-bottom:1.3mm"></span>
    <span style="font-family:Montserrat;font-weight:700;font-size:11.5pt;letter-spacing:.04em;color:#d6dbe3">${label}</span></div>`;
}
function folio(n, doc, dark = false) {
  const c = dark ? 'rgba(255,255,255,.55)' : '#9aa0a8';
  return `<div style="position:absolute;left:28mm;right:18mm;bottom:9mm;display:flex;justify-content:space-between;font-family:Montserrat;font-size:6.5pt;letter-spacing:.18em;color:${c}">
    <span>JTECK VALVE SERVICE · ${doc}</span><span style="font-weight:700">${String(n).padStart(2, '0')}</span></div>`;
}

module.exports = {
  logoPaths, svgLogo, tri, tab, folio,
  C, DATA, parts, logo, artefacto, qr, jFold, icon, eModule, pattern, ic, baseCss,
  cardFront, cardBack, letterhead, envelopeCartaFrente, envelopeCartaVerso, envelopeA4Frente, envelopeA4Verso,
  pastaCapa, pastaBolso, cadernoCapa, cadernoContracapa, cracha, emailSignature, emailSignatureHtml, cardBackVerniz,
};
