import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests, rejectFriendRequest } from "../lib/api";
import { 
  BellIcon, 
  ClockIcon, 
  MessageSquareIcon, 
  UserCheckIcon,
  UserPlus,
  Users,
  Check,
  X,
  RefreshCw,
  Filter,
  Search,
  Globe,
  TrendingUp,
  Star,
  MessageCircle,
  Video
} from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import { Link } from "react-router";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";
import { useState } from "react";
import { getLanguageFlag } from "../components/FriendCard";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: friendRequests, isLoading, refetch } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending: acceptPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: (data, requestId) => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Friend request accepted! 🎉");
    },
    onError: () => {
      toast.error("Failed to accept friend request");
    }
  });

  const { mutate: rejectRequestMutation, isPending: rejectPending } = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      toast.success("Friend request rejected");
    },
    onError: () => {
      toast.error("Failed to reject friend request");
    }
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  // Filter requests based on search
  const filteredIncoming = incomingRequests.filter(request =>
    request.sender.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    refetch();
    toast.success("Notifications refreshed!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Enhanced Header */}
        <div className="bg-base-100 rounded-2xl shadow-lg p-6 border border-base-300">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full">
                    <img src={authUser?.profilePic} alt={authUser?.fullName} />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
                    Notifications 🔔
                  </h1>
                  <p className="text-base-content/60">Manage your friend requests and updates</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="stat bg-primary/10 rounded-lg p-3 min-w-0">
                  <div className="stat-figure text-primary">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div className="stat-value text-lg text-primary">{incomingRequests.length}</div>
                  <div className="stat-desc text-primary/70">Pending</div>
                </div>
                <div className="stat bg-success/10 rounded-lg p-3 min-w-0">
                  <div className="stat-figure text-success">
                    <UserCheckIcon className="w-6 h-6" />
                  </div>
                  <div className="stat-value text-lg text-success">{acceptedRequests.length}</div>
                  <div className="stat-desc text-success/70">Accepted</div>
                </div>
                <div className="stat bg-accent/10 rounded-lg p-3 min-w-0">
                  <div className="stat-figure text-accent">
                    <BellIcon className="w-6 h-6" />
                  </div>
                  <div className="stat-value text-lg text-accent">{incomingRequests.length + acceptedRequests.length}</div>
                  <div className="stat-desc text-accent/70">Total</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRefresh}
                className="btn btn-outline btn-sm gap-2 hover:scale-105 transition-transform"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link to="/" className="btn btn-primary btn-sm gap-2 hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Friend Requests Section */}
            {incomingRequests.length > 0 && (
              <div className="bg-base-100 rounded-2xl shadow-lg p-8 border border-base-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <UserPlus className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-base-content">Friend Requests</h2>
                      <p className="text-base-content/60 text-sm">People who want to connect with you</p>
                    </div>
                  </div>
                  <div className="badge badge-primary">{filteredIncoming.length} requests</div>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Search friend requests..."
                    className="input input-bordered w-full pl-10 bg-base-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  {filteredIncoming.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 border border-base-300 group"
                    >
                      <div className="card-body p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="avatar online">
                              <div className="w-16 h-16 rounded-full ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                                <img src={request.sender.profilePic} alt={request.sender.fullName} className="object-cover" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                {request.sender.fullName}
                              </h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="badge badge-secondary gap-1 px-3 py-1">
                                  {getLanguageFlag(request.sender.nativeLanguage)}
                                  Native: {request.sender.nativeLanguage}
                                </span>
                                <span className="badge badge-outline gap-1 px-3 py-1">
                                  {getLanguageFlag(request.sender.learningLanguage)}
                                  Learning: {request.sender.learningLanguage}
                                </span>
                              </div>
                              {request.sender.bio && (
                                <p className="text-sm text-base-content/70 mt-2">{request.sender.bio}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              className="btn btn-outline btn-sm hover:scale-105 transition-transform"
                              onClick={() => rejectRequestMutation(request._id)}
                              disabled={rejectPending}
                            >
                              <X className="w-4 h-4" />
                              Decline
                            </button>
                            <button
                              className="btn btn-primary btn-sm hover:scale-105 transition-transform"
                              onClick={() => acceptRequestMutation(request._id)}
                              disabled={acceptPending}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Connections Section */}
            {acceptedRequests.length > 0 && (
              <div className="bg-base-100 rounded-2xl shadow-lg p-8 border border-base-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <UserCheckIcon className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-base-content">New Connections</h2>
                    <p className="text-base-content/60 text-sm">Recent friend request acceptances</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {acceptedRequests.map((notification) => (
                    <div key={notification._id} className="card bg-base-200 hover:shadow-lg transition-all duration-300 border border-base-300">
                      <div className="card-body p-6">
                        <div className="flex items-center gap-4">
                          <div className="avatar">
                            <div className="w-12 h-12 rounded-full">
                              <img
                                src={notification.recipient.profilePic}
                                alt={notification.recipient.fullName}
                                className="object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-base-content">
                              {notification.recipient.fullName}
                            </h3>
                            <p className="text-sm text-base-content/70 mt-1">
                              {notification.recipient.fullName} accepted your friend request
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                              <ClockIcon className="w-3 h-3 text-base-content/40" />
                              <span className="text-xs text-base-content/60">Recently</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              to={`/chat/${notification.recipient._id}`}
                              className="btn btn-primary btn-sm hover:scale-105 transition-transform"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Chat
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
              <NoNotificationsFound />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;
