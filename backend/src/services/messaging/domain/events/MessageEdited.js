/**
 * Domain event: Message edited
 */
export class MessageEdited {
  /**
   * @param {Object} params
   * @param {string} params.messageId
   * @param {string} params.channelId
   * @param {string} params.senderId
   * @param {Date} [params.occurredAt]
   */
  constructor({ messageId, channelId, senderId, occurredAt }) {
    this.type = 'MessageEdited';
    this.aggregateId = messageId;
    this.aggregateType = 'Message';
    this.occurredAt = occurredAt || new Date();
    this.payload = { messageId, channelId, senderId };
  }
}

