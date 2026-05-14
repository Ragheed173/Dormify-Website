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
const sendPasswordChangeEmail = async ({ email, name, changeUrl }) => {
  if (!transporter) {
    const err = new Error("EMAIL_NOT_CONFIGURED");
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }

  const mailOptions = {
    from,
    to: email,
    subject: "Dormify — confirm password change",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 560px;">
        <h1 style="font-size: 20px;">Password change request</h1>
        <p>Hi ${name || "there"},</p>
        <p>We received a request to change the password for your Dormify account. Click the button below to choose a new password. This link expires in one hour.</p>
        <p style="margin: 24px 0;">
          <a href="${changeUrl}" style="background: #0d6efd; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">Change my password</a>
        </p>
        <p style="font-size: 13px; color: #666;">If you did not request this, you can ignore this email. Your password will stay the same.</p>
        <p style="font-size: 12px; color: #999; word-break: break-all;">If the button does not work, copy this link into your browser:<br/>${changeUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 14px;"><strong>طلب تغيير كلمة المرور</strong></p>
        <p>وصلنا طلبًا لتغيير كلمة مرور حسابك على Dormify. اضغط الزر أعلاه لاختيار كلمة مرور جديدة (الرابط صالح لمدة ساعة).</p>
        <p style="font-size: 13px; color: #666;">إذا لم تطلب ذلك، تجاهل هذه الرسالة.</p>
        <p>Best regards,<br/>Dormify</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
module.exports = {
  sendWelcomeEmail,
  sendPasswordChangeEmail,
};
