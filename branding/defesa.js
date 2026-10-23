'use strict';
const L = require('./lib');
const { render } = require('./render');
const { C } = L;
const DOC = 'DEFESA DE IDENTIDADE VISUAL';

let n = 0;
const page = (inner, { bg = '#fff', dark = false, label = '', folio = true } = {}) => {
  n += 1;
  return `<section class="page" style="background:${bg}">${label ? L.tab(label) : ''}${inner}${folio ? L.folio(n, DOC, dark) : ''}</section>`;
};

const H = (t, s = 19) => `<h2 style="font-family:Montserrat;font-weight:700;font-size:${s}pt;line-height:1.18;color:${C.blueDeep};letter-spacing:-.01em;text-wrap:balance">${t}</h2>`;
const K = (t, c = C.solar) => `<div style="font-family:Montserrat;font-weight:700;font-size:7.5pt;letter-spacing:.24em;color:${c};margin-bottom:3.5mm">${t}</div>`;
const P = (t, extra = '') => `<p style="font-size:9.6pt;line-height:1.62;color:#5b626c;font-weight:300;${extra}">${t}</p>`;
const col = (title, text) => `<div><h3 style="font-family:Montserrat;font-weight:700;font-size:12.5pt;line-height:1.25;color:#7d828a;margin-bottom:3.5mm">${title}</h3>${P(text)}</div>`;
const cols3 = (items, top = 92) => `<div style="position:absolute;left:28mm;right:28mm;top:${top}mm;display:grid;grid-template-columns:repeat(3,1fr);gap:12mm">${items.map(([a, b]) => col(a, b)).join('')}</div>`;
const band = (title, text, top = 34) => `<div style="position:absolute;left:0;right:0;top:${top}mm;height:44mm;background:#e3e5e7;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 50mm">
  <h3 style="font-family:Montserrat;font-weight:700;font-size:13pt;color:#7d828a;margin-bottom:3mm">${title}</h3>${P(text, 'max-width:190mm')}</div>`;
const svgLogo = (opts = {}, style = '') => `<svg viewBox="30 0 1348 350" style="display:block;width:100%;height:auto;${style}" xmlns="http://www.w3.org/2000/svg">${L.logoPaths(opts)}</svg>`;

const pages = [];

/* 1 · Capa */
pages.push(page(`
  <div style="position:absolute;left:0;right:0;top:78mm;text-align:center">
    <div style="font-family:Montserrat;font-weight:700;font-size:14pt;letter-spacing:.06em;color:#6f757d">BRANDING</div>
    <div style="font-family:Montserrat;font-weight:300;font-size:15pt;letter-spacing:.06em;color:#8a9097;margin-top:4mm">NOVA MARCA · VÁLVULAS INDUSTRIAIS</div>
  </div>
  <div style="position:absolute;left:50%;top:150mm;width:56mm;transform:translateX(-50%)">${L.artefacto()}</div>
`, { folio: false }));

/* 2 · Ponto de partida */
pages.push(page(`
  <div style="position:absolute;left:28mm;top:40mm;width:120mm">
    ${K('O PONTO DE PARTIDA')}
    ${H('Uma empresa técnica não precisa parecer complicada.', 22)}
    ${P('A identidade da JTECK precisava traduzir um segmento industrial de alta responsabilidade, a manutenção de válvulas de segurança e controle, sem recorrer aos clichês visuais mais comuns do setor: engrenagens, tubulações e ilustrações de produto.', 'margin-top:6mm')}
  </div>
  ${cols3([
    ['Precisão', 'Controle, leitura e consistência. Uma válvula de segurança precisa abrir na pressão exata; a marca precisa transmitir esse mesmo rigor.'],
    ['Robustez', 'Estrutura para ambientes exigentes. Plataformas, refinarias e caldeiras pedem uma presença visual firme e confiável.'],
    ['Confiança', 'Clareza para uma relação técnica. O cliente entrega à JTECK o equipamento que protege sua planta e suas pessoas.'],
  ], 118)}
`, { label: 'PONTO DE PARTIDA' }));

/* 3 · Estudo do nome */
pages.push(page(`
  ${cols3([
    ['Sonoridade técnica', 'O nome JTECK carrega na pronúncia a palavra “tech”, de tecnologia e técnica. A grafia com “CK” dá peso e firmeza ao final da palavra, reforçando a ideia de algo bem fixado, travado, seguro.'],
    ['Curto e memorável', 'Cinco letras, duas sílabas e leitura imediata. Um nome curto funciona bem em fachadas, uniformes, veículos e equipamentos, e se fixa na memória de quem o encontra em campo.'],
    ['Valve Service', 'O descritor em inglês deixa claro o segmento logo no primeiro contato e conversa com o vocabulário internacional da indústria de óleo, gás e energia, onde normas e documentos técnicos circulam em inglês.'],
  ], 62)}
`, { label: 'ESTUDO DO NOME' }));

/* 4 · O desafio */
const terr = (num, t, d) => `<div style="border-top:0.5mm solid ${C.blue};padding-top:5mm">
  <div style="font-family:Montserrat;font-weight:800;font-size:22pt;color:${C.grayLight}">${num}</div>
  <div style="font-family:Montserrat;font-weight:700;font-size:12pt;letter-spacing:.14em;color:${C.blueDeep};margin:2mm 0 2mm">${t}</div>${P(d)}</div>`;
pages.push(page(`
  <div style="position:absolute;left:28mm;top:38mm;width:150mm">
    ${K('O DESAFIO')}${H('Como comunicar especialização sem transformar a marca em ilustração?')}
  </div>
  <div style="position:absolute;left:28mm;right:28mm;top:92mm;display:grid;grid-template-columns:repeat(3,1fr);gap:12mm">
    ${terr('01', 'INDÚSTRIA', 'Força, resistência e presença em ambientes de alta exigência.')}
    ${terr('02', 'TECNOLOGIA', 'Precisão, método e atualização constante de normas e processos.')}
    ${terr('03', 'SERVIÇO', 'Confiança, proximidade e especialização no atendimento.')}
  </div>
  <div style="position:absolute;left:28mm;right:28mm;top:156mm">${P('A solução precisava equilibrar os três territórios sem deixar nenhum deles dominar a leitura.', 'font-weight:500;color:#3f4650')}</div>
`, { label: 'O DESAFIO' }));

/* 5 · Caminho criativo */
const li = (t, strike) => `<li style="font-family:Montserrat;font-weight:${strike ? 400 : 600};font-size:12pt;color:${strike ? '#a7acb3' : C.blueDeep};${strike ? 'text-decoration:line-through;text-decoration-color:' + C.solar + ';' : ''}list-style:none;padding:2.4mm 0;border-bottom:0.2mm solid #e5e7ea">${t}</li>`;
pages.push(page(`
  <div style="position:absolute;left:28mm;top:38mm;width:118mm">
    ${K('O CAMINHO CRIATIVO')}${H('Em vez de adicionar elementos, começamos retirando.')}
    ${P('A identidade nasce de uma linguagem industrial reduzida ao essencial. Cada elemento que permaneceu precisou justificar sua presença com uma função: ser lido, ser lembrado, ser aplicado.', 'margin-top:6mm')}
  </div>
  <div style="position:absolute;left:162mm;top:40mm;width:48mm">
    <div style="font-family:Montserrat;font-weight:800;font-size:9pt;letter-spacing:.24em;color:#a7acb3;margin-bottom:2mm">MENOS</div>
    <ul>${['engrenagens', 'tubulações', 'detalhes', 'ornamentos'].map((t) => li(t, true)).join('')}</ul>
  </div>
  <div style="position:absolute;left:222mm;top:40mm;width:48mm">
    <div style="font-family:Montserrat;font-weight:800;font-size:9pt;letter-spacing:.24em;color:${C.blue};margin-bottom:2mm">MAIS</div>
    <ul>${['reconhecimento', 'legibilidade', 'personalidade', 'consistência'].map((t) => li(t, false)).join('')}</ul>
  </div>
`, { label: 'CAMINHO CRIATIVO' }));

/* 6 · Abertura do estudo da marca */
pages.push(page(`
  <div style="position:absolute;left:0;right:0;top:90mm;text-align:center;font-family:Montserrat;font-size:19pt;color:#9aa0a8;letter-spacing:.04em;line-height:1.35">
    <b style="color:#7d828a">JTECK</b> · VALVE SERVICE<br><span style="font-size:11pt;letter-spacing:.24em">IDENTIDADE INDUSTRIAL REDUZIDA AO ESSENCIAL</span>
  </div>
`, { label: 'ESTUDO DA MARCA' }));

/* 7 · Da escolha à versão final */
pages.push(page(`
  <div style="position:absolute;left:28mm;top:38mm;width:120mm">
    ${K('TRÊS EXPRESSÕES. UMA IDENTIDADE.')}${H('A versão final reúne o melhor de cada caminho.')}
    ${P('As três propostas apresentadas pertenciam à mesma família e variavam apenas a intensidade de cada atributo. A marca definida combina o E modular da primeira, a robustez de leitura da segunda e o acento solar da terceira, e acrescenta um gesto novo: a dobra no J.', 'margin-top:6mm')}
    <div style="display:grid;grid-template-columns:auto 1fr;gap:2.5mm 5mm;margin-top:8mm;font-size:8.6pt;color:#5b626c;align-items:center">
      <b style="font-family:Montserrat;color:${C.blue}">01</b><span><b>Técnica</b> · o E construído por módulos</span>
      <b style="font-family:Montserrat;color:${C.blue}">02</b><span><b>Essencial</b> · construção robusta e leitura imediata</span>
      <b style="font-family:Montserrat;color:${C.blue}">03</b><span><b>Assinatura</b> · o ponto solar como acento</span>
    </div>
  </div>
  <div style="position:absolute;left:166mm;top:36mm;width:104mm;height:96mm;display:flex;align-items:center;justify-content:center;opacity:.55;filter:grayscale(.35)">
    <img src="assets/opcoes.png" style="height:96mm;width:auto">
  </div>
  <div style="position:absolute;left:150mm;right:28mm;top:140mm;height:0.3mm;background:${C.grayLight}"></div>
  <div style="position:absolute;left:150mm;top:144mm;font-family:Montserrat;font-weight:700;font-size:7pt;letter-spacing:.24em;color:${C.solar}">VERSÃO FINAL</div>
  <div style="position:absolute;left:150mm;top:152mm;width:119mm">${svgLogo()}</div>
`, { label: 'DECISÃO' }));

/* 8 · Construção técnica (grid) */
const gridLines = () => {
  let g = '';
  for (let x = 13; x <= 1395; x += 21.5) g += `<line x1="${x}" y1="-30" x2="${x}" y2="380" stroke="#d6dae0" stroke-width="1.4"/>`;
  for (let y = -9.5; y <= 380; y += 21.5) g += `<line x1="0" y1="${y}" x2="1395" y2="${y}" stroke="#d6dae0" stroke-width="1.4"/>`;
  return g;
};
const guide = (y, label, color = C.solar) => `<line x1="0" y1="${y}" x2="1390" y2="${y}" stroke="${color}" stroke-width="2.4" stroke-dasharray="8 7"/>`;
const bracket = (x, y1, y2, label) => `<g stroke="${C.blue}" stroke-width="3" fill="none"><path d="M${x} ${y1}h-12v${y2 - y1}h12"/></g><text x="${x - 24}" y="${(y1 + y2) / 2 + 11}" text-anchor="end" font-family="Montserrat" font-weight="700" font-size="32" fill="${C.blue}">${label}</text>`;
pages.push(page(`
  <div style="position:absolute;left:28mm;top:34mm;width:96mm">
    ${K('CONSTRUÇÃO TÉCNICA')}${H('Uma marca construída, não decorada.', 18)}
    ${P('Formas geométricas, cortes precisos e espessuras controladas. Toda a marca parte de um módulo: <b>x</b>, a altura de uma barra do E.', 'margin-top:5mm')}
    <div style="display:grid;gap:3.4mm;margin-top:7mm;font-size:8.6pt;color:#5b626c">
      <div><b style="font-family:Montserrat;color:${C.blueDeep}">ENCAIXE</b> · geometria que sugere precisão</div>
      <div><b style="font-family:Montserrat;color:${C.blueDeep}">CONTROLE</b> · ritmo visual e repetição</div>
      <div><b style="font-family:Montserrat;color:${C.blueDeep}">ESTRUTURA</b> · peso suficiente para o ambiente industrial</div>
    </div>
    ${P('A palavra JTECK mede 4,65x de altura. “VALVE SERVICE” tem cerca de 0,37 dessa altura, muito próximo de 0,382, a proporção áurea inversa ao quadrado, que traz equilíbrio natural ao conjunto.', 'margin-top:7mm;font-size:8.6pt')}
  </div>
  <div style="position:absolute;left:128mm;top:62mm;width:156mm">
    <svg viewBox="-80 -30 1640 420" style="width:100%;height:auto">
      ${gridLines()}
      <g opacity=".92">${L.logoPaths()}</g>
      ${guide(33.5)}${guide(233.5)}${guide(270.5, '', C.blue)}${guide(344.5, '', C.blue)}
      ${bracket(20, 33.5, 76.5, 'x')}${bracket(20, 112.5, 155.5, 'x')}${bracket(20, 190.5, 233.5, 'x')}
      <path d="M1392 33.5h14v200h-14M1392 270.5h14v74h-14" stroke="${C.blue}" stroke-width="3" fill="none"/>
      <text x="1422" y="145" font-family="Montserrat" font-weight="700" font-size="32" fill="${C.blue}">4,65x</text>
      <text x="1422" y="319" font-family="Montserrat" font-weight="700" font-size="32" fill="${C.blue}">1,72x</text>
    </svg>
  </div>
`, { label: 'CONSTRUÇÃO' }));

/* 9 · Elemento proprietário: E */
pages.push(page(`
  <div style="position:absolute;left:40mm;top:56mm;width:82mm">${L.eModule({ style: 'width:82mm;height:auto' })}</div>
  <div style="position:absolute;left:150mm;top:52mm;width:112mm">
    ${K('ELEMENTO PROPRIETÁRIO')}${H('O “E” deixa de ser apenas uma letra.', 18)}
    ${P('Três módulos transformam um caractere comum em um elemento capaz de sustentar um sistema gráfico próprio. O módulo central, em azul, marca o eixo da marca e dá direção à leitura.', 'margin-top:5mm')}
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5mm;margin-top:8mm;font-size:8.2pt;color:#5b626c">
      <div><b style="font-family:Montserrat;color:${C.blueDeep};display:block;letter-spacing:.14em">MÓDULO</b>forma repetível</div>
      <div><b style="font-family:Montserrat;color:${C.blueDeep};display:block;letter-spacing:.14em">FLUXO</b>leitura horizontal</div>
      <div><b style="font-family:Montserrat;color:${C.blueDeep};display:block;letter-spacing:.14em">CONEXÃO</b>associação indireta ao universo técnico</div>
    </div>
    ${P('Técnico sem ser óbvio. Industrial sem ser genérico.', 'margin-top:8mm;font-weight:500;color:#3f4650')}
  </div>
`, { label: 'SÍMBOLO' }));

/* 10 · A dobra */
pages.push(page(`
  <div style="position:absolute;left:46mm;top:40mm;width:66mm">${L.jFold({ style: 'width:66mm;height:auto' })}</div>
  <div style="position:absolute;left:150mm;top:52mm;width:112mm">
    ${K('A DOBRA')}${H('A válvula não precisa ser desenhada para estar presente.', 18)}
    ${P('O canto do J se dobra como o disco de uma válvula que se abre: o instante exato em que a pressão é aliviada com segurança. É um gesto pequeno, mas carregado de sentido para quem vive o segmento.', 'margin-top:5mm')}
    ${P('A dobra também lembra uma página sendo virada. Ela marca o início de uma nova fase para a empresa e dá ao J, primeira letra da marca, um ponto de entrada memorável.', 'margin-top:4mm')}
  </div>
`, { label: 'SÍMBOLO' }));

/* 11 · Acento solar */
pages.push(page(`
  <div style="position:absolute;left:30mm;top:70mm;width:110mm">
    <svg viewBox="830 30 260 210" style="width:100%;height:auto"><path fill="${C.gray}" d="${L.parts.C}"/><rect fill="${C.solar}" x="945" y="126" width="82.5" height="14" rx="7"/></svg>
  </div>
  <div style="position:absolute;left:150mm;top:52mm;width:112mm">
    ${K('ACENTO SOLAR')}${H('Um ponto de controle visual.', 18)}
    ${P('O pequeno traço solar dentro do C funciona como o ponteiro de um manômetro: introduz energia e direção sem competir com a tipografia.', 'margin-top:5mm')}
    ${P('Ele preserva a associação com técnica, fluxo e controle sem transformar a identidade em uma ilustração do produto, e quebra a rigidez do cinza com um detalhe que o olhar encontra e lembra.', 'margin-top:4mm')}
  </div>
`, { label: 'SÍMBOLO' }));

/* 12 · Estudo das cores */
const sw = (bg, h = 7) => `<div style="height:${h}mm;background:${bg};margin:3mm 0 6mm"></div>`;
pages.push(page(`
  ${band('Cor como função', 'Uma paleta curta, em que cada cor tem um papel. A escolha parte da psicologia das cores e do ambiente onde a marca vive: metal, estrutura, instrumentos de medição e sinalização de segurança.')}
  <div style="position:absolute;left:28mm;right:28mm;top:92mm;display:grid;grid-template-columns:repeat(3,1fr);gap:12mm">
    <div><h3 style="font-family:Montserrat;font-weight:700;font-size:13pt;color:#7d828a">Azul JTECK</h3>${sw(C.blue)}${P('Tecnologia, precisão e confiança. É a cor principal da marca e carrega o nome e o descritor. Um azul profundo e saturado, que mantém leitura forte em fundos claros e se impõe em fachadas e uniformes.')}</div>
    <div><h3 style="font-family:Montserrat;font-weight:700;font-size:13pt;color:#7d828a">Cinza aço</h3>${sw(`linear-gradient(90deg,#b9bcc1,${C.gray},#5f6163)`)}${P('Metal, estrutura e ambiente industrial. O cinza dá corpo à segunda metade da palavra e equilibra o azul, evocando o aço das válvulas, flanges e equipamentos.')}</div>
    <div><h3 style="font-family:Montserrat;font-weight:700;font-size:13pt;color:#7d828a">Solar</h3>${sw(C.solar)}${P('Energia e ponto de atenção. O amarelo não disputa protagonismo: atua como acento, criando um ponto memorável dentro de uma identidade predominantemente técnica, como a sinalização de segurança na planta.')}</div>
  </div>
`, { label: 'ESTUDO DAS CORES' }));

/* 13 · Paleta (página cheia) */
const pcol = (bg, a, b, dark = true) => `<div style="position:relative;background:${bg}">
  <div style="position:absolute;left:12mm;bottom:22mm;font-size:11pt;line-height:1.5;color:${dark ? '#fff' : '#8a9097'}"><div style="letter-spacing:.08em">${a}</div><div style="font-weight:300">${b}</div></div></div>`;
pages.push(page(`
  <div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr .7fr .9fr">
    ${pcol(`linear-gradient(180deg,#9bb7df 0%,#3c74c4 35%,${C.blue} 62%,${C.blueNight} 100%)`, 'PRECISÃO', 'Confiança')}
    ${pcol('linear-gradient(180deg,#e6e7e9 0%,#a9abae 35%,#7d7d7e 62%,#4d4e50 100%)', 'ESTRUTURA', 'Metal e resistência')}
    ${pcol('linear-gradient(180deg,#fbe7b8 0%,#f0c460 40%,#e6af39 70%,#c98f1c 100%)', 'ENERGIA', 'Atenção')}
    ${pcol('#ffffff', 'Clareza', 'e respiro', false)}
  </div>
  <div style="position:absolute;left:12mm;top:14mm;font-family:Montserrat;font-weight:700;font-size:10pt;color:#fff;line-height:1.3;border-bottom:0.35mm solid #fff;padding-bottom:2.5mm;width:46mm">PALETA<br>DE CORES</div>
`, { folio: false }));

/* 14 · Tipografia */
pages.push(page(`
  ${band('Definição da tipografia', 'A tipografia carrega a personalidade da JTECK. A palavra principal foi desenhada sob medida; o descritor e os textos de apoio usam uma família geométrica de ampla disponibilidade, garantindo consistência em qualquer meio.')}
  ${cols3([
    ['Legibilidade e clareza', 'Formas abertas e espaçamento generoso garantem leitura em placas, uniformes e equipamentos, à distância ou em tamanhos pequenos, como etiquetas e lacres.'],
    ['Robustez e confiança', 'Traços de espessura constante e cantos retos sustentam o nome com firmeza, sem excesso de peso nem efeitos que comprometam a reprodução.'],
    ['Modernidade', 'A construção geométrica comunica atualização técnica e método, alinhando a marca a um setor que evolui com normas e tecnologia.'],
  ], 92)}
`, { label: 'TIPOGRAFIA' }));

/* 15 · Tipografia aplicada */
pages.push(page(`
  <div style="position:absolute;left:28mm;top:38mm;width:120mm">
    <h3 style="font-family:Montserrat;font-weight:700;font-size:12.5pt;color:#7d828a;margin-bottom:3mm">Desenho próprio</h3>
    ${P('As letras de JTECK foram construídas sobre o mesmo módulo, com cortes retos, curvas controladas no J e no C e diagonais firmes no K. O resultado é uma palavra única, que funciona como símbolo.')}
    <h3 style="font-family:Montserrat;font-weight:700;font-size:12.5pt;color:#7d828a;margin:9mm 0 3mm">Tipografia secundária</h3>
    ${P('“VALVE SERVICE” usa Montserrat SemiBold com espaçamento amplo entre letras. A abertura do espaçamento cria uma linha de base calma, que sustenta a palavra principal sem disputar atenção.')}
  </div>
  <div style="position:absolute;left:168mm;top:54mm;width:100mm">${svgLogo()}</div>
  <div style="position:absolute;left:168mm;top:96mm;width:100mm;height:0.25mm;background:${C.grayLight}"></div>
  <div style="position:absolute;left:168mm;top:104mm;font-family:Montserrat;font-weight:600;font-size:15pt;letter-spacing:.38em;color:${C.blue}">VALVE SERVICE</div>
  <div style="position:absolute;left:168mm;top:116mm;font-family:Montserrat;font-weight:400;font-size:8pt;letter-spacing:.12em;color:#9aa0a8">MONTSERRAT SEMIBOLD · ESPAÇAMENTO AMPLO</div>
`, { label: 'TIPOGRAFIA' }));

/* 16 · Apresentação clara */
pages.push(page(`<div style="position:absolute;left:50%;top:50%;width:150mm;transform:translate(-50%,-50%)">${svgLogo()}</div>`,
  { bg: 'radial-gradient(circle at 50% 50%,#ffffff 0%,#f6f7f8 45%,#e2e4e7 100%)', folio: false }));

/* 17 · Apresentação negativa */
pages.push(page(`${L.pattern({ opacity: 0.035, size: 18 })}<div style="position:absolute;left:50%;top:50%;width:150mm;transform:translate(-50%,-50%)">${svgLogo({ blue: '#fff', gray: '#b8bfca', flap: '#fff', flapOpacity: 0.55 })}</div>`,
  { bg: `linear-gradient(180deg,#1d5aa6 0%,${C.blueDeep} 55%,${C.blueNight} 100%)`, folio: false }));

/* 18 · Mockup: cartões */
const place = (inner, w, h, { left, top, scale = 1, rotate = 0 }) => `<div style="position:absolute;left:${left}mm;top:${top}mm;width:${w * scale}mm;height:${h * scale}mm;transform:rotate(${rotate}deg)">
  <div style="width:${w}mm;height:${h}mm;transform:scale(${scale});transform-origin:top left;box-shadow:0 2mm 4mm rgba(10,25,50,.18),0 12mm 26mm rgba(10,25,50,.25);overflow:hidden">${inner}</div></div>`;
pages.push(page(`
  ${place(L.cardBack(), 90, 50, { left: 60, top: 44, scale: 1.55, rotate: -6 })}
  ${place(L.cardFront(), 90, 50, { left: 112, top: 98, scale: 1.55, rotate: 4 })}
`, { bg: 'linear-gradient(150deg,#ecebe7 0%,#d6d3cc 100%)', folio: false }));

/* 19 · Mockup: fachada */
pages.push(page(`
  <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 52mm,rgba(0,0,0,.07) 52mm 52.5mm),repeating-linear-gradient(90deg,transparent 0 74mm,rgba(0,0,0,.05) 74mm 74.5mm)"></div>
  <div style="position:absolute;left:48mm;top:56mm;width:200mm;height:96mm;border-radius:2mm;background:linear-gradient(135deg,rgba(255,255,255,.88),rgba(255,255,255,.6));box-shadow:0 10mm 22mm rgba(0,0,0,.2),inset 0 0 0 .6mm rgba(255,255,255,.9)">
    ${[[7, 7], [187, 7], [7, 83], [187, 83]].map(([x, y]) => `<div style="position:absolute;left:${x}mm;top:${y}mm;width:6mm;height:6mm;border-radius:50%;background:radial-gradient(circle at 35% 35%,#f4f5f6,#9ea3a9);box-shadow:0 1mm 1.5mm rgba(0,0,0,.25)"></div>`).join('')}
    <div style="position:absolute;left:50%;top:50%;width:150mm;transform:translate(-50%,-50%)">${svgLogo()}</div>
  </div>
`, { bg: 'linear-gradient(180deg,#d7d8da 0%,#bfc2c5 100%)', folio: false }));

/* 20 · Conclusão */
pages.push(page(`
  <div style="position:absolute;left:50%;top:34mm;width:132mm;transform:translateX(-50%);text-align:center;font-size:9.6pt;line-height:1.7;color:#7d828a;font-weight:300">
    <p>Com aplicação segura em fundos claros e escuros, leitura imediata e um conceito desenhado para o universo técnico da JTECK, apresentamos esta marca.</p><br>
    <p>A precisão, a robustez e a confiança que o cliente espera de quem cuida das válvulas de segurança da sua planta estão traduzidas em uma palavra, um módulo, uma dobra e um ponto de luz.</p><br>
    <p>Uma identidade robusta sem excesso, técnica sem obviedade e preparada para crescer junto com a empresa.</p><br>
    <p style="font-weight:500;color:${C.blueDeep}">JTECK Valve Service. Precisão aplicada ao que mantém a indústria em movimento.</p>
  </div>
  <div style="position:absolute;left:50%;top:150mm;width:56mm;transform:translateX(-50%)">${L.artefacto()}</div>
`, { folio: false }));

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${L.baseCss('297mm', '210mm')}</style></head><body>${pages.join('\n')}</body></html>`;
render({ name: 'jteck-defesa-identidade-visual', html, width: '297mm', height: '210mm', previews: process.argv.includes('--prev') ? pages.map((_, i) => i) : [] })
  .then(() => console.log('defesa ok', pages.length));
