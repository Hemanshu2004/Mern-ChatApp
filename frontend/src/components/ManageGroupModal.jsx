import { useState } from "react";
import { X, Edit, UserPlus, UserMinus, Trash2, LogOut, Save } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateGroup, deleteGroup, addMemberToGroup, removeMemberFromGroup, getUserFriends } from "../lib/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const ManageGroupModal = ({ isOpen, onClose, group, isAdmin, currentUserId }) => {
  const [activeTab, setActiveTab] = useState("details"); // details, members, danger
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(group?.name || "");
  const [groupDescription, setGroupDescription] = useState(group?.description || "");
  const [groupLanguage, setGroupLanguage] = useState(group?.language || "");
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState(new Set());

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch friends list for adding members
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: isOpen && showAddMembers,
  });

  // Filter friends who are not already group members
  const availableFriends = friends.filter(
    friend => !group.members.some(member => member._id === friend._id)
  );

  const { mutate: updateGroupMutation, isPending: isUpdating } = useMutation({
    mutationFn: (data) => updateGroup(group._id, data),
    onSuccess: (updatedGroup) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", group._id] });
      toast.success("Group updated successfully!");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to update group");
    }
  });

  const { mutate: deleteGroupMutation, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteGroup(group._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Group deleted successfully");
      onClose();
      navigate("/");
    },
    onError: () => {
      toast.error("Failed to delete group");
    }
  });

  const { mutate: addMemberMutation, isPending: isAddingMember } = useMutation({
    mutationFn: (userId) => addMemberToGroup(group._id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", group._id] });
      toast.success("Member added successfully!");
      setSelectedFriends(new Set());
      setShowAddMembers(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  });

  const { mutate: removeMemberMutation, isPending: isRemovingMember } = useMutation({
    mutationFn: (userId) => removeMemberFromGroup(group._id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", group._id] });
      toast.success("Member removed successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  });

  const handleUpdateGroup = () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    updateGroupMutation({
      name: groupName.trim(),
      description: groupDescription.trim(),
      language: groupLanguage,
    });
  };

  const handleDeleteGroup = () => {
    if (window.confirm(`Are you sure you want to delete "${group.name}"? This action cannot be undone.`)) {
      deleteGroupMutation();
    }
  };

  const handleLeaveGroup = () => {
    if (window.confirm(`Are you sure you want to leave "${group.name}"?`)) {
      removeMemberMutation(currentUserId);
      onClose();
      navigate("/");
    }
  };

  const handleAddMembers = () => {
    if (selectedFriends.size === 0) {
      toast.error("Please select at least one friend");
      return;
    }

    // Add first selected friend (extend this to add multiple if needed)
    const userId = Array.from(selectedFriends)[0];
    addMemberMutation(userId);
  };

  const handleRemoveMember = (userId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      removeMemberMutation(userId);
    }
  };

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-base-100 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h3 className="text-xl font-semibold">Manage Group</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-200 mx-6 mt-4">
          <a 
            className={`tab ${activeTab === "details" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </a>
          <a 
            className={`tab ${activeTab === "members" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            Members ({group.members?.length || 0})
          </a>
          {isAdmin && (
            <a 
              className={`tab ${activeTab === "danger" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("danger")}
            >
              Danger Zone
            </a>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {isAdmin && (
                <div className="flex justify-end">
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="btn btn-primary btn-sm gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Group
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setIsEditing(false);
                          setGroupName(group.name);
                          setGroupDescription(group.description);
                          setGroupLanguage(group.language);
                        }}
                        className="btn btn-ghost btn-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleUpdateGroup}
                        disabled={isUpdating}
                        className="btn btn-primary btn-sm gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="label">
                  <span className="label-text font-medium">Group Name</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                ) : (
                  <p className="text-lg font-semibold">{group.name}</p>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                {isEditing ? (
                  <textarea
                    className="textarea textarea-bordered w-full h-24"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                  />
                ) : (
                  <p className="text-base-content/70">{group.description || "No description"}</p>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Primary Language</span>
                </label>
                {isEditing ? (
                  <select
                    className="select select-bordered w-full"
                    value={groupLanguage}
                    onChange={(e) => setGroupLanguage(e.target.value)}
                  >
                    <option value="">Select language</option>
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="hindi">Hindi</option>
                    <option value="chinese">Chinese</option>
                    <option value="japanese">Japanese</option>
                    <option value="arabic">Arabic</option>
                  </select>
                ) : (
                  <p className="text-base-content/70 capitalize">{group.language || "Not specified"}</p>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Admin</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      <img src={group.admin?.profilePic} alt={group.admin?.fullName} />
                    </div>
                  </div>
                  <span className="font-medium">{group.admin?.fullName}</span>
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div className="space-y-4">
              {isAdmin && (
                <div className="flex justify-end">
                  <button 
                    onClick={() => setShowAddMembers(!showAddMembers)}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Members
                  </button>
                </div>
              )}

              {/* Add Members Section */}
              {showAddMembers && isAdmin && (
                <div className="card bg-base-200 p-4">
                  <h4 className="font-semibold mb-3">Select Friends to Add</h4>
                  {availableFriends.length === 0 ? (
                    <p className="text-sm opacity-70">All your friends are already in this group!</p>
                  ) : (
                    <>
                      <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                        {availableFriends.map((friend) => (
                          <label
                            key={friend._id}
                            className="flex items-center gap-3 p-2 rounded hover:bg-base-300 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="checkbox checkbox-primary checkbox-sm"
                              checked={selectedFriends.has(friend._id)}
                              onChange={() => {
                                const newSelected = new Set(selectedFriends);
                                if (newSelected.has(friend._id)) {
                                  newSelected.delete(friend._id);
                                } else {
                                  newSelected.add(friend._id);
                                }
                                setSelectedFriends(newSelected);
                              }}
                            />
                            <div className="avatar">
                              <div className="w-8 h-8 rounded-full">
                                <img src={friend.profilePic} alt={friend.fullName} />
                              </div>
                            </div>
                            <span className="text-sm">{friend.fullName}</span>
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={handleAddMembers}
                        disabled={isAddingMember || selectedFriends.size === 0}
                        className="btn btn-primary btn-sm w-full"
                      >
                        {isAddingMember ? "Adding..." : `Add ${selectedFriends.size} Member(s)`}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Members List */}
              <div className="space-y-2">
                {group.members?.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full">
                          <img src={member.profilePic} alt={member.fullName} />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{member.fullName}</p>
                        {member._id === group.admin?._id && (
                          <span className="text-xs badge badge-warning">Admin</span>
                        )}
                      </div>
                    </div>
                    
                    {isAdmin && member._id !== group.admin?._id && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        disabled={isRemovingMember}
                        className="btn btn-error btn-xs btn-ghost gap-1"
                      >
                        <UserMinus className="w-3 h-3" />
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === "danger" && isAdmin && (
            <div className="space-y-6">
              <div className="alert alert-warning">
                <span>⚠️ These actions cannot be undone. Please be careful.</span>
              </div>

              <div className="card bg-base-200 p-4">
                <h4 className="font-semibold text-error mb-2">Delete Group</h4>
                <p className="text-sm opacity-70 mb-4">
                  Permanently delete this group. All members will be removed and chat history will be lost.
                </p>
                <button
                  onClick={handleDeleteGroup}
                  disabled={isDeleting}
                  className="btn btn-error gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Deleting..." : "Delete Group"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isAdmin && (
          <div className="p-6 border-t border-base-300">
            <button
              onClick={handleLeaveGroup}
              className="btn btn-error btn-outline w-full gap-2"
            >
              <LogOut className="w-4 h-4" />
              Leave Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageGroupModal;
