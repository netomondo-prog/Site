"""Gera o kit vetorial do logotipo JTECK Valve Service.

Uso: python3 -I build_logo.py <pyft_dir> <montserrat600.ttf> <out_dir>

Saídas em <out_dir>:
  parts.json                      geometria para o site e para os documentos
  digital-rgb/*.svg               versões RGB (cor, negativo, preto, branco, sem dobra, área de proteção)
  impressao-cmyk/*.pdf, *.eps     versões CMYK com os valores do manual
  pantone/*.pdf                   versões em cores especiais (Pantone)
  icone/*.svg                     ícone reduzido
"""
import json
import math
import os
import sys

sys.path.insert(0, sys.argv[1])
import pathops  # noqa: E402
from fontTools.ttLib import TTFont  # noqa: E402
from fontTools.pens.svgPathPen import SVGPathPen  # noqa: E402
from fontTools.pens.transformPen import TransformPen  # noqa: E402
from fontTools.pens.boundsPen import BoundsPen  # noqa: E402
from fontTools.pens.basePen import BasePen  # noqa: E402
from fontTools.svgLib.path import parse_path  # noqa: E402

FONT, OUT = sys.argv[2], sys.argv[3]
for d in ('digital-rgb', 'impressao-cmyk', 'pantone', 'icone'):
    os.makedirs(os.path.join(OUT, d), exist_ok=True)

# ---------- Geometria da palavra JTECK (unidades da arte original) ----------
# J com os mesmos raios do C (externo 70, interno 28).
J = "M177 77L227.5 35.3V163.5A70 70 0 0 1 157.5 233.5H35V190.5H149A28 28 0 0 0 177 162.5Z"
# Dobra: passa 4 unidades por baixo do J (desenhada antes dele) para não abrir filete na emenda.
FLAP = "M183 2C203 5 220.5 17 227.5 35.3V39.3L177 81V77L137 110Z"
T = "M263 33.5H519.5V76.5H416.5V233.5H366V76.5H263Z"
E_TOP = "M558 33.5H799.5V76.5H558Z"
E_MID = "M558 112.5H799.5V155.5H558Z"
E_BOT = "M558 190.5H799.5V233.5H558Z"
C = ("M1079.5 33.5H907A70 70 0 0 0 837 103.5V163.5A70 70 0 0 0 907 233.5H1079.5"
     "V190.5H915.5A28 28 0 0 1 887.5 162.5V104.5A28 28 0 0 1 915.5 76.5H1079.5Z")
DASH = "M952 126H1020.5A7 7 0 0 1 1020.5 140H952A7 7 0 0 1 952 126Z"
K = ("M1118 33.5H1168.5V121.8L1290 33.5H1369.5L1237 133.5L1371 233.5H1292"
     "L1168.5 143.4V233.5H1118Z")

# ---------- Descritor VALVE SERVICE: Montserrat SemiBold sem distorção ----------
BASE, CAP_TOP, X0, X1 = 344.5, 270.5, 35.5, 1371.5
TEXT = "VALVE SERVICE"
font = TTFont(FONT)
gs = font.getGlyphSet()
cmap = font.getBestCmap()
s = (BASE - CAP_TOP) / font["OS/2"].sCapHeight  # escala uniforme (sx = sy)


def ink(ch):
    b = BoundsPen(gs)
    gs[cmap[ord(ch)]].draw(b)
    return b.bounds


# Posição por avanço da fonte + espacejamento uniforme (tracking) resolvido para
# ocupar exatamente a largura da palavra JTECK.
adv = {ch: gs[cmap[ord(ch)]].width for ch in set(TEXT)}
n_gaps = len(TEXT) - 1


def layout(track):
    x, xs = 0.0, []
    for ch in TEXT:
        xs.append(x)
        x += adv[ch] * s + track
    first = xs[0] + ink(TEXT[0])[0] * s
    last = xs[-1] + ink(TEXT[-1])[2] * s
    return xs, first, last


_, f0, l0 = layout(0)
track = ((X1 - X0) - (l0 - f0)) / n_gaps
xs, first, _ = layout(track)
dx = X0 - first

desc = pathops.Path()
pen = desc.getPen()
for ch, x in zip(TEXT, xs):
    if ch == ' ':
        continue
    gs[cmap[ord(ch)]].draw(TransformPen(pen, (s, 0, 0, -s, x + dx, BASE)))
desc.simplify()  # une sobreposições e remove contornos cruzados


def fmt(v):
    return ("%.2f" % v).rstrip("0").rstrip(".")


sp = SVGPathPen(None, ntos=fmt)
desc.draw(sp)
DESC = sp.getCommands()
TRACK_EM = track / (s * 1000)

# ---------- Ícone reduzido (quadrado 100 x 100) ----------
ICON_TF = (0.25, 26, 16, 35, 2)  # escala, deslocamento x/y, origem do J
ICON_DASH = "M28 79.5H40A2 2 0 0 1 40 83.5H28A2 2 0 0 1 28 79.5Z"
ICON_R = 14

# ---------- Variantes ----------
VB_TIGHT = (35, 2, 1336.5, 343.56)
PAL = {
    'blue': '#064590', 'gray': '#7d7d7e', 'flap': '#d9d8d3', 'solar': '#e6af39',
    'deep': '#0b2347', 'negGray': '#b8bfca', 'negFlap': '#8fa3c0',
}
VARIANTS = {
    'jteck-logo': dict(blue=PAL['blue'], gray=PAL['gray'], flap=PAL['flap'], gold=PAL['solar']),
    'jteck-logo-negativo': dict(blue='#ffffff', gray=PAL['negGray'], flap=PAL['negFlap'], gold=PAL['solar']),
    'jteck-logo-preto': dict(blue='#000000', gray='#000000', flap='#999999', gold='#000000'),
    'jteck-logo-branco': dict(blue='#ffffff', gray='#ffffff', flap='#ffffff', flap_opacity=0.4, gold='#ffffff'),
    'jteck-logo-preto-sem-dobra': dict(blue='#000000', gray='#000000', flap=None, gold='#000000'),
    'jteck-logo-branco-sem-dobra': dict(blue='#ffffff', gray='#ffffff', flap=None, gold='#ffffff'),
}


def svg_logo(v, vb=VB_TIGHT, title='JTECK Valve Service', extra=''):
    flap = ''
    if v.get('flap'):
        op = f' fill-opacity="{v["flap_opacity"]}"' if v.get('flap_opacity') else ''
        flap = f'<path id="J-dobra" fill="{v["flap"]}"{op} d="{FLAP}"/>'
    w, h = vb[2], vb[3]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{fmt(vb[0])} {fmt(vb[1])} {fmt(w)} {fmt(h)}" width="{fmt(w)}" height="{fmt(h)}" role="img" aria-label="{title}">
  <title>{title}</title>{extra}
  <g id="jteck-logo">
    <g id="simbolo-J">{flap}<path id="J" fill="{v['blue']}" d="{J}"/></g>
    <path id="T" fill="{v['blue']}" d="{T}"/>
    <g id="E"><path id="E-topo" fill="{v['gray']}" d="{E_TOP}"/><path id="E-meio" fill="{v['blue']}" d="{E_MID}"/><path id="E-base" fill="{v['gray']}" d="{E_BOT}"/></g>
    <g id="C"><path id="C-letra" fill="{v['gray']}" d="{C}"/><path id="acento-solar" fill="{v['gold']}" d="{DASH}"/></g>
    <path id="K" fill="{v['gray']}" d="{K}"/>
    <path id="descritor" fill="{v['blue']}" d="{DESC}"/>
  </g>
</svg>
'''


def svg_icon(bg, j, flap, dash, radius=ICON_R, title='JTECK · ícone'):
    sc, tx, ty, ox, oy = ICON_TF
    rect = f'<rect width="100" height="100" rx="{radius}" fill="{bg}"/>' if bg else ''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" role="img" aria-label="{title}">
  <title>{title}</title>
  {rect}
  <g transform="translate({tx} {ty}) scale({sc}) translate({-ox} {-oy})"><path fill="{flap}" d="{FLAP}"/><path fill="{j}" d="{J}"/></g>
  <path fill="{dash}" d="{ICON_DASH}"/>
</svg>
'''


for name, v in VARIANTS.items():
    open(os.path.join(OUT, 'digital-rgb', name + '.svg'), 'w').write(svg_logo(v))

X = 43  # módulo
pad = 2 * X
vb_area = (VB_TIGHT[0] - pad, VB_TIGHT[1] - pad, VB_TIGHT[2] + 2 * pad, VB_TIGHT[3] + 2 * pad)
guide = (f'\n  <rect id="area-de-protecao" x="{fmt(vb_area[0])}" y="{fmt(vb_area[1])}" width="{fmt(vb_area[2])}" '
         f'height="{fmt(vb_area[3])}" fill="none" stroke="#e6af39" stroke-width="2" stroke-dasharray="10 8"/>')
open(os.path.join(OUT, 'digital-rgb', 'jteck-logo-area-de-protecao.svg'), 'w').write(
    svg_logo(VARIANTS['jteck-logo'], vb=vb_area, title='JTECK Valve Service · área de proteção 2x', extra=guide))

ICONS = {
    'jteck-icone': (PAL['blue'], '#ffffff', PAL['flap'], PAL['solar']),
    'jteck-icone-fundo-branco': ('#ffffff', PAL['blue'], PAL['flap'], PAL['solar']),
    'jteck-icone-negativo': (PAL['deep'], '#ffffff', PAL['negFlap'], PAL['solar']),
    'jteck-icone-preto': (None, '#000000', '#999999', '#000000'),
}
for name, (bg, j, fl, da) in ICONS.items():
    open(os.path.join(OUT, 'icone', name + '.svg'), 'w').write(svg_icon(bg, j, fl, da))

# ---------- Exportação vetorial CMYK / Pantone (PDF e EPS escritos à mão) ----------
CMYK = {
    'blue': (1, .72, 0, .12), 'gray': (0, 0, 0, .60), 'flap': (0, 0, .03, .18), 'solar': (0, .27, .85, .05),
    'white': (0, 0, 0, 0), 'black': (0, 0, 0, 1), 'black40': (0, 0, 0, .40),
    'negGray': (.28, .18, .12, 0), 'negFlap': (.45, .28, .12, 0),
}
SPOT = {
    'blue': ('PANTONE 2945 C', CMYK['blue']), 'gray': ('PANTONE Cool Gray 9 C', CMYK['gray']),
    'flap': ('PANTONE Cool Gray 1 C', CMYK['flap']), 'solar': ('PANTONE 7409 C', CMYK['solar']),
}

# elementos na ordem de pintura: (path, chave-de-cor-do-papel)
ORDER = [('flap', FLAP), ('blue', J), ('blue', T), ('gray', E_TOP), ('blue', E_MID), ('gray', E_BOT),
         ('gray', C), ('gold', DASH), ('gray', K), ('blue', DESC)]

CMYK_VARIANTS = {
    'jteck-logo-cmyk': {'blue': 'blue', 'gray': 'gray', 'flap': 'flap', 'gold': 'solar'},
    'jteck-logo-negativo-cmyk': {'blue': 'white', 'gray': 'negGray', 'flap': 'negFlap', 'gold': 'solar'},
    'jteck-logo-preto-k100': {'blue': 'black', 'gray': 'black', 'flap': 'black40', 'gold': 'black'},
    'jteck-logo-preto-k100-sem-dobra': {'blue': 'black', 'gray': 'black', 'flap': None, 'gold': 'black'},
    'jteck-logo-azul-1cor-cmyk': {'blue': 'blue', 'gray': 'blue', 'flap': None, 'gold': 'blue'},
}


class OpsPen(BasePen):
    """Converte contornos em operadores PDF/PostScript (y invertido, escala em pt)."""

    def __init__(self, sc, ox, oy, h, ps=False):
        super().__init__(None)
        self.o, self.sc, self.ox, self.oy, self.h, self.ps = [], sc, ox, oy, h, ps

    def p(self, pt):
        x, y = pt
        return f'{(x - self.ox) * self.sc:.3f} {(self.h - (y - self.oy)) * self.sc:.3f}'

    def _moveTo(self, pt):
        self.o.append(f'{self.p(pt)} {"moveto" if self.ps else "m"}')

    def _lineTo(self, pt):
        self.o.append(f'{self.p(pt)} {"lineto" if self.ps else "l"}')

    def _curveToOne(self, a, b, c):
        self.o.append(f'{self.p(a)} {self.p(b)} {self.p(c)} {"curveto" if self.ps else "c"}')

    def _closePath(self):
        self.o.append('closepath' if self.ps else 'h')


WIDTH_PT = 200 / 25.4 * 72  # arte com 200 mm de largura
SC = WIDTH_PT / VB_TIGHT[2]
W_PT, H_PT = VB_TIGHT[2] * SC, VB_TIGHT[3] * SC


def ops_for(d, ps=False):
    pen = OpsPen(SC, VB_TIGHT[0], VB_TIGHT[1], VB_TIGHT[3], ps)
    parse_path(d, pen)
    return pen.o


def write_pdf(path, colors, spot=False, title='JTECK Valve Service'):
    content, cs_res = [], {}
    for role, d in ORDER:
        key = colors.get(role)
        if not key:
            continue
        if spot and key in SPOT:
            name = 'CS' + key
            cs_res[name] = SPOT[key]
            content.append(f'/{name} cs 1 scn')
        else:
            c, m, y, k = CMYK[key]
            content.append(f'{c} {m} {y} {k} k')
        content += ops_for(d)
        content.append('f')
    stream = '\n'.join(content).encode()
    objs = []
    objs.append(b'<< /Type /Catalog /Pages 2 0 R >>')
    objs.append(b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
    res_cs = ''
    extra_objs = []
    for i, (nm, (pname, (c, m, y, k))) in enumerate(cs_res.items()):
        fn_id = 6 + 2 * i
        cs_id = fn_id + 1
        extra_objs.append((fn_id, f'<< /FunctionType 2 /Domain [0 1] /C0 [0 0 0 0] /C1 [{c} {m} {y} {k}] /N 1 >>'.encode()))
        extra_objs.append((cs_id, f'[/Separation /{pname.replace(" ", "#20")} /DeviceCMYK {fn_id} 0 R]'.encode()))
        res_cs += f'/{nm} {cs_id} 0 R '
    box = f'[0 0 {W_PT:.3f} {H_PT:.3f}]'
    objs.append(f'<< /Type /Page /Parent 2 0 R /MediaBox {box} /TrimBox {box} /ArtBox {box} '
                f'/Resources << /ColorSpace << {res_cs}>> >> /Contents 4 0 R >>'.encode())
    objs.append(b'<< /Length ' + str(len(stream)).encode() + b' >>\nstream\n' + stream + b'\nendstream')
    title_pdf = title.encode('latin-1', 'replace')
    objs.append(b'<< /Title (' + title_pdf + b') /Creator (Artefacto Marketing) /Producer (build_logo.py) >>')
    for _, data in extra_objs:
        objs.append(data)
    out = bytearray(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')
    offs = []
    for i, data in enumerate(objs, 1):
        offs.append(len(out))
        out += f'{i} 0 obj\n'.encode() + data + b'\nendobj\n'
    xref = len(out)
    out += f'xref\n0 {len(objs) + 1}\n0000000000 65535 f \n'.encode()
    for o in offs:
        out += f'{o:010d} 00000 n \n'.encode()
    out += f'trailer\n<< /Size {len(objs) + 1} /Root 1 0 R /Info 5 0 R >>\nstartxref\n{xref}\n%%EOF\n'.encode()
    open(path, 'wb').write(out)


def write_eps(path, colors, title='JTECK Valve Service'):
    lines = ['%!PS-Adobe-3.0 EPSF-3.0', f'%%BoundingBox: 0 0 {math.ceil(W_PT)} {math.ceil(H_PT)}',
             f'%%HiResBoundingBox: 0 0 {W_PT:.3f} {H_PT:.3f}', f'%%Title: {title}', '%%Creator: Artefacto Marketing',
             '%%EndComments']
    for role, d in ORDER:
        key = colors.get(role)
        if not key:
            continue
        c, m, y, k = CMYK[key]
        lines.append(f'{c} {m} {y} {k} setcmykcolor newpath')
        lines += ops_for(d, ps=True)
        lines.append('fill')
    lines += ['showpage', '%%EOF']
    open(path, 'w', encoding='latin-1').write('\n'.join(lines) + '\n')


for name, cols in CMYK_VARIANTS.items():
    write_pdf(os.path.join(OUT, 'impressao-cmyk', name + '.pdf'), cols, title=f'JTECK Valve Service - {name}')
    write_eps(os.path.join(OUT, 'impressao-cmyk', name + '.eps'), cols, title=f'JTECK Valve Service - {name}')
write_pdf(os.path.join(OUT, 'pantone', 'jteck-logo-pantone.pdf'),
          {'blue': 'blue', 'gray': 'gray', 'flap': 'flap', 'gold': 'solar'}, spot=True,
          title='JTECK Valve Service - Pantone 2945 C, Cool Gray 9 C, Cool Gray 1 C, 7409 C')
write_pdf(os.path.join(OUT, 'pantone', 'jteck-logo-pantone-2945-1cor.pdf'),
          {'blue': 'blue', 'gray': 'blue', 'flap': None, 'gold': 'blue'}, spot=True,
          title='JTECK Valve Service - 1 cor Pantone 2945 C')

json.dump({
    'viewBox': ' '.join(fmt(v) for v in VB_TIGHT), 'J': J, 'FLAP': FLAP, 'T': T, 'E_TOP': E_TOP, 'E_MID': E_MID,
    'E_BOT': E_BOT, 'C': C, 'DASH': DASH, 'K': K, 'TEXT': DESC, 'trackEm': round(TRACK_EM, 3),
    'icon': {'tf': ICON_TF, 'dash': ICON_DASH, 'radius': ICON_R},
    'palette': PAL,
}, open(os.path.join(OUT, 'parts.json'), 'w'))
print('ok · tracking descritor =', round(TRACK_EM * 1000), '/1000 em · escala', round(s, 5))
