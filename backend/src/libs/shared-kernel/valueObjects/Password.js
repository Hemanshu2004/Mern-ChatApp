/**
 * @typedef {string} Password
 * 
 * Password value object representing a user password.
 * Enforces minimum security requirements.
 */

const MIN_PASSWORD_LENGTH = 6;

/**
 * Creates a Password value object
 * @param {string} password - The password string
 * @returns {Password}
 * @throws {Error} If password doesn't meet requirements
 */
export function createPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }

  return password;
}

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password must be a non-empty string' };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { 
      valid: false, 
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` 
    };
  }

  return { valid: true };
}

