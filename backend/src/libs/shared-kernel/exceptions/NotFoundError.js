import { DomainError } from './DomainError.js';

/**
 * Error for when a requested entity is not found
 */
export class NotFoundError extends DomainError {
  /**
   * @param {string} entityType - Type of entity (e.g., 'User', 'Group')
   * @param {string} [identifier] - The identifier that was not found
   */
  constructor(entityType, identifier = null) {
    const message = identifier 
      ? `${entityType} with identifier '${identifier}' not found`
      : `${entityType} not found`;
    super(message, 'NOT_FOUND');
    this.name = 'NotFoundError';
    this.entityType = entityType;
    this.identifier = identifier;
  }
}

