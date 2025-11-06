import bcrypt from 'bcryptjs';
import { createPassword } from '../../../../libs/shared-kernel/valueObjects/Password.js';

/**
 * Domain service for password hashing and verification
 */
export class PasswordHasher {
  /**
   * Hashes a password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hash(password) {
    const validatedPassword = createPassword(password);
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(validatedPassword, salt);
  }

  /**
   * Verifies a password against a hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  async verify(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

