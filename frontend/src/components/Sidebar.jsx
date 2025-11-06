import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { 
  BellIcon, 
  HomeIcon, 
  ShipWheelIcon, 
  UsersIcon, 
  MessageCircle, 
  Users, 
  Settings, 
  Search,
  MoreVertical,
  LogOut,
  VideoIcon
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getUserGroups, getUserFriends, getFriendRequests, createMeeting } from "../lib/api";
import { useState } from "react";
import FriendSelectionModal from "./FriendSelectionModal";
import CreateGroupModal from "./CreateGroupModal";
import ChatList from "./ChatList";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { authUser, logout } = useAuthUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPath = location.pathname;
  const currentGroupId = searchParams.get('group');
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: getUserGroups,
    enabled: !!authUser,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: !!authUser,
  });

  const { data: friendRequests = [] } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    enabled: !!authUser,
  });

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  const handleNewChat = () => {
    if (friends.length === 0) {
      toast.error("Add some friends first to start chatting!");
      navigate("/friends");
      return;
    }
    
    if (friends.length === 1) {
      navigate(`/chat/${friends[0]._id}`);
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

  // Filter groups based on search query
  const filteredGroups = groups.filter(group => 
    group.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    <aside className="w-80 bg-base-100 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0 shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-base-300 bg-base-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="avatar online">
              <div className="w-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100">
                <img src={authUser?.profilePic} alt={authUser?.fullName} />
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm">{authUser?.fullName}</p>
              <p className="text-xs text-base-content/60">Active now</p>
            </div>
          </div>
          <div className="dropdown dropdown-end">
            <button 
              tabIndex={0} 
              className="btn btn-ghost btn-sm btn-circle"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <MoreVertical className="size-5" />
            </button>
            {showProfileMenu && (
              <ul 
                tabIndex={0} 
                className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box w-52 border border-base-300"
                onClick={() => setShowProfileMenu(false)}
              >
                <li>
                  <Link to="/settings">
                    <Settings className="size-4" />
                    Settings
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="text-error">
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Search chats..."
            className="input input-sm w-full pl-10 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs tabs-boxed bg-base-200 p-2 border-b border-base-300">
        <Link 
          to="/" 
          className={`tab flex-1 gap-2 ${currentPath === "/" ? "tab-active" : ""}`}
        >
          <HomeIcon className="size-4" />
          Home
        </Link>
        <Link 
          to="/friends" 
          className={`tab flex-1 gap-2 ${currentPath === "/friends" ? "tab-active" : ""}`}
        >
          <UsersIcon className="size-4" />
          Friends
        </Link>
        <Link 
          to="/notifications" 
          className={`tab flex-1 gap-2 ${currentPath === "/notifications" ? "tab-active" : ""}`}
        >
          <BellIcon className="size-4" />
          Alerts
        </Link>
      </div>

      {/* Chats & Groups List */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick Actions */}
        <div className="p-3 border-b border-base-300">
          <h3 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2">Quick Actions</h3>
          <div className="space-y-1">
            <button 
              onClick={handleNewChat}
              className="btn btn-ghost btn-sm justify-start w-full gap-2 hover:bg-primary/10 hover:text-primary"
            >
              <MessageCircle className="size-4" />
              New Chat
            </button>
            <button 
              onClick={handleNewGroup}
              className="btn btn-ghost btn-sm justify-start w-full gap-2 hover:bg-accent/10 hover:text-accent"
            >
              <Users className="size-4" />
              New Group
            </button>
            <button 
              onClick={handleCreateMeeting}
              className="btn btn-ghost btn-sm justify-start w-full gap-2 hover:bg-success/10 hover:text-success"
            >
              <VideoIcon className="size-4" />
              Create Meeting
            </button>
            <Link
              to="/notifications"
              className="btn btn-ghost btn-sm justify-start w-full gap-2 hover:bg-warning/10 hover:text-warning relative"
            >
              <BellIcon className="size-4" />
              Friend Requests
              {friendRequests.length > 0 && (
                <span className="badge badge-warning badge-xs absolute right-2">
                  {friendRequests.length}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Groups Section */}
        {filteredGroups.length > 0 && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Groups</h3>
              <span className="badge badge-sm badge-primary">{groups.length}</span>
            </div>
            <div className="space-y-1">
              {filteredGroups.slice(0, 5).map((group) => (
                <button
                  key={group._id}
                  onClick={() => setSearchParams({ group: group._id })}
                  className={`flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-all w-full text-left ${
                    currentGroupId === group._id ? "bg-primary/10 border-l-4 border-primary" : ""
                  }`}
                >
                  <div className="avatar-group -space-x-3">
                    {group.members?.slice(0, 2).map((member, idx) => (
                      <div key={idx} className="avatar">
                        <div className="w-8 rounded-full ring-1 ring-base-100">
                          <img src={member.profilePic} alt={member.fullName} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{group.name}</p>
                    <p className="text-xs text-base-content/60 truncate">{group.members?.length} members</p>
                  </div>
                  {group.activeMeetingId && (
                    <div className="badge badge-success badge-xs">Live</div>
                  )}
                </button>
              ))}
            </div>
            {filteredGroups.length > 5 && (
              <button className="btn btn-ghost btn-xs w-full mt-2">
                View all {filteredGroups.length} groups
              </button>
            )}
          </div>
        )}

        {/* Active Chats with unread indicators */}
        <ChatList searchQuery={searchQuery} />
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-base-300 bg-base-200">
        <div className="flex items-center gap-2">
          <Link to="/settings" className="btn btn-ghost btn-sm flex-1 gap-2">
            <Settings className="size-4" />
            Settings
          </Link>
          <button 
            onClick={handleLogout} 
            className="btn btn-ghost btn-sm btn-square text-error"
            title="Logout"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
    
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
    </>
  );
};
export default Sidebar;
