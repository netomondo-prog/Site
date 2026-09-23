'use strict';

/**
 * Normalização de telefones para o formato exigido pela API do WhatsApp
 * (somente dígitos, com código do país, ex.: 5519999990000).
 */

const DEFAULT_COUNTRY = process.env.WHATSAPP_DEFAULT_COUNTRY || '55';

/** Retorna o número só com dígitos e DDI, ou '' se for inválido. */
function normalize(raw, country = DEFAULT_COUNTRY) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  digits = digits.replace(/^00/, '');
  if (country === '55') {
    digits = digits.replace(/^0+/, '');
    // Sem DDI: DDD + 8 ou 9 dígitos
    if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
    if (!/^55\d{10,11}$/.test(digits)) return '';
    return digits;
  }
  if (digits.length < 8 || digits.length > 15) return '';
  return digits;
}

/**
 * Chaves equivalentes de um número. No Brasil o WhatsApp pode devolver o
 * wa_id sem o nono dígito (ex.: 551999990000 em vez de 5519999990000), então
 * as duas formas precisam ser consideradas o mesmo contato.
 */
function variants(number) {
  const n = String(number || '').replace(/\D/g, '');
  if (!n) return [];
  const out = new Set([n]);
  const br = n.match(/^55(\d{2})(\d{8,9})$/);
  if (br) {
    const [, ddd, local] = br;
    if (local.length === 9 && local[0] === '9') out.add(`55${ddd}${local.slice(1)}`);
    if (local.length === 8) out.add(`55${ddd}9${local}`);
  }
  return [...out];
}

function same(a, b) {
  const va = variants(a);
  return variants(b).some((v) => va.includes(v));
}

/** Formatação amigável para exibição: +55 (19) 99999-0000 */
function format(number) {
  const n = String(number || '');
  const br = n.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  if (br) return `+55 (${br[1]}) ${br[2]}-${br[3]}`;
  return n ? `+${n}` : '';
}

module.exports = { normalize, variants, same, format };
