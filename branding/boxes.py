"""Grava TrimBox/BleedBox em PDFs de impressão. uso: boxes.py arquivo.pdf sangria_mm"""
import sys
sys.modules['cryptography'] = None
import os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), 'pylib'))
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject, NameObject, TextStringObject
f, b = sys.argv[1], float(sys.argv[2]) * 72 / 25.4
r = PdfReader(f); w = PdfWriter()
for p in r.pages:
    x0, y0, x1, y1 = [float(v) for v in p.mediabox]
    p.bleedbox = RectangleObject([x0, y0, x1, y1])
    p.trimbox = RectangleObject([x0 + b, y0 + b, x1 - b, y1 - b])
    w.add_page(p)
w.add_metadata({'/Title': sys.argv[3] if len(sys.argv) > 3 else 'JTECK Valve Service', '/Author': 'Artefacto'})
w.write(f)
