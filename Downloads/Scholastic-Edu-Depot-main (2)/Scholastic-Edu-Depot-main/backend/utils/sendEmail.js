const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Basic validation: if SMTP settings are missing, skip sending and log a warning.
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_EMAIL', 'SMTP_PASSWORD', 'FROM_EMAIL', 'FROM_NAME'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.warn(`SMTP not configured (missing: ${missing.join(', ')}). Skipping sending email to ${options.email}.`);
    return { ok: false, reason: 'smtp_not_configured' };
  }

  try {
    // Create a transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 465,
      secure: String(process.env.SMTP_PORT) === '465', // true for 465
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Define email options
    const message = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html // HTML supported
    };

    // Send the email; catch errors to avoid bubbling up and breaking flows like registration
    const info = await transporter.sendMail(message);
    console.log('Email sent to %s (messageId: %s)', options.email, info.messageId);
    return { ok: true, info };
  } catch (err) {
    console.error('Error sending email to %s: %o', options.email, err);
    // Return failure details but do not throw to prevent higher-level 500s during registration
    return { ok: false, reason: 'send_failed', error: err.message || String(err) };
  }
};

module.exports = sendEmail;