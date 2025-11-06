import { createContext, useContext, useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { useQuery } from '@tanstack/react-query';
import { getStreamToken } from '../lib/api';
import useAuthUser from '../hooks/useAuthUser';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const StreamChatContext = createContext(null);

// Singleton instance
let streamClientInstance = null;

export const StreamChatProvider = ({ children }) => {
  const [chatClient, setChatClient] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ['streamToken'],
    queryFn: getStreamToken,
    enabled: !!authUser,
    staleTime: Infinity, // Token doesn't change frequently
  });

  useEffect(() => {
    const connectUser = async () => {
      if (!tokenData?.token || !authUser || isConnecting) return;
      
      // Reuse existing instance if available
      if (streamClientInstance && streamClientInstance.userID === authUser._id) {
        setChatClient(streamClientInstance);
        return;
      }

      try {
        setIsConnecting(true);
        
        // Disconnect old client if user changed
        if (streamClientInstance && streamClientInstance.userID !== authUser._id) {
          await streamClientInstance.disconnectUser();
          streamClientInstance = null;
        }

        const client = StreamChat.getInstance(STREAM_API_KEY);
        
        // Only connect if not already connected
        if (!client.userID) {
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.profilePic,
            },
            tokenData.token
          );
        }

        streamClientInstance = client;
        setChatClient(client);
      } catch (error) {
        console.error('Error connecting to Stream Chat:', error);
        // Don't retry on rate limit
        if (error.code !== 9) {
          streamClientInstance = null;
        }
      } finally {
        setIsConnecting(false);
      }
    };

    connectUser();

    // Cleanup on unmount (only disconnect when user logs out)
    return () => {
      // Keep connection alive for reuse
    };
  }, [tokenData, authUser, isConnecting]);

  return (
    <StreamChatContext.Provider value={{ chatClient, isConnecting }}>
      {children}
    </StreamChatContext.Provider>
  );
};

export const useStreamChat = () => {
  const context = useContext(StreamChatContext);
  if (!context) {
    throw new Error('useStreamChat must be used within StreamChatProvider');
  }
  return context;
};
