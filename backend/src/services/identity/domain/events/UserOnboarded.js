/**
 * Domain event: User completed onboarding
 */
export class UserOnboarded {
  /**
   * @param {Object} params
   * @param {string} params.userId
   * @param {Date} [params.occurredAt]
   */
  constructor({ userId, occurredAt }) {
    this.type = 'UserOnboarded';
    this.aggregateId = userId;
    this.aggregateType = 'User';
    this.occurredAt = occurredAt || new Date();
    this.payload = { userId };
  }
}

