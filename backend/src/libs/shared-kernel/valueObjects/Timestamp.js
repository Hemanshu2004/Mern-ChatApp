/**
 * @typedef {Date} Timestamp
 * 
 * Timestamp value object representing a point in time.
 * Used for domain events and entity timestamps.
 */

/**
 * Creates a Timestamp from a Date or number
 * @param {Date|number} value - The date value
 * @returns {Timestamp}
 */
export function createTimestamp(value = Date.now()) {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'number') {
    return new Date(value);
  }
  throw new Error('Timestamp must be a Date or number');
}

/**
 * Creates a Timestamp for the current time
 * @returns {Timestamp}
 */
export function now() {
  return new Date();
}

/**
 * Checks if a timestamp is before another
 * @param {Timestamp} timestamp1
 * @param {Timestamp} timestamp2
 * @returns {boolean}
 */
export function isBefore(timestamp1, timestamp2) {
  return timestamp1.getTime() < timestamp2.getTime();
}

/**
 * Checks if a timestamp is after another
 * @param {Timestamp} timestamp1
 * @param {Timestamp} timestamp2
 * @returns {boolean}
 */
export function isAfter(timestamp1, timestamp2) {
  return timestamp1.getTime() > timestamp2.getTime();
}

