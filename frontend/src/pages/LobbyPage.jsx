import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMeetingDetails,
  joinMeeting,
  respondToJoinRequest,
} from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";

const LobbyPage = () => {
  const { meetingId } = useParams();
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState("loading"); // "loading" | "waiting" | "approved"
  const [meeting, setMeeting] = useState(null);

  // ✅ Fetch meeting details
  const { data, isLoading } = useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: () => getMeetingDetails(meetingId),
    refetchInterval: 3000, // auto refresh
  });

  useEffect(() => {
    if (data) setMeeting(data);
  }, [data]);

  // ✅ Join meeting
  const joinMutation = useMutation({
    mutationFn: ({ meetingId, userId, name }) =>
      joinMeeting(meetingId, userId, name),
    onSuccess: (res) => {
      setStatus(res.status);
    },
  });

  // ✅ Host respond
  const respondMutation = useMutation({
    mutationFn: ({ userId, action }) =>
      respondToJoinRequest(meetingId, userId, action),
    onSuccess: () => {
      queryClient.invalidateQueries(["meeting", meetingId]);
    },
  });

  // ✅ Auto-join on page load
  useEffect(() => {
    if (!authUser?._id || !meetingId) return;

    joinMutation.mutate({
      meetingId,
      userId: authUser._id,
      name: authUser.fullName,
    });
  }, [authUser, meetingId]);

  // ✅ Navigate to call when approved
  useEffect(() => {
    if (status === "approved") {
      navigate(`/call/${meetingId}`);
    }
  }, [status, meetingId, navigate]);

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-2">Meeting Not Found</h2>
        <p className="opacity-70">
          The meeting ID <code>{meetingId}</code> does not exist.
        </p>
      </div>
    );
  }

  const isHost = meeting.hostId === authUser?._id;

  // ✅ Host View
  if (isHost) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">
          {meeting.isGroupMeeting ? `Group Meeting: ${meeting.groupName}` : `Meeting Lobby: ${meeting.meetingId}`}
        </h1>
        <p className="text-lg mb-6">
          Welcome, <strong>{meeting.hostName || authUser.fullName}</strong>! You are the host.
        </p>

        {/* 👉 Host can start the call */}
        <button
          onClick={() => navigate(`/call/${meeting.meetingId}`)}
          className="btn btn-primary mb-8"
        >
          Start Call
        </button>

        <h2 className="text-xl font-semibold mb-4">Waiting Room</h2>

        {meeting.pendingRequests.length === 0 ? (
          <p className="opacity-70">No users waiting to join right now.</p>
        ) : (
          <ul className="space-y-3">
            {meeting.pendingRequests.map((user) => (
              <li
                key={user.userId}
                className="flex justify-between items-center bg-base-200 p-3 rounded-lg"
              >
                <span>{user.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      respondMutation.mutate({
                        userId: user.userId,
                        action: "approve",
                      })
                    }
                    className="btn btn-success btn-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      respondMutation.mutate({
                        userId: user.userId,
                        action: "reject",
                      })
                    }
                    className="btn btn-error btn-sm"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2">Approved Participants</h3>
          {meeting.participants.length <= 1 ? (
            <p className="opacity-70">No one has joined yet.</p>
          ) : (
            <p className="opacity-70">{meeting.participants.length} participants</p>
          )}
        </div>
      </div>
    );
  }

  // ✅ Guest View
  if (status === "waiting") {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-2">Waiting for Host Approval</h2>
        <p className="opacity-70">Please wait while the host approves your request...</p>
      </div>
    );
  }

  // ✅ Once approved, navigate handled by useEffect
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="opacity-70">Connecting to the call...</p>
    </div>
  );
};

export default LobbyPage;
