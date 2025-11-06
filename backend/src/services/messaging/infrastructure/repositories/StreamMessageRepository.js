import { IMessageRepository } from '../../domain/repositories/IMessageRepository.js';
import { Message } from '../../domain/entities/Message.js';
import { StreamChatAdapter } from '../adapters/StreamChatAdapter.js';
import { NotFoundError } from '../../../../libs/shared-kernel/exceptions/NotFoundError.js';

/**
 * Stream Chat SDK implementation of IMessageRepository
 */
export class StreamMessageRepository extends IMessageRepository {
  /**
   * @param {StreamChatAdapter} streamAdapter - Stream adapter
   * @param {string} channelType - Stream channel type (default: 'messaging')
   */
  constructor(streamAdapter, channelType = 'messaging') {
    super();
    this.streamAdapter = streamAdapter;
    this.channelType = channelType;
  }

  /**
   * @param {string} messageId
   * @returns {Promise<Message | null>}
   */
  async findById(messageId) {
    try {
      // Stream SDK doesn't have a direct findById, so we need to search channels
      // This is a limitation - in production, you might want to cache message-channel mapping
      // For now, we'll return null and let the caller handle it
      return null;
    } catch (error) {
      console.error('Error finding message by ID:', error);
      return null;
    }
  }

  /**
   * @param {string} channelId - Channel ID (may include type prefix)
   * @param {Object} [options]
   * @returns {Promise<Message[]>}
   */
  async findByChannel(channelId, options = {}) {
    try {
      // Parse channel ID (might be messaging:channelId or just channelId)
      const parts = channelId.split(':');
      const channelType = parts.length > 1 ? parts[0] : this.channelType;
      const actualChannelId = parts.length > 1 ? parts.slice(1).join(':') : parts[0];

      const channel = await this.streamAdapter.getOrCreateChannel(
        channelType,
        actualChannelId
      );

      const limit = options.limit || 50;
      const before = options.before;

      const response = await channel.query({
        messages: { limit, ...(before && { id_lt: before }) },
      });

      const messages = response.messages || [];
      return messages.map(msg => this.streamAdapter.toDomainMessage(msg));
    } catch (error) {
      console.error('Error finding messages by channel:', error);
      return [];
    }
  }

  /**
   * @param {Message} message
   * @returns {Promise<Message>}
   */
  async save(message) {
    try {
      // Parse channel ID (might be messaging:channelId or just channelId)
      const channelIdParts = message.channelId.split(':');
      const channelType = channelIdParts.length > 1 ? channelIdParts[0] : this.channelType;
      const actualChannelId = channelIdParts.length > 1 ? channelIdParts.slice(1).join(':') : channelIdParts[0];

      const channel = await this.streamAdapter.getOrCreateChannel(
        channelType,
        actualChannelId
      );

      const streamMessage = this.streamAdapter.toStreamMessage(message);

      // If message ID starts with 'temp-', it's a new message
      if (message.id.startsWith('temp-')) {
        // Send new message
        const response = await channel.sendMessage(streamMessage);
        return this.streamAdapter.toDomainMessage(response.message);
      } else {
        // Update existing message
        const response = await channel.updateMessage(message.id, streamMessage);
        return this.streamAdapter.toDomainMessage(response.message);
      }
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  /**
   * @param {string} messageId
   * @returns {Promise<void>}
   */
  async delete(messageId) {
    try {
      // Stream SDK doesn't have a direct delete by ID
      // We need to find the channel first (limitation)
      // For now, we'll mark as deleted in the save method
      throw new Error('Delete by ID not directly supported - use save() with deleted message');
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
}

