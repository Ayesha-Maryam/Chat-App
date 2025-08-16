import React, { createContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";
import socket from "../services/socket";
const ChatContext = createContext();
export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const socketRef = useRef(null);
  useEffect(() => {
  if (!user) return;

  socketRef.current = socket;

  socket.emit('set-online', user._id);

  socket.on("private-message", (message) => {
    // Append message directly
    setMessages((prev) => [...prev, message]);
  });

  socket.on('typing', ({ senderId, isTyping }) => {
    setIsTyping(isTyping);
    setTypingUser(senderId);
  });

  socket.on('user-status-changed', (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
    );
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      const fetchedUsers = res.data.data.map(u => ({ ...u, isOnline: false }));
      setUsers(fetchedUsers);
    } catch (error) {
      console.error(error);
    }
  };

  fetchUsers();

  return () => {
    socketRef.current.off('private-message');
    socketRef.current.off('typing');
    socketRef.current.off('user-status-changed');
  };
}, [user]);
  const selectUser = async (user) => {
    setSelectedUser(user);
    try {
      const res = await api.get(`/chat/${user._id}`);
      setMessages(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };
  const sendMessage = (message) => {
    if (!selectedUser) return;
    const messageData = {
      sender: { _id: user._id, name: user.name },
      receiverId: selectedUser._id,
      content: message.content,
      messageType: message.messageType,
      fileMeta: message.fileMeta,
      createdAt: new Date().toISOString(),
    };
  
    socket.emit("private-message", messageData);
  };
  const sendTypingStatus = (isTyping) => {
    if (!selectedUser) return;
    socket.emit("typing", { receiverId: selectedUser._id, isTyping });
  };
  return (
    <ChatContext.Provider
      value={{
        users,
        selectedUser,
        messages,
        isTyping,
        typingUser,
        selectUser,
        sendMessage,
        sendTypingStatus,
      }}
    >
      {" "}
      {children}{" "}
    </ChatContext.Provider>
  );
};
export const useChat = () => React.useContext(ChatContext);
