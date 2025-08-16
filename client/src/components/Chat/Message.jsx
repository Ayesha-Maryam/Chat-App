import React from "react";
import { useAuth } from "../../context/AuthContext";
import { FiDownload } from "react-icons/fi";
const Message = ({ message }) => {
  const { user } = useAuth();
  
  const isSender = message.isSender !== undefined 
    ? message.isSender 
    : message.sender?._id?.toString() === user._id?.toString() || 
      message.sender?.toString() === user._id?.toString();

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "text":
        return <p className="text-gray-800">{message.content}</p>;
      case "image":
        return (
          <div className="max-w-xs">
            {" "}
            <img
              src={message.content}
              alt="Sent image"
              className="rounded-lg shadow-sm"
            />{" "}
            <a
              href={message.content}
              download
              className="flex items-center mt-1 text-sm text-indigo-600 hover:text-indigo-800"
            >
              {" "}
              <FiDownload className="mr-1" /> Download{" "}
            </a>{" "}
          </div>
        );
      case "video":
        return (
          <div className="max-w-xs">
            {" "}
            <video controls className="rounded-lg shadow-sm">
              {" "}
              <source src={message.content} type="video/mp4" /> Your browser
              does not support the video tag.{" "}
            </video>{" "}
            <a
              href={message.content}
              download
              className="flex items-center mt-1 text-sm text-indigo-600 hover:text-indigo-800"
            >
              {" "}
              <FiDownload className="mr-1" /> Download{" "}
            </a>{" "}
          </div>
        );
      case "audio":
        return (
          <div className="max-w-xs">
            {" "}
            <audio controls className="w-full">
              {" "}
              <source src={message.content} type="audio/mpeg" /> Your browser
              does not support the audio element.{" "}
            </audio>{" "}
            <a
              href={message.content}
              download
              className="flex items-center mt-1 text-sm text-indigo-600 hover:text-indigo-800"
            >
              {" "}
              <FiDownload className="mr-1" /> Download{" "}
            </a>{" "}
          </div>
        );
      case "file":
        return (
          <div className="p-3 bg-gray-100 rounded-lg">
            {" "}
            <div className="flex items-center">
              {" "}
              <div className="flex-shrink-0">
                {" "}
                <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center">
                  {" "}
                  <span className="text-indigo-600">File</span>{" "}
                </div>{" "}
              </div>{" "}
              <div className="ml-3">
                {" "}
                <p className="text-sm font-medium text-gray-900">
                  {" "}
                  {message.fileMeta.name}{" "}
                </p>{" "}
                <p className="text-xs text-gray-500">
                  {" "}
                  {(message.fileMeta.size / 1024).toFixed(2)} KB{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <a
              href={message.content}
              download
              className="flex items-center mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              {" "}
              <FiDownload className="mr-1" /> Download{" "}
            </a>{" "}
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
      {" "}
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isSender
            ? "bg-indigo-600 text-white rounded-tr-none"
            : "bg-white text-gray-800 rounded-tl-none shadow-sm"
        }`}
      >
        {" "}
        {!isSender && (
          <p className="text-xs font-semibold text-indigo-600 mb-1">
            {" "}
            {message.sender.name}{" "}
          </p>
        )}{" "}
        {renderMessageContent()}{" "}
        <p
          className={`text-xs mt-1 ${
            isSender ? "text-indigo-200" : "text-gray-500"
          }`}
        >
          {" "}
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
        </p>{" "}
      </div>{" "}
    </div>
  );
};
export default Message;
