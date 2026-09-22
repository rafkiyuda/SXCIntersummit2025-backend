const prisma = require("../config/db");
const messages = require("../constants/messages");
const verif = prisma.pendingUserVerification;
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/SendEmail");
const { composeEmail } = require("../constants/email");
const JWT_SECRET = process.env.JWT_SECRET;

async function findUserByEmail(email) {
  return await prisma.user.findUnique({ where: { email } });
}

async function findStaffByEmail(email) {
  return await prisma.staff.findUnique({ where: { email } });
}

async function findTempEmail(email) {
  return await prisma.pendingUserVerification.findUnique({ where: { email } });
}

async function createTempUser(data) {
  return await prisma.pendingUserVerification.create({ data });
}

async function createUser(data) {
  return await prisma.user.create({ data });
}

async function sendOtpEmail(email, otp) {
  const html = await composeEmail({
    title: "Your OTP Code",
    bodyBlocks: [
      {
        type: "otp",
        text: `<strong>${otp}</strong>`,
      },
      {
        type: "paragraph",
        text: "Silakan masukkan kode ini untuk melanjutkan proses verifikasi.",
      },
    ],
  });
  const result = await sendEmail(email, "Kode OTP Anda", html);
  return result;
}

async function resendOTP(email, newOtp, newDate) {
  return await prisma.pendingUserVerification.update({
    where: {
      email: email,
    },
    data: {
      otp: newOtp,
      otpSentAt: newDate,
    },
  });
}

async function incrementAttempt(email) {
  return await verif.update({
    where: { email },
    data: {
      otpTries: { increment: 1 },
    },
  });
}

async function deleteTempUser(email) {
  return await verif.delete({
    where: { email },
  });
}

async function updateTempUser(email, data) {
  return await verif.update({
    where: { email },
    data,
  });
}

async function updateUserPassword(email, hashedPassword) {
  return await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
}

async function findReferralCode(code) {
  if (!code || code.trim() === "" || code === "") {
    return { valid: false, message: messages.INVALID_REFERRAL };
  }
  return prisma.referral.findUnique({
    where: { code: code },
  });
}

async function verifyReferralCode(code) {
  if (!code || code.trim() === "" || code === "") {
    return { valid: false, message: messages.INVALID_REFERRAL };
  }

  const referral = await prisma.referral.findUnique({
    where: { code },
  });

  if (!referral) {
    return { valid: false, message: messages.INVALID_REFERRAL };
  }

  return { valid: true, data: referral };
}

async function addTokenToBlacklist(token) {
  try {
    // Decoding token tanpa verifikasi untuk ambil expiry
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      throw new Error("Invalid token: cannot find exp claim");
    }
    const existToken = await prisma.blacklist.findUnique({
      where: { token },
    });
    if (existToken) {
      return { success: false, message: "Token already blacklisted" };
    }
    // Convert exp (Unix timestamp) ke Date object
    const expiresAt = new Date(Date.now() + 60 * 1000);

    await prisma.blacklist.create({
      data: {
        token,
        expiresAt,
      },
    });
  } catch (error) {
    console.error("Failed to add token to blacklist:", error);
  }
}

module.exports = {
  findUserByEmail,
  createTempUser,
  createUser,
  findTempEmail,
  sendOtpEmail,
  resendOTP,
  incrementAttempt,
  deleteTempUser,
  updateTempUser,
  findStaffByEmail,
  updateUserPassword,
  verifyReferralCode,
  findReferralCode,
  addTokenToBlacklist,
};
