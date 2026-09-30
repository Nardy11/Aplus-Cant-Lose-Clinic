import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  CircularProgress,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VideoChatIcon from "@mui/icons-material/VideoChat";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { API_URL } from "../../Consts";
import { useSelector } from "react-redux";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import { ChatState } from "../../Context/ChatProvider";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { useNavigate } from "react-router-dom";

function SideDrawer() {
  const logId = useSelector((state) => state.user.logId);
  const id = useSelector((state) => state.user.id);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [selectedName, setSelectedName] = useState("");
  const [names, setNames] = useState([]);

  const { setSelectedChat, notification, setNotification, chats, setChats } = ChatState();

  const handleSearch = async () => {
    if (!search) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/user/users?search=${search}`);
      setSearchResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      const { data } = await axios.post(`${API_URL}/chat/`, { userId, logId });
      if (!chats?.find((c) => c._id === data._id)) setChats([data, ...(chats || [])]);
      setSelectedChat(data);
      setLoadingChat(false);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = user.role === "doctor"
          ? await axios.get(`${API_URL}/doctor/Mypatients/${id}`)
          : await axios.get(`${API_URL}/patient/MyDoctors/${id}`);
        setNames(response.data.patients || response.data.doctors || []);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    if (id) fetchContacts();
  }, [id, user.role]);

  const handleNameSelect = (event) => {
    const value = event.target.value;
    setSelectedName(value);
    setSearch(value);
  };

  return (
    <>
      <div className="chat-tools-bar">
        <div className="chat-tool-copy">
          <span>MESSAGING</span>
          <strong>Connect with your care team</strong>
        </div>

        <Button
          className="chat-tool-button"
          onClick={() => setIsOpen(true)}
          startIcon={<SearchIcon />}
        >
          {user.role === "patient" ? "Search doctors" : "Search patients"}
        </Button>

        <Button
          className="chat-tool-button video"
          onClick={() => navigate("/vidcall")}
          startIcon={<VideoChatIcon />}
        >
          Video visit
        </Button>

        <IconButton
          className="chat-notification-button"
          onClick={(event) => setNotificationAnchor(event.currentTarget)}
        >
          <NotificationsNoneRoundedIcon />
          {notification.length > 0 && <span>{notification.length}</span>}
        </IconButton>

        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={() => setNotificationAnchor(null)}
        >
          {!notification.length && <MenuItem disabled>No new messages</MenuItem>}
          {notification.map((notif) => (
            <MenuItem
              key={notif._id}
              onClick={() => {
                setSelectedChat(notif.chat);
                setNotification(notification.filter((n) => n !== notif));
                setNotificationAnchor(null);
              }}
            >
              {notif.chat.isGroupChat
                ? `New message in ${notif.chat.chatName}`
                : `New message from ${getSender(user, notif.chat.users)}`}
            </MenuItem>
          ))}
        </Menu>
      </div>

      <Drawer
        anchor="left"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{ className: "chat-search-drawer" }}
      >
        <div className="chat-drawer-header">
          <div>
            <span>NEW CONVERSATION</span>
            <h2>Find someone</h2>
          </div>
          <IconButton onClick={() => setIsOpen(false)}>×</IconButton>
        </div>

        <Typography className="chat-drawer-copy">
          Select a known contact or search by username.
        </Typography>

        <div className="chat-search-row">
          <FormControl fullWidth size="small">
            <InputLabel>Contact</InputLabel>
            <Select
              native
              value={selectedName}
              label="Contact"
              onChange={handleNameSelect}
            >
              <option value="" />
              {names.map((name, index) => {
                const value = typeof name === "string" ? name : (name.username || name.name || name.email || "");
                return <option key={index} value={value}>{value}</option>;
              })}
            </Select>
          </FormControl>
          <Button className="chat-go-button" onClick={handleSearch}>Search</Button>
        </div>

        <div className="chat-search-results">
          {loading ? (
            <ChatLoading />
          ) : (
            searchResult?.map((foundUser) => (
              <UserListItem
                key={foundUser._id}
                user={foundUser}
                handleFunction={() => accessChat(foundUser._id)}
              />
            ))
          )}
          {loadingChat && <CircularProgress />}
        </div>
      </Drawer>
    </>
  );
}

export default SideDrawer;
