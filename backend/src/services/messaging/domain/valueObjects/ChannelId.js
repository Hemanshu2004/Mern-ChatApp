/**
 * @typedef {string} ChannelId
 * 
 * Channel ID value object representing a chat channel.
 * Can be 1:1 (sorted user IDs) or group (group-{groupId}).
 */

/**
 * Creates a ChannelId value object
 * @param {string} id - The channel ID string
 * @returns {ChannelId}
 * @throws {Error} If id is empty or invalid
 */
export function createChannelId(id) {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('ChannelId must be a non-empty string');
  }
  return id;
}

/**
 * Creates a 1:1 channel ID from two user IDs
 * @param {string} userId1
 * @param {string} userId2
 * @returns {ChannelId}
 */
export function createDirectChannelId(userId1, userId2) {
  return createChannelId([userId1, userId2].sort().join('-'));
}

/**
 * Creates a group channel ID from group ID
 * @param {string} groupId
 * @returns {ChannelId}
 */
export function createGroupChannelId(groupId) {
  return createChannelId(`group-${groupId}`);
}

