/**
 * Domain event: Message sent
 */
export class MessageSent {
  /**
   * @param {Object} params
   * @param {string} params.messageId
   * @param {string} params.channelId
   * @param {string} params.senderId
   * @param {Date} [params.occurredAt]
   */
  constructor({ messageId, channelId, senderId, occurredAt }) {
    this.type = 'MessageSent';
    this.aggregateId = messageId;
    this.aggregateType = 'Message';
    this.occurredAt = occurredAt || new Date();
    this.payload = { messageId, channelId, senderId };
  }
}

