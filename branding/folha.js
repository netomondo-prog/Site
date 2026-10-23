'use strict';
/* Folha de apresentação do kit do logotipo (A4 deitado). */
const L = require('./lib');
const { render } = require('./render');
const fs = require('fs');
const { C } = L;
const D = __dirname + '/pdf/04-logotipo/';
const svg = (f) => fs.readFileSync(D + f, 'utf8').replace(/<\?xml[^>]*>/, '').replace('<svg ', '<svg style="display:block;width:100%;height:auto" ');
const cell = (bg, file, label, w = '78%') => `<div style="background:${bg};position:relative;display:flex;align-items:center;justify-content:center;border:${bg === '#fff' ? '0.25mm solid #e3e5e8' : '0'}">
  <div style="width:${w}">${svg(file)}</div>
  <div style="position:absolute;left:3mm;bottom:2.2mm;font-family:Montserrat;font-size:5.6pt;letter-spacing:.12em;color:${bg === '#fff' || bg === '#f1f2f4' ? '#8a9097' : '#c9d0da'}">${label}</div></div>`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${L.baseCss('297mm', '210mm')}</style></head><body>
<section class="page" style="background:#fff">
  <div style="position:absolute;left:18mm;top:14mm;font-family:Montserrat;font-weight:700;font-size:13pt;letter-spacing:.16em;color:${C.blueDeep}">JTECK · KIT DO LOGOTIPO</div>
  <div style="position:absolute;left:18mm;top:21mm;font-size:7.5pt;color:#7d828a">Vetor de curvas (sem fontes). Arquivos em SVG, PDF e EPS. Detalhes de uso no LEIA-ME.txt e no manual.</div>
  <div style="position:absolute;left:18mm;right:18mm;top:30mm;bottom:20mm;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(3,1fr);gap:3mm">
    ${cell('#fff', 'digital-rgb/jteck-logo.svg', 'PRINCIPAL · jteck-logo')}
    ${cell(C.blueDeep, 'digital-rgb/jteck-logo-negativo.svg', 'NEGATIVA · jteck-logo-negativo')}
    ${cell('#fff', 'digital-rgb/jteck-logo-preto.svg', 'PRETO · DOBRA K40')}
    ${cell('#fff', 'digital-rgb/jteck-logo-preto-sem-dobra.svg', 'PRETO · SEM DOBRA')}
    ${cell(C.blue, 'digital-rgb/jteck-logo-branco-sem-dobra.svg', 'BRANCO SEM DOBRA · sobre Azul JTECK')}
    ${cell(C.gray, 'digital-rgb/jteck-logo-branco-sem-dobra.svg', 'BRANCO SEM DOBRA · sobre Cinza aço')}
    ${cell('#000', 'digital-rgb/jteck-logo-branco.svg', 'BRANCO · dobra a 40% (só digital)')}
    ${cell('#f1f2f4', 'digital-rgb/jteck-logo-area-de-protecao.svg', 'ÁREA DE PROTEÇÃO · 2x', '84%')}
    ${cell('#fff', 'icone/jteck-icone.svg', 'ÍCONE · jteck-icone', '34%')}
    ${cell('#fff', 'icone/jteck-icone-fundo-branco.svg', 'ÍCONE · fundo branco', '34%')}
    ${cell('#fff', 'icone/jteck-icone-negativo.svg', 'ÍCONE · negativo', '34%')}
    ${cell('#fff', 'icone/jteck-icone-preto.svg', 'ÍCONE · preto', '34%')}
  </div>
  <div style="position:absolute;left:18mm;right:18mm;bottom:9mm;display:flex;justify-content:space-between;font-family:Montserrat;font-size:6pt;letter-spacing:.14em;color:#9aa0a8"><span>AZUL #064590 · 100/72/0/12 · PANTONE 2945 C &nbsp;|&nbsp; CINZA AÇO #7D7D7E · K60 · COOL GRAY 9 C &nbsp;|&nbsp; CINZA CLARO #D9D8D3 · COOL GRAY 1 C &nbsp;|&nbsp; SOLAR #E6AF39 · 0/27/85/5 · 7409 C</span></div>
</section></body></html>`;
render({ name: 'jteck-logo-folha-de-apresentacao', html, width: '297mm', height: '210mm', previews: [0] }).then(() => console.log('folha ok'));
