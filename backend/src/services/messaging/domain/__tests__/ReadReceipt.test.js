import { describe, it, expect } from '@jest/globals';
import { ReadReceipt } from '../valueObjects/ReadReceipt.js';

describe('ReadReceipt Value Object', () => {
  it('should create a valid read receipt', () => {
    const receipt = new ReadReceipt({ userId: 'user-123' });
    expect(receipt.userId).toBe('user-123');
    expect(receipt.readAt).toBeInstanceOf(Date);
  });

  it('should use provided readAt timestamp', () => {
    const readAt = new Date('2024-01-01');
    const receipt = new ReadReceipt({ userId: 'user-123', readAt });
    expect(receipt.readAt).toEqual(readAt);
  });

  it('should serialize to data object', () => {
    const receipt = new ReadReceipt({ userId: 'user-123' });
    const data = receipt.toData();
    expect(data.userId).toBe('user-123');
    expect(data.readAt).toBeInstanceOf(Date);
  });

  it('should create from data object', () => {
    const data = {
      userId: 'user-456',
      readAt: new Date('2024-01-01'),
    };
    const receipt = ReadReceipt.fromData(data);
    expect(receipt.userId).toBe('user-456');
    expect(receipt.readAt).toEqual(new Date('2024-01-01'));
  });
});

