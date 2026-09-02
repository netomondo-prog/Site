'use strict';

const crypto = require('crypto');

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function checkCredentials(user, password) {
  const expectedUser = process.env.ADMIN_USER || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD || 'jtec2026';
  return safeEqual(user, expectedUser) && safeEqual(password, expectedPass);
}

function requireAuth(req, res, next) {
  if (req.session && req.session.admin) return next();
  req.session.returnTo = req.originalUrl;
  return res.redirect('/admin/login');
}

/** Token anti-CSRF simples, guardado na sessão. */
function csrfToken(req) {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(24).toString('hex');
  return req.session.csrf;
}

function verifyCsrf(req, res, next) {
  const token = req.body && req.body._csrf;
  if (req.session && req.session.csrf && token && safeEqual(token, req.session.csrf)) return next();
  return res.status(403).render('pages/error', {
    title: 'Sessão expirada',
    message: 'O formulário expirou. Volte e tente novamente.',
  });
}

/** Limitador de requisições em memória (por IP) para formulários públicos. */
function rateLimit({ windowMs = 10 * 60 * 1000, max = 5 } = {}) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const entry = hits.get(key) || { count: 0, start: now };
    if (now - entry.start > windowMs) {
      entry.count = 0;
      entry.start = now;
    }
    entry.count += 1;
    hits.set(key, entry);
    if (hits.size > 5000) hits.clear();
    if (entry.count > max) {
      return res.status(429).render('pages/error', {
        title: 'Muitas tentativas',
        message: 'Você enviou muitas mensagens em pouco tempo. Aguarde alguns minutos ou fale conosco pelo WhatsApp.',
      });
    }
    return next();
  };
}

module.exports = { checkCredentials, requireAuth, csrfToken, verifyCsrf, rateLimit };
