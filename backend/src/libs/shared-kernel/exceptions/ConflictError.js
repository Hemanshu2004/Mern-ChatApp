import { DomainError } from './DomainError.js';

/**
 * Error for domain conflicts (e.g., duplicate email, conflicting state)
 */
export class ConflictError extends DomainError {
  /**
   * @param {string} message - Error message
   * @param {string} [resource] - The resource that caused the conflict
   */
  constructor(message, resource = null) {
    super(message, 'CONFLICT');
    this.name = 'ConflictError';
    this.resource = resource;
  }
}

