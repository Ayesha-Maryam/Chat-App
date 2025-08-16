import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import Message from './Message';

const ChatMessages = () => {
  const { messages, selectedUser } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Select a user to start chatting
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose from the list on the left
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
      <div className="space-y-4">
        {messages.map((message) => (
  <Message 
    key={message._id || `${message.createdAt}-${message.content.substring(0, 10)}`} 
    message={message} 
  />
))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;