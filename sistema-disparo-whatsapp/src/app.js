'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');

const text = require('./lib/text');
const { checkCredentials, requireAuth, csrfToken, verifyCsrf } = require('./middleware/auth');
const routes = require('./routes/painel');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const APP_NAME = process.env.APP_NAME || 'Disparo WhatsApp';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(
  express.json({
    limit: '5mb',
    // corpo bruto usado para validar a assinatura do webhook
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: isProduction ? '7d' : 0 }));

// Webhook da Meta: público, antes da sessão
app.use('/webhooks/whatsapp', routes.webhook);

app.use(
  session({
    name: 'disparo.sid',
    secret: process.env.SESSION_SECRET || 'dev-secret-troque-em-producao',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction && process.env.SECURE_COOKIES !== 'false',
      maxAge: 12 * 60 * 60 * 1000,
    },
  })
);

app.use((req, res, next) => {
  res.locals.appName = APP_NAME;
  res.locals.text = text;
  res.locals.path = req.path;
  res.locals.csrf = csrfToken(req);
  res.locals.user = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

// ---------- Login ----------

app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  return res.render('login', { error: null });
});

app.post('/login', verifyCsrf, (req, res) => {
  const { user, password } = req.body;
  if (!checkCredentials(user, password)) return res.status(401).render('login', { error: 'Usuário ou senha inválidos.' });
  const target = req.session.returnTo || '/';
  return req.session.regenerate((err) => {
    if (err) return res.status(500).render('login', { error: 'Erro ao iniciar sessão.' });
    req.session.user = { name: user, since: new Date().toISOString() };
    return res.redirect(target);
  });
});

app.post('/logout', verifyCsrf, (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.get('/health', (req, res) => res.json({ ok: true }));

// ---------- Painel ----------

app.use('/', requireAuth, routes.painel);

app.use((req, res) => {
  res.status(404).render('error', { title: 'Página não encontrada', message: 'O endereço acessado não existe.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Erro interno', message: 'Ocorreu um erro inesperado. Tente novamente em instantes.' });
});

module.exports = app;
