import { DomainError } from './DomainError.js';

/**
 * Error for unauthorized access attempts
 */
export class UnauthorizedError extends DomainError {
  /**
   * @param {string} [message] - Error message
   * @param {string} [action] - The action that was attempted
   */
  constructor(message = 'Unauthorized', action = null) {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
    this.action = action;
  }
}

