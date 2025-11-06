/**
 * Domain event: Message read (read receipt)
 */
export class MessageRead {
  /**
   * @param {Object} params
   * @param {string} params.messageId
   * @param {string} params.channelId
   * @param {string} params.userId - User who read the message
   * @param {Date} [params.occurredAt]
   */
  constructor({ messageId, channelId, userId, occurredAt }) {
    this.type = 'MessageRead';
    this.aggregateId = messageId;
    this.aggregateType = 'Message';
    this.occurredAt = occurredAt || new Date();
    this.payload = { messageId, channelId, userId };
  }
}

