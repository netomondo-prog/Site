'use strict';

/**
 * Envio de e-mail do formulário de contato.
 * Só é ativado quando SMTP_HOST está configurado; caso contrário as mensagens
 * ficam apenas gravadas em data/messages.json e visíveis no painel.
 */

let transporter = null;

function getTransporter() {
  if (transporter !== null) return transporter;
  if (!process.env.SMTP_HOST) {
    transporter = false;
    return transporter;
  }
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

async function sendContact(message, site) {
  const transport = getTransporter();
  if (!transport) return { sent: false, reason: 'smtp-not-configured' };

  const lines = [
    `Nome: ${message.name}`,
    `E-mail: ${message.email}`,
    `Empresa: ${message.company || '-'}`,
    `Telefone: ${message.phone || '-'}`,
    `Cidade/UF: ${message.city || '-'} / ${message.state || '-'}`,
    `Assunto: ${message.subject}`,
    '',
    message.message,
  ];

  await transport.sendMail({
    from: process.env.MAIL_FROM || `Site ${site.name} <no-reply@localhost>`,
    to: process.env.MAIL_TO || site.email,
    replyTo: message.email,
    subject: `[Site] ${message.subject} - ${message.name}`,
    text: lines.join('\n'),
  });
  return { sent: true };
}

module.exports = { sendContact };
