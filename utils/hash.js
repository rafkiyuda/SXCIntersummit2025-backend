const bcrypt = require("bcryptjs");

/**
 * Hash plain password
 * @param {string} plain
 * @returns {Promise<string>} hashed password
 */
exports.hashPassword = async (plain) => {
  return await bcrypt.hash(plain, 12);
};

/**
 * Compare plain password with hashed
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
exports.comparePassword = async (plain, hash) => {
  return await bcrypt.compare(plain, hash);
};
