'use strict';

/**
 * Utilitários de texto usados nas views e no painel.
 */

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Formatação inline: **negrito** e *itálico*. */
function inline(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

/**
 * Converte texto simples editado no painel em HTML.
 * Regras:
 *  - parágrafos separados por linha em branco
 *  - linhas iniciadas com "- " viram lista
 *  - linhas iniciadas com "## " viram subtítulo
 *  - linhas iniciadas com "> " viram destaque
 *  - **negrito** e *itálico*
 * Se o texto já contiver tags HTML, é devolvido sem alterações.
 */
function richText(text) {
  const src = String(text ?? '').replace(/\r\n/g, '\n').trim();
  if (!src) return '';
  if (/<\/?[a-z][\s\S]*>/i.test(src)) return src;

  return src
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split('\n');
      if (lines.every((l) => /^- /.test(l))) {
        return `<ul>${lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`;
      }
      if (lines.every((l) => /^\d+\. /.test(l))) {
        return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\d+\. /, ''))}</li>`).join('')}</ol>`;
      }
      if (/^## /.test(lines[0])) return `<h3>${inline(lines[0].slice(3))}</h3>`;
      if (/^### /.test(lines[0])) return `<h4>${inline(lines[0].slice(4))}</h4>`;
      if (/^> /.test(lines[0])) {
        return `<blockquote>${lines.map((l) => inline(l.replace(/^> ?/, ''))).join('<br>')}</blockquote>`;
      }
      return `<p>${lines.map(inline).join('<br>')}</p>`;
    })
    .join('\n');
}

/** Remove tags e reduz para um resumo curto. */
function excerpt(text, max = 160) {
  const plain = String(text ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*>-]+\s/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

/** Converte "5519999990000" em "+55 (19) 99999-0000" para exibição. */
function formatPhone(digits) {
  const d = String(digits || '').replace(/\D/g, '');
  if (d.length === 13) return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  if (d.length === 12) return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 8)}-${d.slice(8)}`;
  return digits;
}

/** Tempo de leitura aproximado em minutos. */
function readingTime(text) {
  const words = String(text || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Linhas "chave: valor" viram lista de especificações. */
function parseSpecs(text) {
  return String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(':');
      if (idx === -1) return { label: line, value: '' };
      return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
    });
}

function specsToText(specs) {
  return (specs || []).map((s) => `${s.label}: ${s.value}`).join('\n');
}

/** Linhas simples viram array de strings. */
function parseLines(text) {
  return String(text || '')
    .split('\n')
    .map((l) => l.replace(/^-\s*/, '').trim())
    .filter(Boolean);
}

module.exports = {
  escapeHtml,
  richText,
  excerpt,
  formatDate,
  formatDateTime,
  formatPhone,
  readingTime,
  parseSpecs,
  specsToText,
  parseLines,
};
