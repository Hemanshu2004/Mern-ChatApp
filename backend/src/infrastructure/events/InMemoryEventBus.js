import { IEventBus } from '../../libs/shared-kernel/interfaces/IEventBus.js';
import { now } from '../../libs/shared-kernel/valueObjects/Timestamp.js';

/**
 * Simple in-memory event bus implementation
 * For production, consider using Redis, RabbitMQ, or similar
 */
export class InMemoryEventBus extends IEventBus {
  constructor() {
    super();
    /** @type {Map<string, Set<EventHandler>>} */
    this.subscribers = new Map();
    /** @type {Set<EventHandler>} */
    this.globalSubscribers = new Set();
  }

  /**
   * @param {DomainEvent} event
   * @returns {Promise<void>}
   */
  async publish(event) {
    // Ensure event has required fields
    if (!event.occurredAt) {
      event.occurredAt = now();
    }

    // Notify type-specific subscribers
    const handlers = this.subscribers.get(event.type) || new Set();
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }

    // Notify global subscribers
    for (const handler of this.globalSubscribers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in global event handler:`, error);
      }
    }
  }

  /**
   * @param {string} eventType
   * @param {EventHandler} handler
   * @returns {function(): void}
   */
  subscribe(eventType, handler) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscribers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * @param {EventHandler} handler
   * @returns {function(): void}
   */
  subscribeAll(handler) {
    this.globalSubscribers.add(handler);

    // Return unsubscribe function
    return () => {
      this.globalSubscribers.delete(handler);
    };
  }
}

