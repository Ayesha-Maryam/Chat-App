import React from 'react';
import { useAuth } from '../context/AuthContext';
import ChatContainer from '../components/Chat/ChatContainer';

const ChatPage = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ChatContainer />
    </div>
  );
};

export default ChatPage;