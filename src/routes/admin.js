'use strict';

/**
 * Painel administrativo: login, dashboard, CRUD genérico das coleções,
 * caixa de mensagens e configurações do site.
 */

const express = require('express');
const store = require('../lib/store');
const text = require('../lib/text');
const { checkCredentials, requireAuth, verifyCsrf } = require('../middleware/auth');

const router = express.Router();

/**
 * Definição das coleções editáveis. Cada campo descreve como é exibido no
 * formulário e como é convertido de/para o JSON.
 * Tipos: text, textarea, rich, lines, specs, select, checkbox, number, date, image
 */
const RESOURCES = {
  servicos: {
    collection: store.services,
    label: 'Serviços',
    singular: 'Serviço',
    publicPath: '/servicos',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'slug', label: 'Endereço (slug)', type: 'text', help: 'Deixe em branco para gerar a partir do título.' },
      { name: 'short', label: 'Resumo curto', type: 'textarea', rows: 2, required: true },
      { name: 'icon', label: 'Ícone', type: 'select', options: ['valve', 'control', 'test', 'field', 'lathe', 'training', 'gauge', 'shield', 'wrench'] },
      { name: 'image', label: 'Imagem (URL)', type: 'image' },
      { name: 'body', label: 'Descrição completa', type: 'rich', rows: 12 },
      { name: 'items', label: 'O que está incluso (um por linha)', type: 'lines', rows: 8 },
      { name: 'benefits', label: 'Benefícios (um por linha)', type: 'lines', rows: 5 },
      { name: 'order', label: 'Ordem', type: 'number' },
      { name: 'published', label: 'Publicado', type: 'checkbox' },
    ],
  },
  produtos: {
    collection: store.products,
    label: 'Produtos',
    singular: 'Produto',
    publicPath: '/produtos',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true, isTitle: true },
      { name: 'slug', label: 'Endereço (slug)', type: 'text', help: 'Deixe em branco para gerar a partir do nome.' },
      { name: 'category', label: 'Categoria', type: 'select', optionsFrom: 'productCategories' },
      { name: 'short', label: 'Resumo curto', type: 'textarea', rows: 2, required: true },
      { name: 'image', label: 'Imagem (URL)', type: 'image' },
      { name: 'body', label: 'Descrição', type: 'rich', rows: 8 },
      { name: 'specs', label: 'Especificações (uma por linha, formato "Rótulo: valor")', type: 'specs', rows: 8 },
      { name: 'applications', label: 'Aplicações (uma por linha)', type: 'lines', rows: 4 },
      { name: 'featured', label: 'Destaque na home', type: 'checkbox' },
      { name: 'order', label: 'Ordem', type: 'number' },
      { name: 'published', label: 'Publicado', type: 'checkbox' },
    ],
  },
  blog: {
    collection: store.posts,
    label: 'Blog',
    singular: 'Artigo',
    publicPath: '/blog',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'slug', label: 'Endereço (slug)', type: 'text' },
      { name: 'excerpt', label: 'Resumo', type: 'textarea', rows: 3, required: true },
      { name: 'cover', label: 'Imagem de capa (URL)', type: 'image' },
      { name: 'author', label: 'Autor', type: 'text' },
      { name: 'date', label: 'Data', type: 'date' },
      { name: 'tags', label: 'Tags (uma por linha)', type: 'lines', rows: 3 },
      { name: 'body', label: 'Conteúdo', type: 'rich', rows: 20 },
      { name: 'published', label: 'Publicado', type: 'checkbox' },
    ],
  },
  segmentos: {
    collection: store.segments,
    label: 'Segmentos',
    singular: 'Segmento',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true, isTitle: true },
      { name: 'short', label: 'Descrição curta', type: 'textarea', rows: 2 },
      { name: 'icon', label: 'Ícone', type: 'select', options: ['oil', 'chemical', 'sugar', 'paper', 'energy', 'ship', 'food', 'mining', 'steel'] },
      { name: 'order', label: 'Ordem', type: 'number' },
      { name: 'published', label: 'Publicado', type: 'checkbox' },
    ],
  },
};

function fromForm(resource, body) {
  const item = {};
  for (const field of resource.fields) {
    const raw = body[field.name];
    switch (field.type) {
      case 'checkbox':
        item[field.name] = raw === 'on' || raw === 'true';
        break;
      case 'number':
        item[field.name] = raw === '' || raw == null ? undefined : Number(raw);
        break;
      case 'lines':
        item[field.name] = text.parseLines(raw);
        break;
      case 'specs':
        item[field.name] = text.parseSpecs(raw);
        break;
      default:
        item[field.name] = String(raw ?? '').trim();
    }
  }
  if (!item.slug) {
    const titleField = resource.fields.find((f) => f.isTitle || f.name === 'title');
    item.slug = store.slugify(item[titleField.name]);
  } else {
    item.slug = store.slugify(item.slug);
  }
  return item;
}

function toForm(resource, item) {
  const values = {};
  for (const field of resource.fields) {
    const v = item ? item[field.name] : undefined;
    if (field.type === 'lines') values[field.name] = (v || []).join('\n');
    else if (field.type === 'specs') values[field.name] = text.specsToText(v);
    else if (field.type === 'checkbox') values[field.name] = item ? v !== false : true;
    else values[field.name] = v ?? '';
  }
  return values;
}

function validate(resource, item) {
  const errors = {};
  for (const field of resource.fields) {
    if (field.required && !String(item[field.name] || '').trim()) errors[field.name] = 'Campo obrigatório.';
  }
  return errors;
}

function flash(req, type, message) {
  req.session.flash = { type, message };
}

// ---------- Autenticação ----------

router.get('/login', (req, res) => {
  if (req.session.admin) return res.redirect('/admin');
  return res.render('admin/login', { error: null });
});

router.post('/login', verifyCsrf, (req, res) => {
  const { user, password } = req.body;
  if (checkCredentials(user, password)) {
    req.session.regenerate((err) => {
      if (err) return res.status(500).render('admin/login', { error: 'Erro ao iniciar sessão.' });
      req.session.admin = { user, since: new Date().toISOString() };
      const target = req.session.returnTo || '/admin';
      delete req.session.returnTo;
      return res.redirect(target);
    });
    return undefined;
  }
  return res.status(401).render('admin/login', { error: 'Usuário ou senha inválidos.' });
});

router.post('/logout', verifyCsrf, (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

router.use(requireAuth);

// ---------- Dashboard ----------

router.get('/', (req, res) => {
  const messages = store.messages.all();
  res.render('admin/dashboard', {
    counts: {
      services: store.services.all().length,
      products: store.products.all().length,
      posts: store.posts.all().length,
      messages: messages.length,
      unread: messages.filter((m) => !m.read).length,
    },
    recentMessages: messages.slice().reverse().slice(0, 5),
    resources: RESOURCES,
  });
});

// ---------- Mensagens ----------

router.get('/mensagens', (req, res) => {
  const messages = store.messages.all().slice().reverse();
  res.render('admin/messages', { messages, resources: RESOURCES });
});

router.get('/mensagens/:id', (req, res, next) => {
  const message = store.messages.findById(req.params.id);
  if (!message) return next();
  if (!message.read) store.messages.save({ ...message, read: true });
  return res.render('admin/message', { message, resources: RESOURCES });
});

router.post('/mensagens/:id/excluir', verifyCsrf, (req, res) => {
  store.messages.remove(req.params.id);
  flash(req, 'success', 'Mensagem excluída.');
  res.redirect('/admin/mensagens');
});

// ---------- Configurações ----------

router.get('/configuracoes', (req, res) => {
  res.render('admin/settings', { resources: RESOURCES, values: res.locals.site, errors: {} });
});

router.post('/configuracoes', verifyCsrf, (req, res) => {
  const b = req.body;
  const patch = {
    name: String(b.name || '').trim(),
    legalName: String(b.legalName || '').trim(),
    tagline: String(b.tagline || '').trim(),
    phone: String(b.phone || '').trim(),
    phoneAlt: String(b.phoneAlt || '').trim(),
    whatsapp: String(b.whatsapp || '').replace(/\D/g, ''),
    whatsappMessage: String(b.whatsappMessage || '').trim(),
    email: String(b.email || '').trim(),
    hours: String(b.hours || '').trim(),
    emergency: String(b.emergency || '').trim(),
    address: {
      street: String(b.street || '').trim(),
      district: String(b.district || '').trim(),
      city: String(b.city || '').trim(),
      state: String(b.state || '').trim(),
      zip: String(b.zip || '').trim(),
      mapsQuery: String(b.mapsQuery || '').trim(),
    },
    social: {
      instagram: String(b.instagram || '').trim(),
      linkedin: String(b.linkedin || '').trim(),
      youtube: String(b.youtube || '').trim(),
    },
    seo: {
      description: String(b.seoDescription || '').trim(),
      keywords: String(b.seoKeywords || '').trim(),
    },
    about: {
      ...(res.locals.site.about || {}),
      headline: String(b.aboutHeadline || '').trim(),
      body: String(b.aboutBody || ''),
      mission: String(b.mission || '').trim(),
      vision: String(b.vision || '').trim(),
      values: text.parseLines(b.values),
    },
  };
  store.settings.update(patch);
  flash(req, 'success', 'Configurações salvas.');
  res.redirect('/admin/configuracoes');
});

// ---------- CRUD genérico ----------

router.param('resource', (req, res, next, key) => {
  const resource = RESOURCES[key];
  if (!resource) return next('route');
  req.resource = resource;
  req.resourceKey = key;
  res.locals.resources = RESOURCES;
  return next();
});

router.get('/:resource', (req, res) => {
  const items = req.resource.collection.all().sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  res.render('admin/list', { resource: req.resource, resourceKey: req.resourceKey, items });
});

router.get('/:resource/novo', (req, res) => {
  res.render('admin/form', {
    resource: req.resource,
    resourceKey: req.resourceKey,
    item: null,
    values: toForm(req.resource, null),
    errors: {},
  });
});

router.post('/:resource/novo', verifyCsrf, (req, res) => {
  const item = fromForm(req.resource, req.body);
  const errors = validate(req.resource, item);
  if (Object.keys(errors).length) {
    return res.status(422).render('admin/form', {
      resource: req.resource,
      resourceKey: req.resourceKey,
      item: null,
      values: toForm(req.resource, item),
      errors,
    });
  }
  req.resource.collection.save(item);
  flash(req, 'success', `${req.resource.singular} criado com sucesso.`);
  return res.redirect(`/admin/${req.resourceKey}`);
});

router.get('/:resource/:id', (req, res, next) => {
  const item = req.resource.collection.findById(req.params.id);
  if (!item) return next();
  return res.render('admin/form', {
    resource: req.resource,
    resourceKey: req.resourceKey,
    item,
    values: toForm(req.resource, item),
    errors: {},
  });
});

router.post('/:resource/:id', verifyCsrf, (req, res, next) => {
  const existing = req.resource.collection.findById(req.params.id);
  if (!existing) return next();
  const item = { ...fromForm(req.resource, req.body), id: existing.id };
  const errors = validate(req.resource, item);
  if (Object.keys(errors).length) {
    return res.status(422).render('admin/form', {
      resource: req.resource,
      resourceKey: req.resourceKey,
      item: existing,
      values: toForm(req.resource, item),
      errors,
    });
  }
  req.resource.collection.save(item);
  flash(req, 'success', `${req.resource.singular} atualizado.`);
  return res.redirect(`/admin/${req.resourceKey}`);
});

router.post('/:resource/:id/excluir', verifyCsrf, (req, res) => {
  req.resource.collection.remove(req.params.id);
  flash(req, 'success', `${req.resource.singular} excluído.`);
  res.redirect(`/admin/${req.resourceKey}`);
});

module.exports = router;
