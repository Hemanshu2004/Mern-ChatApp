import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStreamToken, getMeetingDetails, respondToJoinRequest, endMeeting } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";
import { CheckIcon, XIcon, UsersIcon } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // Query meeting details to get pending requests
  const { data: meetingData } = useQuery({
    queryKey: ["meeting", callId],
    queryFn: async () => {
      try {
        return await getMeetingDetails(callId);
      } catch (error) {
        // Silently handle 404 - meeting may not exist yet or has ended
        if (error?.response?.status === 404) {
          return null;
        }
        return null; // Return null for any error
      }
    },
    enabled: !!callId,
    refetchInterval: 5000, // Refresh every 5 seconds
    retry: 1,
    retryDelay: 2000,
    staleTime: 1000,
  });

  useEffect(() => {
    let isMounted = true;
    let videoClient = null;
    let callInstance = null;
    let hasJoined = false;

    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId) return;
      if (!isMounted) return;

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        // Use singleton pattern to avoid duplicate clients
        videoClient = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        if (!isMounted) return;

        callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });
        hasJoined = true;

        if (!isMounted) {
          // If unmounted after join, leave immediately
          if (hasJoined) {
            callInstance.leave().catch(() => {});
          }
          return;
        }

        console.log("Joined call successfully");
        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        if (isMounted) {
          toast.error("Could not join the call. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsConnecting(false);
        }
      }
    };

    initCall();

    // Cleanup function
    return () => {
      isMounted = false;
      
      // Only leave if we successfully joined
      if (callInstance && hasJoined) {
        try {
          // Check if call is still active before leaving
          const state = callInstance.state;
          if (state?.callingState !== 'left') {
            callInstance.leave().catch(() => {
              // Silently catch errors - call might already be left
            });
          }
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, [tokenData, authUser, callId]);

  if (isLoading || tokenLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-base-200">
      {client && call ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <CallContent meetingData={meetingData} authUser={authUser} callId={callId} isConnecting={isConnecting} />
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p>Could not initialize call. Please refresh or try again later.</p>
        </div>
      )}
    </div>
  );
};

const CallContent = ({ meetingData, authUser, callId, isConnecting }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showRequests, setShowRequests] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // Mutation to respond to join requests
  const respondMutation = useMutation({
    mutationFn: ({ userId, action }) =>
      respondToJoinRequest(callId, userId, action),
    onSuccess: () => {
      queryClient.invalidateQueries(["meeting", callId]);
      toast.success("Request handled successfully");
    },
    onError: () => {
      toast.error("Failed to handle request");
    },
  });

  // Mutation to end meeting (host only)
  const endMeetingMutation = useMutation({
    mutationFn: () => endMeeting(callId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting", callId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Meeting ended successfully");
      navigate("/");
    },
    onError: () => {
      toast.error("Failed to end meeting");
      setIsEnding(false);
    }
  });

  useEffect(() => {
    // When user leaves the call
    if (callingState === CallingState.LEFT && !isEnding) {
      const isHost = meetingData?.hostId === authUser?._id;
      
      if (isHost) {
        // Host ending - clean up meeting
        setIsEnding(true);
        endMeetingMutation.mutate();
      } else {
        // Regular user leaving - just navigate
        navigate("/");
      }
    }
  }, [callingState, navigate, isEnding, meetingData, authUser, endMeetingMutation]);

  // Track if we've ever had meeting data
  const [hadMeetingData, setHadMeetingData] = useState(false);

  useEffect(() => {
    if (meetingData && meetingData !== null) {
      setHadMeetingData(true);
    }
  }, [meetingData]);

  // Check if meeting was ended (only after we had data)
  useEffect(() => {
    if (meetingData === null && hadMeetingData && !isEnding && !isConnecting) {
      // Meeting existed before but now gone - was ended by host
      toast("Meeting has ended", { icon: "ℹ️" });
      navigate("/");
    }
  }, [meetingData, navigate, isEnding, hadMeetingData, isConnecting]);

  // Check if user is host
  const isHost = meetingData?.hostId === authUser?._id;
  const pendingRequests = meetingData?.pendingRequests || [];

  // Auto-show requests panel when new requests arrive
  useEffect(() => {
    if (isHost && pendingRequests.length > 0) {
      setShowRequests(true);
      // Show toast notification for new requests
      toast(`${pendingRequests.length} user(s) want to join the meeting`, {
        icon: '👥',
        duration: 4000,
      });
    }
  }, [isHost, pendingRequests.length]);

  return (
    <StreamTheme>
      <div className="flex flex-col h-screen relative">
        <div className="flex-1">
          <SpeakerLayout />
        </div>
        
        {/* Join Requests Notification for Host */}
        {isHost && pendingRequests.length > 0 && (
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setShowRequests(!showRequests)}
              className="btn btn-warning btn-sm flex items-center gap-2"
            >
              <UsersIcon className="size-4" />
              {pendingRequests.length} Join Request{pendingRequests.length > 1 ? 's' : ''}
            </button>
          </div>
        )}

        {/* Join Requests Panel */}
        {isHost && showRequests && (
          <div className="absolute top-16 right-4 bg-base-100 rounded-lg shadow-xl p-4 w-80 z-50 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Join Requests</h3>
              <button
                onClick={() => setShowRequests(false)}
                className="btn btn-ghost btn-xs"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            
            {pendingRequests.length === 0 ? (
              <p className="text-sm opacity-70">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div
                    key={request.userId}
                    className="flex items-center justify-between bg-base-200 p-3 rounded-lg"
                  >
                    <span className="font-medium">{request.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          respondMutation.mutate({
                            userId: request.userId,
                            action: "approve",
                          })
                        }
                        disabled={respondMutation.isPending}
                        className="btn btn-success btn-xs"
                      >
                        <CheckIcon className="size-3" />
                      </button>
                      <button
                        onClick={() =>
                          respondMutation.mutate({
                            userId: request.userId,
                            action: "reject",
                          })
                        }
                        disabled={respondMutation.isPending}
                        className="btn btn-error btn-xs"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-base-300">
          <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};

export default CallPage;
