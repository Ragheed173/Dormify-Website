const nodemailer = require('nodemailer');

const host = process.env.EMAIL_HOST;
const port = Number(process.env.EMAIL_PORT) || 587;
const secure = process.env.EMAIL_SECURE === 'true';
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const from = process.env.EMAIL_FROM || `Dormify <noreply@${host || 'dormify.com'}>`;

let transporter = null;
if (host && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
} else {
  console.warn('Email service is not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS to enable sending emails.');
}

const sendWelcomeEmail = async (user) => {
  if (!transporter) {
    console.warn(`Skipping welcome email for ${user.email}: email service not configured.`);
    return;
  }

  const mailOptions = {
    from,
    to: user.email,
    subject: 'Welcome to Dormify!',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1>Welcome to Dormify, ${user.name}!</h1>
        <p>Thank you for joining Dormify. We are excited to help you find the best student housing options.</p>
        <p>Start exploring listings now and book your next accommodation with confidence.</p>
        <p>Best regards,<br/>The Dormify Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendWelcomeEmail,
};
