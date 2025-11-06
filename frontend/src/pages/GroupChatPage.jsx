import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGroupDetails, createGroupMeeting, getGroupMeeting } from "../lib/api";
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
import "../styles/chat-custom.css";
import "../styles/chat-layout.css";
import { 
  ArrowLeft, 
  VideoIcon, 
  Users, 
  Settings,
  UserPlus,
  Crown,
  Link as LinkIcon,
  Calendar
} from "lucide-react";

import ChatLoader from "../components/ChatLoader";

const GroupChatPage = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { chatClient } = useStreamChat();

  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  const { authUser } = useAuthUser();

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => getGroupDetails(groupId),
    enabled: !!groupId,
  });

  const { data: groupMeeting, refetch: refetchMeeting } = useQuery({
    queryKey: ["groupMeeting", groupId],
    queryFn: async () => {
      try {
        return await getGroupMeeting(groupId);
      } catch (error) {
        // Silently handle 404 - no active meeting
        if (error?.response?.status === 404) {
          return null;
        }
        // Don't throw other errors either, just return null
        return null;
      }
    },
    enabled: false, // Don't auto-fetch, only fetch when we create a meeting
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity, // Never consider stale unless manually invalidated
  });

  const { mutate: createMeetingMutation, isPending: creatingMeeting } = useMutation({
    mutationFn: () => createGroupMeeting(groupId, authUser._id, authUser.fullName),
    onSuccess: (data) => {
      // Manually refetch the meeting data
      refetchMeeting();
      const meetingLink = `${window.location.origin}/lobby/${data.meetingId}`;
      
      // Send meeting link to group chat
      if (channel) {
        channel.sendMessage({
          text: `🎥 Group Meeting Started!\n\nJoin the meeting: ${meetingLink}\n\nWaiting for everyone to join...`,
          attachments: [{
            type: 'meeting',
            meetingId: data.meetingId,
            meetingLink: meetingLink,
            hostName: authUser.fullName
          }]
        });
      }
      
      toast.success("Group meeting created! Link shared in chat.");
      setShowMeetingModal(false);
      
      // Navigate to call page
      window.open(`/call/${data.meetingId}`, '_blank');
    },
    onError: () => {
      toast.error("Failed to create group meeting");
    }
  });

  useEffect(() => {
    const initChat = async () => {
      if (!chatClient) {
        setLoading(false);
        return;
      }
      if (!authUser) {
        setLoading(false);
        return;
      }
      if (!group) {
        setLoading(false);
        return;
      }

      console.log("Initializing group chat for:", group.name);

      try {

        // Create group channel with unique members only
        const memberIds = group.members.map(m => m._id);
        const uniqueMembers = [...new Set(memberIds)]; // Remove duplicates
        
        console.log(`Creating channel for group with ${uniqueMembers.length} members`);
        
        // Don't set created_by_id with client-side auth
        const groupChannel = chatClient.channel("messaging", `group-${groupId}`, {
          name: group.name,
          members: uniqueMembers,
        });

        console.log("Watching channel...");
        await groupChannel.watch();
        console.log("Channel watched successfully");
        
        // Mark all messages as read when opening the channel
        await groupChannel.markRead();
        
        // Set the channel
        setChannel(groupChannel);
        
        console.log("Group chat initialized successfully");
        
        // Mark messages as read when new messages arrive
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
        console.error("Error details:", error.message, error.code);
        toast.error("Could not connect to group chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [chatClient, authUser, group, groupId]);

  const handleCreateMeeting = () => {
    setShowMeetingModal(true);
  };

  const confirmCreateMeeting = () => {
    createMeetingMutation();
  };

  const isCreator = group?.admin._id === authUser?._id;

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
              <button 
                onClick={() => navigate(-1)}
                className="btn btn-ghost btn-sm btn-circle hover:bg-base-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="avatar-group -space-x-2">
                  {group.members?.slice(0, 3).map((member, index) => (
                    <div key={member._id} className="avatar">
                      <div className="w-8 h-8 rounded-full ring-2 ring-base-100">
                        <img src={member.profilePic} alt={member.fullName} className="object-cover" />
                      </div>
                    </div>
                  ))}
                  {group.members?.length > 3 && (
                    <div className="avatar placeholder">
                      <div className="w-8 h-8 bg-neutral text-neutral-content rounded-full">
                        <span className="text-xs">+{group.members.length - 3}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base-content">
                      {group.name}
                    </h3>
                    {isCreator && (
                      <Crown className="w-4 h-4 text-warning" title="Group Creator" />
                    )}
                  </div>
                  <p className="text-xs text-base-content/60">
                    {group.members?.length} members
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="btn btn-ghost btn-sm btn-circle hover:bg-base-300">
                <UserPlus className="w-5 h-5" />
              </button>
              {isCreator && (
                <button 
                  onClick={handleCreateMeeting}
                  className="btn btn-success btn-sm gap-2 hover:scale-105 transition-transform"
                  disabled={creatingMeeting}
                >
                  <VideoIcon className="w-4 h-4" />
                  {creatingMeeting ? "Creating..." : "Start Meeting"}
                </button>
              )}
              <button className="btn btn-ghost btn-sm btn-circle hover:bg-base-300">
                <Settings className="w-5 h-5" />
              </button>
            </div>
      </div>

      {/* Active Meeting Banner */}
      {groupMeeting && (
            <div className="bg-success/10 border-b border-success/20 px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <VideoIcon className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">
                    Meeting in progress - Join now!
                  </span>
                </div>
                <a
                  href={`/lobby/${groupMeeting.meetingId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success btn-xs gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  Join
                </a>
              </div>
            </div>
      )}

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

      {/* Create Meeting Confirmation Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowMeetingModal(false)}>
          <div className="bg-base-100 rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <VideoIcon className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold">Start Group Meeting</h3>
            </div>
            <p className="text-base-content/70 mb-4">
              This will create a new meeting for <strong>{group.name}</strong> and share the join link in the group chat. All members will be able to join.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowMeetingModal(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={confirmCreateMeeting}
                className="btn btn-success flex-1"
                disabled={creatingMeeting}
              >
                {creatingMeeting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <VideoIcon className="w-4 h-4 mr-1" />
                    Start Meeting
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChatPage;
