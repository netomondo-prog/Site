# JTECK – Site institucional dinâmico

Site institucional da **JTECK Valve Service** com conteúdo
gerenciável por painel administrativo, formulário de contato, blog técnico,
catálogo de produtos e botão flutuante de WhatsApp.

## Stack

- **Node.js 18+** com **Express 4** e templates **EJS** (renderização no servidor)
- Conteúdo armazenado em arquivos **JSON** em `data/` (sem banco de dados)
- Painel administrativo em `/admin` com sessão, CSRF e CRUD das coleções
- API pública somente leitura em `/api/*`
- CSS e JS puros, sem build step

## Rodando localmente

```bash
npm install
cp .env.example .env   # ajuste as variáveis
npm run dev            # http://localhost:3000
```

Painel: `http://localhost:3000/admin` (usuário e senha em `.env`, padrão `admin` / `jteck2026`).

## Estrutura

```
server.js              # inicia o servidor
src/app.js             # configuração do Express
src/routes/public.js   # páginas do site
src/routes/admin.js    # painel administrativo
src/routes/api.js      # API JSON
src/lib/store.js       # leitura/escrita dos JSON
src/lib/text.js        # texto rico, datas, resumos
src/lib/mailer.js      # envio de e-mail (opcional)
data/                  # conteúdo: site.json, services.json, products.json, posts.json, segments.json
views/                 # templates EJS (pages, partials, admin)
public/                # css, js e imagens (SVG)
```

## O que é editável pelo painel

- **Serviços**: título, resumo, ícone, imagem, descrição, itens inclusos, benefícios
- **Produtos**: nome, categoria, resumo, imagem, descrição, especificações, aplicações, destaque
- **Blog**: título, resumo, capa, autor, data, tags, conteúdo
- **Segmentos**: nome, descrição, ícone
- **Mensagens**: caixa de entrada do formulário de contato
- **Configurações**: telefones, WhatsApp, e-mail, endereço, redes sociais, textos da página Empresa e SEO

Os textos longos aceitam uma formatação simples: linha em branco separa parágrafos,
`- ` cria listas, `## ` cria subtítulos, `> ` cria destaques, `**negrito**` e `*itálico*`.

## Formulário de contato

As mensagens são sempre gravadas em `data/messages.json` e exibidas no painel.
Para receber também por e-mail, configure `SMTP_*` e `MAIL_TO` no `.env`.

## Deploy

### Render (um clique)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/netomondo-prog/Site)

1. Clique no botão acima e entre com a conta do GitHub.
2. O Render lê o `render.yaml`, cria o serviço e gera `SESSION_SECRET` e `ADMIN_PASSWORD` automaticamente.
3. Ao terminar, o site fica em `https://jteck-site.onrender.com` (ou nome parecido, se já existir).
4. A senha do painel aparece em **Environment → ADMIN_PASSWORD** no dashboard do Render.

No plano gratuito o serviço "dorme" após 15 minutos sem acesso e as edições feitas no painel
não persistem entre deploys. Para manter as edições, use um plano pago com disco
persistente e defina `DATA_DIR=/data` (veja o comentário no `render.yaml`).

### Railway

Crie um projeto a partir do repositório GitHub. O `railway.json` já define build e start.
Adicione as variáveis `NODE_ENV=production`, `SESSION_SECRET` e `ADMIN_PASSWORD`.
Para persistir os dados, adicione um Volume montado em `/data` e defina `DATA_DIR=/data`.

### Hospedagem por FTP (versão estática)

Para servidores sem Node.js (hospedagem compartilhada, aprovação do cliente), exporte o site
como arquivos estáticos:

```bash
npm run export                                    # gera a pasta dist/ com caminhos relativos
SITE_URL=https://dominio.com.br/pasta npm run export   # define a URL usada em og:url e compartilhamento
```

Os caminhos são relativos, então o conteúdo de `dist/` funciona tanto na raiz do domínio quanto
em qualquer subpasta. Envie **o conteúdo** da pasta `dist/` (não a pasta em si) para o FTP. Nessa versão o formulário de contato envia a mensagem pelo WhatsApp, a busca de
produtos filtra na própria página e o painel administrativo não existe. Para atualizar o
conteúdo, edite os JSON em `data/` e exporte de novo.

### Outros hosts

Qualquer host Node.js serve (Fly.io, VPS com PM2, Docker).

```bash
docker build -t jteck-site .
docker run -p 3000:3000 -e SESSION_SECRET=... -e ADMIN_PASSWORD=... -v jteck-data:/data -e DATA_DIR=/data jteck-site
```

Em produção defina `NODE_ENV=production`, um `SESSION_SECRET` forte, uma senha de admin
e, se os dados precisarem persistir fora do container, `DATA_DIR` apontando para um volume
(os JSON iniciais são copiados automaticamente para lá no primeiro acesso).

## Testes

```bash
npm test
```
