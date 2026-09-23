# Sistema de Disparo WhatsApp

Painel web para disparar mensagens pela **API oficial do WhatsApp (Cloud API da
Meta)**, organizando os contatos em **grupos de interesse** e enviando **kits
pré-configurados de imagens e vídeo**.

Projeto independente: tem servidor, login, dados e deploy próprios.

## Funcionalidades

- **Grupos de interesse**: cada lista enviada (CSV ou colada) vira um grupo.
  Colunas `telefone` (obrigatória), `nome` e quaisquer outras (`empresa`,
  `segmento`…), que viram variáveis nas mensagens. Números sem DDI recebem +55,
  duplicados são unificados e um contato pode estar em vários grupos.
  Exemplo: [`docs/exemplo-lista.csv`](docs/exemplo-lista.csv).
- **Kits de mídia**: imagens (JPG/PNG até 5 MB), vídeo (MP4 até 16 MB) e PDF
  guardados no sistema, com legenda, ordem de envio e texto final. Cada kit é
  ligado a um modelo (template) aprovado pela Meta. Botão de envio de teste.
- **Campanhas**: kit + um ou mais grupos, disparo imediato ou agendado, fila com
  limite de mensagens por segundo, pausar/retomar/cancelar, acompanhamento de
  enviadas, entregues, lidas, respostas, kits entregues e falhas (com o motivo),
  e relatório CSV.
- **Descadastro automático**: respostas SAIR, PARAR, STOP, CANCELAR,
  DESCADASTRAR ou REMOVER; VOLTAR reativa.
- **Modo simulação**: sem credenciais da API nada é enviado de verdade — dá
  para montar listas, kits e campanhas antes do número estar pronto.

### Como o kit é entregue

A Meta só permite **iniciar** conversa com um modelo aprovado, e o modelo leva
no máximo **uma** imagem ou vídeo no cabeçalho. Por isso:

1. o sistema envia o modelo com a mídia principal do kit no cabeçalho e um
   botão de resposta rápida (ex.: “Quero receber”);
2. quando o contato toca no botão ou responde, abre-se a janela de 24h e o
   sistema envia sozinho as demais imagens, o vídeo e o texto final.

## Cadastro do número na API oficial

Passo a passo completo (portfólio empresarial, app, número, token permanente,
pagamento, webhook e modelos): **[docs/configurar-numero-api-oficial.md](docs/configurar-numero-api-oficial.md)**.

## Rodando localmente

```bash
cd sistema-disparo-whatsapp
npm install
cp .env.example .env   # ajuste usuário/senha e, quando tiver, as credenciais da API
npm run dev            # http://localhost:3000
```

Login com `ADMIN_USER` / `ADMIN_PASSWORD` do `.env`.

Para receber as respostas (entrega do kit) em ambiente local é preciso expor o
servidor com HTTPS (ex.: `ngrok http 3000`) e cadastrar
`https://…/webhooks/whatsapp` como webhook no app da Meta.

## Deploy

- **Docker**: `docker build -t disparo . && docker run -p 3000:3000 -v disparo-dados:/data --env-file .env disparo`
- **Render**: `render.yaml` desta pasta (usa `rootDir: sistema-disparo-whatsapp`
  e um disco persistente em `/data`). Ao criar o Blueprint, informe o caminho
  `sistema-disparo-whatsapp/render.yaml`.

Os dados (listas, kits, mídias e histórico) ficam em `DATA_DIR`; em produção ele
**precisa** estar em disco persistente.

## Estrutura

```
server.js                 # inicia o servidor e a fila de campanhas
src/app.js                # Express, sessão, login
src/routes/painel.js      # telas do painel e webhook /webhooks/whatsapp
src/lib/api.js            # cliente da Cloud API (envio, upload de mídia, modelos)
src/lib/engine.js         # grupos, kits, fila de campanhas, respostas e descadastro
src/lib/log.js            # histórico de envios (data/envios.json)
src/lib/phone.js          # normalização de telefones (+55, nono dígito)
src/lib/csv.js            # leitura de CSV (vírgula, ponto e vírgula, tabulação)
src/lib/store.js          # dados em JSON (grupos, contatos, kits, campanhas)
views/                    # telas (EJS)
docs/                     # guia de configuração e exemplo de lista
```

## Testes

```bash
npm test
```
