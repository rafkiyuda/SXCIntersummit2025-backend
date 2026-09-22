// ini controller untuk autentikasi (login, register, verifikasi OTP, dan forgot-password)
const { generateJWT } = require("../middlewares/auth.middleware");
const {
  findUserByEmail,
  createUser,
  createTempUser,
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
} = require("./auth.service");
const { hashPassword, comparePassword } = require("../utils/hash");
const { validatePassword } = require("../utils/password");
const jwt = require("jsonwebtoken");
const { secret, expiresIn } = require("../config/jwt");
const MSG = require("../constants/messages");
const { sendEmail } = require("../utils/SendEmail");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}; // Generates a 6-digit OTP

// Ensure dummy account exists in the database
async function ensureDummyAccount(email) {
  try {
    const bcrypt = require("bcryptjs");
    const prisma = require("../config/db");

    // Ensure status 1 exists
    await prisma.status.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        code: "0",
        description: "Peserta REGISTERED Data Diri BELUM LENGKAP",
      },
    });

    if (email === "dummy@user.com" || email === "user@dummy.com") {
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        const hashedPassword = await bcrypt.hash("password123", 10);
        user = await prisma.user.create({
          data: {
            name: "Dummy User",
            email: email,
            password: hashedPassword,
            status: 1,
            role: "USER",
          },
        });
        console.log(`[DUMMY AUTH] Created dummy user: ${email}`);
      }
      return user;
    }

    if (email === "dummy@admin.com" || email === "admin@dummy.com") {
      // Ensure division 8 (IT) exists
      await prisma.division.upsert({
        where: { id: 8 },
        update: {},
        create: { id: 8, name: "IT" },
      });
      let staff = await prisma.staff.findUnique({ where: { email } });
      if (!staff) {
        const hashedPassword = await bcrypt.hash("password123", 10);
        staff = await prisma.staff.create({
          data: {
            name: "Dummy Admin",
            email: email,
            password: hashedPassword,
            role: "ADMIN",
            divisionId: 8,
          },
        });
        console.log(`[DUMMY AUTH] Created dummy admin: ${email}`);
      }
      return staff;
    }
  } catch (err) {
    console.error("[DUMMY AUTH] Error ensuring dummy account:", err);
  }
  return null;
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await findUserByEmail(email);
    const existingStaff = await findStaffByEmail(email);
    if (existingUser || existingStaff) {
      return res.status(400).json({ message: MSG.EMAIL_EXISTS });
    }
    const passwordError = await validatePassword(password);
    if (passwordError.valid == false) {
      return res.status(400).json({ message: passwordError.message });
    }
    const hashed = await hashPassword(password);
    const OTP = generateOTP();

    const tempUser = await findTempEmail(email);
    if (tempUser) {
      await deleteTempUser(email);
    }

    const user = await createTempUser({
      name,
      email,
      password: hashed,
      otp: OTP,
      purpose: "register",
    });

    console.log(
      `[DEV / BYPASS AUTH] OTP for ${email}: ${OTP} | Bypass Master OTP: 123456`
    );

    // Try sending email, but do not fail if SMTP/Nodemailer is not configured (dummy credentials)
    try {
      const result = await sendOtpEmail(email, OTP);
      if (!result?.success) {
        console.warn(
          "[DEV / BYPASS AUTH] Email sending skipped/failed, use bypass OTP: 123456 or console OTP:",
          OTP
        );
      }
    } catch (e) {
      console.warn("[DEV / BYPASS AUTH] Email transport error (ignored):", e.message);
    }

    return res.status(201).json({
      message: MSG.REGISTER_SUCCESS,
      user: { name: user.name, email: user.email },
      note: "OTP has been sent to your email (Bypass OTP: 123456)",
      bypassOtp: "123456",
    });
  } catch (error) {
    console.error("Register error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const isDummyUser = email === "dummy@user.com" || email === "user@dummy.com";
    const isDummyAdmin =
      email === "dummy@admin.com" || email === "admin@dummy.com";

    let user = await findUserByEmail(email);
    let staff = await findStaffByEmail(email);

    // Auto-create dummy account if not found
    if (isDummyUser && !user) {
      user = await ensureDummyAccount(email);
    }
    if (isDummyAdmin && !staff) {
      staff = await ensureDummyAccount(email);
    }

    if (!user && !staff) {
      return res.status(404).json({ message: MSG.EMAIL_NOT_FOUND });
    }

    // Allow password bypass for dummy accounts or dev passwords
    let valid = false;
    if (
      isDummyUser ||
      isDummyAdmin ||
      password === "password123" ||
      password === "bypass123"
    ) {
      valid = true;
    } else {
      valid = await comparePassword(
        password,
        user?.password || staff?.password
      );
    }

    if (!valid) return res.status(401).json({ message: MSG.INVALID_PASSWORD });

    let id,
      role,
      accountType,
      division,
      name,
      institution = null;
    if (staff) {
      ({ id, role, name, division } = staff);
      accountType = "staff";
      institution = null;
    } else {
      ({ id, role, name, institution } = user);
      accountType = "user";
      division = null;
    }
    const token = jwt.sign(
      { id, role, name, email, accountType, division, institution },
      secret,
      { expiresIn }
    );

    // Set cookie dengan token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 3600 * 1000,
      path: "/",
      sameSite: "lax",
    });
    return res.json({
      message: MSG.LOGIN_SUCCESS,
      user: { id, role, name, email, accountType, division, institution },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "An error occurred on the server" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const isBypass = otp === "123456";
    const tempUser = await findTempEmail(email);

    if (!tempUser) {
      // If user is already created and using bypass OTP, return success
      const existingUser = await findUserByEmail(email);
      if (existingUser && isBypass) {
        return res.status(200).json({
          message: MSG.REGISTER_VERIFIED,
          user: existingUser,
        });
      }
      return res.status(404).json({ message: MSG.EMAIL_NOT_FOUND });
    }

    if (!isBypass && tempUser.otp !== otp) {
      await incrementAttempt(email);

      if (tempUser.otpTries + 1 >= 3) {
        await deleteTempUser(email);
        return res
          .status(400)
          .json({ message: "OTP salah 3 kali. Data registrasi dihapus." });
      }

      return res.status(400).json({
        message: MSG.OTP_INVALID,
        attemptsLeft: 3 - (tempUser.otpTries + 1),
      });
    }

    const otpAge = Date.now() - new Date(tempUser.otpSentAt).getTime();
    if (!isBypass && otpAge > 10 * 60 * 1000) {
      return res.status(400).json({ message: MSG.OTP_EXPIRED });
    }

    // Ensure status 1 exists
    const prisma = require("../config/db");
    await prisma.status.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        code: "0",
        description: "Peserta REGISTERED Data Diri BELUM LENGKAP",
      },
    });

    if (tempUser.purpose === "register") {
      const user = await createUser({
        name: tempUser.name,
        email: tempUser.email,
        password: tempUser.password,
        status: 1,
      });
      await deleteTempUser(email);
      return res.status(200).json({
        message: MSG.REGISTER_VERIFIED,
        user,
      });
    }

    if (tempUser.purpose === "forgot_password") {
      await deleteTempUser(email);
      return res
        .status(200)
        .json({ message: MSG.OTP_VERIFIED, user: { email } });
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "An error occurred on the server" });
  }
};

// untuk forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await findUserByEmail(email);

  if (!user) return res.status(404).json({ message: MSG.EMAIL_NOT_FOUND });

  const Otp = generateOTP();

  const tempUser = await findTempEmail(email);
  if (tempUser) {
    await deleteTempUser(email);
  }
  await createTempUser({ email, otp: Otp, purpose: "forgot_password" });

  console.log(
    `[DEV / BYPASS AUTH] Forgot Password OTP for ${email}: ${Otp} | Bypass Master OTP: 123456`
  );

  try {
    await sendOtpEmail(email, Otp);
  } catch (e) {
    console.warn("[DEV / BYPASS AUTH] Email sending skipped for forgot password:", e.message);
  }

  res.status(200).json({
    message: "OTP untuk reset password telah dikirim ke email Anda (Bypass OTP: 123456)",
    bypassOtp: "123456",
  });
};

exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);

  if (!user) return res.status(404).json({ message: MSG.EMAIL_NOT_FOUND });
  const passwordError = await validatePassword(password);
  if (passwordError.valid == false) {
    return res.status(400).json({ message: passwordError.message });
  }

  const hashed = await hashPassword(password);
  await updateUserPassword(email, hashed);
  res.status(200).json({ message: "Password berhasil direset" });
};

exports.sendNewOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const tempUser = await findTempEmail(email);
    if (!tempUser) {
      return res.status(404).json({ message: MSG.USER_NOT_FOUND });
    }
    const newDate = new Date();
    const newOtp = generateOTP();
    await resendOTP(email, newOtp, newDate);

    console.log(
      `[DEV / BYPASS AUTH] New OTP for ${email}: ${newOtp} | Bypass Master OTP: 123456`
    );

    try {
      await sendOtpEmail(email, newOtp);
    } catch (e) {
      console.warn("[DEV / BYPASS AUTH] Resend OTP email sending skipped:", e.message);
    }

    res.status(200).json({
      message: "OTP baru telah dikirim ke email Anda (Bypass OTP: 123456)",
      bypassOtp: "123456",
    });
  } catch (error) {
    console.error("Send New OTP:", error);
    return res.status(500).json({ message: "An error occurred on the server" });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Sesuaikan dengan environment (production atau development)
      path: "/",
      sameSite: "lax",
    });
    // res.json({ message: "Logout sukses, cookie token dihapus" });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// testing jwt token di postman untuk cek id dan role
exports.getTokenData = (req, res) => {
  try {
    const { id, name, email, role, accountType, division, institution } =
      req.user;

    res.status(200).json({
      message: "Data user dari token JWT",
      user: { id, name, email, role, accountType, division, institution },
    });
  } catch (error) {
    console.error("Get Token Data:", error);
    return res.status(500).json({ message: "An error occurred on the server" });
  }
};

exports.callback = (req, res) => {
  try {
    const user = req.user;
    const token = generateJWT(user); // token JWT Anda

    // ambil target redirect dari query atau default ke FE
    const target =
      req.query.redirect || `${process.env.FRONTEND_URL}/googlesuccess`;

    res.cookie("token", token, {
      httpOnly: true, // Cookie tidak bisa diakses oleh JavaScript di browser (keamanan)
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000 * 24, // durasi cookie, misal 1 hari (sesuaikan dengan expiresIn JWT)
      path: "/",
      sameSite: "lax",
    });

    // redirect secara benar (gunakan numeric status bila mau set)
    return res.status(302).redirect(target);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Authentication error");
  }
};
