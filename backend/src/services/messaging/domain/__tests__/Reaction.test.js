import { describe, it, expect } from '@jest/globals';
import { Reaction, VALID_REACTIONS } from '../valueObjects/Reaction.js';

describe('Reaction Value Object', () => {
  it('should create a valid reaction', () => {
    const reaction = new Reaction({ userId: 'user-123', emoji: '❤️' });
    expect(reaction.userId).toBe('user-123');
    expect(reaction.emoji).toBe('❤️');
    expect(reaction.reactedAt).toBeInstanceOf(Date);
  });

  it('should throw error for invalid emoji', () => {
    expect(() => {
      new Reaction({ userId: 'user-123', emoji: '💩' });
    }).toThrow('Invalid reaction emoji');
  });

  it('should accept all valid reactions', () => {
    VALID_REACTIONS.forEach(emoji => {
      const reaction = new Reaction({ userId: 'user-123', emoji });
      expect(reaction.emoji).toBe(emoji);
    });
  });

  it('should serialize to data object', () => {
    const reaction = new Reaction({ userId: 'user-123', emoji: '👍' });
    const data = reaction.toData();
    expect(data.userId).toBe('user-123');
    expect(data.emoji).toBe('👍');
  });

  it('should create from data object', () => {
    const data = {
      userId: 'user-456',
      emoji: '😂',
      reactedAt: new Date(),
    };
    const reaction = Reaction.fromData(data);
    expect(reaction.userId).toBe('user-456');
    expect(reaction.emoji).toBe('😂');
  });
});

