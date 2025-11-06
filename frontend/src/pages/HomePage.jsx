import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  getUserFriends,
  getFriendRequests,
  createMeeting,
} from "../lib/api";
import {
  MessageCircle,
  Users,
  VideoIcon,
  BellIcon
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import FriendSelectionModal from "../components/FriendSelectionModal";
import CreateGroupModal from "../components/CreateGroupModal";
import ChatWindow from "../components/ChatWindow";
import GroupChatWindow from "../components/GroupChatWindow";
import toast from "react-hot-toast";

const HomePage = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  // Get chat/group from URL parameters
  const chatUserId = searchParams.get('chat');
  const groupId = searchParams.get('group');
  const hasActiveChat = chatUserId || groupId;

  // ✅ Queries
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: friendRequests = [] } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    enabled: !!authUser,
  });

  const handleNewChat = () => {
    if (friends.length === 0) {
      toast.error("Add some friends first to start chatting!");
      navigate("/friends");
      return;
    }
    
    if (friends.length === 1) {
      setSearchParams({ chat: friends[0]._id });
      toast.success(`Starting chat with ${friends[0].fullName}!`);
    } else {
      setShowFriendModal(true);
    }
  };

  const handleNewGroup = () => {
    if (friends.length === 0) {
      toast.error("Add some friends first to create a group!");
      navigate("/friends");
      return;
    }
    setShowCreateGroupModal(true);
  };

  const handleCreateMeeting = async () => {
    try {
      if (!authUser?._id) {
        toast.error("Please log in to create a meeting.");
        return;
      }
      const { meetingId } = await createMeeting(
        authUser._id,
        authUser.fullName
      );
      const meetingLink = `${window.location.origin}/lobby/${meetingId}`;
      await navigator.clipboard.writeText(meetingLink);
      toast.success("Meeting created! Link copied to clipboard.");
    } catch (err) {
      console.error("Error creating meeting:", err);
      toast.error("Failed to create meeting. Please try again.");
    }
  };

  const handleCloseChat = () => {
    setSearchParams({});
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {hasActiveChat ? (
        // Show active chat - full screen
        <>
          {chatUserId && (
            <ChatWindow userId={chatUserId} onClose={handleCloseChat} />
          )}
          {groupId && (
            <GroupChatWindow groupId={groupId} onClose={handleCloseChat} />
          )}
        </>
      ) : (
          // Show welcome screen when no chat is active
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-base-100 to-base-200">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
              {/* Welcome Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-bold text-base-content mb-4">
                  Welcome to ChatApp
                </h1>
                <p className="text-lg text-base-content/60">
                  Your language learning companion
                </p>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-base-100 rounded-3xl shadow-2xl p-8 sm:p-12 border border-base-300">
                <h2 className="text-2xl font-bold text-base-content mb-8 text-center">
                  Quick Actions
                </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* New Chat */}
              <button
                onClick={handleNewChat}
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center transition-all">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-base-content mb-1">New Chat</h3>
                  <p className="text-xs text-base-content/60">Start a conversation</p>
                </div>
              </button>

              {/* New Group */}
              <button
                onClick={handleNewGroup}
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/20 border-2 border-accent/20 hover:border-accent/40 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="w-16 h-16 rounded-full bg-accent/20 group-hover:bg-accent/30 flex items-center justify-center transition-all">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-base-content mb-1">New Group</h3>
                  <p className="text-xs text-base-content/60">Create a group chat</p>
                </div>
              </button>

              {/* Create Meeting */}
              <button
                onClick={handleCreateMeeting}
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-success/5 to-success/10 hover:from-success/10 hover:to-success/20 border-2 border-success/20 hover:border-success/40 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="w-16 h-16 rounded-full bg-success/20 group-hover:bg-success/30 flex items-center justify-center transition-all">
                  <VideoIcon className="w-8 h-8 text-success" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-base-content mb-1">Create Meeting</h3>
                  <p className="text-xs text-base-content/60">Start a video call</p>
                </div>
              </button>

              {/* Friend Requests */}
              <Link
                to="/notifications"
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-warning/5 to-warning/10 hover:from-warning/10 hover:to-warning/20 border-2 border-warning/20 hover:border-warning/40 transition-all duration-300 hover:scale-105 hover:shadow-xl relative"
              >
                <div className="w-16 h-16 rounded-full bg-warning/20 group-hover:bg-warning/30 flex items-center justify-center transition-all">
                  <BellIcon className="w-8 h-8 text-warning" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-base-content mb-1">Friend Requests</h3>
                  <p className="text-xs text-base-content/60">Manage requests</p>
                </div>
                {friendRequests.length > 0 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-warning rounded-full flex items-center justify-center text-warning-content font-bold text-sm shadow-lg">
                    {friendRequests.length}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Modals */}
      <FriendSelectionModal
        isOpen={showFriendModal}
        onClose={() => setShowFriendModal(false)}
        friends={friends}
        title="Start a Chat"
      />

      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        friends={friends}
      />
    </div>
  );
};

export default HomePage;
