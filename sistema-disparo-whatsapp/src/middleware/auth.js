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
  const expectedPass = process.env.ADMIN_PASSWORD || 'disparo2026';
  return safeEqual(user, expectedUser) && safeEqual(password, expectedPass);
}

function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  req.session.returnTo = req.originalUrl;
  return res.redirect('/login');
}

/** Token anti-CSRF simples, guardado na sessão. */
function csrfToken(req) {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(24).toString('hex');
  return req.session.csrf;
}

function verifyCsrf(req, res, next) {
  const token = req.body && req.body._csrf;
  if (req.session && req.session.csrf && token && safeEqual(token, req.session.csrf)) return next();
  return res.status(403).render('error', {
    title: 'Sessão expirada',
    message: 'O formulário expirou. Volte e tente novamente.',
  });
}

module.exports = { checkCredentials, requireAuth, csrfToken, verifyCsrf };
