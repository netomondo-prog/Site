"""Gera o logotipo JTECK Valve Service em SVG a partir de medidas da imagem original.

Uso: python3 -I build_logo.py <pyft_dir> <montserrat600.ttf> <out_dir>
"""
import os
import sys

sys.path.insert(0, sys.argv[1])
from fontTools.ttLib import TTFont  # noqa: E402
from fontTools.pens.svgPathPen import SVGPathPen  # noqa: E402
from fontTools.pens.transformPen import TransformPen  # noqa: E402
from fontTools.pens.boundsPen import BoundsPen  # noqa: E402

FONT, OUT = sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)

# ---------- Marca JTECK (coordenadas em pixels da arte original 1392x365) ----------
TOP, BOT = 33.5, 233.5

J = ("M177 77L227.5 35.3V165.5A68 68 0 0 1 159.5 233.5H35V190.5H147"
     "A30 30 0 0 0 177 160.5Z")
FLAP = "M183 2C203 5 221 16 229 34L137 110Z"
T = "M263 33.5H519.5V76.5H416.5V233.5H366V76.5H263Z"
E_TOP = "M558 33.5H799.5V76.5H558Z"
E_MID = "M558 112.5H799.5V155.5H558Z"
E_BOT = "M558 190.5H799.5V233.5H558Z"
C = ("M1079.5 33.5H907A70 70 0 0 0 837 103.5V163.5A70 70 0 0 0 907 233.5H1079.5"
     "V190.5H915.5A28 28 0 0 1 887.5 162.5V104.5A28 28 0 0 1 915.5 76.5H1079.5Z")
DASH = '<rect x="945" y="126" width="82.5" height="14" rx="7"/>'
K = ("M1118 33.5H1168.5V121.8L1290 33.5H1369.5L1237 133.5L1371 233.5H1292"
     "L1168.5 143.4V233.5H1118Z")

# ---------- Texto VALVE SERVICE (Montserrat SemiBold em contornos) ----------
BASE, CAP_TOP = 344.5, 270.5
BOXES = [
    ("V", 35.5, 118.5), ("A", 149.5, 233.5), ("L", 275.5, 336.5), ("V", 371.5, 454.5),
    ("E", 496.5, 556.5), ("S", 665.5, 738.5), ("E", 787.5, 848.5), ("R", 898.5, 968.5),
    ("V", 1005.5, 1088.5), ("I", 1129.5, 1143.5), ("C", 1190.5, 1266.5), ("E", 1311.5, 1371.5),
]
font = TTFont(FONT)
gs = font.getGlyphSet()
cmap = font.getBestCmap()
cap = font["OS/2"].sCapHeight
sy = (BASE - CAP_TOP) / cap


def fmt(v):
    return ("%.2f" % v).rstrip("0").rstrip(".")


def glyph_path(ch, x0, x1):
    g = gs[cmap[ord(ch)]]
    b = BoundsPen(gs)
    g.draw(b)
    gx0, _, gx1, _ = b.bounds
    natural = (gx1 - gx0) * sy
    sx = min(max((x1 - x0) / natural, 1.0), 1.15) * sy
    cx_font = (gx0 + gx1) / 2
    cx_px = (x0 + x1) / 2
    pen = SVGPathPen(gs, ntos=fmt)
    tp = TransformPen(pen, (sx, 0, 0, -sy, cx_px - cx_font * sx, BASE))
    g.draw(tp)
    return pen.getCommands()


TEXT = "".join(glyph_path(ch, a, b) for ch, a, b in BOXES)

VIEWBOX = "30 0 1348 350"


def svg(colors, title="JTECK Valve Service"):
    blue, gray, flap, gold = colors["blue"], colors["gray"], colors["flap"], colors["gold"]
    flap_op = colors.get("flap_opacity", 1)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VIEWBOX}" width="1348" height="350" role="img" aria-label="{title}">
  <title>{title}</title>
  <g fill="{blue}">
    <path d="{J}"/>
    <path d="{T}"/>
    <path d="{E_MID}"/>
    <path d="{TEXT}"/>
  </g>
  <path fill="{flap}" fill-opacity="{flap_op}" d="{FLAP}"/>
  <g fill="{gray}">
    <path d="{E_TOP}"/>
    <path d="{E_BOT}"/>
    <path d="{C}"/>
    <path d="{K}"/>
  </g>
  <g fill="{gold}">{DASH}</g>
</svg>
"""


VARIANTS = {
    "jteck-logo": {"blue": "#064590", "gray": "#7d7d7e", "flap": "#d9d8d3", "gold": "#e6af39"},
    "jteck-logo-negativo": {"blue": "#ffffff", "gray": "#b8bfca", "flap": "#ffffff", "flap_opacity": 0.55, "gold": "#e6af39"},
    "jteck-logo-preto": {"blue": "#000000", "gray": "#000000", "flap": "#000000", "flap_opacity": 0.3, "gold": "#000000"},
    "jteck-logo-branco": {"blue": "#ffffff", "gray": "#ffffff", "flap": "#ffffff", "flap_opacity": 0.45, "gold": "#ffffff"},
}
for name, colors in VARIANTS.items():
    with open(os.path.join(OUT, name + ".svg"), "w") as f:
        f.write(svg(colors))

# Partes para o template EJS do site (cores via variáveis)
with open(os.path.join(OUT, "parts.json"), "w") as f:
    import json
    json.dump({"viewBox": VIEWBOX, "J": J, "FLAP": FLAP, "T": T, "E_TOP": E_TOP, "E_MID": E_MID,
               "E_BOT": E_BOT, "C": C, "K": K, "TEXT": TEXT}, f)
print("ok", len(TEXT))
