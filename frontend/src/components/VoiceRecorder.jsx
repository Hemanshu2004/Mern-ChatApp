import { useState, useRef, useEffect } from "react";
import { Mic, X, Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const VoiceRecorder = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Start recording automatically when component mounts
    startRecording();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone");
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
      onCancel();
    }
  };

  const handleDelete = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    onCancel();
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 bg-base-100 border-t border-base-300 p-4 shadow-2xl animate-slide-up z-50">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          {/* Cancel Button */}
          <button
            onClick={handleDelete}
            className="btn btn-circle btn-error btn-sm"
          >
            <X className="size-4" />
          </button>

          {/* Recording Indicator / Waveform */}
          <div className="flex-1 flex items-center gap-3">
            {isRecording ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Mic className="size-6 text-error animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
                    </span>
                  </div>
                  <span className="text-error font-semibold">Recording...</span>
                </div>
                <div className="flex-1 flex items-center gap-1 h-8">
                  {/* Animated waveform bars */}
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-error rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`,
                        minHeight: '4px'
                      }}
                    />
                  ))}
                </div>
              </>
            ) : audioUrl ? (
              <>
                <button
                  onClick={togglePlay}
                  className="btn btn-circle btn-primary btn-sm"
                >
                  {isPlaying ? "⏸️" : "▶️"}
                </button>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <div className="flex-1 bg-base-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all" style={{ width: isPlaying ? '100%' : '0%' }} />
                </div>
              </>
            ) : null}

            {/* Duration */}
            <span className="text-lg font-mono font-bold">
              {formatDuration(duration)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="btn btn-circle btn-warning"
              >
                <div className="w-4 h-4 bg-warning-content rounded-sm"></div>
              </button>
            ) : audioBlob ? (
              <>
                <button
                  onClick={handleDelete}
                  className="btn btn-circle btn-ghost"
                >
                  <Trash2 className="size-5" />
                </button>
                <button
                  onClick={handleSend}
                  className="btn btn-circle btn-primary"
                >
                  <Send className="size-5" />
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Hint Text */}
        <p className="text-center text-sm text-base-content/60 mt-2">
          {isRecording ? "Tap to stop recording" : "Tap play to preview, then send"}
        </p>
      </div>
    </div>
  );
};

export default VoiceRecorder;
