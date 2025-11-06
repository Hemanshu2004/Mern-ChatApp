import { Message } from '../../domain/entities/Message.js';
import { createChannelId } from '../../domain/valueObjects/ChannelId.js';

/**
 * Anti-corruption layer for Stream Chat SDK
 * Converts between Stream SDK format and domain models
 */
export class StreamChatAdapter {
  /**
   * @param {StreamChat} streamClient - Stream Chat client instance
   */
  constructor(streamClient) {
    if (!streamClient) {
      throw new Error('StreamChatAdapter requires a Stream Chat client instance');
    }
    this.streamClient = streamClient;
  }

  /**
   * Converts Stream message to domain Message
   * @param {Object} streamMessage - Stream SDK message object
   * @returns {Message}
   */
  toDomainMessage(streamMessage) {
    // Extract read receipts from Stream format
    const readReceipts = [];
    if (streamMessage.read) {
      Object.entries(streamMessage.read).forEach(([userId, readData]) => {
        readReceipts.push({
          userId,
          readAt: readData.read_at || new Date(),
        });
      });
    }

    // Extract reactions from Stream format
    const reactions = [];
    if (streamMessage.reaction_counts) {
      Object.entries(streamMessage.reaction_counts).forEach(([emoji, userMap]) => {
        Object.keys(userMap).forEach(userId => {
          reactions.push({
            userId,
            emoji,
            reactedAt: streamMessage.reactions?.[emoji]?.[userId]?.created_at || new Date(),
          });
        });
      });
    }

    // Extract attachments
    const attachments = streamMessage.attachments || [];
    const mediaUrl = attachments[0]?.asset_url || null;
    const mediaType = attachments[0]?.type || null;

    return Message.fromData({
      id: streamMessage.id,
      channelId: streamMessage.cid,
      senderId: streamMessage.user?.id || streamMessage.user_id,
      content: streamMessage.text || streamMessage.content || '',
      parentMessageId: streamMessage.parent_id,
      mediaUrl,
      mediaType,
      readReceipts,
      reactions,
      createdAt: new Date(streamMessage.created_at),
      updatedAt: new Date(streamMessage.updated_at || streamMessage.created_at),
      isEdited: streamMessage.updated_at && streamMessage.updated_at !== streamMessage.created_at,
      isDeleted: streamMessage.deleted_at !== null,
    });
  }

  /**
   * Converts domain Message to Stream format
   * @param {Message} message - Domain message
   * @returns {Object} Stream message format
   */
  toStreamMessage(message) {
    return {
      id: message.id,
      text: message.content,
      user_id: message.senderId,
      parent_id: message.parentMessageId,
      attachments: message.mediaUrl ? [{
        type: message.mediaType || 'image',
        asset_url: message.mediaUrl,
      }] : [],
    };
  }

  /**
   * Gets channel members
   * @param {string} channelId - Channel ID (format: messaging:channelId or just channelId)
   * @returns {Promise<string[]>} Array of user IDs
   */
  async getChannelMembers(channelId) {
    try {
      // Channel ID might be prefixed with type or not
      const parts = channelId.split(':');
      const channelType = parts.length > 1 ? parts[0] : 'messaging';
      const actualChannelId = parts.length > 1 ? parts.slice(1).join(':') : parts[0];
      
      const channel = this.streamClient.channel(channelType, actualChannelId);
      await channel.watch();
      const members = Object.values(channel.state.members || {});
      return members.map(m => m.user?.id || m.user_id).filter(Boolean);
    } catch (error) {
      console.error('Error getting channel members:', error);
      return [];
    }
  }

  /**
   * Creates or gets a channel
   * @param {string} channelType - Channel type (e.g., 'messaging')
   * @param {string} channelId - Channel ID (without type prefix)
   * @param {Object} [options] - Channel options (members, etc.)
   * @returns {Promise<Object>} Stream channel
   */
  async getOrCreateChannel(channelType, channelId, options = {}) {
    const channel = this.streamClient.channel(channelType, channelId, options);
    await channel.watch();
    return channel;
  }
}

