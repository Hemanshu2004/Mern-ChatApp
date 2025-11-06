import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserFriends, getRecommendedUsers, sendFriendRequest } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw,
  Home
} from "lucide-react";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { Link } from "react-router";
import toast from "react-hot-toast";

const FriendsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [showTab, setShowTab] = useState("all"); // 'all' or 'friends'
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading: loadingFriends, error: friendsError, refetch: refetchFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: allUsers = [], isLoading: loadingAllUsers, error: allUsersError, refetch: refetchAllUsers } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: getRecommendedUsers,
  });

  const sendRequestMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      toast.success("Friend request sent!");
      queryClient.invalidateQueries(["recommendedUsers"]);
      queryClient.invalidateQueries(["outgoingFriendReqs"]);
    },
    onError: () => {
      toast.error("Failed to send friend request");
    },
  });

  const loading = loadingFriends || loadingAllUsers;
  const error = friendsError || allUsersError;

  // Get friend IDs for filtering
  const friendIds = friends.map(f => f._id);

  // Filter users based on tab
  const usersToShow = showTab === "friends" 
    ? friends 
    : allUsers.filter(user => 
        user._id !== authUser?._id && // Exclude self
        !friendIds.includes(user._id) // Exclude existing friends
      );

  // Filter users based on search and language
  const filteredUsers = usersToShow.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = filterLanguage === "all" || 
                           user.nativeLanguage === filterLanguage || 
                           user.learningLanguage === filterLanguage;
    return matchesSearch && matchesLanguage;
  });

  // Get unique languages for filter dropdown
  const availableLanguages = [...new Set([
    ...allUsers.map(f => f.nativeLanguage),
    ...allUsers.map(f => f.learningLanguage)
  ])].filter(Boolean);

  const handleRefresh = () => {
    if (showTab === "friends") {
      refetchFriends();
    } else {
      refetchAllUsers();
    }
    toast.success("List refreshed!");
  };

  const handleSendRequest = (userId) => {
    sendRequestMutation.mutate(userId);
  };

  const isFriend = (userId) => friendIds.includes(userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* All Friends Section */}
        <div className="bg-base-100 rounded-2xl shadow-lg p-8 border border-base-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">
                  {showTab === "friends" ? "My Friends" : "Discover Users"}
                </h2>
                <p className="text-base-content/60 text-sm">
                  {showTab === "friends" ? "Your language learning partners" : "Find new people to connect with"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="badge badge-primary">{filteredUsers.length} {showTab === "friends" ? "friends" : "users"}</div>
              <button
                onClick={handleRefresh}
                className="btn btn-outline btn-sm gap-2 hover:scale-105 transition-transform"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link to="/" className="btn btn-primary btn-sm gap-2 hover:scale-105 transition-transform">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs tabs-boxed mb-6 bg-base-200">
            <button 
              className={`tab ${showTab === "all" ? "tab-active" : ""}`}
              onClick={() => setShowTab("all")}
            >
              Discover New Users
            </button>
            <button 
              className={`tab ${showTab === "friends" ? "tab-active" : ""}`}
              onClick={() => setShowTab("friends")}
            >
              My Friends ({friends.length})
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Search friends by name..."
                className="input input-bordered w-full pl-10 bg-base-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="select select-bordered bg-base-200"
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
              >
                <option value="all">All Languages</option>
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <button className="btn btn-ghost btn-square">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="alert alert-error mb-6">
              <span>Failed to load friends. Please try again later.</span>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            searchTerm || filterLanguage !== "all" ? (
              <div className="card bg-base-200 p-8 text-center border-2 border-dashed border-base-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-base-300 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-base-content/40" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No matches found</h3>
                <p className="text-base-content/60">Try adjusting your search or filters</p>
              </div>
            ) : showTab === "friends" ? (
              <NoFriendsFound />
            ) : (
              <div className="card bg-base-200 p-8 text-center border-2 border-dashed border-base-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-base-300 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-base-content/40" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No new users available</h3>
                <p className="text-base-content/60">Check back later for new members</p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-6">
              {filteredUsers.map((user) => (
                <div key={user._id} className="group">
                  <FriendCard 
                    friend={user} 
                    showAddButton={showTab === "all" && !isFriend(user._id)}
                    onAddFriend={() => handleSendRequest(user._id)}
                    isAddingFriend={sendRequestMutation.isPending}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
