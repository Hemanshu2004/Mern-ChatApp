import { DomainError } from './DomainError.js';

/**
 * Validation error for invalid input or domain rule violations
 */
export class ValidationError extends DomainError {
  /**
   * @param {string} message - Error message
   * @param {Object} [details] - Additional validation details
   */
  constructor(message, details = {}) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.details = details;
  }
}

