const MSG = require("../constants/messages");

/**
 * Validate password strength
 * @param {string} password
 * @returns {Object} { valid: boolean, message?: string }
 */
exports.validatePassword = async (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: MSG.PASSWORD_TOO_SHORT };
  }
  if (!hasUppercase) {
    return { valid: false, message: MSG.PASSWORD_NO_UPPERCASE };
  }
  if (!hasLowercase) {
    return { valid: false, message: MSG.PASSWORD_NO_LOWERCASE };
  }
  if (!hasNumber) {
    return { valid: false, message: MSG.PASSWORD_NO_NUMBER };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: MSG.PASSWORD_NO_SPECIAL_CHAR };
  }

  return { valid: true };
};
