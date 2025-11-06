import { Check, CheckCheck } from "lucide-react";
import { useChannelStateContext } from "stream-chat-react";

/**
 * MessageStatus component displays message delivery status
 * - 1 tick (grey): Message sent
 * - 2 ticks (grey): Message delivered
 * - 2 ticks (blue): Message read
 */
const MessageStatus = ({ message, isOwn }) => {
  const { channel } = useChannelStateContext();
  
  if (!isOwn || !message) return null; // Only show status for own messages

  // Get channel members excluding self
  const members = Object.values(channel?.state?.members || {});
  const otherMembers = members.filter(m => m.user.id !== message.user?.id);
  
  // Check read receipts
  const readBy = message?.read_by || [];
  const readByOthers = readBy.filter(reader => reader.id !== message.user?.id);
  
  // Message is read if any other member has read it
  const isRead = readByOthers.length > 0;
  
  // Message is delivered if it has been received by the server and others
  const isDelivered = message?.status === 'received' || 
                     message?.type === 'regular' || 
                     otherMembers.length > 0;
  
  // Message is sent if it has a timestamp
  const isSent = message?.created_at || message?.status === 'sent';

  if (isRead) {
    return (
      <div className="flex items-center gap-0.5 text-blue-500 ml-1" title="Read">
        <CheckCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
      </div>
    );
  }

  if (isDelivered) {
    return (
      <div className="flex items-center gap-0.5 text-base-content/40 ml-1" title="Delivered">
        <CheckCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
      </div>
    );
  }

  if (isSent) {
    return (
      <div className="flex items-center text-base-content/40 ml-1" title="Sent">
        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
      </div>
    );
  }

  return null;
};

export default MessageStatus;
