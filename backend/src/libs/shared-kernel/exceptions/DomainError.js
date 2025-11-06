/**
 * Base domain error class
 * All domain-specific errors should extend this
 */
export class DomainError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} [code] - Error code for programmatic handling
   */
  constructor(message, code = 'DOMAIN_ERROR') {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

