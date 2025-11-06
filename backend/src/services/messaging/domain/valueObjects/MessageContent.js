/**
 * @typedef {string} MessageContent
 * 
 * Message content value object.
 * Enforces content rules (max length, not empty, etc.).
 */

const MAX_CONTENT_LENGTH = 10000; // 10KB limit

/**
 * Creates a MessageContent value object
 * @param {string} content - The message content
 * @returns {MessageContent}
 * @throws {Error} If content is invalid
 */
export function createMessageContent(content) {
  if (content === null || content === undefined) {
    throw new Error('Message content cannot be null or undefined');
  }

  const contentStr = String(content).trim();

  if (contentStr.length === 0) {
    throw new Error('Message content cannot be empty');
  }

  if (contentStr.length > MAX_CONTENT_LENGTH) {
    throw new Error(`Message content cannot exceed ${MAX_CONTENT_LENGTH} characters`);
  }

  return contentStr;
}

