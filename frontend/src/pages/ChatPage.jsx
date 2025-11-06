import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation } from "@tanstack/react-query";
import { createMeeting } from "../lib/api";
import { useStreamChat } from "../contexts/StreamChatContext";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import toast from "react-hot-toast";
import CustomMessage from "../components/CustomMessage";
import MessageStatus from "../components/MessageStatus";
import "../styles/chat-custom.css";
import "../styles/chat-layout.css";
import { 
  ArrowLeft, 
  VideoIcon, 
  PhoneIcon, 
  MoreVertical, 
  Search,
  Paperclip,
  Smile,
  Send
} from "lucide-react";

import ChatLoader from "../components/ChatLoader";

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const { chatClient } = useStreamChat();

  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const { authUser } = useAuthUser();

  useEffect(() => {
    const initChat = async () => {
      if (!chatClient || !authUser) {
        setLoading(false);
        return;
      }

      try {

        // Create unique channel ID by sorting user IDs
        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = chatClient.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();
        
        // Mark all messages as read when opening the channel
        await currChannel.markRead();

        // Get target user info from channel members
        const members = Object.values(currChannel.state.members);
        const targetMember = members.find(member => member.user.id !== authUser._id);
        if (targetMember) {
          setTargetUser(targetMember.user);
        }

        // Listen for typing events
        const handleTyping = (event) => {
          if (event.user?.id !== authUser._id) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 3000);
          }
        };

        currChannel.on('typing.start', handleTyping);
        currChannel.on('typing.stop', () => setIsTyping(false));

        // Mark messages as read when new messages arrive
        const handleNewMessage = async (event) => {
          if (event.user?.id !== authUser._id) {
            await currChannel.markRead();
          }
        };

        currChannel.on('message.new', handleNewMessage);

        setChannel(currChannel);

        return () => {
          currChannel.off('typing.start', handleTyping);
          currChannel.off('typing.stop', () => setIsTyping(false));
          currChannel.off('message.new', handleNewMessage);
        };
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [chatClient, authUser, targetUserId]);

  const createMeetingMutation = useMutation({
    mutationFn: () => createMeeting(authUser._id, authUser.fullName),
    onSuccess: (data) => {
      const callUrl = `${window.location.origin}/lobby/${data.meetingId}`;
      
      // Send meeting link in chat
      if (channel) {
        channel.sendMessage({
          text: `📞 Video call started! Join here: ${callUrl}`,
          attachments: [{
            type: 'card',
            title: '🎥 Video Call',
            text: 'Click to join the call',
            actions: [{
              type: 'link',
              text: 'Join Call',
              url: callUrl
            }]
          }]
        });
      }

      toast.success("Video call created!");
      // Navigate host to lobby
      navigate(`/lobby/${data.meetingId}`);
    },
    onError: () => {
      toast.error("Failed to create video call");
    }
  });

  const handleVideoCall = () => {
    if (!authUser) {
      toast.error("Please log in first");
      return;
    }
    createMeetingMutation.mutate();
  };

  if (loading || !chatClient || !channel) {
    return (
      <div className="chat-loading">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/60">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="btn btn-ghost btn-sm btn-circle hover:bg-base-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              {targetUser && (
                <div className="flex items-center gap-3">
                  <div className="avatar online">
                    <div className="w-10 h-10 rounded-full">
                      <img 
                        src={targetUser.image || '/default-avatar.png'} 
                        alt={targetUser.name}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base-content">
                      {targetUser.name}
                    </h3>
                    <p className="text-xs text-base-content/60">
                      {isTyping ? 'Typing...' : 'Online'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button className="btn btn-ghost btn-sm btn-circle hover:bg-base-300">
                <Search className="w-5 h-5" />
              </button>
              <button 
                onClick={handleVideoCall}
                disabled={createMeetingMutation.isPending}
                className="btn btn-ghost btn-sm btn-circle hover:bg-base-300 text-success tooltip tooltip-bottom"
                data-tip="Start video call"
              >
                {createMeetingMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <VideoIcon className="w-5 h-5" />
                )}
              </button>
              <button className="btn btn-ghost btn-sm btn-circle hover:bg-base-300">
                <PhoneIcon className="w-5 h-5" />
              </button>
              <div className="dropdown dropdown-end">
                <button className="btn btn-ghost btn-sm btn-circle hover:bg-base-300">
                  <MoreVertical className="w-5 h-5" />
                </button>
                <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52">
                  <li><a>View Profile</a></li>
                  <li><a>Search Messages</a></li>
                  <li><a>Mute Notifications</a></li>
                  <li><a className="text-error">Block User</a></li>
                </ul>
              </div>
            </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        <Chat client={chatClient}>
          <Channel channel={channel}>
            <Window>
              <MessageList 
                Message={CustomMessage}
                messageActions={['react', 'reply', 'edit', 'delete']}
              />
              <MessageInput 
                focus 
                additionalTextareaProps={{
                  placeholder: "Type a message...",
                }}
              />
            </Window>
          </Channel>
        </Chat>
      </div>
    </div>
  );
};
export default ChatPage;
