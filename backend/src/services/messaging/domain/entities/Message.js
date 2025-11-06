import { createMessageId } from '../valueObjects/MessageId.js';
import { createChannelId } from '../valueObjects/ChannelId.js';
import { createMessageContent } from '../valueObjects/MessageContent.js';
import { createUserId } from '../../../../libs/shared-kernel/valueObjects/UserId.js';
import { ReadReceipt } from '../valueObjects/ReadReceipt.js';
import { Reaction } from '../valueObjects/Reaction.js';
import { now } from '../../../../libs/shared-kernel/valueObjects/Timestamp.js';
import { UnauthorizedError } from '../../../../libs/shared-kernel/exceptions/UnauthorizedError.js';

/**
 * Message aggregate root
 * Represents a message in a chat channel
 */
export class Message {
  /**
   * @param {Object} params
   * @param {string} params.id - Message ID
   * @param {string} params.channelId - Channel ID
   * @param {string} params.senderId - User ID of sender
   * @param {string} params.content - Message content
   * @param {string} [params.parentMessageId] - ID of parent message (for replies)
   * @param {string} [params.mediaUrl] - URL to attached media
   * @param {string} [params.mediaType] - Type of media (image, video, file)
   * @param {ReadReceipt[]} [params.readReceipts] - Read receipts
   * @param {Reaction[]} [params.reactions] - Reactions
   * @param {Date} [params.createdAt] - Creation timestamp
   * @param {Date} [params.updatedAt] - Update timestamp
   * @param {boolean} [params.isEdited] - Whether message was edited
   * @param {boolean} [params.isDeleted] - Whether message was deleted
   */
  constructor({
    id,
    channelId,
    senderId,
    content,
    parentMessageId = null,
    mediaUrl = null,
    mediaType = null,
    readReceipts = [],
    reactions = [],
    createdAt,
    updatedAt,
    isEdited = false,
    isDeleted = false,
  }) {
    this._id = createMessageId(id);
    this._channelId = createChannelId(channelId);
    this._senderId = createUserId(senderId);
    this._content = createMessageContent(content);
    this._parentMessageId = parentMessageId;
    this._mediaUrl = mediaUrl;
    this._mediaType = mediaType;
    this._readReceipts = readReceipts.map(r => r instanceof ReadReceipt ? r : ReadReceipt.fromData(r));
    this._reactions = reactions.map(r => r instanceof Reaction ? r : Reaction.fromData(r));
    this._createdAt = createdAt || now();
    this._updatedAt = updatedAt || now();
    this._isEdited = Boolean(isEdited);
    this._isDeleted = Boolean(isDeleted);
  }

  /** @returns {string} */
  get id() {
    return this._id;
  }

  /** @returns {string} */
  get channelId() {
    return this._channelId;
  }

  /** @returns {string} */
  get senderId() {
    return this._senderId;
  }

  /** @returns {string} */
  get content() {
    return this._content;
  }

  /** @returns {string | null} */
  get parentMessageId() {
    return this._parentMessageId;
  }

  /** @returns {string | null} */
  get mediaUrl() {
    return this._mediaUrl;
  }

  /** @returns {string | null} */
  get mediaType() {
    return this._mediaType;
  }

  /** @returns {ReadReceipt[]} */
  get readReceipts() {
    return [...this._readReceipts];
  }

  /** @returns {Reaction[]} */
  get reactions() {
    return [...this._reactions];
  }

  /** @returns {Date} */
  get createdAt() {
    return this._createdAt;
  }

  /** @returns {Date} */
  get updatedAt() {
    return this._updatedAt;
  }

  /** @returns {boolean} */
  get isEdited() {
    return this._isEdited;
  }

  /** @returns {boolean} */
  get isDeleted() {
    return this._isDeleted;
  }

  /**
   * Edits message content
   * Domain rule: Only sender can edit
   * @param {string} userId - User attempting to edit
   * @param {string} newContent - New content
   * @throws {UnauthorizedError} If user is not the sender
   */
  edit(userId, newContent) {
    if (this._senderId !== userId) {
      throw new UnauthorizedError('Only message sender can edit the message', 'editMessage');
    }

    if (this._isDeleted) {
      throw new Error('Cannot edit a deleted message');
    }

    this._content = createMessageContent(newContent);
    this._isEdited = true;
    this._updatedAt = now();
  }

  /**
   * Deletes message
   * Domain rule: Only sender can delete
   * @param {string} userId - User attempting to delete
   * @throws {UnauthorizedError} If user is not the sender
   */
  delete(userId) {
    if (this._senderId !== userId) {
      throw new UnauthorizedError('Only message sender can delete the message', 'deleteMessage');
    }

    this._isDeleted = true;
    this._updatedAt = now();
  }

  /**
   * Marks message as read by user
   * @param {string} userId - User who read the message
   */
  markAsRead(userId) {
    // Check if already read
    const existingReceipt = this._readReceipts.find(r => r.userId === userId);
    if (existingReceipt) {
      return; // Already read
    }

    // Add new read receipt
    this._readReceipts.push(new ReadReceipt({ userId }));
    this._updatedAt = now();
  }

  /**
   * Adds a reaction
   * @param {string} userId - User who reacted
   * @param {string} emoji - Reaction emoji
   */
  addReaction(userId, emoji) {
    // Check if user already reacted with this emoji
    const existingReaction = this._reactions.find(
      r => r.userId === userId && r.emoji === emoji
    );
    if (existingReaction) {
      return; // Already reacted
    }

    // Add new reaction
    this._reactions.push(new Reaction({ userId, emoji }));
    this._updatedAt = now();
  }

  /**
   * Removes a reaction
   * @param {string} userId - User removing reaction
   * @param {string} emoji - Reaction emoji to remove
   */
  removeReaction(userId, emoji) {
    this._reactions = this._reactions.filter(
      r => !(r.userId === userId && r.emoji === emoji)
    );
    this._updatedAt = now();
  }

  /**
   * Checks if user has read the message
   * @param {string} userId
   * @returns {boolean}
   */
  hasRead(userId) {
    return this._readReceipts.some(r => r.userId === userId);
  }

  /**
   * Gets reaction count for an emoji
   * @param {string} emoji
   * @returns {number}
   */
  getReactionCount(emoji) {
    return this._reactions.filter(r => r.emoji === emoji).length;
  }

  /**
   * Creates from plain object (e.g., from Stream SDK)
   * @param {Object} data
   * @returns {Message}
   */
  static fromData(data) {
    return new Message({
      id: data.id || data._id,
      channelId: data.channelId || data.cid,
      senderId: data.senderId || data.user?.id || data.user_id,
      content: data.content || data.text || '',
      parentMessageId: data.parentMessageId || data.parent_id,
      mediaUrl: data.mediaUrl || data.attachments?.[0]?.asset_url,
      mediaType: data.mediaType || data.attachments?.[0]?.type,
      readReceipts: data.readReceipts || data.read || [],
      reactions: data.reactions || [],
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at,
      isEdited: data.isEdited || Boolean(data.updated_at && data.updated_at !== data.created_at),
      isDeleted: data.isDeleted || false,
    });
  }

  /**
   * Converts to plain object for persistence
   * @returns {Object}
   */
  toData() {
    return {
      id: this._id,
      channelId: this._channelId,
      senderId: this._senderId,
      content: this._content,
      parentMessageId: this._parentMessageId,
      mediaUrl: this._mediaUrl,
      mediaType: this._mediaType,
      readReceipts: this._readReceipts.map(r => r.toData()),
      reactions: this._reactions.map(r => r.toData()),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      isEdited: this._isEdited,
      isDeleted: this._isDeleted,
    };
  }
}

