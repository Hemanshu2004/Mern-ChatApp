import { StreamChat } from 'stream-chat';
import 'dotenv/config';

/**
 * Factory for creating Stream Chat client instances
 * Singleton pattern to avoid multiple instances
 */
let streamClientInstance = null;

/**
 * Gets or creates Stream Chat client instance
 * @returns {StreamChat}
 */
export function getStreamClient() {
  if (!streamClientInstance) {
    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('Stream API key or secret is missing');
    }

    streamClientInstance = StreamChat.getInstance(apiKey, apiSecret);
  }

  return streamClientInstance;
}

