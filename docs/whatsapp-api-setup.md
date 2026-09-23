# Cadastro do número na API oficial do WhatsApp (Cloud API)

Guia passo a passo para colocar um número **novo** (ainda não cadastrado) na
WhatsApp Cloud API da Meta e ligar ao painel de disparo (`/admin/whatsapp`).

> As telas da Meta mudam de nome com frequência. Se algum menu não bater
> exatamente, procure pelo mesmo termo em inglês (entre parênteses).

---

## 0. Antes de começar (checklist)

| Item | Observação |
|---|---|
| **Número de telefone** | Fixo ou celular, capaz de receber **SMS ou ligação** para o código de verificação. **Não pode estar ativo** no app WhatsApp ou WhatsApp Business. Se estiver, apague a conta no app (Configurações → Conta → Apagar conta) antes. |
| **Conta pessoal no Facebook** | Do responsável pela empresa (será admin). |
| **Portfólio empresarial (Business Manager)** | Em https://business.facebook.com. Nome, endereço e site iguais aos do CNPJ. |
| **Site com política de privacidade** | Exigido para publicar o app e para a verificação da empresa. |
| **Cartão de crédito** | As conversas iniciadas pela empresa (modelos) são cobradas pela Meta. |
| **Servidor com HTTPS** | Onde este sistema vai rodar (Render, Railway, VPS…). O webhook exige HTTPS público. |
| **Opt-in dos contatos** | Só envie para quem autorizou receber mensagens da empresa no WhatsApp (política da Meta + LGPD). Guarde a origem da autorização de cada lista. |

---

## 1. Criar o portfólio empresarial e verificar a empresa

1. Acesse https://business.facebook.com → **Criar conta** (portfólio empresarial).
2. Preencha nome da empresa, seu nome e e-mail comercial.
3. Em **Configurações → Central de segurança (Security Center) → Verificação da empresa**,
   clique em **Iniciar verificação** e envie os documentos (cartão CNPJ, conta de
   consumo ou contrato social; o endereço e o nome precisam bater com o cadastro).
   - A verificação não bloqueia os primeiros testes, mas é necessária para
     aumentar os limites de envio e para o nome de exibição ser aprovado com
     mais facilidade. Leva de alguns dias a 2 semanas.

## 2. Criar o app na Meta for Developers

1. Acesse https://developers.facebook.com → **Meus apps → Criar app**.
2. Caso de uso: **Outro** → tipo **Empresa (Business)**.
3. Dê um nome (ex.: “JTEC Disparos”), informe o e-mail e **selecione o portfólio
   empresarial** do passo 1.
4. No painel do app, em **Adicionar produtos**, clique em **Configurar** no
   **WhatsApp**.
5. A Meta cria automaticamente uma **Conta do WhatsApp Business (WABA)** e um
   **número de teste**. Na tela **WhatsApp → Configuração da API (API Setup)**
   já é possível enviar uma mensagem de teste para até 5 números cadastrados —
   útil para validar o sistema antes do número definitivo.

## 3. Adicionar o número definitivo

1. Em **WhatsApp → Configuração da API**, role até **Etapa 5: Adicionar um
   número de telefone** → **Adicionar número de telefone**
   (ou pelo WhatsApp Manager: https://business.facebook.com/wa/manage/phone-numbers/).
2. Preencha o **perfil do WhatsApp Business**:
   - **Nome de exibição**: deve ter relação clara com a empresa/marca (ex.:
     “JTEC Válvulas Industriais”). Sem termos genéricos isolados, sem
     emojis/pontuação excessiva, capitalização normal. Ele passa por revisão.
   - **Fuso horário**, **categoria** (ex.: Serviços industriais) e descrição.
3. Informe o número com o código do país (+55 e DDD) e escolha **SMS** ou
   **Ligação** para receber o código de 6 dígitos. Digite o código.
4. Anote o **ID do número de telefone (Phone number ID)** e o **ID da conta do
   WhatsApp Business (WABA ID)** que aparecem na tela **Configuração da API**.

## 4. Registrar o número na Cloud API (PIN de duas etapas)

O número precisa ser “registrado” para uso pela API, definindo um PIN de 6
dígitos (verificação em duas etapas). Normalmente o próprio WhatsApp Manager
faz isso; se o número aparecer como **Pendente** ou **Não registrado**, rode:

```bash
curl -X POST "https://graph.facebook.com/v23.0/PHONE_NUMBER_ID/register" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messaging_product":"whatsapp","pin":"123456"}'
```

Guarde o PIN: ele será pedido se o número for migrado ou registrado novamente.
Resposta esperada: `{"success":true}`.

## 5. Gerar o token permanente (usuário do sistema)

O token que aparece na tela de teste expira em 24h. Para produção:

1. https://business.facebook.com → **Configurações da empresa → Usuários →
   Usuários do sistema → Adicionar**. Nome: “api-whatsapp”, função **Admin**.
2. Com o usuário selecionado, **Atribuir ativos**:
   - **Apps** → o app do passo 2 → **Controle total**;
   - **Contas do WhatsApp** → a WABA → **Controle total**.
3. Clique em **Gerar novo token** → escolha o app → validade **Nunca** →
   permissões:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
   - (`business_management`, se aparecer)
4. Copie o token (ele só é exibido uma vez) → vai em `WHATSAPP_TOKEN`.

## 6. Forma de pagamento

WhatsApp Manager → **Configurações da conta → Pagamentos (Payment settings)** →
adicionar cartão e moeda (BRL). Sem forma de pagamento os modelos de
**marketing** não são entregues.

Cobrança atual da Meta: **por mensagem de modelo entregue**, com preço por
categoria (Marketing, Utilidade, Autenticação) e país. Respostas dentro da
janela de 24h aberta pelo cliente (é aqui que o restante do kit é enviado) não
são cobradas como modelo. Consulte a tabela vigente em
https://developers.facebook.com/docs/whatsapp/pricing.

## 7. Configurar o webhook (status de entrega e respostas)

O webhook é o que permite ao sistema saber que a mensagem foi entregue/lida e,
principalmente, **enviar o restante do kit quando o contato responde**.

1. No servidor, defina `WHATSAPP_VERIFY_TOKEN` com uma frase qualquer (ex.:
   `jtec-webhook-2026`) e reinicie a aplicação.
2. No app (developers.facebook.com) → **WhatsApp → Configuração
   (Configuration)** → **Webhook → Editar**:
   - **URL de callback**: `https://SEU-DOMINIO/webhooks/whatsapp`
   - **Token de verificação**: o mesmo valor de `WHATSAPP_VERIFY_TOKEN`
   - Clique em **Verificar e salvar**.
3. Em **Campos do webhook**, clique em **Assinar** no campo **messages**.
4. Em **Configurações do app → Básico**, copie a **Chave secreta do app (App
   secret)** → `WHATSAPP_APP_SECRET` (o sistema valida a assinatura
   `X-Hub-Signature-256` de cada chamada).
5. Garanta que o app está inscrito na WABA (costuma ser automático; se os
   eventos não chegarem, rode):

   ```bash
   curl -X POST "https://graph.facebook.com/v23.0/WABA_ID/subscribed_apps" \
     -H "Authorization: Bearer TOKEN"
   ```

6. **Publique o app** (alternar o modo de *Desenvolvimento* para *Ao vivo*/
   *Publicado*, exige URL da política de privacidade em Configurações →
   Básico). Em modo desenvolvimento os webhooks de números reais podem não ser
   entregues.

## 8. Criar e aprovar os modelos de mensagem (templates)

Toda campanha começa com um modelo aprovado. Em WhatsApp Manager → **Modelos
de mensagem → Criar modelo**:

- **Categoria**: *Marketing* (divulgação de produtos/materiais).
- **Nome**: minúsculas e `_`, ex.: `lancamento_valvula_jtg`.
- **Idioma**: Português (BR) → `pt_BR`.
- **Cabeçalho**: *Mídia → Vídeo* (ou *Imagem*). É a peça principal do kit; ao
  criar o modelo a Meta pede um arquivo de exemplo.
- **Corpo**, com variáveis, por exemplo:

  ```
  Olá, {{1}}! A JTEC acaba de lançar a válvula globo JT-G, pensada para {{2}}.
  Preparamos um kit com fotos, ficha técnica e vídeo de aplicação.
  Toque em "Quero receber" para ver o material completo.
  ```
- **Rodapé**: `Responda SAIR para não receber mais mensagens.`
- **Botões**: *Resposta rápida* → `Quero receber` (e, se quiser, uma segunda
  resposta rápida `Não tenho interesse`).

A aprovação costuma levar de minutos a 24h. O botão de resposta rápida é o que
abre a janela de 24h e dispara a entrega automática do restante do kit.

No painel (`/admin/whatsapp/kits`), no kit correspondente:

| Campo do kit | Valor para o exemplo acima |
|---|---|
| Nome do modelo aprovado | `lancamento_valvula_jtg` |
| Idioma | `pt_BR` |
| Variáveis (uma por linha) | `{nome\|cliente}` e `{segmento\|a sua operação}` |
| Mídia do cabeçalho | o vídeo do kit |
| Entrega do restante | Quando o contato responder |

## 9. Variáveis de ambiente do sistema

No painel da hospedagem (Render/Railway) ou no `.env`:

```env
WHATSAPP_TOKEN=EAAG...                 # token permanente do passo 5
WHATSAPP_PHONE_NUMBER_ID=1234567890    # passo 3
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321 # WABA ID, passo 3 (lista os modelos no painel)
WHATSAPP_APP_SECRET=abc123...          # passo 7.4
WHATSAPP_VERIFY_TOKEN=jtec-webhook-2026
WHATSAPP_API_VERSION=v23.0             # versão da Graph API
WHATSAPP_RATE_PER_SECOND=10            # velocidade máxima do disparo
DATA_DIR=/data                         # disco persistente (listas, kits e histórico)
```

Sem `WHATSAPP_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID` o painel funciona em **modo
simulação** (nada é enviado), o que permite montar tudo antes do número estar
pronto. Depois de configurar, a página **WhatsApp → Visão geral** mostra o
número, o nome verificado, a qualidade e a lista de modelos aprovados.

> **Disco persistente**: listas, kits (imagens/vídeos) e histórico ficam em
> `DATA_DIR`. No Render é preciso um disco (plano pago); sem ele, tudo se perde
> a cada deploy.

## 10. Teste de ponta a ponta

1. Em **Kits de mídia → (seu kit) → Enviar teste**, informe o seu celular.
2. Você deve receber o modelo com o vídeo/imagem no cabeçalho.
3. Toque em **Quero receber** → em segundos chegam as demais imagens, vídeo e o
   texto final. Se não chegarem, o webhook não está configurado (passo 7).
4. Responda **SAIR** → você recebe a confirmação e fica marcado como
   descadastrado.

## 11. Limites e boas práticas

- **Limite de conversas iniciadas pela empresa**: um número novo começa com
  **250 contatos únicos por 24h**. O limite sobe automaticamente (para milhares
  e depois ilimitado) à medida que você usa boa parte do limite com **qualidade
  alta** e após a **verificação da empresa**. Acompanhe em WhatsApp Manager →
  Visão geral. Divida listas grandes em campanhas ao longo de vários dias.
- **Qualidade do número** (verde/amarelo/vermelho): cai se muitos contatos
  bloquearem ou denunciarem. Envie apenas para quem espera a mensagem, com
  conteúdo relevante por grupo de interesse, e sempre com opção de sair.
- **Limite de marketing por usuário**: a Meta pode deixar de entregar modelos de
  marketing para quem já recebeu muitos de outras empresas (erro 131049). Não
  insista no mesmo contato em sequência.
- **Mídia**: imagens JPG/PNG até 5 MB; vídeo MP4 (H.264 + áudio AAC) até 16 MB.
  Vídeos maiores: comprima (ex.: HandBrake, 720p) antes de subir.
- **Opt-out**: palavras SAIR, PARAR, STOP, CANCELAR, DESCADASTRAR ou REMOVER
  descadastram o contato automaticamente; VOLTAR reativa.

## Erros comuns

| Código | Significado | O que fazer |
|---|---|---|
| 190 | Token inválido/expirado | Gere o token permanente (passo 5). |
| 131047 | Fora da janela de 24h | Só modelos podem iniciar conversa; use entrega “Quando o contato responder”. |
| 132001 | Modelo não existe/não aprovado no idioma | Confira nome e idioma exatos no WhatsApp Manager. |
| 132000 | Nº de variáveis diferente do modelo | Ajuste as linhas de variáveis no kit. |
| 131026 | Destinatário sem WhatsApp | Revise a lista. |
| 131049 | Não entregue por limite de marketing da Meta | Tente mais tarde, sem reenviar em sequência. |
| 131056 / 130429 | Muitas mensagens em pouco tempo | Reduza `WHATSAPP_RATE_PER_SECOND`. |
| 133010 | Número não registrado | Rode o registro do passo 4. |
