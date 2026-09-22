const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const prisma = require("../config/db");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
      accessType: "offline", // Penting untuk dapat refresh token
      prompt: "consent", // Memaksa tampilan consent screen tiap login
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/drive.file", // akses upload file ke Drive
        "https://www.googleapis.com/auth/drive.metadata", // akses metadata folder
      ],
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const email = profile.emails[0].value;

        // Cek apakah user sudah ada
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          // Buat user baru
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              name: profile.displayName,
              email,
              password: "google", // placeholder
              role: "USER", // default role
              refreshToken: refreshToken, // simpan refresh token
            },
          });
        }
        console.log("Access Token:", accessToken);
        console.log("Refresh Token:", refreshToken);
        return done(null, user); // JWT akan diproses di /google/callback
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
