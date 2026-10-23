# Identidade visual JTECK

Arquivos-fonte da defesa da marca, do manual de identidade visual e da papelaria.
Os PDFs finais ficam em `pdf/`.

## Gerar os PDFs

Requer Node.js 18+ e Playwright com Chromium.

```bash
cd branding
npm i playwright            # ou defina PLAYWRIGHT_MODULE com o caminho de uma instalação existente
mkdir -p out
node defesa.js              # out/jteck-defesa-identidade-visual.pdf
node manual.js              # out/jteck-manual-identidade-visual.pdf
node papelaria.js           # mockups + arquivos de impressão (3 mm de sangria) + assinatura de e-mail
node folha.js               # folha de apresentação do kit do logotipo
```

- `lib.js` concentra cores, dados de contato (`DATA`), logotipos e as peças em tamanho real.
  Para mudar nome, e-mail ou telefone do cartão, edite `DATA` e gere de novo.
- `build_logo.py` gera o kit do logotipo: SVG (RGB), PDF/EPS (CMYK), PDF Pantone e ícone.
  Uso: `python3 build_logo.py <pasta-fonttools> <Montserrat-SemiBold.ttf> <saida>`.
- `boxes.py` grava TrimBox/BleedBox nos PDFs de impressão (usa pypdf).
- `pattern()` gera o padrão do E em vetor puro; `tri()` gera a faixa 64/29/7 sobre o formato final.
- Fontes: Montserrat e Inter (Google Fonts, licença OFL).
