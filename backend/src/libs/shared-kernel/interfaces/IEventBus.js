/**
 * Event Bus interface for publishing and subscribing to domain events
 * 
 * This is an interface/contract that implementations must follow.
 * Use dependency injection to provide concrete implementations.
 */

/**
 * @typedef {Object} DomainEvent
 * @property {string} type - Event type (e.g., 'UserRegistered', 'MessageSent')
 * @property {string} aggregateId - ID of the aggregate that emitted the event
 * @property {string} aggregateType - Type of aggregate (e.g., 'User', 'Message')
 * @property {Date} occurredAt - When the event occurred
 * @property {Object} payload - Event-specific data
 */

/**
 * Event handler function type
 * @typedef {function(DomainEvent): Promise<void> | void} EventHandler
 */

/**
 * Event Bus interface
 * @interface
 */
export class IEventBus {
  /**
   * Publishes a domain event
   * @param {DomainEvent} event - The domain event to publish
   * @returns {Promise<void>}
   */
  async publish(event) {
    throw new Error('IEventBus.publish() must be implemented');
  }

  /**
   * Subscribes to events of a specific type
   * @param {string} eventType - The event type to subscribe to
   * @param {EventHandler} handler - The handler function
   * @returns {function(): void} Unsubscribe function
   */
  subscribe(eventType, handler) {
    throw new Error('IEventBus.subscribe() must be implemented');
  }

  /**
   * Subscribes to all events
   * @param {EventHandler} handler - The handler function
   * @returns {function(): void} Unsubscribe function
   */
  subscribeAll(handler) {
    throw new Error('IEventBus.subscribeAll() must be implemented');
  }
}

