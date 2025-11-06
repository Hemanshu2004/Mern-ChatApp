import { ValidationError } from '../../../../libs/shared-kernel/exceptions/ValidationError.js';

/**
 * Domain service for message validation
 */
export class MessageValidator {
  /**
   * Validates that a user can send a message to a channel
   * @param {string} userId - User attempting to send
   * @param {string} channelId - Channel ID
   * @param {string[]} channelMembers - List of member IDs in the channel
   * @throws {ValidationError} If user is not a member
   */
  validateCanSendMessage(userId, channelId, channelMembers) {
    if (!channelMembers.includes(userId)) {
      throw new ValidationError(
        `User ${userId} is not a member of channel ${channelId}`
      );
    }
  }

  /**
   * Validates that a user can read messages from a channel
   * @param {string} userId - User attempting to read
   * @param {string} channelId - Channel ID
   * @param {string[]} channelMembers - List of member IDs in the channel
   * @throws {ValidationError} If user is not a member
   */
  validateCanReadMessage(userId, channelId, channelMembers) {
    if (!channelMembers.includes(userId)) {
      throw new ValidationError(
        `User ${userId} is not a member of channel ${channelId}`
      );
    }
  }
}

