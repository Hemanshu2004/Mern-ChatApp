import { useEffect, useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { createMeeting } from "../lib/api";
import { useStreamChat } from "../contexts/StreamChatContext";
import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";
import toast from "react-hot-toast";
import CustomMessage from "./CustomMessage";
import "../styles/chat-custom.css";
import "../styles/chat-layout.css";
import { 
  VideoIcon, 
  PhoneIcon, 
  MoreVertical, 
  Search,
  X
} from "lucide-react";

const ChatWindow = ({ userId, onClose }) => {
  const { chatClient } = useStreamChat();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [creatingMeeting, setCreatingMeeting] = useState(false);

  const { authUser } = useAuthUser();

  useEffect(() => {
    const initChat = async () => {
      if (!chatClient || !authUser || !userId) {
        setLoading(false);
        return;
      }

      try {

        const channelId = [authUser._id, userId].sort().join("-");

        const currChannel = chatClient.channel("messaging", channelId, {
          members: [authUser._id, userId],
        });

        await currChannel.watch();
        await currChannel.markRead();

        const members = Object.values(currChannel.state.members);
        const targetMember = members.find(member => member.user.id !== authUser._id);
        if (targetMember) {
          setTargetUser(targetMember.user);
        }

        const handleTyping = (event) => {
          if (event.user?.id !== authUser._id) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 3000);
          }
        };

        currChannel.on('typing.start', handleTyping);
        currChannel.on('typing.stop', () => setIsTyping(false));

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
  }, [chatClient, authUser, userId]);

  const handleVideoCall = async () => {
    if (creatingMeeting) return;
    
    try {
      setCreatingMeeting(true);
      
      // Create meeting
      const { meetingId } = await createMeeting(
        authUser._id,
        authUser.fullName
      );
      
      const meetingLink = `${window.location.origin}/lobby/${meetingId}`;
      
      // Send meeting link to chat
      await channel.sendMessage({
        text: `📹 Video Call Started!\n\nJoin the video call: ${meetingLink}\n\nWaiting for everyone to join...`,
        attachments: [{
          type: 'meeting',
          meetingId: meetingId,
          meetingLink: meetingLink,
          hostId: authUser._id,
          hostName: authUser.fullName
        }]
      });
      
      // Navigate to meeting lobby
      window.open(`/lobby/${meetingId}`, '_blank');
      toast.success("Meeting created! Opening video call...");
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("Failed to create meeting. Please try again.");
    } finally {
      setCreatingMeeting(false);
    }
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
              {targetUser && (
                <>
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
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button className="btn btn-ghost btn-sm btn-circle hover:bg-base-300">
                <Search className="w-5 h-5" />
              </button>
              <button 
                onClick={handleVideoCall}
                disabled={creatingMeeting}
                className="btn btn-ghost btn-sm btn-circle hover:bg-base-300 text-success"
              >
                {creatingMeeting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <VideoIcon className="w-5 h-5" />
                )}
              </button>
              <button className="btn btn-ghost btn-sm btn-circle hover:bg-base-300">
                <PhoneIcon className="w-5 h-5" />
              </button>
              <button className="btn btn-ghost btn-sm btn-circle hover:bg-base-300">
                <MoreVertical className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="btn btn-ghost btn-sm btn-circle hover:bg-base-300 lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
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

export default ChatWindow;
