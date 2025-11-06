const TypingIndicator = ({ users = [] }) => {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].name} is typing`;
    } else if (users.length === 2) {
      return `${users[0].name} and ${users[1].name} are typing`;
    } else {
      return `${users[0].name} and ${users.length - 1} others are typing`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-base-content/60 animate-fade-in">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
      <span className="text-xs font-medium">{getTypingText()}</span>
    </div>
  );
};

export default TypingIndicator;
