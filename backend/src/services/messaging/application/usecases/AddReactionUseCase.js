import { NotFoundError } from '../../../../libs/shared-kernel/exceptions/NotFoundError.js';
import { ValidationError } from '../../../../libs/shared-kernel/exceptions/ValidationError.js';

/**
 * Use case: Add reaction to a message
 */
export class AddReactionUseCase {
  /**
   * @param {IMessageRepository} messageRepository
   */
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  /**
   * @param {Object} request
   * @param {string} request.messageId - Message ID
   * @param {string} request.userId - User ID who reacted
   * @param {string} request.emoji - Reaction emoji
   * @returns {Promise<Message>}
   * @throws {NotFoundError | ValidationError}
   */
  async execute({ messageId, userId, emoji }) {
    // Validate input
    if (!messageId || !userId || !emoji) {
      throw new ValidationError('Message ID, user ID, and emoji are required');
    }

    // Find message
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message', messageId);
    }

    // Add reaction (idempotent - won't duplicate)
    message.addReaction(userId, emoji);

    // Save updated message
    const updatedMessage = await this.messageRepository.save(message);

    return updatedMessage;
  }
}

