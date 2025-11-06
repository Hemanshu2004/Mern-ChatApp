import { useState } from "react";
import { Link } from "react-router";
import {
  MessageCircle,
  Video,
  Users,
  MoreHorizontal,
  Settings,
  UserPlus,
  Crown,
  Trash2,
  Calendar
} from "lucide-react";
import toast from "react-hot-toast";
import ManageGroupModal from "./ManageGroupModal";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGroup } from "../lib/api";
import { useNavigate } from "react-router";

const GroupCard = ({ group, isCreator = false }) => {
  const [showManageModal, setShowManageModal] = useState(false);
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: deleteGroupMutation } = useMutation({
    mutationFn: () => deleteGroup(group._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Group deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete group");
    }
  });

  const handleVideoCall = () => {
    toast.success(`Starting group meeting for ${group.name}!`);
    // Navigate to group meeting creation
  };

  const handleManageGroup = () => {
    setShowManageModal(true);
  };

  const handleDeleteGroup = () => {
    if (window.confirm(`Are you sure you want to delete "${group.name}"? This action cannot be undone.`)) {
      deleteGroupMutation();
    }
  };

  return (
    <div className="card bg-base-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-base-300 group animate-fade-in">
      <div className="card-body p-6">
        {/* Group Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="avatar-group -space-x-2">
            {group.members?.slice(0, 3).map((member, index) => (
              <div key={member._id} className="avatar">
                <div className="w-10 h-10 rounded-full ring-2 ring-base-100">
                  <img src={member.profilePic} alt={member.fullName} className="object-cover" />
                </div>
              </div>
            ))}
            {group.members?.length > 3 && (
              <div className="avatar placeholder">
                <div className="w-10 h-10 bg-neutral text-neutral-content rounded-full">
                  <span className="text-xs">+{group.members.length - 3}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                {group.name}
              </h3>
              {isCreator && (
                <Crown className="w-4 h-4 text-warning" title="Group Creator" />
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Users className="w-3 h-3 text-base-content/40" />
              <span className="text-xs text-base-content/60">
                {group.members?.length || 0} members
              </span>
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
                <button onClick={handleManageGroup} className="text-xs flex items-center gap-2">
                  <Settings className="w-3 h-3" />
                  Manage Group
                </button>
              </li>
              {isCreator && (
                <>
                  <div className="divider my-1"></div>
                  <li>
                    <button 
                      onClick={handleDeleteGroup}
                      className="text-xs text-error flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete Group
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Group Description */}
        {group.description && (
          <p className="text-sm text-base-content/70 mb-4 line-clamp-2">
            {group.description}
          </p>
        )}

        {/* Language Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge badge-primary text-xs">
            {group.language || 'Multi-language'}
          </span>
          <span className="badge badge-outline text-xs">
            Learning Group
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link 
            to={`/group/${group._id}`} 
            className="btn btn-primary btn-sm flex-1 hover:scale-105 transition-transform"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Open Chat
          </Link>
          {isCreator && (
            <button 
              onClick={handleVideoCall}
              className="btn btn-success btn-sm btn-square hover:scale-105 transition-transform tooltip tooltip-top"
              data-tip="Start Meeting"
            >
              <Video className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Manage Group Modal */}
      <ManageGroupModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        group={group}
        isAdmin={isCreator}
        currentUserId={authUser?._id}
      />
    </div>
  );
};

export default GroupCard;
