'use strict';
const L = require('./lib');
const { render } = require('./render');
const { C } = L;
const DOC = 'MANUAL DE IDENTIDADE VISUAL';

let n = 0;
const page = (inner, { bg = '#fff', dark = false, folio = true } = {}) => {
  n += 1;
  return `<section class="page" style="background:${bg}">${inner}${folio ? L.folio(n, DOC, dark) : ''}</section>`;
};
const T = (t, dark = false) => `<div style="font-family:Montserrat;font-weight:700;font-size:17pt;color:${dark ? '#fff' : '#3f4650'};position:relative;display:inline-block;margin-bottom:9mm">${t}<span style="position:absolute;left:0;bottom:-2.6mm;width:9mm;height:0.9mm;border-radius:.45mm;background:${C.solar}"></span></div>`;
const P = (t, extra = '') => `<p style="font-size:11pt;line-height:1.6;color:#5b626c;font-weight:300;text-wrap:pretty;${extra}">${t}</p>`;
const svgLogo = (opts = {}, style = '', vb = L.parts.viewBox, extra = '') => `<svg viewBox="${vb}" style="display:block;width:100%;height:auto;${style}" xmlns="http://www.w3.org/2000/svg">${extra}${L.logoPaths(opts)}</svg>`;
const NEG = { blue: '#fff', gray: '#b8bfca', flap: '#8fa3c0' };
/* uma cor: dobra em cor chapada (ex.: K40) ou removida (flap = null), nunca transparente */
const MONO = (c, flap = null) => ({ blue: c, gray: c, flap, gold: c });
const BLUE_BG = C.bgInst;

const sections = [
  ['INTRODUÇÃO', 3], ['SOBRE', 4], ['LOGOTIPO', 5], ['CONSTRUÇÃO', 6], ['ÁREA DE PROTEÇÃO', 7], ['REDUÇÃO MÍNIMA', 8],
  ['CORES', 9], ['VERSÕES', 11], ['APLICAÇÃO SOBRE FUNDOS', 12], ['PRETO E BRANCO', 13], ['PROIBIÇÕES', 14],
  ['TIPOGRAFIA', 15], ['ELEMENTOS GRÁFICOS', 16], ['CONCLUSÃO', 17],
];
const pages = [];

/* 1 · Capa */
pages.push(page(`
  <div style="position:absolute;left:18mm;top:16mm;width:34mm">${L.icon({ style: 'width:34mm;height:34mm' })}</div>
  <div style="position:absolute;left:18mm;bottom:20mm;width:96mm">${svgLogo()}</div>
  <div style="position:absolute;right:0;top:0;bottom:0;width:78mm;background:${BLUE_BG};overflow:hidden">
    ${L.pattern({ w: 78, h: 210, opacity: 0.05, size: 3.7 })}
    <div style="position:absolute;right:14mm;top:0;height:136mm;width:0.35mm;background:rgba(255,255,255,.85)"></div>
    <div style="position:absolute;right:14mm;top:146mm;text-align:right;font-family:Montserrat;color:#fff;line-height:1.15">
      <div style="font-weight:300;font-size:15pt;color:rgba(255,255,255,.75)">MANUAL DE</div>
      <div style="font-weight:700;font-size:15pt">IDENTIDADE</div>
      <div style="font-weight:700;font-size:15pt">VISUAL</div>
      <div style="font-weight:300;font-size:11pt;color:rgba(255,255,255,.6);margin-top:12mm">2026</div>
      <div style="font-weight:300;font-size:6.5pt;color:rgba(255,255,255,.45);margin-top:1.5mm">© Todos os direitos reservados.</div>
    </div>
  </div>
`, { folio: false }));

/* 2 · Índice */
pages.push(page(`
  <div style="position:absolute;left:28mm;top:26mm">${T('ÍNDICE')}</div>
  <div style="position:absolute;left:28mm;top:50mm;display:grid;grid-template-columns:repeat(2,96mm);grid-template-rows:repeat(7,auto);grid-auto-flow:column;column-gap:30mm;row-gap:5.2mm">
    ${sections.map(([t, p]) => `<div style="display:flex;align-items:baseline;gap:7mm;border-bottom:0.2mm solid #eceef1;padding-bottom:2.4mm">
      <span style="font-family:Montserrat;font-weight:700;font-size:14pt;color:${C.solar};width:11mm">${String(p).padStart(2, '0')}</span>
      <span style="font-family:Montserrat;font-weight:500;font-size:10.5pt;letter-spacing:.06em;color:#4b525c">${t}</span></div>`).join('')}
  </div>
`));

/* 3 · Introdução */
pages.push(page(`
  <div style="position:absolute;right:-36mm;top:18mm;width:170mm">${L.jFold({ blue: '#eef2f8', flap: '#f1f1ef', style: 'width:170mm;height:auto' })}</div>
  <div style="position:absolute;left:28mm;top:30mm;width:150mm">
    ${T('INTRODUÇÃO')}
    ${P('Bem-vindo ao Manual de Identidade Visual da JTECK Valve Service. Este documento foi criado para garantir a consistência e a integridade da marca em todas as suas aplicações, refletindo os valores de precisão, robustez e confiança que orientam o trabalho da empresa.')}
    ${P('Aqui você encontra as diretrizes de uso do logotipo, da paleta de cores, da tipografia e dos elementos gráficos. O objetivo é que todos os materiais de comunicação, do cartão de visita à fachada, do relatório técnico ao uniforme, sejam apresentados de forma uniforme.', 'margin-top:5mm')}
    ${P('É essencial que colaboradores, parceiros e fornecedores sigam estas orientações. Uma marca aplicada com cuidado é a primeira prova do cuidado que a JTECK tem com cada válvula que passa por suas mãos.', 'margin-top:5mm')}
  </div>
`));

/* 4 · Sobre */
pages.push(page(`
  ${L.pattern({ w: 297, h: 210, opacity: 0.05, size: 4.8 })}
  <div style="position:absolute;right:-20mm;bottom:-40mm;width:170mm">${L.jFold({ blue: '#25518d', flap: '#3c639a', style: 'width:170mm;height:auto' })}</div>
  <div style="position:absolute;left:28mm;top:30mm;width:120mm">
    ${T('SOBRE', true)}
    ${P('A nova identidade visual foi concebida para refletir a excelência e a precisão dos serviços de manutenção, testes e certificação de válvulas de segurança, alívio e controle oferecidos pela JTECK.', 'color:rgba(255,255,255,.82)')}
    ${P('A marca dispensa ícones ilustrativos: a própria palavra JTECK é o símbolo. O E construído por módulos, a dobra do J e o acento solar dentro do C formam um vocabulário próprio, técnico sem ser óbvio e industrial sem ser genérico.', 'margin-top:5mm;color:rgba(255,255,255,.82)')}
    ${P('A JTECK pretende transmitir que é mais do que uma prestadora de serviço: é parceira técnica de quem precisa manter a planta operando com segurança.', 'margin-top:5mm;color:rgba(255,255,255,.82)')}
  </div>
`, { bg: BLUE_BG, dark: true }));

/* 5 · Logotipo */
pages.push(page(`
  <div style="position:absolute;left:28mm;top:26mm">${T('LOGOTIPO')}</div>
  <div style="position:absolute;left:28mm;top:46mm;width:80mm">${P('O logotipo é composto pela palavra <b>JTECK</b>, de desenho exclusivo, e pelo descritor <b>VALVE SERVICE</b>. Os dois elementos formam um bloco único e não devem ser separados ou reorganizados.')}</div>
  <div style="position:absolute;left:128mm;top:30mm;right:0;bottom:30mm;background:radial-gradient(circle at 50% 50%,#ffffff 0%,#f4f5f7 55%,#e4e6e9 100%);display:flex;align-items:center;justify-content:center">
    <div style="width:130mm">${svgLogo()}</div></div>
`));

/* 6 · Construção */
const grid = () => {
  let g = '';
  for (let x = 13; x <= 1395; x += 21.5) g += `<line x1="${x}" y1="-30" x2="${x}" y2="380" stroke="#d6dae0" stroke-width="1.4"/>`;
  for (let y = -9.5; y <= 380; y += 21.5) g += `<line x1="0" y1="${y}" x2="1395" y2="${y}" stroke="#d6dae0" stroke-width="1.4"/>`;
  return g;
};
pages.push(page(`
  <div style="position:absolute;left:28mm;top:26mm">${T('CONSTRUÇÃO')}</div>
  <div style="position:absolute;left:28mm;top:46mm;width:80mm">
    ${P('A marca é construída sobre um módulo <b>x</b>, igual à altura de uma barra do E. Todas as medidas de proporção, área de proteção e redução partem desse módulo.')}
    <div style="display:grid;grid-template-columns:auto 1fr;gap:2.4mm 5mm;margin-top:7mm;font-size:9.4pt;color:#5b626c">
      <b style="font-family:Montserrat;color:${C.blue}">x</b><span>altura de uma barra do E</span>
      <b style="font-family:Montserrat;color:${C.blue}">4,65x</b><span>altura da palavra JTECK</span>
      <b style="font-family:Montserrat;color:${C.blue}">0,86x</b><span>respiro entre JTECK e o descritor</span>
      <b style="font-family:Montserrat;color:${C.blue}">1,72x</b><span>altura de VALVE SERVICE</span>
    </div>
  </div>
  <div style="position:absolute;left:122mm;top:62mm;width:156mm">
    <svg viewBox="-80 -30 1640 420" style="width:100%;height:auto">
      ${grid()}<g>${L.logoPaths()}</g>
      ${[33.5, 233.5].map((y) => `<line x1="0" y1="${y}" x2="1390" y2="${y}" stroke="${C.solar}" stroke-width="2.4" stroke-dasharray="8 7"/>`).join('')}
      ${[270.5, 344.5].map((y) => `<line x1="0" y1="${y}" x2="1390" y2="${y}" stroke="${C.blue}" stroke-width="2.4" stroke-dasharray="8 7"/>`).join('')}
      ${[[33.5, 76.5], [112.5, 155.5], [190.5, 233.5]].map(([a, b]) => `<path d="M20 ${a}h-12v${b - a}h12" stroke="${C.blue}" stroke-width="3" fill="none"/><text x="-4" y="${(a + b) / 2 + 11}" text-anchor="end" font-family="Montserrat" font-weight="700" font-size="32" fill="${C.blue}">x</text>`).join('')}
      <path d="M1392 33.5h14v200h-14M1392 270.5h14v74h-14" stroke="${C.blue}" stroke-width="3" fill="none"/>
      <path d="M1384 237.5h10v29h-10" stroke="${C.solar}" stroke-width="3" fill="none"/><text x="1422" y="262" font-family="Montserrat" font-weight="700" font-size="26" fill="${C.solar}">0,86x</text>
      <text x="1422" y="145" font-family="Montserrat" font-weight="700" font-size="32" fill="${C.blue}">4,65x</text>
      <text x="1422" y="319" font-family="Montserrat" font-weight="700" font-size="32" fill="${C.blue}">1,72x</text>
    </svg>
  </div>
`));

/* 7 · Área de proteção */
const X = 43;
const [VX, VY, VW, VH] = L.parts.viewBox.split(' ').map(Number);
pages.push(page(`
  <div style="position:absolute;left:28mm;top:26mm">${T('ÁREA DE PROTEÇÃO')}</div>
  <div style="position:absolute;left:28mm;top:46mm;width:80mm">
    ${P('Em todas as aplicações, o espaço livre ao redor da marca deve ser respeitado. Nenhum texto, imagem ou borda pode invadir essa área.')}
    ${P('A área de proteção mínima corresponde a <b>2x</b>, ou seja, duas vezes a altura de uma barra do E, em todos os lados.', 'margin-top:5mm')}
  </div>
  <div style="position:absolute;left:122mm;top:46mm;width:150mm">
    <svg viewBox="${VX - 2 * X - 30} ${VY - 2 * X - 30} ${VW + 4 * X + 60} ${VH + 4 * X + 60}" style="width:100%;height:auto">
      <rect x="${VX - 2 * X}" y="${VY - 2 * X}" width="${VW + 4 * X}" height="${VH + 4 * X}" fill="#f4f6f9" stroke="${C.blue}" stroke-width="2.5" stroke-dasharray="10 8"/>
      <rect x="${VX}" y="${VY}" width="${VW}" height="${VH}" fill="#fff" stroke="#c8cdd4" stroke-width="2"/>
      ${L.logoPaths()}
      ${[[VX - 2 * X, VY - 2 * X], [VX + VW, VY - 2 * X], [VX - 2 * X, VY + VH], [VX + VW, VY + VH]].map(([x, y]) => `<rect x="${x}" y="${y}" width="${2 * X}" height="${2 * X}" fill="${C.solar}"/><text x="${x + X}" y="${y + X + 12}" text-anchor="middle" font-family="Montserrat" font-weight="700" font-size="32" fill="#fff">2x</text>`).join('')}
    </svg>
  </div>
`));

/* 8 · Redução mínima */
pages.push(page(`
  <div style="position:absolute;left:28mm;top:26mm">${T('REDUÇÃO MÍNIMA')}</div>
  <div style="position:absolute;left:28mm;top:46mm;width:80mm">
    ${P('Para preservar a leitura de VALVE SERVICE, o logotipo não deve ser reproduzido abaixo das larguras indicadas.')}
    ${P('Em espaços menores, como avatares, bordados pequenos e etiquetas, use o <b>ícone reduzido</b>.', 'margin-top:5mm')}
    <div style="margin-top:7mm;font-size:8.6pt;color:#5b626c;display:grid;grid-template-columns:1fr auto;row-gap:1.6mm;column-gap:6mm">
      <b style="font-family:Montserrat;font-size:7.6pt;letter-spacing:.12em;color:${C.blueDeep}">PROCESSO</b><b style="font-family:Montserrat;font-size:7.6pt;letter-spacing:.12em;color:${C.blueDeep}">MÍNIMO</b>
      <span>Offset e digital</span><span>30 mm</span>
      <span>Serigrafia e tampografia</span><span>40 mm</span>
      <span>Bordado</span><span>50 mm</span>
      <span>Gravação a laser</span><span>30 mm</span>
      <span>Tela</span><span>120 px</span>
    </div>
  </div>
  <div style="position:absolute;left:128mm;top:52mm;display:grid;grid-template-columns:auto auto;gap:14mm 22mm;align-items:end">
    <div><div style="width:60mm">${svgLogo()}</div><div style="font-size:8pt;color:#7d828a;margin-top:4mm">referência · 60 mm</div></div>
    <div><div style="width:30mm">${svgLogo()}</div><div style="font-size:8pt;color:#7d828a;margin-top:4mm"><b style="color:${C.blueDeep}">mínimo impresso · 30 mm</b><br>mínimo digital · 120 px</div></div>
    <div style="display:flex;gap:8mm;align-items:flex-end"><div style="width:16mm">${L.icon({ style: 'width:16mm;height:16mm' })}</div><div style="width:8mm">${L.icon({ style: 'width:8mm;height:8mm' })}</div></div>
    <div style="font-size:8pt;color:#7d828a"><b style="color:${C.blueDeep}">ícone reduzido</b><br>mínimo impresso · 8 mm<br>mínimo digital · 32 px</div>
  </div>
`));

/* 9 · Cores */
const row = (num, bg, name, cmyk, rgb, hex, pantone, role) => `<div style="display:grid;grid-template-columns:8mm 1fr;gap:4mm;align-items:start">
  <div style="font-family:Montserrat;font-weight:700;font-size:10pt;color:#9aa0a8;padding-top:1mm">${num}.</div>
  <div>
    <div style="display:flex;align-items:center;gap:4mm"><div style="font-family:Montserrat;font-weight:700;font-size:10.5pt;color:#3f4650">${name}</div><div style="flex:1;height:0.25mm;background:#d9dce1"></div></div>
    <div style="height:7mm;background:${bg};margin:1.6mm 0 1.6mm"></div>
    <div style="display:flex;gap:6mm;flex-wrap:wrap;font-size:7.8pt;color:#5b626c;font-weight:500"><span>CMYK ${cmyk}</span><span>RGB ${rgb}</span><span>HEX ${hex}</span><span>Pantone ${pantone}</span></div>
    <div style="font-size:7.8pt;color:#8a9097;margin-top:.6mm">${role}</div>
  </div></div>`;
pages.push(page(`
  <div style="position:absolute;left:28mm;top:26mm">${T('CORES')}</div>
  <div style="position:absolute;left:28mm;top:46mm;width:76mm">
    ${P('As cores expressam quem a empresa é e como deseja ser percebida. Cada uma tem uma função definida.')}
    ${P('<b>1.</b> Azul JTECK, cor principal: tecnologia, precisão e confiança.<br><b>2.</b> Cinza aço: metal, estrutura e ambiente industrial.<br><b>3.</b> Cinza claro: a dobra do J.<br><b>4.</b> Solar: energia e ponto de atenção, sempre em pequena área.<br><b>5–6.</b> Cores de apoio para fundos e versão negativa.', 'margin-top:5mm;font-size:9.6pt')}
    ${P('Valores CMYK e Pantone são referências. Valide sempre com prova de cor da gráfica.', 'margin-top:5mm;font-size:8pt;color:#8a9097')}
  </div>
  <div style="position:absolute;left:118mm;right:18mm;top:20mm;display:grid;gap:3.2mm">
    ${row(1, C.blue, 'Azul JTECK', '100/72/0/12', '6/69/144', '#064590', '2945 C', 'J, T, módulo central do E e descritor.')}
    ${row(2, C.gray, 'Cinza aço', '0/0/0/60', '125/125/126', '#7D7D7E', 'Cool Gray 9 C', 'Barras externas do E, C e K.')}
    ${row(3, C.grayLight, 'Cinza claro', '0/0/3/18', '217/216/211', '#D9D8D3', 'Cool Gray 1 C', 'Dobra do J.')}
    ${row(4, C.solar, 'Solar', '0/27/85/5', '230/175/57', '#E6AF39', '7409 C', 'Acento dentro do C e detalhes pontuais.')}
    ${row(5, C.blueDeep, 'Azul profundo (apoio)', '100/80/30/55', '11/35/71', '#0B2347', '289 C', 'Fundos institucionais e capas (degradê com o Azul JTECK).')}
    ${row(6, '#B8BFCA', 'Cinza negativo (apoio)', '28/18/12/0', '184/191/202', '#B8BFCA', 'Cool Gray 4 C', 'C, K e barras externas do E na versão negativa; dobra em #8FA3C0.')}
  </div>
`));

/* 10 · Paleta */
const pcol = (bg, a, b, dark = true) => `<div style="position:relative;background:${bg}"><div style="position:absolute;left:12mm;bottom:22mm;font-size:11pt;line-height:1.5;color:${dark ? '#fff' : '#8a9097'}"><div style="letter-spacing:.08em">${a}</div><div style="font-weight:300">${b}</div></div></div>`;
pages.push(page(`
  <div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr .7fr .9fr">
    ${pcol(`linear-gradient(180deg,#9bb7df 0%,#3c74c4 30%,${C.blue} 60%,${C.blueDeep} 100%)`, 'PRECISÃO', 'Confiança')}
    ${pcol('linear-gradient(180deg,#e6e7e9 0%,#a9abae 35%,#7d7d7e 62%,#4d4e50 100%)', 'ESTRUTURA', 'Metal e resistência')}
    ${pcol('linear-gradient(180deg,#fbe7b8 0%,#f0c460 40%,#e6af39 70%,#c98f1c 100%)', 'ENERGIA', 'Atenção')}
    ${pcol('#ffffff', 'Clareza', 'e respiro', false)}
  </div>
  <div style="position:absolute;left:12mm;top:14mm;font-family:Montserrat;font-weight:700;font-size:10pt;color:#fff;line-height:1.3;border-bottom:0.35mm solid #fff;padding-bottom:2.5mm;width:46mm">PALETA<br>DE CORES</div>
`, { folio: false }));

/* 11 · Versões */
pages.push(page(`
  <div style="position:absolute;left:28mm;top:26mm">${T('VERSÕES')}</div>
  <div style="position:absolute;left:28mm;top:46mm;width:80mm">
    ${P('A marca possui uma versão principal, horizontal, e um <b>ícone reduzido</b> para espaços quadrados e pequenos.')}
    ${P('Fundos escuros: versão negativa. Sobre o Azul JTECK ou o Cinza aço: versão branca, sem a dobra.', 'margin-top:5mm')}
  </div>
  <div style="position:absolute;left:128mm;top:30mm;width:100mm">${svgLogo()}<div style="font-size:7.5pt;color:#8a9097;margin-top:3mm;letter-spacing:.14em">PRINCIPAL</div></div>
  <div style="position:absolute;left:244mm;top:26mm;width:26mm">${L.icon({ style: 'width:26mm;height:26mm' })}<div style="font-size:7.5pt;color:#8a9097;margin-top:3mm;letter-spacing:.14em">ÍCONE</div></div>
  <div style="position:absolute;left:0;right:0;top:92mm;bottom:22mm;margin-left:128mm;background:${BLUE_BG};display:flex;align-items:center;justify-content:center;gap:16mm">
    <div style="width:92mm">${svgLogo(NEG)}</div>
    <div style="width:24mm">${L.icon({ bg: '#fff', j: C.blue, style: 'width:24mm;height:24mm' })}</div>
  </div>
  <div style="position:absolute;left:28mm;top:100mm;width:76mm;height:62mm;background:#eef0f3;padding:7mm;font-size:10pt;line-height:1.55;color:#3f4650;font-weight:400"><b style="font-family:Montserrat;color:${C.blueDeep}">Regra</b><br>Fundos claros: versão colorida.<br>Fundos escuros: versão negativa.<br>Azul JTECK ou Cinza aço: versão branca.</div>
  <div style="position:absolute;left:104mm;top:131mm;width:24mm;height:0.25mm;background:#9aa0a8"></div>
`));

/* 12 · Aplicação sobre fundos */
const tile = (bg, opts, label, dark) => `<div style="background:${bg};position:relative;display:flex;align-items:center;justify-content:center">
  <div style="width:62%">${svgLogo(opts)}</div>
  <div style="position:absolute;left:4mm;bottom:3mm;font-size:6.5pt;letter-spacing:.14em;color:${dark ? 'rgba(255,255,255,.6)' : '#8a9097'}">${label}</div></div>`;
pages.push(page(`
  <div style="position:absolute;left:28mm;top:26mm">${T('APLICAÇÃO<br>SOBRE FUNDOS')}</div>
  <div style="position:absolute;left:28mm;top:58mm;width:68mm">${P('Use a versão colorida apenas em fundos claros. Em fundos escuros, use a versão negativa. Sobre o Azul JTECK ou o Cinza aço, use a versão branca, sem a dobra.')}</div>
  <div style="position:absolute;left:108mm;right:0;top:0;bottom:20mm;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,1fr)">
    ${tile('#ffffff', {}, 'BRANCO · VERSÃO COLORIDA')}
    ${tile(C.graySoft, {}, 'CINZA SUAVE · VERSÃO COLORIDA')}
    ${tile(BLUE_BG, NEG, 'AZUL PROFUNDO · NEGATIVA', true)}
    ${tile('#1b1d21', NEG, 'GRAFITE · NEGATIVA', true)}
    ${tile(C.blue, MONO('#fff'), 'AZUL JTECK · BRANCA', true)}
    ${tile(C.gray, MONO('#fff'), 'CINZA AÇO · BRANCA', true)}
  </div>
`));

/* 13 · Preto e branco */
pages.push(page(`
  <div style="position:absolute;left:28mm;top:26mm">${T('PRETO E BRANCO')}</div>
  <div style="position:absolute;left:28mm;top:46mm;width:84mm">
    ${P('A versão em uma única cor deve ser usada em bordados, silk, gravação a laser, relevo, plotagem de recorte, aplicação em vidro e documentos em preto e branco, sempre que não for possível reproduzir a versão colorida.')}
    ${P('Em uma cor, a dobra do J é uma cor chapada (preto 40%, K40). Quando o processo não permitir meio-tom (bordado, laser, recorte), use a versão sem a dobra.', 'margin-top:5mm')}
  </div>
  <div style="position:absolute;left:122mm;top:30mm;width:70mm">${svgLogo(MONO('#000', '#999999'))}<div style="font-size:7pt;letter-spacing:.14em;color:#8a9097;margin-top:3mm">PRETO · DOBRA K40</div></div>
  <div style="position:absolute;left:203mm;top:30mm;width:70mm">${svgLogo(MONO('#000'))}<div style="font-size:7pt;letter-spacing:.14em;color:#8a9097;margin-top:3mm">PRETO · SEM DOBRA</div></div>
  <div style="position:absolute;left:122mm;right:24mm;top:84mm;height:76mm;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="width:110mm">${svgLogo(MONO('#fff'))}</div><div style="font-size:7pt;letter-spacing:.14em;color:#aaa;margin-top:6mm">BRANCO · SEM DOBRA</div></div>
`));

/* 14 · Proibições */
const bad = (inner, label) => `<div style="position:relative;background:#f4f5f7;display:flex;align-items:center;justify-content:center;overflow:hidden">
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%"><path d="M8 8L92 92M92 8L8 92" stroke="#e5e7eb" stroke-width="5"/></svg>
  <div style="position:relative;width:70%">${inner}</div>
  <div style="position:absolute;left:3mm;bottom:2.5mm;font-size:6.6pt;font-weight:600;letter-spacing:.06em;color:#c0392b">✕ ${label}</div></div>`;
const noText = (opts = {}) => `<svg viewBox="35 2 1336.5 240" style="display:block;width:100%;height:auto"><path fill="${C.grayLight}" d="${L.parts.FLAP}"/><g fill="${opts.blue || C.blue}"><path d="${L.parts.J}"/><path d="${L.parts.T}"/><path d="${L.parts.E_MID}"/></g><g fill="${opts.gray || C.gray}"><path d="${L.parts.E_TOP}"/><path d="${L.parts.E_BOT}"/><path d="${L.parts.C}"/><path d="${L.parts.K}"/></g><path fill="${C.solar}" d="${L.parts.DASH}"/></svg>`;
pages.push(page(`
  <div style="position:absolute;left:28mm;top:26mm">${T('PROIBIÇÕES')}</div>
  <div style="position:absolute;left:28mm;top:46mm;width:70mm">
    ${P('Qualquer aplicação contrária a este manual está incorreta, especialmente:')}
    <div style="font-size:10pt;line-height:1.85;color:#5b626c;font-weight:300;margin-top:4mm">- Rotações;<br>- Alteração de proporção;<br>- Cores fora da paleta;<br>- Aplicação em contorno;<br>- Sombras e efeitos;<br>- Reorganização dos elementos;<br>- Fundos sem contraste;<br>- Troca da tipografia;<br>- Troca das cores internas;<br>- Remoção da dobra ou do acento.</div>
  </div>
  <div style="position:absolute;left:108mm;right:0;top:0;bottom:20mm;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(5,1fr);gap:1mm;background:#fff">
    ${bad(`<div style="transform:rotate(-14deg)">${svgLogo()}</div>`, 'ROTACIONAR')}
    ${bad(`<div style="transform:scale(1.25,.62)">${svgLogo()}</div>`, 'DISTORCER')}
    ${bad(svgLogo({ blue: '#7b3fb8', gray: '#2fa36b', gold: '#e8453c' }), 'CORES FORA DA PALETA')}
    ${bad(`<svg viewBox="${L.parts.viewBox}" style="display:block;width:100%;height:auto"><g fill="none" stroke="${C.blue}" stroke-width="5">${L.logoPaths({ blue: 'none', gray: 'none', flap: 'none', gold: 'none' })}</g></svg>`, 'CONTORNO')}
    ${bad(`<div style="filter:drop-shadow(4mm 4mm 2mm rgba(0,0,0,.45))">${svgLogo()}</div>`, 'SOMBRAS E EFEITOS')}
    ${bad(`<div style="display:flex;align-items:center;gap:3mm"><div style="width:72%">${noText()}</div><div style="font-family:Montserrat;font-weight:600;font-size:7pt;letter-spacing:.2em;color:${C.blue};line-height:1.4">VALVE<br>SERVICE</div></div>`, 'REORGANIZAR ELEMENTOS')}
    <div style="position:relative;background:#4a6fa5;display:flex;align-items:center;justify-content:center"><div style="width:70%">${svgLogo()}</div><div style="position:absolute;left:3mm;bottom:2.5mm;font-size:6.6pt;font-weight:600;letter-spacing:.06em;color:#ffd6d1">✕ FUNDO SEM CONTRASTE</div></div>
    ${bad(`${noText()}<div style="font-family:'Times New Roman',serif;font-size:13pt;letter-spacing:.32em;color:${C.blue};text-align:center;margin-top:1mm">Valve Service</div>`, 'TROCAR A TIPOGRAFIA')}
    ${bad(svgLogo({ blue: C.gray, gray: C.blue }), 'INVERTER CORES INTERNAS')}
    ${bad(svgLogo({ flap: null, gold: C.gray }), 'REMOVER DOBRA OU ACENTO')}
  </div>
`));

/* 15 · Tipografia */
const tag = (t, bg) => `<span style="display:inline-block;background:${bg};color:#fff;font-family:Montserrat;font-weight:700;font-size:9.5pt;padding:1.5mm 5mm;min-width:46mm;text-align:center">${t}</span>`;
const spec = (fam, w, size = 13) => `<div style="font-family:${fam};font-weight:${w};font-size:${size}pt;line-height:1.45;color:#2b313a;margin-top:2.5mm">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn<br>Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789</div>`;
pages.push(page(`
  <div style="position:absolute;left:28mm;top:26mm">${T('TIPOGRAFIA')}</div>
  <div style="position:absolute;left:28mm;top:46mm;width:84mm">
    ${P('A palavra JTECK tem desenho exclusivo e não deve ser reproduzida com fontes. Para todos os demais textos, a marca usa duas famílias gratuitas, disponíveis no Google Fonts:')}
    ${P('<b>Montserrat</b>, a mesma de VALVE SERVICE, para títulos, subtítulos e destaques.<br><b>Inter</b> para textos corridos, documentos técnicos e interfaces.', 'margin-top:5mm')}
    ${P('Não aplique bordas, sombras ou tarjas que não sigam a estrutura deste manual.', 'margin-top:5mm')}
  </div>
  <div style="position:absolute;left:128mm;top:34mm;width:142mm;display:grid;gap:9mm">
    <div>${tag('Títulos', C.blueDeep)} ${tag('Montserrat Bold', C.solar)}${spec('Montserrat', 700)}</div>
    <div>${tag('Subtítulos', C.blueDeep)} ${tag('Montserrat SemiBold', C.solar)}${spec('Montserrat', 600)}</div>
    <div>${tag('Corpo de texto', C.blueDeep)} ${tag('Inter Light / Regular', C.solar)}${spec('Inter', 300, 12.5)}</div>
  </div>
`));

/* 16 · Elementos gráficos */
const box = (inner, title, text, bg = '#f4f5f7') => `<div><div style="height:46mm;background:${bg};position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center">${inner}</div>
  <div style="font-family:Montserrat;font-weight:700;font-size:10pt;color:#3f4650;margin:4mm 0 1.5mm">${title}</div><div style="font-size:8.6pt;line-height:1.55;color:#6b7280;font-weight:300">${text}</div></div>`;
pages.push(page(`
  <div style="position:absolute;left:28mm;top:26mm">${T('ELEMENTOS GRÁFICOS')}</div>
  <div style="position:absolute;left:28mm;right:28mm;top:50mm;display:grid;grid-template-columns:repeat(4,1fr);gap:8mm">
    ${box(L.pattern({ w: 60, h: 46, opacity: 0.05, size: 3.7 }), 'Padrão modular', 'Derivado das barras do E, sempre em vetor. Branco sobre o fundo institucional: barras externas a 5% e barra central a 8%. Em capas, versos e fundos.', BLUE_BG)}
    ${box(`<div style="position:absolute;right:-14mm;top:-18mm;width:62mm">${L.jFold({ style: 'width:62mm;height:auto' })}</div>`, 'J com dobra', 'Pode ser ampliado e recortado nos cantos de peças, como no cartão de visita e no papel timbrado. Nunca substitui o logotipo.')}
    ${box(`<div style="width:60%;height:4mm;border-radius:2mm;background:${C.solar}"></div>`, 'Acento solar', 'Traço curto com pontas arredondadas. Marca pontos de atenção, como o nome no cartão. Além do acento do logotipo, no máximo um traço por peça.')}
    ${box(`<div style="position:absolute;left:0;right:0;bottom:12mm;height:6mm;background:${L.tri(60)}"></div>`, 'Faixa tricolor', 'Azul, cinza e solar na proporção da marca (64 / 29 / 7). Fecha rodapés de documentos, envelopes e capas.')}
  </div>
`));

/* 17 · Conclusão */
pages.push(page(`
  ${L.pattern({ w: 297, h: 210, opacity: 0.04, size: 4.8 })}
  <div style="position:absolute;right:-24mm;top:22mm;width:150mm">${L.jFold({ blue: '#25518d', flap: '#3c639a', style: 'width:150mm;height:auto' })}</div>
  <div style="position:absolute;left:28mm;top:34mm;width:124mm">
    ${T('CONCLUSÃO', true)}
    ${P('Unindo design e conceito, a identidade visual <b style="color:#fff">JTECK</b> foi construída para traduzir precisão, robustez e confiança em uma marca simples de reconhecer e fácil de aplicar.', 'color:rgba(255,255,255,.82)')}
    ${P('Os elementos, cores e fontes aqui definidos criam identificação com o público técnico e posicionam a empresa de forma profissional no mercado industrial.', 'margin-top:5mm;color:rgba(255,255,255,.82)')}
    ${P('Este guia existe para facilitar e orientar o uso da marca, para que ela mantenha sua essência em cada aplicação.', 'margin-top:5mm;color:rgba(255,255,255,.82)')}
    ${P('Faça bom uso.', 'margin-top:10mm;color:#fff;font-weight:500')}
  </div>
`, { bg: C.bgInst, dark: true }));

/* 18 · Contracapa */
pages.push(page(`
  <div style="position:absolute;left:50%;top:62mm;width:80mm;transform:translateX(-50%)">${L.artefacto()}</div>
  <div style="position:absolute;left:0;right:0;top:118mm;text-align:center;font-family:Montserrat;line-height:2">
    <div style="font-weight:700;font-size:11pt;color:#9aa0a8;display:flex;justify-content:center;align-items:center;gap:2mm">${L.ic('whats', '#9aa0a8', '5mm')}19 99675.8920</div>
    <div style="font-size:11pt;color:#9aa0a8">contato@artefacto.art.br</div>
  </div>
`, { folio: false }));

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${L.baseCss('297mm', '210mm')}</style></head><body>${pages.join('\n')}</body></html>`;
render({ name: 'jteck-manual-identidade-visual', html, width: '297mm', height: '210mm', previews: process.argv.includes('--prev') ? pages.map((_, i) => i) : [] })
  .then(() => console.log('manual ok', pages.length));
