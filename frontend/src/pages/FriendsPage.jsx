import { useEffect, useState } from "react";
import { getUserFriends } from "../lib/api";
import PageLoader from "../components/PageLoader.jsx";

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFriends = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserFriends();
      setFriends(res);
    } catch (err) {
      console.error("Error fetching friends:", err);
      setError("Failed to load friends. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Friends</h1>
        <button
          onClick={fetchFriends}
          className="btn btn-sm btn-outline"
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}

      {friends.length === 0 ? (
        <p className="text-gray-500">You don't have any friends yet 😅</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <div
              key={friend._id}
              className="p-4 rounded-xl bg-base-200 shadow-sm flex items-center gap-3"
            >
              <img
                src={friend.profilePic || "/default-avatar.png"}
                alt={friend.fullName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{friend.fullName}</p>
                <p className="text-sm text-gray-500">
                  {friend.nativeLanguage} → {friend.learningLanguage}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
