import { MessageEdited } from '../../domain/events/MessageEdited.js';
import { NotFoundError } from '../../../../libs/shared-kernel/exceptions/NotFoundError.js';
import { ValidationError } from '../../../../libs/shared-kernel/exceptions/ValidationError.js';
import { eventBus } from '../../../../infrastructure/events/EventBus.js';

/**
 * Use case: Edit a message
 */
export class EditMessageUseCase {
  /**
   * @param {IMessageRepository} messageRepository
   */
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  /**
   * @param {Object} request
   * @param {string} request.messageId - Message ID
   * @param {string} request.userId - User ID attempting to edit
   * @param {string} request.newContent - New message content
   * @returns {Promise<Message>}
   * @throws {NotFoundError | ValidationError | UnauthorizedError}
   */
  async execute({ messageId, userId, newContent }) {
    // Validate input
    if (!messageId || !userId || !newContent) {
      throw new ValidationError('Message ID, user ID, and new content are required');
    }

    // Find message
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message', messageId);
    }

    // Edit message (domain rule: only sender can edit)
    message.edit(userId, newContent);

    // Save updated message
    const updatedMessage = await this.messageRepository.save(message);

    // Publish domain event
    await eventBus.publish(
      new MessageEdited({
        messageId: updatedMessage.id,
        channelId: updatedMessage.channelId,
        senderId: updatedMessage.senderId,
      })
    );

    return updatedMessage;
  }
}

