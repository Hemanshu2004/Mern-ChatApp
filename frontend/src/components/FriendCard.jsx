import { Link, useNavigate } from "react-router";
import { MessageCircle, Video, MoreHorizontal, UserMinus, User, Phone, UserPlus } from "lucide-react";
import { LANGUAGE_TO_FLAG } from "../constants";
import toast from "react-hot-toast";
import { useState } from "react";

const FriendCard = ({ friend, showAddButton = false, onAddFriend, isAddingFriend = false }) => {
  const navigate = useNavigate();
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const handleVideoCall = () => {
    toast.success(`Starting video call with ${friend.fullName}!`);
    // In a real app, this would initiate a video call
  };

  const handleViewProfile = () => {
    toast.success(`Viewing ${friend.fullName}'s profile`);
    // In a real app, this would navigate to profile page
  };

  const handleRemoveFriend = () => {
    setShowRemoveModal(true);
  };

  const confirmRemoveFriend = () => {
    toast.success(`${friend.fullName} has been removed from your friends`);
    setShowRemoveModal(false);
    // In a real app, this would call an API to remove the friend
  };
  return (
    <div className="card bg-base-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-base-300 group animate-fade-in">
      <div className="card-body p-6">
        {/* USER INFO */}
        <div className="flex items-center gap-4 mb-4">
          <div className="avatar online">
            <div className="w-14 h-14 rounded-full ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
              <img src={friend.profilePic} alt={friend.fullName} className="object-cover" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
              {friend.fullName}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-base-content/60">Online</span>
            </div>
          </div>
          <div className="dropdown dropdown-end">
            <button 
              tabIndex={0}
              className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <ul 
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-44 border border-base-300"
            >
              <li>
                <button onClick={handleViewProfile} className="text-xs flex items-center gap-2">
                  <User className="w-3 h-3" />
                  View Profile
                </button>
              </li>
              <li>
                <button onClick={handleVideoCall} className="text-xs flex items-center gap-2">
                  <Video className="w-3 h-3" />
                  Video Call
                </button>
              </li>
              <li>
                <button onClick={() => navigate(`/chat/${friend._id}`)} className="text-xs flex items-center gap-2">
                  <MessageCircle className="w-3 h-3" />
                  Send Message
                </button>
              </li>
              <div className="divider my-1"></div>
              <li>
                <button onClick={handleRemoveFriend} className="text-xs text-error flex items-center gap-2">
                  <UserMinus className="w-3 h-3" />
                  Remove Friend
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge badge-secondary text-xs gap-1 px-3 py-1">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs gap-1 px-3 py-1">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        <div className="flex gap-3">
          {showAddButton ? (
            <button 
              onClick={onAddFriend}
              disabled={isAddingFriend}
              className="btn btn-primary btn-sm flex-1 hover:scale-105 transition-transform"
            >
              {isAddingFriend ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Add Friend
                </>
              )}
            </button>
          ) : (
            <>
              <Link 
                to={`/chat/${friend._id}`} 
                className="btn btn-primary btn-sm flex-1 hover:scale-105 transition-transform"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Message
              </Link>
              <button 
                onClick={handleVideoCall}
                className="btn btn-ghost btn-sm btn-square hover:scale-105 transition-transform tooltip tooltip-top"
                data-tip="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Remove Friend Confirmation Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowRemoveModal(false)}>
          <div className="bg-base-100 rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-error/10 rounded-lg">
                <UserMinus className="w-6 h-6 text-error" />
              </div>
              <h3 className="text-lg font-semibold">Remove Friend</h3>
            </div>
            <p className="text-base-content/70 mb-4">
              Are you sure you want to remove <span className="font-semibold">{friend.fullName}</span> from your friends? 
              You can always add them back later.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowRemoveModal(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemoveFriend}
                className="btn btn-error flex-1"
              >
                Remove Friend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
