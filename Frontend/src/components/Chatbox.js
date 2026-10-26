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
          <h1>{selectedChat ? "Conversation" : "Messages"}</h1>
        </div>
      </div>
      <div className="chatbox-content">
        <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      </div>
    </section>
  );
};

export default Chatbox;
