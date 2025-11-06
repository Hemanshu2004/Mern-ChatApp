/**
 * @typedef {string} Email
 * 
 * Email value object representing a valid email address.
 * Enforces email format validation.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Creates an Email value object
 * @param {string} email - The email address string
 * @returns {Email}
 * @throws {Error} If email format is invalid
 */
export function createEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('Email must be a non-empty string');
  }

  const trimmedEmail = email.trim().toLowerCase();
  
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    throw new Error('Invalid email format');
  }

  return trimmedEmail;
}

/**
 * Validates an email format
 * @param {string} email - The email to validate
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

