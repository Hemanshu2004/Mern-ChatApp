/**
 * Singleton event bus instance
 * Export a single instance for use across the application
 */
import { InMemoryEventBus } from './InMemoryEventBus.js';

// Create singleton instance
export const eventBus = new InMemoryEventBus();

