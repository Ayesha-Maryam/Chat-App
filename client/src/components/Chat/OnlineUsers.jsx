import React from 'react';
import { useChat } from '../../context/ChatContext';
import { FiUser } from 'react-icons/fi';

const OnlineUsers = () => {
  const { users, selectUser, selectedUser } = useChat();

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Online Users</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user._id}
            onClick={() => selectUser(user)}
            className={`flex items-center p-2 rounded-md cursor-pointer ${
              selectedUser?._id === user._id ? 'bg-indigo-100' : 'hover:bg-gray-100'
            }`}
          >
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <FiUser className="text-gray-500" />
                </div>
              )}
              <span
                className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                  user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
              ></span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">
                {user.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnlineUsers;