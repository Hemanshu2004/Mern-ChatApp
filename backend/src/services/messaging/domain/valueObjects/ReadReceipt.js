import { createUserId } from '../../../../libs/shared-kernel/valueObjects/UserId.js';
import { now } from '../../../../libs/shared-kernel/valueObjects/Timestamp.js';

/**
 * Read receipt value object
 * Represents when a user read a message
 */
export class ReadReceipt {
  /**
   * @param {Object} params
   * @param {string} params.userId - User who read the message
   * @param {Date} [params.readAt] - When the message was read
   */
  constructor({ userId, readAt }) {
    this._userId = createUserId(userId);
    this._readAt = readAt || now();
  }

  /** @returns {string} */
  get userId() {
    return this._userId;
  }

  /** @returns {Date} */
  get readAt() {
    return this._readAt;
  }

  /**
   * Creates from plain object
   * @param {Object} data
   * @returns {ReadReceipt}
   */
  static fromData(data) {
    return new ReadReceipt({
      userId: data.userId || data.user,
      readAt: data.readAt || data.readAt,
    });
  }

  /**
   * Converts to plain object
   * @returns {Object}
   */
  toData() {
    return {
      userId: this._userId,
      readAt: this._readAt,
    };
  }
}

