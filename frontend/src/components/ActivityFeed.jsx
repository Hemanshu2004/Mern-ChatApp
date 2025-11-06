import { 
  MessageCircle, 
  UserPlus, 
  Video, 
  Calendar,
  Clock,
  CheckCircle,
  ExternalLink,
  User
} from "lucide-react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const ActivityFeed = ({ friends = [] }) => {
  const navigate = useNavigate();
  const handleActivityClick = (activity) => {
    switch (activity.type) {
      case "message":
        if (friends.find(f => f.fullName === activity.user.fullName)) {
          const friend = friends.find(f => f.fullName === activity.user.fullName);
          navigate(`/chat/${friend._id}`);
          toast.success(`Opening chat with ${activity.user.fullName}`);
        } else {
          toast.error("User not found in your friends list");
        }
        break;
      case "friend_request":
        navigate("/notifications");
        toast.success("Opening friend requests");
        break;
      case "video_call":
        toast.success("Video call feature - redirecting to call page");
        break;
      case "session":
        toast.success("Learning session completed!");
        break;
      default:
        toast("Activity clicked", { icon: "ℹ️" });
    }
  };

  // Mock activity data - in real app this would come from API
  const activities = [
    {
      id: 1,
      type: "message",
      user: friends[0] || { fullName: "Sarah Chen", profilePic: "/default-avatar.png", _id: "mock1" },
      action: "sent you a message",
      time: "2 minutes ago",
      icon: MessageCircle,
      color: "text-primary",
      clickable: true
    },
    {
      id: 2,
      type: "friend_request",
      user: { fullName: "Alex Rodriguez", profilePic: "/default-avatar.png", _id: "mock2" },
      action: "accepted your friend request",
      time: "1 hour ago",
      icon: UserPlus,
      color: "text-success",
      clickable: true
    },
    {
      id: 3,
      type: "video_call",
      user: friends[1] || { fullName: "Maria Garcia", profilePic: "/default-avatar.png", _id: "mock3" },
      action: "started a video call",
      time: "3 hours ago",
      icon: Video,
      color: "text-accent",
      clickable: true
    },
    {
      id: 4,
      type: "session",
      user: friends[2] || { fullName: "John Smith", profilePic: "/default-avatar.png", _id: "mock4" },
      action: "completed a learning session",
      time: "1 day ago",
      icon: CheckCircle,
      color: "text-secondary",
      clickable: false
    }
  ];

  return (
    <div className="bg-base-100 rounded-2xl shadow-lg p-6 border border-base-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-base-content">Recent Activity</h3>
        <button 
          onClick={() => {
            toast.success("Activity history feature coming soon!");
          }}
          className="btn btn-ghost btn-sm hover:scale-105 transition-transform"
        >
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            onClick={() => activity.clickable && handleActivityClick(activity)}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
              activity.clickable 
                ? 'hover:bg-base-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]' 
                : 'hover:bg-base-100'
            }`}
          >
            <div className="avatar">
              <div className="w-10 h-10 rounded-full ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                <img src={activity.user.profilePic} alt={activity.user.fullName} className="object-cover" />
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-semibold text-base-content group-hover:text-primary transition-colors">
                  {activity.user.fullName}
                </span>
                <span className="text-base-content/70 ml-1">{activity.action}</span>
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-base-content/40" />
                <span className="text-xs text-base-content/60">{activity.time}</span>
              </div>
            </div>
            
            <div className={`p-2 rounded-lg bg-base-200 group-hover:bg-base-300 transition-colors relative`}>
              <activity.icon className={`w-4 h-4 ${activity.color}`} />
              {activity.clickable && (
                <ExternalLink className="w-3 h-3 absolute -top-1 -right-1 text-base-content/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      {activities.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-base-content/40" />
          </div>
          <p className="text-base-content/60">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
