import React from "react";
import { ChatState } from "../Context/ChatProvider";
import SingleChat from "./SingleChat";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <section className={`chatbox-panel ${selectedChat ? "has-chat" : ""}`}>
      <div className="chatbox-heading">
        <div>
          <span>CONVERSATION</span>
          <h1>{selectedChat ? "Chat" : "Talk-A-Tive"}</h1>
        </div>
      </div>
      <div className="chatbox-content">
        <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      </div>
    </section>
  );
};

export default Chatbox;
