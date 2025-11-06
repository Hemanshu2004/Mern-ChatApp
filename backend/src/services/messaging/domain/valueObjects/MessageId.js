/**
 * @typedef {string} MessageId
 * 
 * Message ID value object representing a unique message identifier.
 * Typically from Stream SDK or MongoDB ObjectId.
 */

/**
 * Creates a MessageId value object
 * @param {string} id - The message ID string
 * @returns {MessageId}
 * @throws {Error} If id is empty or invalid
 */
export function createMessageId(id) {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('MessageId must be a non-empty string');
  }
  return id;
}

