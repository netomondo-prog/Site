'use strict';

/**
 * Leitor de CSV simples (sem dependências). Aceita vírgula, ponto e vírgula
 * (padrão do Excel em português) ou tabulação, campos entre aspas e BOM.
 */

function detectDelimiter(firstLine) {
  const counts = { ';': 0, ',': 0, '\t': 0 };
  let quoted = false;
  for (const ch of firstLine) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch in counts) counts[ch] += 1;
  }
  const [best, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return count > 0 ? best : ',';
}

function parseRows(input) {
  const src = String(input || '').replace(/^﻿/, '');
  const firstLine = src.split(/\r?\n/, 1)[0] || '';
  const delim = detectDelimiter(firstLine);
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === delim) {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
}

function headerKey(h) {
  return String(h || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const PHONE_KEYS = ['telefone', 'celular', 'whatsapp', 'fone', 'phone', 'numero', 'mobile', 'tel'];
const NAME_KEYS = ['nome', 'name', 'contato', 'cliente'];

/**
 * Converte o CSV em objetos { phone, name, fields }.
 * Se não houver cabeçalho reconhecível, assume: coluna 1 = telefone, coluna 2 = nome.
 */
function parseContacts(input) {
  const rows = parseRows(input);
  if (!rows.length) return [];
  const header = rows[0].map(headerKey);
  const phoneIdx = header.findIndex((h) => PHONE_KEYS.some((k) => h.startsWith(k)));
  const hasHeader = phoneIdx >= 0;
  const nameIdx = hasHeader ? header.findIndex((h) => NAME_KEYS.some((k) => h.startsWith(k))) : 1;
  const pIdx = hasHeader ? phoneIdx : 0;
  const body = hasHeader ? rows.slice(1) : rows;
  return body.map((r) => {
    const fields = {};
    if (hasHeader) {
      header.forEach((h, i) => {
        if (h && i !== pIdx && i !== nameIdx) fields[h] = String(r[i] ?? '').trim();
      });
    }
    return {
      phone: String(r[pIdx] ?? '').trim(),
      name: nameIdx >= 0 ? String(r[nameIdx] ?? '').trim() : '',
      fields,
    };
  });
}

module.exports = { parseRows, parseContacts };
