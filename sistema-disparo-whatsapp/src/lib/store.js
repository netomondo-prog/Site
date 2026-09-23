'use strict';

/**
 * Camada de dados simples baseada em arquivos JSON (pasta DATA_DIR).
 * Coleções: grupos, contatos, kits e campanhas. O histórico de envios fica
 * em envios.json (ver log.js) e as mídias dos kits em DATA_DIR/midias.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function read(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath(name), 'utf8'));
  } catch (err) {
    return fallback;
  }
}

function write(name, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const target = filePath(name);
  const tmp = `${target}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, target);
}

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function collection(name) {
  return {
    name,
    all() {
      return read(name, []);
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
      const index = items.findIndex((i) => i.id === item.id);
      if (index >= 0) items[index] = { ...items[index], ...item };
      else items.push(item);
      write(name, items);
      return item;
    },
    remove(id) {
      write(name, this.all().filter((i) => i.id !== id));
    },
    replaceAll(items) {
      write(name, items);
    },
  };
}

module.exports = {
  DATA_DIR,
  read,
  write,
  slugify,
  newId,
  groups: collection('grupos'),
  contacts: collection('contatos'),
  kits: collection('kits'),
  campaigns: collection('campanhas'),
};
