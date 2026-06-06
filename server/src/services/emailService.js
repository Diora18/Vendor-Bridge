const nodemailer = require('nodemailer');
const env = require('../config/env');

const isEmailConfigured = () => Boolean(env.email.user && env.email.pass);

const createTransport = () => {
  if (!isEmailConfigured()) return null;

  return nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.secure,
    auth: {
      user: env.email.user,
      pass: env.email.pass
    },
    tls: env.email.port === 587 ? { rejectUnauthorized: false } : undefined
  });
};

const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  if (!isEmailConfigured()) {
    const error = new Error('Email is not configured. Set EMAIL_USER and EMAIL_PASS in server/.env');
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  const transport = createTransport();
  const info = await transport.sendMail({
    from: env.email.from,
    to,
    subject,
    html,
    text,
    attachments
  });

  if (env.nodeEnv === 'development') {
    console.log(`[email] Sent to ${to}: ${subject}`);
    if (info.messageId) console.log(`[email] Message ID: ${info.messageId}`);
  }

  return {
    sent: true,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected
  };
};

module.exports = { sendEmail, isEmailConfigured };
