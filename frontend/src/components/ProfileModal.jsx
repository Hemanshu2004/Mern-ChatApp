import { X, Mail, MapPin, Globe, Calendar, MessageCircle, Video, UserPlus, UserMinus, UserCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tantml:react-query";
import { sendFriendRequest, getUserFriends } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

const ProfileModal = ({ isOpen, onClose, user }) => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: !!authUser,
  });

  const isFriend = friends.some(friend => friend._id === user?._id);
  const isOwnProfile = authUser?._id === user?._id;

  const sendRequestMutation = useMutation({
    mutationFn: (recipientId) => sendFriendRequest(recipientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      toast.success("Friend request sent!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send request");
    },
  });

  if (!isOpen || !user) return null;

  const handleStartChat = () => {
    // Navigate to chat with user
    window.location.href = `/chat/${user._id}`;
  };

  const handleVideoCall = () => {
    toast("Starting video call...", { icon: "📞" });
    // Implement video call logic
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-base-100 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-primary to-secondary relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 btn btn-circle btn-sm bg-base-100/90 hover:bg-base-100 border-none"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="p-6 -mt-16">
          <div className="flex items-end gap-4 mb-6">
            <div className="avatar online">
              <div className="w-32 rounded-full ring-4 ring-base-100 shadow-xl">
                <img src={user.profilePic} alt={user.fullName} />
              </div>
            </div>
            <div className="flex-1 mb-4">
              <h2 className="text-3xl font-bold mb-1">{user.fullName}</h2>
              <p className="text-base-content/60 flex items-center gap-1">
                <span className="size-2 rounded-full bg-success inline-block"></span>
                Active now
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="flex gap-2 mb-6">
              <button 
                onClick={handleStartChat}
                className="btn btn-primary flex-1 gap-2"
              >
                <MessageCircle className="size-4" />
                Message
              </button>
              <button 
                onClick={handleVideoCall}
                className="btn btn-success gap-2"
              >
                <Video className="size-4" />
                Call
              </button>
              {!isFriend ? (
                <button 
                  onClick={() => sendRequestMutation.mutate(user._id)}
                  disabled={sendRequestMutation.isPending}
                  className="btn btn-outline gap-2"
                >
                  <UserPlus className="size-4" />
                  Add Friend
                </button>
              ) : (
                <button className="btn btn-ghost gap-2" disabled>
                  <UserCheck className="size-4" />
                  Friends
                </button>
              )}
            </div>
          )}

          {/* Bio */}
          {user.bio && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-base-content/70">{user.bio}</p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-base-content/60">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {user.location && (
              <div className="card bg-base-200">
                <div className="card-body p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <MapPin className="size-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-base-content/60">Location</p>
                      <p className="font-medium">{user.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Languages */}
          <div className="card bg-base-200 mb-6">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Globe className="size-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-base-content/60 mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge badge-primary">
                      Native: {user.nativeLanguage}
                    </span>
                    <span className="badge badge-secondary">
                      Learning: {user.learningLanguage}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <Calendar className="size-4" />
            <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
