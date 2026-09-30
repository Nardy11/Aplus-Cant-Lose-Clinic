import React, { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import { ChatState } from "../Context/ChatProvider";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import { API_URL } from "../Consts";

const MyChats = ({ fetchAgain }) => {
  const logId = useSelector((state) => state.user.logId);
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const { selectedChat, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/chat/${logId}`);
      setChats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAgain]);

  return (
    <aside className="my-chats-panel">
      <div className="my-chats-heading">
        <span>MESSAGING</span>
        <h2>My chats</h2>
        <p>Your conversations with the clinic.</p>
      </div>

      <div className="my-chats-list">
        {loading ? (
          <ChatLoading />
        ) : chats?.length ? (
          <Stack spacing={1}>
            {chats.map((chat) => {
              const name = !chat.isGroupChat
                ? getSender(user, chat.users)
                : chat.chatName;
              return (
                <button
                  className={`my-chat-item ${selectedChat === chat ? "selected" : ""}`}
                  onClick={() => { setSelectedChat(chat); setNotification((notification || []).filter((item) => item.chat?._id !== chat._id)); }}
                  key={chat._id}
                >
                  <span className="my-chat-avatar">
                    {name?.charAt(0)?.toUpperCase() || "C"}
                  </span>
                  <span className="my-chat-copy">
                    <strong>{name}</strong>
                    {chat.latestMessage && (
                      <small>
                        <b>{chat.latestMessage.sender.name}: </b>
                        {chat.latestMessage.content.length > 50
                          ? chat.latestMessage.content.substring(0, 51) + "..."
                          : chat.latestMessage.content}
                      </small>
                    )}
                  </span>
                </button>
              );
            })}
          </Stack>
        ) : (
          <div className="chat-empty-list">
            <img className="chat-empty-list-image" src="/virtualclinic.png" alt="El7a2ny Clinic messaging" style={{ width: 104, height: 104, objectFit: "contain", marginBottom: 14 }} />
            <strong>Start a care conversation</strong>
            <span>Search for a doctor or patient above to start a private chat.</span>
            <small>Your recent conversations will appear here once you send or receive a message.</small>
          </div>
        )}
      </div>
    </aside>
  );
};

export default MyChats;
