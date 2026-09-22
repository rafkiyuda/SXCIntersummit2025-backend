const mail = require("nodemailer");

const isDummyEmailConfig =
  !process.env.EMAIL_USER ||
  process.env.EMAIL_USER.includes("dummy") ||
  !process.env.EMAIL_PASS ||
  process.env.EMAIL_PASS.includes("dummy");

const transporter = mail.createTransport({
  host: "mail.yusufghazali.com",
  port: 465,
  secure: true,
  connectionTimeout: 3000,
  greetingTimeout: 3000,
  socketTimeout: 3000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Fungsi umum kirim email
 */
async function sendEmail(to, subject, html) {
  // If dummy credentials configured in .env, simulate email sending instantly
  if (isDummyEmailConfig || to.includes("dummy") || to.includes("example.com")) {
    console.log(`[EMAIL SIMULATOR] Email to ${to} simulated successfully: "${subject}"`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"SxCInterSummit2025" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Gagal kirim email:", error.message || error);
    return { success: false, error };
  }
}

/**
 * Fungsi kirim OTP email
 */
async function sendOtpEmail(email, otp) {
  const html = `<p>Kode OTP Anda adalah: <strong>${otp}</strong></p>`;
  return await sendEmail(email, "Kode OTP Anda", html);
}

module.exports = {
  sendEmail,
  sendOtpEmail,
};
