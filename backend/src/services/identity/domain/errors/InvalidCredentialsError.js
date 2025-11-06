import { ValidationError } from '../../../../libs/shared-kernel/exceptions/ValidationError.js';

/**
 * Error thrown when login credentials are invalid
 */
export class InvalidCredentialsError extends ValidationError {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

