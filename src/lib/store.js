'use strict';

/**
 * Camada de dados simples baseada em arquivos JSON.
 * Cada "coleção" é um arquivo em /data (services, products, posts, messages).
 * As configurações do site ficam em /data/site.json.
 *
 * Isso mantém o site dinâmico (conteúdo editável pelo painel) sem exigir
 * um banco de dados. Para volumes maiores, basta trocar esta camada.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
const SEED_DIR = path.join(__dirname, '..', '..', 'data');

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

/** Copia os dados iniciais para DATA_DIR quando ele é um diretório externo vazio. */
function seedIfNeeded(name) {
  ensureDir();
  const target = filePath(name);
  if (fs.existsSync(target)) return;
  const seed = path.join(SEED_DIR, `${name}.json`);
  if (path.resolve(seed) !== path.resolve(target) && fs.existsSync(seed)) {
    fs.copyFileSync(seed, target);
  }
}

function read(name, fallback) {
  seedIfNeeded(name);
  try {
    return JSON.parse(fs.readFileSync(filePath(name), 'utf8'));
  } catch (err) {
    return fallback;
  }
}

function write(name, data) {
  ensureDir();
  const target = filePath(name);
  const tmp = `${target}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, target);
}

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Fábrica de coleções com operações básicas. */
function collection(name) {
  return {
    name,
    all() {
      return read(name, []);
    },
    published() {
      return this.all().filter((item) => item.published !== false);
    },
    findBySlug(slug) {
      return this.all().find((item) => item.slug === slug) || null;
    },
    findById(id) {
      return this.all().find((item) => item.id === id) || null;
    },
    save(item) {
      const items = this.all();
      const now = new Date().toISOString();
      if (!item.id) {
        item.id = newId();
        item.createdAt = now;
      }
      item.updatedAt = now;
      if ('title' in item && !item.slug) item.slug = slugify(item.title);
      if (item.slug) item.slug = uniqueSlug(items, item);
      const index = items.findIndex((i) => i.id === item.id);
      if (index >= 0) items[index] = { ...items[index], ...item };
      else items.push(item);
      write(name, items);
      return item;
    },
    remove(id) {
      const items = this.all().filter((i) => i.id !== id);
      write(name, items);
    },
    replaceAll(items) {
      write(name, items);
    },
  };
}

function uniqueSlug(items, item) {
  const base = slugify(item.slug) || 'item';
  let slug = base;
  let n = 2;
  while (items.some((i) => i.slug === slug && i.id !== item.id)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

const settings = {
  get() {
    return read('site', {});
  },
  update(patch) {
    const current = this.get();
    const next = deepMerge(current, patch);
    write('site', next);
    return next;
  },
};

function deepMerge(a, b) {
  const out = { ...a };
  for (const key of Object.keys(b)) {
    if (b[key] && typeof b[key] === 'object' && !Array.isArray(b[key]) && a[key] && typeof a[key] === 'object') {
      out[key] = deepMerge(a[key], b[key]);
    } else {
      out[key] = b[key];
    }
  }
  return out;
}

module.exports = {
  DATA_DIR,
  slugify,
  newId,
  settings,
  services: collection('services'),
  products: collection('products'),
  posts: collection('posts'),
  messages: collection('messages'),
  segments: collection('segments'),
};
