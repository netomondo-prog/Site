'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');

const store = require('./lib/store');
const text = require('./lib/text');
const { csrfToken } = require('./middleware/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Cabeçalhos de segurança básicos
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(
  express.static(path.join(__dirname, '..', 'public'), {
    maxAge: isProduction ? '7d' : 0,
    etag: true,
  })
);

app.use(
  session({
    name: 'jteck.sid',
    secret: process.env.SESSION_SECRET || 'dev-secret-troque-em-producao',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction && process.env.SECURE_COOKIES !== 'false',
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

// Variáveis disponíveis em todas as views
app.use((req, res, next) => {
  const site = store.settings.get();
  res.locals.site = site;
  res.locals.text = text;
  res.locals.path = req.path;
  res.locals.currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  res.locals.csrf = csrfToken(req);
  res.locals.isAdmin = Boolean(req.session.admin);
  res.locals.footerServices = store.services
    .published()
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .slice(0, 6);
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  res.locals.meta = { title: '', description: site.seo?.description || '', image: '' };
  res.locals.whatsappLink = (message) => {
    const number = String(site.whatsapp || '').replace(/\D/g, '');
    const msg = encodeURIComponent(message || site.whatsappMessage || 'Olá! Gostaria de mais informações.');
    return `https://wa.me/${number}?text=${msg}`;
  };
  next();
});

app.use('/', publicRoutes);
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('pages/error', {
    title: 'Página não encontrada',
    message: 'A página que você procura não existe ou foi movida.',
  });
});

// Erros
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('pages/error', {
    title: 'Erro interno',
    message: 'Ocorreu um erro inesperado. Tente novamente em instantes.',
  });
});

module.exports = app;
