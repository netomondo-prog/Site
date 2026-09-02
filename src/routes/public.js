'use strict';

const express = require('express');
const store = require('../lib/store');
const mailer = require('../lib/mailer');
const { verifyCsrf, rateLimit } = require('../middleware/auth');

const router = express.Router();

const byOrder = (a, b) => (a.order ?? 99) - (b.order ?? 99);
const byDateDesc = (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);

function relatedProducts(product, all, limit = 3) {
  return all
    .filter((p) => p.id !== product.id)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, limit);
}

router.get('/', (req, res) => {
  const services = store.services.published().sort(byOrder);
  const products = store.products.published().sort(byOrder);
  const posts = store.posts.published().sort(byDateDesc).slice(0, 3);
  const segments = store.segments.published().sort(byOrder);
  res.render('pages/home', {
    services: services.slice(0, 6),
    products: products.filter((p) => p.featured).slice(0, 4),
    posts,
    segments,
  });
});

router.get('/empresa', (req, res) => {
  res.render('pages/empresa', {
    meta: { title: 'A Empresa', description: res.locals.site.about?.headline || '' },
    segments: store.segments.published().sort(byOrder),
  });
});

router.get('/servicos', (req, res) => {
  res.render('pages/servicos', {
    meta: { title: 'Serviços', description: 'Manutenção, testes, calibração e usinagem de válvulas industriais.' },
    services: store.services.published().sort(byOrder),
  });
});

router.get('/servicos/:slug', (req, res, next) => {
  const service = store.services.findBySlug(req.params.slug);
  if (!service || service.published === false) return next();
  const others = store.services.published().filter((s) => s.id !== service.id).sort(byOrder);
  return res.render('pages/servico', {
    meta: { title: service.title, description: service.short },
    service,
    others,
  });
});

router.get('/produtos', (req, res) => {
  const site = res.locals.site;
  const categories = site.productCategories || [];
  const category = String(req.query.categoria || '');
  const q = String(req.query.q || '').trim().toLowerCase();
  let products = store.products.published().sort(byOrder);
  if (category) products = products.filter((p) => p.category === category);
  if (q) {
    products = products.filter((p) =>
      [p.name, p.short, p.body, (p.specs || []).map((s) => `${s.label} ${s.value}`).join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }
  const current = categories.find((c) => c.slug === category) || null;
  res.render('pages/produtos', {
    meta: {
      title: current ? current.name : 'Produtos',
      description: 'Válvulas de segurança, controle, instrumentação e peças para a indústria.',
    },
    products,
    categories,
    category,
    current,
    q,
  });
});

router.get('/produtos/:slug', (req, res, next) => {
  const product = store.products.findBySlug(req.params.slug);
  if (!product || product.published === false) return next();
  const categories = res.locals.site.productCategories || [];
  const category = categories.find((c) => c.slug === product.category) || null;
  return res.render('pages/produto', {
    meta: { title: product.name, description: product.short, image: product.image },
    product,
    category,
    related: relatedProducts(product, store.products.published()),
  });
});

router.get('/blog', (req, res) => {
  const tag = String(req.query.tag || '');
  let posts = store.posts.published().sort(byDateDesc);
  if (tag) posts = posts.filter((p) => (p.tags || []).includes(tag));
  const tags = [...new Set(store.posts.published().flatMap((p) => p.tags || []))].sort();
  res.render('pages/blog', {
    meta: { title: 'Blog', description: 'Conteúdo técnico sobre válvulas industriais, manutenção e segurança de processo.' },
    posts,
    tags,
    tag,
  });
});

router.get('/blog/:slug', (req, res, next) => {
  const post = store.posts.findBySlug(req.params.slug);
  if (!post || post.published === false) return next();
  const others = store.posts
    .published()
    .filter((p) => p.id !== post.id)
    .sort(byDateDesc)
    .slice(0, 3);
  return res.render('pages/post', {
    meta: { title: post.title, description: post.excerpt, image: post.cover },
    post,
    others,
  });
});

const SUBJECTS = [
  'Solicitar orçamento',
  'Manutenção de válvulas',
  'Compra de produtos',
  'Suporte técnico',
  'Emergência 24h',
  'Trabalhe conosco',
  'Outros assuntos',
];

router.get('/contato', (req, res) => {
  res.render('pages/contato', {
    meta: { title: 'Contato', description: 'Fale com a equipe técnica da JTECK. Atendimento comercial e emergências 24h.' },
    subjects: SUBJECTS,
    values: { subject: req.query.assunto || '' },
    errors: {},
    sent: req.query.enviado === '1',
  });
});

router.post('/contato', rateLimit({ max: 6 }), verifyCsrf, async (req, res, next) => {
  const body = req.body || {};
  const values = {
    name: String(body.name || '').trim().slice(0, 120),
    email: String(body.email || '').trim().slice(0, 160),
    company: String(body.company || '').trim().slice(0, 120),
    phone: String(body.phone || '').trim().slice(0, 40),
    city: String(body.city || '').trim().slice(0, 80),
    state: String(body.state || '').trim().slice(0, 2).toUpperCase(),
    subject: String(body.subject || '').trim().slice(0, 80),
    message: String(body.message || '').trim().slice(0, 4000),
  };

  // Campo "honeypot" contra robôs: deve permanecer vazio
  if (body.website) return res.redirect('/contato?enviado=1');

  const errors = {};
  if (values.name.length < 2) errors.name = 'Informe seu nome.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Informe um e-mail válido.';
  if (values.phone.replace(/\D/g, '').length < 10) errors.phone = 'Informe um telefone com DDD.';
  if (!SUBJECTS.includes(values.subject)) errors.subject = 'Selecione o assunto.';
  if (values.message.length < 10) errors.message = 'Descreva sua necessidade com um pouco mais de detalhe.';

  if (Object.keys(errors).length) {
    return res.status(422).render('pages/contato', {
      meta: { title: 'Contato' },
      subjects: SUBJECTS,
      values,
      errors,
      sent: false,
    });
  }

  try {
    const saved = store.messages.save({ ...values, read: false, ip: req.ip });
    try {
      await mailer.sendContact(saved, res.locals.site);
    } catch (mailErr) {
      console.error('Falha ao enviar e-mail de contato:', mailErr.message);
    }
    return res.redirect('/contato?enviado=1');
  } catch (err) {
    return next(err);
  }
});

router.get('/sitemap.xml', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  const urls = ['/', '/empresa', '/servicos', '/produtos', '/blog', '/contato'];
  store.services.published().forEach((s) => urls.push(`/servicos/${s.slug}`));
  store.products.published().forEach((p) => urls.push(`/produtos/${p.slug}`));
  store.posts.published().forEach((p) => urls.push(`/blog/${p.slug}`));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${base}${u}</loc></url>`)
    .join('\n')}\n</urlset>`;
  res.type('application/xml').send(xml);
});

router.get('/robots.txt', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${base}/sitemap.xml\n`);
});

module.exports = router;
