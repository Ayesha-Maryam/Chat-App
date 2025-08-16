import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { FiUser } from 'react-icons/fi';

const ChatHeader = () => {
  const { selectedUser, isTyping, typingUser } = useChat();
  const { logout } = useAuth();

  return (
    <div className="border-b border-gray-200 p-4 flex justify-between items-center">
      {selectedUser ? (
        <div className="flex items-center">
          <div className="relative">
            {selectedUser.avatar ? (
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <FiUser className="text-gray-500" />
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></span>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium">{selectedUser.name}</h3>
            <p className="text-sm text-gray-500">
              {isTyping && typingUser === selectedUser._id
                ? 'typing...'
                : selectedUser.isOnline
                ? 'Online'
                : `Last seen ${new Date(selectedUser.lastSeen).toLocaleTimeString()}`}
            </p>
          </div>
        </div>
      ) : (
        <h3 className="text-lg font-medium">Select a user to chat</h3>
      )}
      <button
        onClick={logout}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
      >
        Logout
      </button>
    </div>
  );
};

export default ChatHeader;