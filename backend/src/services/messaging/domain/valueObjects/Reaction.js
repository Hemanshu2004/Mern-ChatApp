import { createUserId } from '../../../../libs/shared-kernel/valueObjects/UserId.js';
import { now } from '../../../../libs/shared-kernel/valueObjects/Timestamp.js';

/**
 * Valid reaction emojis
 */
export const VALID_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

/**
 * Reaction value object
 * Represents a user's reaction to a message
 */
export class Reaction {
  /**
   * @param {Object} params
   * @param {string} params.userId - User who reacted
   * @param {string} params.emoji - Reaction emoji
   * @param {Date} [params.reactedAt] - When the reaction was added
   */
  constructor({ userId, emoji, reactedAt }) {
    this._userId = createUserId(userId);
    this._validateEmoji(emoji);
    this._emoji = emoji;
    this._reactedAt = reactedAt || now();
  }

  /**
   * Validates emoji
   * @private
   */
  _validateEmoji(emoji) {
    if (!VALID_REACTIONS.includes(emoji)) {
      throw new Error(`Invalid reaction emoji: ${emoji}. Must be one of: ${VALID_REACTIONS.join(', ')}`);
    }
  }

  /** @returns {string} */
  get userId() {
    return this._userId;
  }

  /** @returns {string} */
  get emoji() {
    return this._emoji;
  }

  /** @returns {Date} */
  get reactedAt() {
    return this._reactedAt;
  }

  /**
   * Creates from plain object
   * @param {Object} data
   * @returns {Reaction}
   */
  static fromData(data) {
    return new Reaction({
      userId: data.userId || data.user,
      emoji: data.emoji,
      reactedAt: data.reactedAt || data.createdAt,
    });
  }

  /**
   * Converts to plain object
   * @returns {Object}
   */
  toData() {
    return {
      userId: this._userId,
      emoji: this._emoji,
      reactedAt: this._reactedAt,
    };
  }
}

