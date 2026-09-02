'use strict';

/**
 * API pública somente leitura (JSON). Útil para integrações, apps ou
 * carregamento dinâmico de conteúdo no front-end.
 */

const express = require('express');
const store = require('../lib/store');

const router = express.Router();

const publicFields = (item) => {
  const { ip, ...rest } = item; // eslint-disable-line no-unused-vars
  return rest;
};

router.get('/services', (req, res) => {
  res.json(store.services.published().map(publicFields));
});

router.get('/products', (req, res) => {
  let products = store.products.published();
  if (req.query.categoria) products = products.filter((p) => p.category === req.query.categoria);
  res.json(products.map(publicFields));
});

router.get('/products/:slug', (req, res) => {
  const product = store.products.findBySlug(req.params.slug);
  if (!product || product.published === false) return res.status(404).json({ error: 'not-found' });
  return res.json(publicFields(product));
});

router.get('/posts', (req, res) => {
  res.json(store.posts.published().map(publicFields));
});

router.get('/site', (req, res) => {
  const { seo, ...site } = store.settings.get(); // eslint-disable-line no-unused-vars
  res.json(site);
});

module.exports = router;
