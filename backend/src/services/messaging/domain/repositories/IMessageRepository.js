/**
 * Message repository interface
 * Defines contract for message persistence
 * 
 * @interface
 */
export class IMessageRepository {
  /**
   * Finds a message by ID
   * @param {string} messageId
   * @returns {Promise<Message | null>}
   */
  async findById(messageId) {
    throw new Error('IMessageRepository.findById() must be implemented');
  }

  /**
   * Finds messages in a channel
   * @param {string} channelId
   * @param {Object} [options]
   * @param {number} [options.limit] - Maximum number of messages
   * @param {string} [options.before] - Get messages before this message ID
   * @returns {Promise<Message[]>}
   */
  async findByChannel(channelId, options = {}) {
    throw new Error('IMessageRepository.findByChannel() must be implemented');
  }

  /**
   * Saves a message (create or update)
   * @param {Message} message
   * @returns {Promise<Message>}
   */
  async save(message) {
    throw new Error('IMessageRepository.save() must be implemented');
  }

  /**
   * Deletes a message
   * @param {string} messageId
   * @returns {Promise<void>}
   */
  async delete(messageId) {
    throw new Error('IMessageRepository.delete() must be implemented');
  }
}

