/**
 * Domain event: User registered
 */
export class UserRegistered {
  /**
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} params.email
   * @param {Date} [params.occurredAt]
   */
  constructor({ userId, email, occurredAt }) {
    this.type = 'UserRegistered';
    this.aggregateId = userId;
    this.aggregateType = 'User';
    this.occurredAt = occurredAt || new Date();
    this.payload = { userId, email };
  }
}

