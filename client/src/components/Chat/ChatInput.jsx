import React, { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useChat } from "../../context/ChatContext";
import { FiPaperclip, FiSmile, FiSend, FiX } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import api from "../../services/api";

const ChatInput = () => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { selectedUser, sendMessage, sendTypingStatus } = useChat();
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
      "video/*": [".mp4", ".webm"],
      "audio/*": [".mp3", ".wav"],
      "application/*": [".pdf", ".doc", ".docx", ".txt"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileChange(acceptedFiles[0]);
      }
    },
  });

  const handleFileChange = (file) => {
    setFile(file);

    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        sendMessage({
          content: res.data.data.url,
          messageType: getMessageType(file.type),
          fileMeta: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
        });

        setFile(null);
        setPreview(null);
      } catch (error) {
        console.error("File upload failed:", error);
      }
    } else if (message.trim()) {
      sendMessage({
        content: message,
        messageType: "text",
      });
      setMessage("");
    }

    setIsTyping(false);
    sendTypingStatus(false);
  };

  const getMessageType = (fileType) => {
    if (fileType.startsWith("image/")) return "image";
    if (fileType.startsWith("video/")) return "video";
    if (fileType.startsWith("audio/")) return "audio";
    return "file";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  useEffect(() => {
    let typingTimeout;

    if (message && !isTyping) {
      setIsTyping(true);
      sendTypingStatus(true);
    } else if (!message && isTyping) {
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
        sendTypingStatus(false);
      }, 2000);
    }

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [message, isTyping, sendTypingStatus]);

  if (!selectedUser) return null;

  return (
    <div className="border-t border-gray-200 p-4 bg-white relative">
      {preview && (
        <div className="relative mb-4 max-w-xs">
          {file.type.startsWith("image/") ? (
            <img src={preview} alt="Preview" className="rounded-lg shadow-sm" />
          ) : file.type.startsWith("video/") ? (
            <video controls className="rounded-lg shadow-sm">
              <source src={preview} type={file.type} />
              Your browser does not support the video tag.
            </video>
          ) : null}
          <button
            onClick={removeFile}
            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="flex-1 flex items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <FiPaperclip size={20} />
          </button>
          <input
            {...getInputProps()}
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files.length > 0) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border-0 focus:ring-0 focus:outline-none mx-2"
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <FiSmile size={20} />
            </button>
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-12 right-0 z-50"
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!message && !file}
          className={`ml-2 p-2 rounded-full ${
            message || file
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <FiSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
