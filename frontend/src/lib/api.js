import { axiosInstance } from "./axios";

// 🧑‍💻 AUTH
export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

// 👥 FRIENDS
export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}

export async function rejectFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/reject`);
  return response.data;
}

// 👥 GROUPS
export async function createGroup(groupData) {
  const response = await axiosInstance.post("/groups/create", groupData);
  return response.data;
}

export async function getUserGroups() {
  const response = await axiosInstance.get("/groups");
  return response.data;
}

export async function getGroupDetails(groupId) {
  const response = await axiosInstance.get(`/groups/${groupId}`);
  return response.data;
}

export async function addMemberToGroup(groupId, userId) {
  const response = await axiosInstance.post(`/groups/${groupId}/members`, { userId });
  return response.data;
}

export async function removeMemberFromGroup(groupId, userId) {
  const response = await axiosInstance.delete(`/groups/${groupId}/members/${userId}`);
  return response.data;
}

export async function createGroupMeeting(groupId, hostId, hostName) {
  const response = await axiosInstance.post(`/groups/${groupId}/meeting`, {
    hostId,
    hostName,
  });
  return response.data;
}

export async function getGroupMeeting(groupId) {
  const response = await axiosInstance.get(`/groups/${groupId}/meeting`);
  return response.data;
}

export async function updateGroup(groupId, groupData) {
  const response = await axiosInstance.put(`/groups/${groupId}`, groupData);
  return response.data;
}

export async function deleteGroup(groupId) {
  const response = await axiosInstance.delete(`/groups/${groupId}`);
  return response.data;
}

// 💬 STREAM CHAT
export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

// 🎥 MEETINGS

// ✅ Create a new meeting (with host info)
export async function createMeeting(hostId, hostName) {
  const response = await axiosInstance.post("/meetings/create", {
    hostId,
    hostName,
  });
  return response.data; // { meetingId: "uuid" }
}

// ✅ Get meeting details
export async function getMeetingDetails(meetingId) {
  const response = await axiosInstance.get(`/meetings/${meetingId}`);
  return response.data;
}

// ✅ Join a meeting (guest)
export async function joinMeeting(meetingId, userId, name) {
  const response = await axiosInstance.post(`/meetings/${meetingId}/join`, {
    userId,
    name,
  });
  return response.data; // { status: "waiting" | "approved" }
}

// Respond to a join request (approve/reject)
export async function respondToJoinRequest(meetingId, userId, action) {
  const response = await axiosInstance.post(
    `/meetings/${meetingId}/respond`,
    { userId, action }
  );
  return response.data;
}

// End meeting (host only)
export async function endMeeting(meetingId) {
  const response = await axiosInstance.delete(`/meetings/${meetingId}`);
  return response.data;
}

// 📸 STATUS/STORIES

// Create status
export async function createStatus(statusData) {
  const response = await axiosInstance.post("/status", statusData);
  return response.data;
}

// Get friends' statuses
export async function getFriendsStatuses() {
  const response = await axiosInstance.get("/status/friends");
  return response.data;
}

// Get my statuses
export async function getMyStatuses() {
  const response = await axiosInstance.get("/status/my");
  return response.data;
}

// View status
export async function viewStatus(statusId) {
  const response = await axiosInstance.post(`/status/${statusId}/view`);
  return response.data;
}

// Delete status
export async function deleteStatus(statusId) {
  const response = await axiosInstance.delete(`/status/${statusId}`);
  return response.data;
}
