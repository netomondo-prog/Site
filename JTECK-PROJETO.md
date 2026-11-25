# JTECK Valve Service · resumo do projeto

Documento de passagem: o que foi feito, onde está cada coisa e o que falta.
Projeto feito pela Artefacto Marketing (contato@artefacto.art.br · 19 99675.8920).

Última atualização: 25/11/2026.

---

## 1. Onde está tudo

| O quê | Onde |
|---|---|
| Código do site + identidade visual | GitHub `netomondo-prog/site`, branch **`claude/jtec-dynamic-website-6l4jld`** |
| Site em aprovação (versão estática) | `https://artefacto.art.br/jteck/` (HostGator, cPanel da Artefacto) |
| PDFs e arquivos finais da marca | pasta `branding/pdf/` deste repositório |
| Fontes dos PDFs (geradores) | pasta `branding/` (`lib.js`, `defesa.js`, `manual.js`, `papelaria.js`, `folha.js`) |

> Atenção: a branch `main` só tem a primeira versão do site (PR #1).
> Todo o trabalho depois disso está na branch `claude/jtec-dynamic-website-6l4jld`.

> Atenção 2: em 24/11 a pasta `artefacto.art.br/jteck` foi apagada pela guia
> "MKT-Artefacto (fork)" e está na lixeira do cPanel. Confirmar se foi de propósito
> antes de subir de novo (ver seção 6).

Para baixar no computador:

```bash
git clone -b claude/jtec-dynamic-website-6l4jld https://github.com/netomondo-prog/site.git JTECK
# depois, para atualizar:
git pull
```

---

## 2. Dados da empresa (valem para site e papelaria)

| Campo | Valor |
|---|---|
| Nome | JTECK Valve Service (razão social no site: JTECK Valve Service Ltda.) |
| Segmento | Manutenção, testes e certificação de válvulas de segurança, alívio e controle |
| Telefone e WhatsApp (único) | **(19) 99695-6270** · `5519996956270` |
| E-mail geral | contato@jteck.com.br |
| Site | www.jteck.com.br |
| Endereço | **R. João Carlos Amaral, 431 – Nova Aparecida, Campinas – SP, 13068-617** |
| Cartão de visita | Jean Pierre Pinheiro Silva · Diretor · jean@jteck.com.br |
| Assinatura do slogan | "Precisão aplicada ao que mantém a indústria em movimento." |

Onde mudar esses dados:

- **Site:** `data/site.json` (ou pelo painel `/admin` → Configurações).
- **Papelaria e PDFs:** objeto `DATA` em `branding/lib.js`, depois gerar os PDFs de novo (seção 5).

A confirmar com o cliente antes de imprimir: nome, cargo, e-mail e endereço do cartão.

---

## 3. O site

### O que é

Site institucional dinâmico, com:

- **Páginas:** Home, Empresa, Serviços (com página de cada serviço), Produtos (catálogo com categorias), Blog técnico e Contato.
- **Painel administrativo** em `/admin`, para editar serviços, produtos, blog, segmentos, mensagens e configurações.
- **Formulário de contato:** grava as mensagens em `data/messages.json` e pode enviar por e-mail, se o SMTP for configurado.
- **WhatsApp:** botão flutuante, que vira um círculo só com o ícone depois de 6 s. No site estático, o formulário envia pelo WhatsApp.
- **Rodapé:** em todas as páginas, "Desenvolvido por Artefacto Marketing", com link para https://artefacto.art.br/.
- **Logotipo novo:** vetor, no topo e no rodapé. O favicon e o ícone para celular também usam a marca nova.

### Tecnologia

- **Servidor:** Node.js 18+, Express 4 e EJS. O conteúdo fica em JSON (`data/`), sem banco de dados.
- **Testes:** `npm test`, 9 testes.
- **Detalhes técnicos:** no `README.md` (estrutura, painel, deploy Render/Railway).

### Rodar no computador

```bash
npm install
npm run dev        # http://localhost:3000  (painel em /admin, ver README para login)
```

### Gerar a versão estática para FTP

A HostGator não roda Node, então ela recebe a versão estática:

```bash
npm ci
SITE_URL=https://artefacto.art.br/jteck node scripts/export-static.js
# no Windows (PowerShell):  $env:SITE_URL="https://artefacto.art.br/jteck"; node scripts/export-static.js
```

O resultado fica em `dist/`, com 34 páginas e caminhos relativos. Funciona em qualquer subpasta.
Na versão estática não existe painel; o conteúdo vem do que estiver em `data/` no momento da exportação.

Última versão entregue: **jteck-site-estatico-v9**.

---

## 4. Identidade visual

### Logotipo

- **Composição:** palavra JTECK desenhada, mais o descritor VALVE SERVICE em Montserrat SemiBold convertido em curvas.
- **Elementos próprios:**
  - o **E modular**: três barras, com a central em azul;
  - a **dobra do J**: o disco da válvula deixando a sede;
  - o **acento solar** dentro do C: o ponteiro de manômetro.
- **Tipo de vetor:** curvas puras, sem fonte. Retas e arcos, sem sobreposições, com artboard justo.
- **Proporções:** módulo x = altura de uma barra do E. JTECK mede 4,65x, o descritor 1,72x, o respiro entre eles 0,86x e a área de proteção 2x.
- **Tamanho mínimo:** 30 mm impresso e 120 px na tela. O ícone vai até 8 mm ou 32 px.

### Cores

| Cor | HEX | CMYK | Pantone | Uso |
|---|---|---|---|---|
| Azul JTECK | #064590 | 100/72/0/12 | 2945 C | J, T, barra central do E, descritor |
| Cinza aço | #7D7D7E | 0/0/0/60 | Cool Gray 9 C | barras externas do E, C, K |
| Cinza claro | #D9D8D3 | 0/0/3/18 | Cool Gray 1 C | dobra do J |
| Solar | #E6AF39 | 0/27/85/5 | 7409 C | acento (no máximo um traço por peça, além do logo) |
| Azul profundo (apoio) | #0B2347 | 100/80/30/55 | 289 C | fundos; degradê institucional 165° #064590 → #0B2347 |
| Cinza negativo (apoio) | #B8BFCA | 28/18/12/0 | Cool Gray 4 C | versão negativa (dobra #8FA3C0) |

- **Faixa tricolor:** 64% azul, 29% cinza e 7% solar.
- **Fontes:** Montserrat nos títulos e Inter nos textos (Google Fonts, gratuitas).

### Entregáveis (`branding/pdf/`)

```
01-defesa-da-marca/      jteck-defesa-identidade-visual.pdf (21 páginas, padrão Artefacto/Ziffra)
02-manual-de-identidade-visual/  jteck-manual-identidade-visual.pdf (18 páginas)
03-papelaria/            papelaria-jteck-mockups.pdf (16 páginas, com página de especificações)
  arquivos-de-impressao/ cartão 90x50 (frente/verso) + máscara de verniz, timbrado A4,
                         envelope carta 229x114, envelope saco 240x340, pasta (capa 220x310
                         e bolso 220x110), caderno A5, crachá CR80 — todos com 3 mm de
                         sangria e TrimBox/BleedBox gravados
04-logotipo/             digital-rgb (SVG + PNG 3000/1000 px), impressao-cmyk (PDF/EPS),
                         pantone (PDF), icone (SVG, PNG 1024–32 px, favicon.ico),
                         jteck-logo-folha-de-apresentacao.pdf
05-digital/              assinatura de e-mail em HTML (texto e links clicáveis) + PNG
LEIA-ME.txt              qual arquivo usar em cada caso
```

Versões do logotipo:

| Versão | Uso |
|---|---|
| Colorida | fundos claros |
| Negativa | fundos escuros |
| Branca sem dobra | sobre o Azul JTECK ou o Cinza aço |
| Preto com dobra K40 | impressão em uma cor |
| Preto sem dobra | bordado, laser e recorte |
| Área de proteção | referência para o fornecedor |

---

## 5. Gerar os PDFs de novo

Use depois de mudar qualquer dado no `branding/lib.js`.

**Requisitos:**
- Node 18+ e Playwright com Chromium;
- `pdfunite` (poppler);
- Python 3 com `pypdf`, usado pelo `boxes.py`, que grava as caixas de corte.

```bash
cd branding
npm i playwright          # ou PLAYWRIGHT_MODULE=<caminho do playwright>
mkdir -p out prev
node defesa.js            # out/jteck-defesa-identidade-visual.pdf
node manual.js            # out/jteck-manual-identidade-visual.pdf
node papelaria.js         # mockups + arquivos de impressão + assinatura
node folha.js             # folha de apresentação do logotipo
```

Depois de gerar:
- copie de `out/` para as pastas certas em `pdf/`;
- os SVG/PDF/EPS do logotipo saem do `build_logo.py` (ver `branding/README.md`).

---

## 6. Pendências

**Do cliente:**
- [ ] Aprovar o site em artefacto.art.br/jteck/.
- [ ] Confirmar nome, cargo, e-mail e endereço do cartão.

**Publicação:**
- [ ] Subir o site v9. A pasta `jteck` está na lixeira do cPanel: recriar ou restaurar, apagar o conteúdo antigo, enviar `dist/` e abrir com Ctrl+Shift+R.

**Com a gráfica e fornecedores:**
- [ ] Pedir a faca dos envelopes e da pasta e montar o planificado.
- [ ] Converter as peças para o perfil CMYK da gráfica (PDF/X) e pedir prova de cor.
- [ ] Crachá: confirmar a faca (cantos e furo do cordão) com o fornecedor.

**Opcional:**
- [ ] Trocar os mockups desenhados por mockups fotográficos.

**Para quando o site for para o domínio próprio:**
- [ ] Assinatura de e-mail: hospedar o logotipo. Hoje o HTML aponta para `https://www.jteck.com.br/img/brand/jteck-logo-assinatura.png`, que só funciona com o site no ar no domínio próprio.
- [ ] Gerar de novo com `SITE_URL=https://www.jteck.com.br`.
- [ ] Ou fazer o deploy dinâmico (Render/Railway, com painel), conforme o README.

---

## 7. Histórico

| Data | Entrega |
|---|---|
| out/2026 | Site dinâmico (Express + EJS), painel, catálogo, blog, WhatsApp flutuante; PR #1 aprovado |
| out/2026 | Config de deploy Render/Railway; exportação estática para FTP com caminhos relativos |
| out/2026 | Troca da marca para JTECK Valve Service; logotipo vetorizado a partir da arte original |
| out/2026 | Defesa da marca, manual e papelaria em PDF; correções de escala, mockups, QR e rodapé |
| 23/10 | Revisão técnica completa (127 itens): logo reconstruído, kit CMYK/Pantone/ícone, sangria e TrimBox, padrão em vetor |
| 26/10 | Rodapé "Desenvolvido por Artefacto Marketing" em todas as páginas |
| nov/2026 | Botão do WhatsApp centralizado no modo compacto |
| 24/11 | Endereço novo: R. João Carlos Amaral, 431 – Nova Aparecida |
| 25/11 | Telefone único (19) 99695-6270, também no WhatsApp |

Para continuar numa guia local: abra a guia na pasta do projeto e peça
"leia o JTECK-PROJETO.md e continue de onde paramos".
