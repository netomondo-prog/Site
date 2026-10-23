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
node papelaria.js           # mockups + arquivos de impressão + assinatura de e-mail
```

- `lib.js` concentra cores, dados de contato (`DATA`), logotipos e as peças em tamanho real.
  Para mudar nome, e-mail ou telefone do cartão, edite `DATA` e gere de novo.
- `build_logo.py` reconstrói os SVGs do logotipo a partir das medidas da arte original.
- Fontes: Montserrat e Inter (Google Fonts, licença OFL).
