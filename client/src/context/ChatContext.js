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
  
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!user) return;
     socket.on("online-users", (onlineUsers) => {
    setUsers(prev => 
      prev.map(u => {
        const match = onlineUsers.find(ou => ou._id === u._id);
        return match ? { ...u, isOnline: true, lastSeen: null } : u;
      })
    );
  });

    socket.emit('set-online', user._id);

    const handleNewMessage = (message) => {
      setMessages(prev => {
        const exists = prev.some(m => 
          m._id === message._id || 
          (m._id?.startsWith('temp-') && 
           m.content === message.content && 
           Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000)
        );
       if (exists) {
      return prev.map(m => 
        (m._id === message.replacesTempId || m._id === message._id) ? message : m
      );
    }
    return [...prev, message];
  });
    };

    const handleStatusChange = (updatedUser) => {
    setUsers(prev => prev.map(u => 
      u._id === updatedUser._id ? { 
        ...u, 
        isOnline: updatedUser.isOnline,
        lastSeen: updatedUser.lastSeen 
      } : u
    ));
  };

    socket.on("private-message", handleNewMessage);
    socket.on('typing', ({ senderId, isTyping }) => {
      setIsTyping(isTyping);
      setTypingUser(senderId);
    });
    socket.on('user-status-changed', handleStatusChange);
  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
     const usersWithStatus = res.data.data.map(u => ({
  ...u,
  isOnline: u.isOnline || false,
  lastSeen: u.lastSeen || null
}));
      setUsers(usersWithStatus);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

    fetchUsers();
    socket.on('user-status-changed', handleStatusChange);

    return () => {
      socket.off("online-users");
      socket.off("private-message", handleNewMessage);
      socket.off('typing');
      socket.off('user-status-changed', handleStatusChange);
      socket.emit('set-offline', user._id);
    };
  }, [user]);

  const selectUser = async (user) => {
    setSelectedUser(user);
    try {
      const res = await api.get(`/chat/${user._id}`);
      setMessages(res.data.data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const sendMessage = (message) => {
  if (!selectedUser) return;
  
  const tempId = `temp-${Date.now()}`;
  const tempMessage = {
    ...message,
    _id: tempId,
    sender: { _id: user._id, name: user.name },
    receiver: { _id: selectedUser._id, name: selectedUser.name },
    createdAt: new Date().toISOString(),
    isSender: true
  };
  
  setMessages(prev => [...prev, tempMessage]);
  
  const messageData = {
    receiverId: selectedUser._id,
    content: message.content,
    messageType: message.messageType,
    fileMeta: message.fileMeta,
    tempId: tempId 
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
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => React.useContext(ChatContext);