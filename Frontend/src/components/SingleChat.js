import { Box, IconButton, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Input } from "@heroui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "../Consts";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import ScrollableChat from "./ScrollableChat";
import ProfileModal from "./miscellaneous/ProfileModal";
import { ChatState } from "../Context/ChatProvider";
import { useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";

const SOCKET_ENDPOINT = API_URL.replace(/\/api\/?$/, "");
let socket;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [sendError, setSendError] = useState("");
  const typingTimerRef = useRef(null);

  const user = useSelector((state) => state.user);
  const logId = user?.logId;

  const toast = useToast();
  const {
    selectedChat,
    setSelectedChat,
    notification,
    setNotification,
  } = ChatState();

  const defaultOptions = useMemo(() => ({
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  }), []);

  const fetchMessages = async () => {
    if (!selectedChat?._id) return;

    try {
      setLoading(true);
      setSendError("");

      const { data } = await axios.get(
        `${API_URL}/message/${selectedChat._id}`
      );

      setMessages(Array.isArray(data) ? data : []);

      if (socket?.connected) {
        socket.emit("join chat", selectedChat._id);
      }
    } catch (error) {
      console.error("Failed to load chat messages:", error);
      setMessages([]);
      setSendError("We couldn't load this conversation. Please refresh and try again.");
      toast({
        title: "Conversation unavailable",
        description: "Failed to load the messages for this chat.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket = io(SOCKET_ENDPOINT, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setSocketConnected(true);
      if (user?.logId) socket.emit("setup", user.logId);
      if (selectedChat?._id) socket.emit("join chat", selectedChat._id);
    });

    socket.on("connected", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      socket?.off("connect");
      socket?.off("connected");
      socket?.off("disconnect");
      socket?.off("typing");
      socket?.off("stop typing");
      socket?.off("message recieved");
      socket?.disconnect();
    };
    // The socket belongs to the logged-in account, not to the selected chat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.logId]);

  useEffect(() => {
    fetchMessages();
    if (!socket) return;

    const handleIncomingMessage = (newMessageReceived) => {
      const incomingChatId = newMessageReceived?.chat?._id;
      if (!incomingChatId) return;

      if (!selectedChat || incomingChatId !== selectedChat._id) {
        setNotification((current) => {
          if (current.some((item) => item._id === newMessageReceived._id)) return current;
          return [newMessageReceived, ...current];
        });
        setFetchAgain((value) => !value);
        return;
      }

      setMessages((current) => {
        if (current.some((item) => item._id === newMessageReceived._id)) return current;
        return [...current, newMessageReceived];
      });
    };

    socket.on("message recieved", handleIncomingMessage);

    return () => {
      socket?.off("message recieved", handleIncomingMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?._id]);

  const sendMessage = async () => {
    const content = newMessage.trim();

    if (!content || !selectedChat?._id || !logId) return;

    try {
      setSendError("");
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

      if (socketConnected) {
        socket.emit("stop typing", selectedChat._id);
      }

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token || ""}`,
        },
      };

      // IMPORTANT: the API expects the Chat ObjectId, not the entire chat object.
      const { data } = await axios.post(
        `${API_URL}/message`,
        {
          content,
          chatId: selectedChat._id,
          logId,
        },
        config
      );

      setNewMessage("");
      setMessages((current) => {
        if (current.some((item) => item._id === data._id)) return current;
        return [...current, data];
      });

      if (socketConnected) {
        socket.emit("new message", data);
      }

      setFetchAgain((value) => !value);
    } catch (error) {
      console.error("Failed to send message:", error?.response?.data || error);
      setSendError("Message could not be sent. Please try again.");
      toast({
        title: "Message not sent",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const typingHandler = (event) => {
    const value = event.target.value;
    setNewMessage(value);

    if (!socketConnected || !selectedChat?._id) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    typingTimerRef.current = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
    }, 1800);
  };

  const senderName = selectedChat && !selectedChat.isGroupChat
    ? getSender(user, selectedChat.users)
    : selectedChat?.chatName;

  const senderFull = selectedChat && !selectedChat.isGroupChat
    ? getSenderFull(user, selectedChat.users)
    : null;

  return (
    <div className="single-chat">
      {selectedChat ? (
        <div className="single-chat-shell">
          <header className="single-chat-header">
            <IconButton
              className="single-chat-back"
              onClick={() => setSelectedChat(null)}
              aria-label="Back to chats"
            >
              <ArrowBackRoundedIcon />
            </IconButton>

            {!selectedChat.isGroupChat && senderFull ? (
              <ProfileModal user={senderFull}>
                <div className="single-chat-person">
                  <div className="single-chat-avatar">
                    {(senderName || "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span>PRIVATE CONVERSATION</span>
                    <h2>{senderName || "Conversation"}</h2>
                    <small>Click to view profile</small>
                  </div>
                </div>
              </ProfileModal>
            ) : (
              <div className="single-chat-person">
                <div className="single-chat-avatar">
                  {(senderName || "C").charAt(0).toUpperCase()}
                </div>
                <div>
                  <span>PRIVATE CONVERSATION</span>
                  <h2>{senderName || "Conversation"}</h2>
                  <small>Clinic group</small>
                </div>
              </div>
            )}
          </header>

          <div className="single-chat-body">
            {loading ? (
              <div className="single-chat-loading">
                <CircularProgress size={30} />
                <span>Loading conversation…</span>
              </div>
            ) : messages.length ? (
              <ScrollableChat messages={messages} />
            ) : (
              <div className="single-chat-no-messages">
                <div className="single-chat-no-messages-icon">+</div>
                <strong>Start the conversation</strong>
                <span>Send a message to begin your private care conversation.</span>
              </div>
            )}

            {sendError ? <div className="single-chat-error">{sendError}</div> : null}

            <div className="single-chat-composer">
              {istyping ? (
                <div className="single-chat-typing">
                  <Lottie options={defaultOptions} width={52} height={25} />
                  <span>{senderName || "The other user"} is typing…</span>
                </div>
              ) : null}

              <div className="single-chat-input-row">
                <Input
                  aria-label="Message"
                  fullWidth
                  variant="bordered"
                  placeholder="Write a message…"
                  value={newMessage}
                  onChange={typingHandler}
                  onKeyDown={handleKeyDown}
                  className="chat-message-input"
                />
                <IconButton
                  className="chat-send-button"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  aria-label="Send message"
                >
                  <SendRoundedIcon />
                </IconButton>
              </div>
              <div className="single-chat-hint">
                <span>Press Enter to send</span>
                <span className={socketConnected ? "chat-live" : ""}>
                  {socketConnected ? "Live connection" : "Sending via secure API"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Box className="chat-welcome-empty">
          <img src="/virtualclinic.png" alt="A+ Clinic messaging" className="chat-welcome-image" />
          <Typography className="chat-welcome-title">Your care conversations, in one place</Typography>
          <Typography className="chat-welcome-copy">
            Select a doctor or patient from your chats, or search above to start a private conversation.
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default SingleChat;
