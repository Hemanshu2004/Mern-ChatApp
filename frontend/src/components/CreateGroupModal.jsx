import { useState } from "react";
import { X, Users, Globe, Plus, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroup } from "../lib/api";
import toast from "react-hot-toast";

const CreateGroupModal = ({ isOpen, onClose, friends = [] }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupLanguage, setGroupLanguage] = useState("");
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const { mutate: createGroupMutation, isPending } = useMutation({
    mutationFn: createGroup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success(`Group "${groupName}" created successfully! 🎉`);
      handleClose();
    },
    onError: (error) => {
      toast.error("Failed to create group. Please try again.");
      console.error("Error creating group:", error);
    }
  });

  const filteredFriends = friends.filter(friend =>
    friend.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMemberToggle = (friendId) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    const groupData = {
      name: groupName.trim(),
      description: groupDescription.trim(),
      language: groupLanguage,
      members: Array.from(selectedMembers)
    };
    createGroupMutation(groupData);
  };

  const handleClose = () => {
    setGroupName("");
    setGroupDescription("");
    setGroupLanguage("");
    setSelectedMembers(new Set());
    setSearchTerm("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4" onClick={handleClose}>
      <div 
        className="bg-base-100 rounded-2xl p-6 max-w-2xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Create New Group</h3>
          </div>
          <button 
            onClick={handleClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Details */}
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Group Name *</span>
              </label>
              <input
                type="text"
                placeholder="Enter group name..."
                className="input input-bordered w-full"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                placeholder="What's this group about?"
                className="textarea textarea-bordered w-full h-20 resize-none"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Primary Language</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={groupLanguage}
                onChange={(e) => setGroupLanguage(e.target.value)}
              >
                <option value="">Select language (optional)</option>
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="italian">Italian</option>
                <option value="portuguese">Portuguese</option>
                <option value="chinese">Chinese</option>
                <option value="japanese">Japanese</option>
                <option value="korean">Korean</option>
                <option value="hindi">Hindi</option>
                <option value="arabic">Arabic</option>
                <option value="russian">Russian</option>
              </select>
            </div>
          </div>

          {/* Member Selection */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Add Members</span>
              <span className="label-text-alt">{selectedMembers.size} selected</span>
            </label>
            
            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search friends..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
            </div>

            {/* Friends List */}
            <div className="max-h-60 overflow-y-auto border border-base-300 rounded-lg">
              {filteredFriends.length === 0 ? (
                <div className="p-4 text-center text-base-content/60">
                  {searchTerm ? "No friends match your search" : "No friends available"}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredFriends.map((friend) => (
                    <label
                      key={friend._id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={selectedMembers.has(friend._id)}
                        onChange={() => handleMemberToggle(friend._id)}
                      />
                      <div className="avatar">
                        <div className="w-8 h-8 rounded-full">
                          <img src={friend.profilePic} alt={friend.fullName} className="object-cover" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{friend.fullName}</p>
                        <p className="text-xs text-base-content/60">
                          {friend.nativeLanguage} → {friend.learningLanguage}
                        </p>
                      </div>
                      {selectedMembers.has(friend._id) && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-base-300">
            <button 
              type="button"
              onClick={handleClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary flex-1"
              disabled={!groupName.trim() || isPending}
            >
              <Plus className="w-4 h-4 mr-1" />
              {isPending ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
