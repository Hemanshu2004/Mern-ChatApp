import { 
  MessageCircle, 
  Video, 
  Users, 
  Calendar, 
  Settings, 
  Bell,
  Search,
  Plus,
  Sparkles
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import FriendSelectionModal from "./FriendSelectionModal";

const QuickActions = ({ onCreateMeeting, friends = [] }) => {
  const navigate = useNavigate();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);

  const handleNewChat = () => {
    if (friends.length === 0) {
      toast.error("Add some friends first to start chatting!");
      document.getElementById('discover-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    if (friends.length === 1) {
      // If only one friend, go directly to chat
      navigate(`/chat/${friends[0]._id}`);
      toast.success(`Starting chat with ${friends[0].fullName}!`);
    } else {
      // Show friend selection modal
      setShowFriendModal(true);
    }
  };

  const handleScheduleSession = () => {
    setShowScheduleModal(true);
    toast.success("Schedule feature coming soon!");
  };


  const quickActions = [
    {
      icon: MessageCircle,
      label: "New Chat",
      description: "Start a conversation",
      color: "text-primary",
      bgColor: "bg-primary/10",
      action: handleNewChat,
      badge: friends.length > 0 ? friends.length : null
    },
    {
      icon: Video,
      label: "Video Call",
      description: "Create meeting room",
      color: "text-success",
      bgColor: "bg-success/10",
      action: onCreateMeeting,
      badge: null
    },
    {
      icon: Users,
      label: "Find Friends",
      description: "Discover learners",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      action: () => {
        document.getElementById('discover-section')?.scrollIntoView({ behavior: 'smooth' });
        toast.success("Scroll down to discover new friends!");
      },
      badge: null
    },
    {
      icon: Calendar,
      label: "Schedule",
      description: "Plan sessions",
      color: "text-warning",
      bgColor: "bg-warning/10",
      action: handleScheduleSession,
      badge: "Soon"
    }
  ];

  return (
    <div className="bg-base-100 rounded-2xl shadow-lg p-6 border border-base-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-base-content">Quick Actions</h3>
        <button className="btn btn-ghost btn-sm">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="group relative p-4 rounded-xl border border-base-300 hover:border-base-content/20 transition-all duration-300 hover:scale-105 bg-base-50 hover:shadow-md active:scale-95"
          >
            {action.badge && (
              <div className="absolute -top-2 -right-2 bg-primary text-primary-content text-xs px-2 py-1 rounded-full font-semibold z-10">
                {action.badge}
              </div>
            )}
            <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon className={`w-6 h-6 ${action.color}`} />
            </div>
            <h4 className="font-semibold text-sm text-base-content mb-1">{action.label}</h4>
            <p className="text-xs text-base-content/60">{action.description}</p>
          </button>
        ))}
      </div>
      
      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowScheduleModal(false)}>
          <div className="bg-base-100 rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Schedule Session</h3>
            </div>
            <p className="text-base-content/70 mb-4">
              Schedule learning sessions with your language partners. This feature is coming soon!
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="btn btn-outline flex-1"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowScheduleModal(false);
                  toast.success("We'll notify you when scheduling is available!");
                }}
                className="btn btn-primary flex-1"
              >
                Notify Me
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Friend Selection Modal */}
      <FriendSelectionModal
        isOpen={showFriendModal}
        onClose={() => setShowFriendModal(false)}
        friends={friends}
        title="Start a Chat"
      />
    </div>
  );
};

export default QuickActions;
