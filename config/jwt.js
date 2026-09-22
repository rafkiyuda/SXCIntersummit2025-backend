    module.exports = {
        secret: process.env.JWT_SECRET || "default-secret", //sxcinter25{summit}
        expiresIn: process.env.JWT_EXPIRES_IN || "1D", //Token Expired 1 hari
    };
