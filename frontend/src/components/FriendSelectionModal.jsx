import { useState } from "react";
import { Search, MessageCircle, X, Users } from "lucide-react";
import { useSearchParams } from "react-router";
import toast from "react-hot-toast";

const FriendSelectionModal = ({ isOpen, onClose, friends = [], title = "Select a Friend" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const filteredFriends = friends.filter(friend =>
    friend.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFriendSelect = (friend) => {
    setSearchParams({ chat: friend._id });
    toast.success(`Starting chat with ${friend.fullName}!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-base-100 rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Search friends..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Friends List */}
        <div className="max-h-60 overflow-y-auto space-y-2">
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-base-content/40" />
              </div>
              <p className="text-base-content/60">
                {searchTerm ? "No friends match your search" : "No friends available"}
              </p>
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <button
                key={friend._id}
                onClick={() => handleFriendSelect(friend)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors group"
              >
                <div className="avatar online">
                  <div className="w-10 h-10 rounded-full">
                    <img src={friend.profilePic} alt={friend.fullName} className="object-cover" />
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {friend.fullName}
                  </h4>
                  <p className="text-xs text-base-content/60">
                    Learning {friend.learningLanguage}
                  </p>
                </div>
                <MessageCircle className="w-4 h-4 text-base-content/40 group-hover:text-primary transition-colors" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-base-300">
          <button 
            onClick={onClose}
            className="btn btn-outline w-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendSelectionModal;
