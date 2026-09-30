import React, { useEffect, useRef } from "react";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import { useSelector } from "react-redux";

const ScrollableChat = ({ messages = [] }) => {
  const chatRef = useRef(null);
  const logId = useSelector((state) => state.user.logId);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const getId = (value) => {
    if (!value) return "";
    return typeof value === "string" ? value : value._id || "";
  };

  const formatTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-messages-scroll" ref={chatRef}>
      <div className="chat-messages-inner">
        {messages.map((message, index) => {
          const senderId = getId(message.sender);
          const own = senderId === logId;
          const previous = messages[index - 1];
          const previousSender = getId(previous?.sender);
          const grouped = previousSender === senderId;

          return (
            <div
              className={`chat-message-row ${own ? "own" : "other"} ${grouped ? "grouped" : ""}`}
              key={message._id || `${senderId}-${index}`}
            >
              {!own ? (
                <div className="chat-message-avatar-slot">
                  {!grouped ? (
                    <Tooltip title={message.sender?.name || "Clinic user"} placement="left" arrow>
                      <Avatar
                        className="chat-message-avatar"
                        alt={message.sender?.name || "Clinic user"}
                        src={message.sender?.pic || ""}
                      >
                        {(message.sender?.name || "C").charAt(0).toUpperCase()}
                      </Avatar>
                    </Tooltip>
                  ) : null}
                </div>
              ) : null}

              <div className="chat-message-bubble-wrap">
                <div className={`chat-message-bubble ${own ? "own" : "other"}`}>
                  {message.content}
                </div>
                <span className="chat-message-time">{formatTime(message.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScrollableChat;
