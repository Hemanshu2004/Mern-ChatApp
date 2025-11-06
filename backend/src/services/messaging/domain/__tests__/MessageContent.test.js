import { describe, it, expect } from '@jest/globals';
import { createMessageContent } from '../valueObjects/MessageContent.js';

describe('MessageContent Value Object', () => {
  it('should create valid content', () => {
    const content = createMessageContent('Hello, world!');
    expect(content).toBe('Hello, world!');
  });

  it('should trim whitespace', () => {
    const content = createMessageContent('  Hello  ');
    expect(content).toBe('Hello');
  });

  it('should throw error for empty content', () => {
    expect(() => createMessageContent('')).toThrow('Message content cannot be empty');
    expect(() => createMessageContent('   ')).toThrow('Message content cannot be empty');
  });

  it('should throw error for null content', () => {
    expect(() => createMessageContent(null)).toThrow('Message content cannot be null');
  });

  it('should throw error for content exceeding max length', () => {
    const longContent = 'a'.repeat(10001);
    expect(() => createMessageContent(longContent)).toThrow('Message content cannot exceed');
  });

  it('should accept content at max length', () => {
    const maxContent = 'a'.repeat(10000);
    const content = createMessageContent(maxContent);
    expect(content.length).toBe(10000);
  });
});

