/**
 * @typedef {string} UserId
 * 
 * User ID value object representing a unique user identifier.
 * Must be a non-empty string (typically MongoDB ObjectId as string).
 */

/**
 * Creates a UserId value object
 * @param {string} id - The user ID string
 * @returns {UserId}
 * @throws {Error} If id is empty or invalid
 */
export function createUserId(id) {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('UserId must be a non-empty string');
  }
  return id;
}

/**
 * Validates a UserId
 * @param {UserId} userId - The user ID to validate
 * @returns {boolean}
 */
export function isValidUserId(userId) {
  return userId && typeof userId === 'string' && userId.trim() !== '';
}

