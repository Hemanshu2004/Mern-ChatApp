import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SendMessageUseCase } from '../../application/usecases/SendMessageUseCase.js';
import { MessageValidator } from '../../domain/services/MessageValidator.js';
import { Message } from '../../domain/entities/Message.js';

describe('SendMessage Integration Test', () => {
  let sendMessageUseCase;
  let mockMessageRepository;
  let mockMessageValidator;
  let mockGetChannelMembers;

  beforeEach(() => {
    // Mock message repository
    mockMessageRepository = {
      save: jest.fn(async (message) => {
        // Simulate saving - return message with real ID
        const data = message.toData();
        return new Message({
          ...data,
          id: `msg-${Date.now()}`,
        });
      }),
    };

    // Mock message validator
    mockMessageValidator = new MessageValidator();

    // Mock get channel members
    mockGetChannelMembers = jest.fn(async (channelId) => {
      return ['user-123', 'user-456'];
    });

    sendMessageUseCase = new SendMessageUseCase(
      mockMessageRepository,
      mockMessageValidator,
      mockGetChannelMembers
    );
  });

  it('should send a message successfully', async () => {
    const result = await sendMessageUseCase.execute({
      channelId: 'channel-789',
      senderId: 'user-123',
      content: 'Hello, world!',
    });

    expect(result).toBeInstanceOf(Message);
    expect(result.content).toBe('Hello, world!');
    expect(result.senderId).toBe('user-123');
    expect(result.channelId).toBe('channel-789');
    expect(mockMessageRepository.save).toHaveBeenCalled();
  });

  it('should throw error if sender is not a channel member', async () => {
    mockGetChannelMembers.mockResolvedValueOnce(['user-456']); // sender not in list

    await expect(
      sendMessageUseCase.execute({
        channelId: 'channel-789',
        senderId: 'user-123',
        content: 'Hello, world!',
      })
    ).rejects.toThrow('is not a member of channel');
  });

  it('should throw error for missing required fields', async () => {
    await expect(
      sendMessageUseCase.execute({
        channelId: 'channel-789',
        // Missing senderId and content
      })
    ).rejects.toThrow('required');
  });

  it('should send message with parent (reply)', async () => {
    const result = await sendMessageUseCase.execute({
      channelId: 'channel-789',
      senderId: 'user-123',
      content: 'This is a reply',
      parentMessageId: 'msg-parent-123',
    });

    expect(result.parentMessageId).toBe('msg-parent-123');
  });

  it('should send message with media', async () => {
    const result = await sendMessageUseCase.execute({
      channelId: 'channel-789',
      senderId: 'user-123',
      content: 'Check this out!',
      mediaUrl: 'https://example.com/image.jpg',
      mediaType: 'image',
    });

    expect(result.mediaUrl).toBe('https://example.com/image.jpg');
    expect(result.mediaType).toBe('image');
  });
});

