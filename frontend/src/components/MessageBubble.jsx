import { useState, useRef } from "react";
import { 
  Reply, 
  Forward, 
  Copy, 
  Trash2, 
  MoreVertical,
  Check,
  CheckCheck
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const MessageBubble = ({ 
  message, 
  isOwn, 
  onReply, 
  onForward, 
  onDelete,
  onReaction 
}) => {
  const { authUser } = useAuthUser();
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const reactions = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

  const handleReaction = (emoji) => {
    onReaction && onReaction(message.id, emoji);
    setShowReactions(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setShowMenu(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group reactions by emoji
  const groupedReactions = message.latest_reactions?.reduce((acc, reaction) => {
    const emoji = reaction.type;
    if (!acc[emoji]) {
      acc[emoji] = [];
    }
    acc[emoji].push(reaction.user);
    return acc;
  }, {}) || {};

  return (
    <div className={`flex gap-2 mb-4 group ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for received messages */}
      {!isOwn && (
        <div className="avatar">
          <div className="w-8 h-8 rounded-full">
            <img src={message.user?.image || message.user?.profilePic} alt={message.user?.name} />
          </div>
        </div>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Reply Reference */}
        {message.quoted_message && (
          <div className="mb-1 px-3 py-2 bg-base-200 rounded-lg text-sm opacity-70 max-w-full">
            <p className="font-semibold text-xs text-primary mb-1">
              {message.quoted_message.user?.name}
            </p>
            <p className="truncate text-xs">
              {message.quoted_message.text || "Media"}
            </p>
          </div>
        )}

        {/* Message Bubble */}
        <div className="relative group">
          <div
            className={`px-4 py-2 rounded-2xl shadow-sm ${
              isOwn
                ? 'bg-primary text-primary-content rounded-br-none'
                : 'bg-base-200 text-base-content rounded-bl-none'
            }`}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
          >
            {/* Sender Name (for group chats) */}
            {!isOwn && message.user?.name && (
              <p className="text-xs font-semibold text-primary mb-1">
                {message.user.name}
              </p>
            )}

            {/* Message Text */}
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.text}
            </p>

            {/* Image Attachment */}
            {message.attachments?.length > 0 && message.attachments[0].type === 'image' && (
              <img
                src={message.attachments[0].image_url || message.attachments[0].thumb_url}
                alt="attachment"
                className="mt-2 rounded-lg max-w-full cursor-pointer hover:opacity-90 transition"
                onClick={() => window.open(message.attachments[0].image_url, '_blank')}
              />
            )}

            {/* Video Attachment */}
            {message.attachments?.length > 0 && message.attachments[0].type === 'video' && (
              <video
                src={message.attachments[0].asset_url}
                controls
                className="mt-2 rounded-lg max-w-full"
              />
            )}

            {/* File Attachment */}
            {message.attachments?.length > 0 && message.attachments[0].type === 'file' && (
              <a
                href={message.attachments[0].asset_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 p-2 bg-base-300 rounded-lg hover:bg-base-300/80 transition"
              >
                <div className="text-xs">
                  📄 {message.attachments[0].title || 'File'}
                </div>
              </a>
            )}

            {/* Time and Status */}
            <div className={`flex items-center gap-1 mt-1 text-[10px] ${isOwn ? 'text-primary-content/70' : 'text-base-content/50'}`}>
              <span>{formatTime(message.created_at)}</span>
              {isOwn && (
                <span>
                  {message.status === 'received' ? (
                    <CheckCheck className="size-3" />
                  ) : message.status === 'read' ? (
                    <CheckCheck className="size-3 text-info" />
                  ) : (
                    <Check className="size-3" />
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Reaction Picker */}
          {showReactions && (
            <div
              className={`absolute ${isOwn ? 'right-0' : 'left-0'} -top-10 bg-base-100 shadow-xl rounded-full px-2 py-1 flex gap-1 border border-base-300 z-10 animate-fade-in`}
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              {reactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Message Menu */}
          <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-10' : 'right-0 translate-x-10'} opacity-0 group-hover:opacity-100 transition-opacity`}>
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                onClick={() => setShowMenu(!showMenu)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <MoreVertical className="size-4" />
              </button>
              {showMenu && (
                <ul
                  tabIndex={0}
                  ref={menuRef}
                  className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box w-44 border border-base-300"
                >
                  <li>
                    <button onClick={() => { onReply && onReply(message); setShowMenu(false); }}>
                      <Reply className="size-4" />
                      Reply
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { onForward && onForward(message); setShowMenu(false); }}>
                      <Forward className="size-4" />
                      Forward
                    </button>
                  </li>
                  <li>
                    <button onClick={handleCopy}>
                      <Copy className="size-4" />
                      Copy
                    </button>
                  </li>
                  {isOwn && (
                    <>
                      <div className="divider my-1"></div>
                      <li>
                        <button 
                          onClick={() => { onDelete && onDelete(message.id); setShowMenu(false); }}
                          className="text-error"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Reactions Display */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className="flex gap-1 mt-1">
            {Object.entries(groupedReactions).map(([emoji, users]) => (
              <div
                key={emoji}
                className="tooltip"
                data-tip={users.map(u => u.name).join(', ')}
              >
                <div className="badge badge-sm bg-base-200 gap-1 cursor-pointer hover:scale-110 transition">
                  <span>{emoji}</span>
                  <span className="text-xs">{users.length}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avatar for sent messages */}
      {isOwn && (
        <div className="avatar">
          <div className="w-8 h-8 rounded-full">
            <img src={authUser?.profilePic} alt={authUser?.fullName} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
