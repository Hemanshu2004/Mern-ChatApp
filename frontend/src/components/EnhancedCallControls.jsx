import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Monitor,
  MonitorOff,
  Users,
  Settings,
  Hand,
  MessageSquare,
  LayoutGrid,
  Maximize2
} from "lucide-react";
import { useState } from "react";
import { 
  useCallStateHooks,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  ScreenShareButton,
  CancelCallButton,
} from "@stream-io/video-react-sdk";

const EnhancedCallControls = ({ 
  onToggleParticipants, 
  onToggleChat,
  onToggleLayout,
  participantCount 
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const { 
    useCameraState, 
    useMicrophoneState,
    useScreenShareState 
  } = useCallStateHooks();
  
  const { camera, isMute: isCameraMuted } = useCameraState();
  const { microphone, isMute: isMicMuted } = useMicrophoneState();
  const { screenShare, isMute: isScreenShareOff } = useScreenShareState();

  const handleRaiseHand = () => {
    setHandRaised(!handRaised);
    // TODO: Send hand raise event to other participants
  };

  return (
    <div className="bg-base-300/95 backdrop-blur-sm rounded-full px-6 py-4 shadow-2xl">
      <div className="flex items-center gap-3">
        {/* Microphone */}
        <div className="tooltip tooltip-top" data-tip={isMicMuted ? "Unmute" : "Mute"}>
          <ToggleAudioPublishingButton>
            <button className={`btn btn-circle ${isMicMuted ? 'btn-error' : 'btn-ghost hover:btn-primary'}`}>
              {isMicMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button>
          </ToggleAudioPublishingButton>
        </div>

        {/* Camera */}
        <div className="tooltip tooltip-top" data-tip={isCameraMuted ? "Turn on camera" : "Turn off camera"}>
          <ToggleVideoPublishingButton>
            <button className={`btn btn-circle ${isCameraMuted ? 'btn-error' : 'btn-ghost hover:btn-primary'}`}>
              {isCameraMuted ? <VideoOff className="size-5" /> : <Video className="size-5" />}
            </button>
          </ToggleVideoPublishingButton>
        </div>

        {/* Screen Share */}
        <div className="tooltip tooltip-top" data-tip={isScreenShareOff ? "Share screen" : "Stop sharing"}>
          <ScreenShareButton>
            <button className={`btn btn-circle ${!isScreenShareOff ? 'btn-primary' : 'btn-ghost hover:btn-primary'}`}>
              {isScreenShareOff ? <Monitor className="size-5" /> : <MonitorOff className="size-5" />}
            </button>
          </ScreenShareButton>
        </div>

        <div className="divider divider-horizontal mx-2"></div>

        {/* Participants */}
        <div className="tooltip tooltip-top" data-tip="Participants">
          <button 
            onClick={onToggleParticipants}
            className="btn btn-circle btn-ghost hover:btn-primary relative"
          >
            <Users className="size-5" />
            {participantCount > 0 && (
              <span className="absolute -top-1 -right-1 badge badge-primary badge-xs">
                {participantCount}
              </span>
            )}
          </button>
        </div>

        {/* Chat */}
        <div className="tooltip tooltip-top" data-tip="Chat">
          <button 
            onClick={onToggleChat}
            className="btn btn-circle btn-ghost hover:btn-primary"
          >
            <MessageSquare className="size-5" />
          </button>
        </div>

        {/* Layout */}
        <div className="tooltip tooltip-top" data-tip="Change layout">
          <button 
            onClick={onToggleLayout}
            className="btn btn-circle btn-ghost hover:btn-primary"
          >
            <LayoutGrid className="size-5" />
          </button>
        </div>

        {/* Raise Hand */}
        <div className="tooltip tooltip-top" data-tip={handRaised ? "Lower hand" : "Raise hand"}>
          <button 
            onClick={handleRaiseHand}
            className={`btn btn-circle ${handRaised ? 'btn-warning' : 'btn-ghost hover:btn-primary'}`}
          >
            <Hand className={`size-5 ${handRaised ? 'animate-bounce' : ''}`} />
          </button>
        </div>

        {/* Settings */}
        <div className="dropdown dropdown-top dropdown-end">
          <div className="tooltip tooltip-top" data-tip="Settings">
            <button 
              tabIndex={0}
              onClick={() => setShowSettings(!showSettings)}
              className="btn btn-circle btn-ghost hover:btn-primary"
            >
              <Settings className="size-5" />
            </button>
          </div>
          {showSettings && (
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box w-64 mb-2">
              <li className="menu-title">Video Settings</li>
              <li>
                <button>
                  <Video className="size-4" />
                  Camera Settings
                </button>
              </li>
              <li>
                <button>
                  <Mic className="size-4" />
                  Audio Settings
                </button>
              </li>
              <li className="menu-title">Display</li>
              <li>
                <button>
                  <Maximize2 className="size-4" />
                  Fullscreen
                </button>
              </li>
            </ul>
          )}
        </div>

        <div className="divider divider-horizontal mx-2"></div>

        {/* Hang Up */}
        <div className="tooltip tooltip-top" data-tip="Leave call">
          <CancelCallButton>
            <button className="btn btn-circle btn-error hover:btn-error shadow-lg">
              <PhoneOff className="size-5" />
            </button>
          </CancelCallButton>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCallControls;
