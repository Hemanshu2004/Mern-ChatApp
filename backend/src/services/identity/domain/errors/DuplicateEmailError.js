import { ConflictError } from '../../../../libs/shared-kernel/exceptions/ConflictError.js';

/**
 * Error thrown when attempting to register with an existing email
 */
export class DuplicateEmailError extends ConflictError {
  /**
   * @param {string} email
   */
  constructor(email) {
    super(`Email '${email}' is already registered`, 'email');
    this.name = 'DuplicateEmailError';
    this.email = email;
  }
}

