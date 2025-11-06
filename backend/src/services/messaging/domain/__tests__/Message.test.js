import { describe, it, expect, beforeEach } from '@jest/globals';
import { Message } from '../entities/Message.js';
import { ReadReceipt } from '../valueObjects/ReadReceipt.js';
import { Reaction } from '../valueObjects/Reaction.js';
import { UnauthorizedError } from '../../../../libs/shared-kernel/exceptions/UnauthorizedError.js';

describe('Message Domain Entity', () => {
  let message;

  beforeEach(() => {
    message = new Message({
      id: 'msg-123',
      channelId: 'channel-456',
      senderId: 'user-789',
      content: 'Hello, world!',
    });
  });

  describe('Creation', () => {
    it('should create a message with required fields', () => {
      expect(message.id).toBe('msg-123');
      expect(message.channelId).toBe('channel-456');
      expect(message.senderId).toBe('user-789');
      expect(message.content).toBe('Hello, world!');
      expect(message.isEdited).toBe(false);
      expect(message.isDeleted).toBe(false);
    });

    it('should throw error for empty content', () => {
      expect(() => {
        new Message({
          id: 'msg-123',
          channelId: 'channel-456',
          senderId: 'user-789',
          content: '',
        });
      }).toThrow('Message content cannot be empty');
    });

    it('should throw error for content exceeding max length', () => {
      const longContent = 'a'.repeat(10001);
      expect(() => {
        new Message({
          id: 'msg-123',
          channelId: 'channel-456',
          senderId: 'user-789',
          content: longContent,
        });
      }).toThrow('Message content cannot exceed');
    });
  });

  describe('Edit', () => {
    it('should allow sender to edit message', () => {
      message.edit('user-789', 'Updated content');
      expect(message.content).toBe('Updated content');
      expect(message.isEdited).toBe(true);
    });

    it('should throw error if non-sender tries to edit', () => {
      expect(() => {
        message.edit('user-999', 'Updated content');
      }).toThrow(UnauthorizedError);
    });

    it('should throw error if trying to edit deleted message', () => {
      message.delete('user-789');
      expect(() => {
        message.edit('user-789', 'Updated content');
      }).toThrow('Cannot edit a deleted message');
    });
  });

  describe('Delete', () => {
    it('should allow sender to delete message', () => {
      message.delete('user-789');
      expect(message.isDeleted).toBe(true);
    });

    it('should throw error if non-sender tries to delete', () => {
      expect(() => {
        message.delete('user-999');
      }).toThrow(UnauthorizedError);
    });
  });

  describe('Read Receipts', () => {
    it('should mark message as read by user', () => {
      message.markAsRead('user-111');
      expect(message.hasRead('user-111')).toBe(true);
      expect(message.readReceipts.length).toBe(1);
    });

    it('should not duplicate read receipts for same user', () => {
      message.markAsRead('user-111');
      message.markAsRead('user-111');
      expect(message.readReceipts.length).toBe(1);
    });

    it('should track multiple read receipts', () => {
      message.markAsRead('user-111');
      message.markAsRead('user-222');
      expect(message.readReceipts.length).toBe(2);
      expect(message.hasRead('user-111')).toBe(true);
      expect(message.hasRead('user-222')).toBe(true);
    });
  });

  describe('Reactions', () => {
    it('should add reaction', () => {
      message.addReaction('user-111', '❤️');
      expect(message.reactions.length).toBe(1);
      expect(message.reactions[0].emoji).toBe('❤️');
      expect(message.reactions[0].userId).toBe('user-111');
    });

    it('should not duplicate reactions from same user', () => {
      message.addReaction('user-111', '❤️');
      message.addReaction('user-111', '❤️');
      expect(message.reactions.length).toBe(1);
    });

    it('should allow multiple users to react with same emoji', () => {
      message.addReaction('user-111', '❤️');
      message.addReaction('user-222', '❤️');
      expect(message.reactions.length).toBe(2);
      expect(message.getReactionCount('❤️')).toBe(2);
    });

    it('should throw error for invalid emoji', () => {
      expect(() => {
        message.addReaction('user-111', '💩');
      }).toThrow('Invalid reaction emoji');
    });

    it('should remove reaction', () => {
      message.addReaction('user-111', '❤️');
      message.removeReaction('user-111', '❤️');
      expect(message.reactions.length).toBe(0);
    });
  });

  describe('Serialization', () => {
    it('should convert to data object', () => {
      const data = message.toData();
      expect(data.id).toBe('msg-123');
      expect(data.channelId).toBe('channel-456');
      expect(data.senderId).toBe('user-789');
      expect(data.content).toBe('Hello, world!');
    });

    it('should create from data object', () => {
      const data = {
        id: 'msg-999',
        channelId: 'channel-888',
        senderId: 'user-777',
        content: 'Test message',
      };
      const msg = Message.fromData(data);
      expect(msg.id).toBe('msg-999');
      expect(msg.channelId).toBe('channel-888');
      expect(msg.senderId).toBe('user-777');
      expect(msg.content).toBe('Test message');
    });
  });
});

