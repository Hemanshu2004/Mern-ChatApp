import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGroupDetails, createGroupMeeting } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
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
  Users, 
  Settings,
  X
} from "lucide-react";

const GroupChatWindow = ({ groupId, onClose }) => {
  const { chatClient } = useStreamChat();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingMeeting, setCreatingMeeting] = useState(false);

  const { authUser } = useAuthUser();

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => getGroupDetails(groupId),
    enabled: !!groupId,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!chatClient || !authUser || !group) {
        setLoading(false);
        return;
      }

      try {

        const memberIds = group.members.map(m => m._id);
        const uniqueMembers = [...new Set(memberIds)];
        
        const groupChannel = chatClient.channel("messaging", `group-${groupId}`, {
          name: group.name,
          members: uniqueMembers,
        });

        await groupChannel.watch();
        await groupChannel.markRead();
        
        setChannel(groupChannel);
        
        const handleNewMessage = async (event) => {
          if (event.user?.id !== authUser._id) {
            await groupChannel.markRead();
          }
        };
        
        groupChannel.on('message.new', handleNewMessage);

        return () => {
          groupChannel.off('message.new', handleNewMessage);
        };
      } catch (error) {
        console.error("Error initializing group chat:", error);
        toast.error("Could not connect to group chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [chatClient, authUser, group, groupId]);

  const handleVideoCall = async () => {
    if (creatingMeeting) return;
    
    try {
      setCreatingMeeting(true);
      
      // Create group meeting
      const { meetingId } = await createGroupMeeting(
        groupId,
        authUser._id,
        authUser.fullName
      );
      
      const meetingLink = `${window.location.origin}/lobby/${meetingId}`;
      
      // Send meeting link to group chat
      await channel.sendMessage({
        text: `🎥 Group Meeting Started!\n\nJoin the meeting: ${meetingLink}\n\nWaiting for everyone to join...`,
        attachments: [{
          type: 'meeting',
          meetingId: meetingId,
          meetingLink: meetingLink,
          hostId: authUser._id,
          hostName: authUser.fullName,
          groupId: groupId
        }]
      });
      
      // Navigate to meeting lobby
      window.open(`/lobby/${meetingId}`, '_blank');
      toast.success("Group meeting created! Opening video call...");
    } catch (error) {
      console.error("Error creating group meeting:", error);
      toast.error("Failed to create group meeting. Please try again.");
    } finally {
      setCreatingMeeting(false);
    }
  };

  if (loading || !chatClient || !channel || groupLoading) {
    return (
      <div className="chat-loading">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/60">Connecting to group chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Group Chat Header */}
      <div className="chat-header">
            <div className="flex items-center gap-3">
              <div className="avatar-group -space-x-3">
                {group.members?.slice(0, 3).map((member, idx) => (
                  <div key={idx} className="avatar">
                    <div className="w-10 rounded-full ring-2 ring-base-100">
                      <img src={member.profilePic} alt={member.fullName} />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-semibold text-base-content flex items-center gap-2">
                  {group.name}
                </h3>
                <p className="text-xs text-base-content/60">
                  {group.members?.length} members
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
                <Users className="w-5 h-5" />
              </button>
              <button className="btn btn-ghost btn-sm btn-circle hover:bg-base-300">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="btn btn-ghost btn-sm btn-circle hover:bg-base-300 lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
      </div>

      {/* Group Chat Messages */}
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
                  placeholder: `Message ${group.name}...`,
                }}
              />
            </Window>
          </Channel>
        </Chat>
      </div>
    </div>
  );
};

export default GroupChatWindow;
