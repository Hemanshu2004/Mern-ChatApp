import { Message } from '../../domain/entities/Message.js';
import { MessageSent } from '../../domain/events/MessageSent.js';
import { MessageValidator } from '../../domain/services/MessageValidator.js';
import { ValidationError } from '../../../../libs/shared-kernel/exceptions/ValidationError.js';
import { eventBus } from '../../../../infrastructure/events/EventBus.js';

/**
 * Use case: Send a message
 */
export class SendMessageUseCase {
  /**
   * @param {IMessageRepository} messageRepository
   * @param {MessageValidator} messageValidator
   * @param {Function} getChannelMembers - Function to get channel members (to be injected)
   */
  constructor(messageRepository, messageValidator, getChannelMembers) {
    this.messageRepository = messageRepository;
    this.messageValidator = messageValidator;
    this.getChannelMembers = getChannelMembers;
  }

  /**
   * @param {Object} request
   * @param {string} request.channelId - Channel ID
   * @param {string} request.senderId - User ID of sender
   * @param {string} request.content - Message content
   * @param {string} [request.parentMessageId] - Parent message ID (for replies)
   * @param {string} [request.mediaUrl] - Media URL
   * @param {string} [request.mediaType] - Media type
   * @returns {Promise<Message>}
   * @throws {ValidationError}
   */
  async execute({
    channelId,
    senderId,
    content,
    parentMessageId = null,
    mediaUrl = null,
    mediaType = null,
  }) {
    // Validate input
    if (!channelId || !senderId || !content) {
      throw new ValidationError('Channel ID, sender ID, and content are required');
    }

    // Get channel members (this will be provided by infrastructure/adapter)
    const channelMembers = await this.getChannelMembers(channelId);
    if (!channelMembers || channelMembers.length === 0) {
      throw new ValidationError(`Channel ${channelId} not found or has no members`);
    }

    // Validate sender is a member
    this.messageValidator.validateCanSendMessage(senderId, channelId, channelMembers);

    // Generate message ID (will be replaced by Stream SDK)
    const messageId = `temp-${Date.now()}-${Math.random()}`;

    // Create message
    const message = new Message({
      id: messageId,
      channelId,
      senderId,
      content,
      parentMessageId,
      mediaUrl,
      mediaType,
    });

    // Save message (repository will handle Stream SDK integration)
    const savedMessage = await this.messageRepository.save(message);

    // Publish domain event
    await eventBus.publish(
      new MessageSent({
        messageId: savedMessage.id,
        channelId: savedMessage.channelId,
        senderId: savedMessage.senderId,
      })
    );

    return savedMessage;
  }
}

