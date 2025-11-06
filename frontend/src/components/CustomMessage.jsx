import { MessageSimple, useMessageContext } from "stream-chat-react";
import MessageStatus from "./MessageStatus";
import useAuthUser from "../hooks/useAuthUser";

const CustomMessage = (props) => {
  const { message, isMyMessage } = useMessageContext();
  const { authUser } = useAuthUser();
  
  const isOwn = isMyMessage();

  return (
    <div className="str-chat__message-wrapper">
      <MessageSimple {...props} />
      {isOwn && message?.text && (
        <div className="flex justify-end mt-1 px-2">
          <MessageStatus message={message} isOwn={isOwn} />
        </div>
      )}
    </div>
  );
};

export default CustomMessage;
