const prisma = require("../config/db");
const jwt = require("jsonwebtoken");
const { secret } = require("../config/jwt");

async function authenticate(req, res, next) {
  try {
    // Ambil token dari header Authorization (Bearer ...) atau dari cookie 'token'
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Token cookie missing" });
    }

    const blacklisted = await prisma.blacklist.findUnique({ where: { token } });

    if (blacklisted) {
      if (new Date() > blacklisted.expiresAt) {
        await prisma.blacklist.delete({ where: { token } });
        return res
          .status(401)
          .json({ message: "Token expired and removed from blacklist" });
      }
      return res.status(401).json({ message: "Token revoked (blacklisted)" });
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Authenticate Middleware Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function verifyProfile(req, res, next) {
  try {
    const user = req.user.id;
    const existUser = await prisma.user.findUnique({
      where: { id: user },
      select: {
        name: true,
        email: true,
        birthdate: true,
        domicile: true,
        institution: true,
        institution_name: true,
        major: true,
        wa_number: true,
        line_id: true,
        insta_acc: true,
        Submission: {
          where: { type: "IDCARD" },
          select: {
            Files: {
              select: {
                filePath: true,
              },
            },
          },
        },
      },
    });

    if (!existUser) {
      res.status(404).json({ message: "user not found" });
    }

    const allGood = Object.values(existUser).every(
      (value) => value !== null && value !== undefined
    );

    if (!allGood) {
      return res.status(400).json({ message: "User profile not complete" });
    }

    // Jika semua lengkap, lanjutkan ke middleware berikutnya
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function generateJWT(user) {
  const payload = {
    id: user.id,
    name: user.name,
    role: user.role,
    institution: user.institution,
    accountType: "user",
    division: null,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
}

function sendJWT(req, res) {
  if (!req.user)
    return res.status(401).json({ message: "User not authenticated" });

  const token = generateJWT(req.user);
  // Bisa kirim JSON langsung
  return res.json({ token });

  // Atau jika ingin redirect frontend dengan token di URL
  // return res.redirect(`http://frontend-app.com/login?token=${token}`);
}

module.exports = { authenticate, verifyProfile, sendJWT, generateJWT };
