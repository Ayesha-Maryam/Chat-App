import React from 'react';
import OnlineUsers from './OnlineUsers';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatHeader from './ChatHeader';

const ChatContainer = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 border-r border-gray-200 bg-white overflow-y-auto">
          <OnlineUsers />
        </div>
        <div className="flex flex-col flex-1 bg-white">
          <ChatHeader />
          <ChatMessages />
          <ChatInput />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;