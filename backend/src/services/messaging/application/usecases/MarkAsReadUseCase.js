import { MessageRead } from '../../domain/events/MessageRead.js';
import { NotFoundError } from '../../../../libs/shared-kernel/exceptions/NotFoundError.js';
import { ValidationError } from '../../../../libs/shared-kernel/exceptions/ValidationError.js';
import { eventBus } from '../../../../infrastructure/events/EventBus.js';

/**
 * Use case: Mark message as read
 */
export class MarkAsReadUseCase {
  /**
   * @param {IMessageRepository} messageRepository
   */
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  /**
   * @param {Object} request
   * @param {string} request.messageId - Message ID
   * @param {string} request.userId - User ID who read the message
   * @returns {Promise<Message>}
   * @throws {NotFoundError | ValidationError}
   */
  async execute({ messageId, userId }) {
    // Validate input
    if (!messageId || !userId) {
      throw new ValidationError('Message ID and user ID are required');
    }

    // Find message
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message', messageId);
    }

    // Mark as read (idempotent - won't duplicate if already read)
    message.markAsRead(userId);

    // Save updated message
    const updatedMessage = await this.messageRepository.save(message);

    // Publish domain event
    await eventBus.publish(
      new MessageRead({
        messageId: updatedMessage.id,
        channelId: updatedMessage.channelId,
        userId,
      })
    );

    return updatedMessage;
  }
}

