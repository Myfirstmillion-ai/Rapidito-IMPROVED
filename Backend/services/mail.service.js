const { createTransport } = require("nodemailer");

// Configuración para Gridsend SMTP
const transport = createTransport({
  host: process.env.SMTP_HOST || "smtp.gridsend.co",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  try {
    const info = await transport.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to,
      subject,
      html,
    });
    console.log("Email enviado:", info);
    return info;
  } catch (error) {
    console.error("Error enviando email:", error);
    throw error;
  }
};

module.exports = {
  sendMail,
};
