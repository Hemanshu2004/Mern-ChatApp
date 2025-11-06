import { useState } from "react";
import { Plus, MessageCircle, Video, Users, X, UserPlus } from "lucide-react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const FloatingActionButton = ({ onCreateMeeting, friends = [], onCreateGroup }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      icon: MessageCircle,
      label: "New Chat",
      color: "bg-primary hover:bg-primary/80",
      action: () => {
        if (friends.length === 0) {
          toast.error("Add some friends first!");
          return;
        }
        const randomFriend = friends[Math.floor(Math.random() * friends.length)];
        navigate(`/chat/${randomFriend._id}`);
        toast.success(`Starting chat with ${randomFriend.fullName}!`);
        setIsOpen(false);
      }
    },
    {
      icon: Video,
      label: "Video Call",
      color: "bg-success hover:bg-success/80",
      action: () => {
        onCreateMeeting();
        setIsOpen(false);
      }
    },
    {
      icon: UserPlus,
      label: "Create Group",
      color: "bg-accent hover:bg-accent/80",
      action: () => {
        if (onCreateGroup) {
          onCreateGroup();
        } else {
          toast.success("Group creation feature coming soon!");
        }
        setIsOpen(false);
      }
    },
    {
      icon: Users,
      label: "Find Friends",
      color: "bg-secondary hover:bg-secondary/80",
      action: () => {
        document.getElementById('discover-section')?.scrollIntoView({ behavior: 'smooth' });
        toast.success("Scroll down to discover new friends!");
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Action Buttons */}
      <div className={`flex flex-col gap-3 mb-4 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`${action.color} text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-200 flex items-center gap-2 group`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-primary hover:bg-primary/80 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-200 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default FloatingActionButton;
