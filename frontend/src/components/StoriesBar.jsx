import { Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFriendsStatuses, getMyStatuses, createStatus } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { useState } from "react";
import StatusViewer from "./StatusViewer";
import toast from "react-hot-toast";

const StoriesBar = () => {
  const { authUser } = useAuthUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState(null);
  const [statusContent, setStatusContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#1e40af");
  const queryClient = useQueryClient();

  const { data: friendsStatuses = [] } = useQuery({
    queryKey: ["friendsStatuses"],
    queryFn: getFriendsStatuses,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: myStatuses = [] } = useQuery({
    queryKey: ["myStatuses"],
    queryFn: getMyStatuses,
    refetchInterval: 30000,
  });

  const createStatusMutation = useMutation({
    mutationFn: createStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendsStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["myStatuses"] });
      toast.success("Status created!");
      setShowCreateModal(false);
      setStatusContent("");
    },
    onError: () => {
      toast.error("Failed to create status");
    },
  });

  const handleCreateStatus = () => {
    if (!statusContent.trim()) {
      toast.error("Please enter some content");
      return;
    }

    createStatusMutation.mutate({
      content: statusContent.trim(),
      mediaType: "text",
      backgroundColor,
    });
  };

  const handleStatusClick = (statusGroup) => {
    setSelectedStatuses(statusGroup);
    setShowViewer(true);
  };

  const colors = [
    "#1e40af", "#dc2626", "#16a34a", "#9333ea", 
    "#ea580c", "#0891b2", "#db2777", "#65a30d"
  ];

  return (
    <>
      <div className="bg-base-100 border-b border-base-300 py-4 px-6">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          {/* Create Status */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="relative">
                <div className="avatar">
                  <div className="w-16 rounded-full ring-2 ring-base-300">
                    <img src={authUser?.profilePic} alt="Your Status" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 btn btn-primary btn-circle btn-xs">
                  <Plus className="size-3" />
                </div>
              </div>
              <span className="text-xs font-medium">Your Status</span>
            </button>
          </div>

          {/* Friends' Statuses */}
          {friendsStatuses.map((statusGroup) => {
            const isOwn = statusGroup.user._id === authUser?._id;
            if (isOwn) return null; // Don't show own status twice

            const hasUnviewed = statusGroup.statuses.some(
              (status) =>
                !status.views.some((view) => view.user._id === authUser?._id)
            );

            return (
              <div key={statusGroup.user._id} className="flex-shrink-0">
                <button
                  onClick={() => handleStatusClick(statusGroup)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`avatar ${
                      hasUnviewed ? "ring-4 ring-primary ring-offset-2 ring-offset-base-100" : "ring-2 ring-base-300"
                    }`}
                  >
                    <div className="w-16 rounded-full">
                      <img
                        src={statusGroup.user.profilePic}
                        alt={statusGroup.user.fullName}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium truncate max-w-[64px]">
                    {statusGroup.user.fullName.split(" ")[0]}
                  </span>
                </button>
              </div>
            );
          })}

          {friendsStatuses.length === 0 && myStatuses.length === 0 && (
            <div className="flex items-center gap-2 text-base-content/60 text-sm ml-4">
              <span>No stories yet. Be the first to share!</span>
            </div>
          )}
        </div>
      </div>

      {/* Create Status Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-base-100 rounded-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Create Status</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Preview */}
              <div
                className="rounded-xl p-6 min-h-[200px] flex items-center justify-center text-white text-center"
                style={{ backgroundColor }}
              >
                <p className="text-2xl font-bold">
                  {statusContent || "Type your status..."}
                </p>
              </div>

              {/* Content Input */}
              <textarea
                className="textarea textarea-bordered w-full h-24"
                placeholder="What's on your mind?"
                value={statusContent}
                onChange={(e) => setStatusContent(e.target.value)}
                maxLength={200}
              />

              {/* Color Picker */}
              <div>
                <p className="text-sm font-medium mb-2">Background Color</p>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackgroundColor(color)}
                      className={`w-10 h-10 rounded-full border-4 ${
                        backgroundColor === color
                          ? "border-primary scale-110"
                          : "border-transparent"
                      } transition-all`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStatus}
                  disabled={createStatusMutation.isPending}
                  className="btn btn-primary flex-1"
                >
                  {createStatusMutation.isPending ? "Creating..." : "Share"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Viewer */}
      {showViewer && selectedStatuses && (
        <StatusViewer
          statusGroup={selectedStatuses}
          onClose={() => {
            setShowViewer(false);
            setSelectedStatuses(null);
          }}
        />
      )}
    </>
  );
};

export default StoriesBar;
