import { MessageDeleted } from '../../domain/events/MessageDeleted.js';
import { NotFoundError } from '../../../../libs/shared-kernel/exceptions/NotFoundError.js';
import { ValidationError } from '../../../../libs/shared-kernel/exceptions/ValidationError.js';
import { eventBus } from '../../../../infrastructure/events/EventBus.js';

/**
 * Use case: Delete a message
 */
export class DeleteMessageUseCase {
  /**
   * @param {IMessageRepository} messageRepository
   */
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  /**
   * @param {Object} request
   * @param {string} request.messageId - Message ID
   * @param {string} request.userId - User ID attempting to delete
   * @returns {Promise<void>}
   * @throws {NotFoundError | ValidationError | UnauthorizedError}
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

    // Delete message (domain rule: only sender can delete)
    message.delete(userId);

    // Save updated message (marked as deleted)
    const deletedMessage = await this.messageRepository.save(message);

    // Publish domain event
    await eventBus.publish(
      new MessageDeleted({
        messageId: deletedMessage.id,
        channelId: deletedMessage.channelId,
        senderId: deletedMessage.senderId,
      })
    );
  }
}

