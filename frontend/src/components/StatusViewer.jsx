import { X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { viewStatus } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";

const StatusViewer = ({ statusGroup, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const currentStatus = statusGroup.statuses[currentIndex];
  const DURATION = 5000; // 5 seconds per status

  const viewStatusMutation = useMutation({
    mutationFn: viewStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendsStatuses"] });
    },
  });

  // Auto-progress timer
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (100 / DURATION) * 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex]);

  // View status on mount and change
  useEffect(() => {
    if (currentStatus) {
      viewStatusMutation.mutate(currentStatus._id);
    }
  }, [currentStatus?._id]);

  const handleNext = () => {
    if (currentIndex < statusGroup.statuses.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {statusGroup.statuses.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{
                width:
                  idx < currentIndex
                    ? "100%"
                    : idx === currentIndex
                    ? `${progress}%`
                    : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 px-4 z-10">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full ring-2 ring-white">
                <img src={statusGroup.user.profilePic} alt={statusGroup.user.fullName} />
              </div>
            </div>
            <div>
              <p className="font-semibold">{statusGroup.user.fullName}</p>
              <p className="text-xs opacity-80">
                {formatTimestamp(currentStatus.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Status Content */}
      <div className="relative w-full max-w-md h-full flex items-center justify-center">
        {currentStatus.mediaType === "text" ? (
          <div
            className="w-full h-[80vh] rounded-lg flex items-center justify-center text-white text-center p-8"
            style={{ backgroundColor: currentStatus.backgroundColor }}
          >
            <p className="text-3xl font-bold break-words">{currentStatus.content}</p>
          </div>
        ) : currentStatus.mediaType === "image" ? (
          <img
            src={currentStatus.mediaUrl}
            alt="Status"
            className="max-w-full max-h-[80vh] rounded-lg object-contain"
          />
        ) : (
          <video
            src={currentStatus.mediaUrl}
            className="max-w-full max-h-[80vh] rounded-lg"
            autoPlay
            loop
            controls
          />
        )}

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 btn btn-circle bg-white/20 hover:bg-white/30 text-white border-none"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}
        {currentIndex < statusGroup.statuses.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 btn btn-circle bg-white/20 hover:bg-white/30 text-white border-none"
          >
            <ChevronRight className="size-6" />
          </button>
        )}
      </div>

      {/* Views (for own status) */}
      {statusGroup.user._id === authUser?._id && currentStatus.views.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="size-4" />
            <span className="font-semibold">{currentStatus.views.length} views</span>
          </div>
          <div className="flex -space-x-2">
            {currentStatus.views.slice(0, 5).map((view, idx) => (
              <div key={idx} className="avatar">
                <div className="w-8 rounded-full ring-2 ring-white">
                  <img src={view.user.profilePic} alt={view.user.fullName} />
                </div>
              </div>
            ))}
            {currentStatus.views.length > 5 && (
              <div className="avatar placeholder">
                <div className="w-8 bg-neutral text-neutral-content rounded-full ring-2 ring-white">
                  <span className="text-xs">+{currentStatus.views.length - 5}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tap zones for mobile */}
      <div className="absolute inset-0 grid grid-cols-2">
        <div onClick={handlePrevious} className="cursor-pointer" />
        <div onClick={handleNext} className="cursor-pointer" />
      </div>
    </div>
  );
};

export default StatusViewer;
