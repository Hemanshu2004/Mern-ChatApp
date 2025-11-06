import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useStreamChat } from "../contexts/StreamChatContext";
import { CheckCheck } from "lucide-react";

const ChatList = ({ searchQuery = "" }) => {
  const { authUser } = useAuthUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentChatId = searchParams.get('chat');
  const { chatClient } = useStreamChat();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChannels = async () => {
      if (!chatClient || !authUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Query channels for the current user
        const filter = { 
          type: 'messaging',
          members: { $in: [authUser._id] }
        };
        const sort = [{ last_message_at: -1 }];
        const channelList = await chatClient.queryChannels(filter, sort, {
          watch: true,
          state: true,
          limit: 20,
        });

        setChannels(channelList);

        // Listen for real-time updates
        const handleEvent = (event) => {
          if (event.type === 'message.new' || event.type === 'message.read') {
            // Update channels list on new message or read event
            chatClient.queryChannels(filter, sort, {
              watch: true,
              state: true,
              limit: 20,
            }).then(setChannels).catch(console.error);
          }
        };

        chatClient.on(handleEvent);

        return () => {
          chatClient.off(handleEvent);
        };
      } catch (error) {
        console.error("Error loading channels:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChannels();
  }, [chatClient, authUser]);

  // Helper functions - defined before use
  const getOtherUser = (channel) => {
    const members = Object.values(channel.state.members);
    const otherMember = members.find(member => member.user.id !== authUser?._id);
    return otherMember?.user;
  };

  // Filter and deduplicate channels based on search
  // Group by user ID to prevent duplicates
  const uniqueChannelsMap = new Map();
  
  channels.forEach(channel => {
    const otherMembers = Object.values(channel.state.members).filter(
      member => member.user.id !== authUser?._id
    );
    const otherUser = otherMembers[0]?.user;
    
    if (!otherUser) return;
    
    // Only keep the most recent channel per user
    const existingChannel = uniqueChannelsMap.get(otherUser.id);
    if (!existingChannel || 
        new Date(channel.state.last_message_at) > new Date(existingChannel.state.last_message_at)) {
      uniqueChannelsMap.set(otherUser.id, channel);
    }
  });
  
  // Convert map to array and filter by search
  const filteredChannels = Array.from(uniqueChannelsMap.values()).filter(channel => {
    const otherUser = getOtherUser(channel);
    if (!otherUser) return false;
    return otherUser.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getLastMessage = (channel) => {
    const messages = channel.state.messages;
    return messages[messages.length - 1];
  };

  const getUnreadCount = (channel) => {
    return channel.countUnread();
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return `${Math.floor(diffMins / 1440)}d`;
  };

  const getMessagePreview = (message) => {
    if (!message) return 'No messages yet';
    if (message.text) {
      return message.text.length > 30 
        ? message.text.substring(0, 30) + '...' 
        : message.text;
    }
    if (message.attachments?.length > 0) return '📎 Attachment';
    return 'Message';
  };

  const getMessageStatus = (channel) => {
    const lastMessage = getLastMessage(channel);
    if (!lastMessage || lastMessage.user.id !== authUser?._id) return null;

    const readBy = lastMessage.read_by || [];
    const isRead = readBy.length > 1;

    return (
      <CheckCheck 
        className={`w-3.5 h-3.5 ${isRead ? 'text-blue-500' : 'text-base-content/40'}`} 
        strokeWidth={2.5} 
      />
    );
  };

  if (loading) {
    return (
      <div className="p-3">
        <div className="flex justify-center py-4">
          <span className="loading loading-spinner loading-sm"></span>
        </div>
      </div>
    );
  }

  if (filteredChannels.length === 0) {
    return (
      <div className="p-3">
        <p className="text-center text-sm text-base-content/60 py-4">
          {searchQuery ? 'No chats found' : 'No active chats'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-base-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
          Active Chats
        </h3>
        <span className="badge badge-sm badge-secondary">{filteredChannels.length}</span>
      </div>
      <div className="space-y-1">
        {filteredChannels.map((channel) => {
          const otherUser = getOtherUser(channel);
          const lastMessage = getLastMessage(channel);
          const unreadCount = getUnreadCount(channel);
          const isActive = currentChatId === otherUser?.id;

          if (!otherUser) return null;

          return (
            <button
              key={channel.id}
              onClick={() => setSearchParams({ chat: otherUser.id })}
              className={`flex items-center gap-2 p-2 rounded-lg hover:bg-base-200 transition-all relative w-full text-left ${
                isActive ? "bg-secondary/10 border-l-4 border-secondary" : ""
              }`}
            >
              <div className={`avatar ${unreadCount > 0 ? 'online' : ''}`}>
                <div className="w-10 rounded-full ring-1 ring-base-100">
                  <img src={otherUser.image} alt={otherUser.name} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`font-medium text-sm truncate ${unreadCount > 0 ? 'font-bold' : ''}`}>
                    {otherUser.name}
                  </p>
                  <span className="text-xs text-base-content/50">
                    {formatTime(lastMessage?.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {getMessageStatus(channel)}
                  <p className={`text-xs truncate ${unreadCount > 0 ? 'text-base-content font-semibold' : 'text-base-content/60'}`}>
                    {getMessagePreview(lastMessage)}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <div className="badge badge-primary badge-sm">
                  {unreadCount}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
