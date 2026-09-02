# JTEC – Site institucional dinâmico

Site institucional da **JTEC Válvulas Industriais** (empresa fictícia) com conteúdo
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

Painel: `http://localhost:3000/admin` (usuário e senha em `.env`, padrão `admin` / `jtec2026`).

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

Qualquer host Node.js serve (Render, Railway, Fly.io, VPS com PM2, Docker).

```bash
docker build -t jtec-site .
docker run -p 3000:3000 -e SESSION_SECRET=... -e ADMIN_PASSWORD=... -v jtec-data:/data -e DATA_DIR=/data jtec-site
```

Em produção defina `NODE_ENV=production`, um `SESSION_SECRET` forte, uma senha de admin
e, se os dados precisarem persistir fora do container, `DATA_DIR` apontando para um volume
(os JSON iniciais são copiados automaticamente para lá no primeiro acesso).

## Testes

```bash
npm test
```
