// Import necessary libraries and constants
import React, { useState, useEffect, useContext } from "react";
import Avatar from "@mui/material/Avatar";

import Typography from "@mui/material/Typography";
import Popover from "@mui/material/Popover";
import LockResetIcon from "@mui/icons-material/LockReset";
import List from "@mui/material/List";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import PermPhoneMsgIcon from "@mui/icons-material/PermPhoneMsg";
import ListItem from "@mui/material/ListItem";
import Dialog from "@mui/material/Dialog";
import LogoutIcon from "@mui/icons-material/Logout";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useDispatch, useSelector } from "react-redux";
import { changePass } from "../../features/userSlice";
import WalletIcon from "@mui/icons-material/Wallet";
import { WalletDialog } from "../WalletDialog.js";
import { Box } from "@mui/material";
import { SnackbarContext } from "../../App";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../features/userSlice";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import NavbarGen from "../NavbarGen";
import axios from "axios";
import { getNotifications } from "../../features/patientSlice.js";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {getNotificationsd} from "../../features/doctorSlice.js";

import { API_URL } from "../../Consts";

const myAccountStyles = {
  cursor: "pointer",
  fontSize: "1.3em",
  textDecoration: "underline",
  color: "#007bff",
  transition: "font-size 0.2s, text-decoration 0.2s",

  "&:hover": {
    fontSize: "1.5em",
    textDecoration: "none",
  },
  textAlign: "center",
};

const containerStyles = {
  display: "flex",
  alignItems: "center",
  height: "fit-content",
  width: "fit-content",
  backgroundColor: "whitesmoke",
  borderRadius: "7px",
  padding: "10px",
};

const avatarStyles = { ml: "10px" };

const logoutButtonStyles = {
  marginRight: "10px",

  textDecoration: "underline",
  position: "absolute", // Corrected typo in 'position'
  right: "0px",
  fontSize: "20px",
  padding: "0px",
  width: "fit-content",
  color: "#ff0000", // Red color
};

const AccountAvatar = () => {
  const snackbarMessage = useContext(SnackbarContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openDialogg, setOpenDialogg] = useState(false);
  const handleOpenDialogg = () => {
    setOpenDialogg(true);
  };

  const handleCloseDialogg = () => {
    setOpenDialogg(false);
  };
  const handleLogout = () => {
    dispatch(logout())
      .then(() => {

        navigate("/Login");

      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };
  const [anchorel, setAnchorel] = useState(null);
  const { username } = useSelector((state) => state.user);
  const { role, id } = useSelector((state) => state.user);

  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emptyFieldError, setEmptyFieldError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (role === "doctor") {
      dispatch(getNotificationsd(id));
    }
    if (role === "patient") {
      dispatch(getNotifications(id));
    }
  }, [dispatch]);

  const notificationsp = useSelector((state) => state.patient.notifications);

  const notificationsd = useSelector((state) => state.doctor.notifications);
  let notifications = null;
  if (role === "doctor") {
    notifications = notificationsd;
  }
  if (role === "patient") {
    notifications = notificationsp;
  }
  const isPasswordValid = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAvatarClose = () => {
    setAnchorEl(null);
  };

  const openChangePasswordDialog = () => {
    setOpenDialog(true);
    handleAvatarClose();
  };

  const closeChangePasswordDialog = () => {
    setOpenDialog(false);
    setPasswordError("");
    setEmptyFieldError(false);
  };
  const handlewallet = (event) => {
    setAnchorel(event.currentTarget);
  };

  const savePassword = async () => {
    if (
      currentPassword === "" ||
      newPassword === "" ||
      confirmNewPassword === ""
    ) {
      setEmptyFieldError(true);
      setPasswordError("");
      return;
    }

    if (newPassword === currentPassword) {
      setEmptyFieldError(false);
      setPasswordError("New password cannot be the same as the old password");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setEmptyFieldError(false);
      setPasswordError("New password and confirm password do not match");
      return;
    }

    if (!isPasswordValid(newPassword)) {
      setEmptyFieldError(false);
      setPasswordError(
        "Password must be at least 8 characters, contain an uppercase letter, and a special character (@#$%^&+=)"
      );
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/changePass/${username}`, {
        oldPassword: currentPassword,
        newPassword,
        username,
      });

      console.log("Response:", response);

      if (response.data.message) {
        snackbarMessage("Password has been changed", "success");
        closeChangePasswordDialog();
        dispatch(logout()).then(() => {
          navigate("/Login");
        });
      } else {
        snackbarMessage(
          `An error occurred: ${response.data.error || "Unknown error"}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error:", error.response.data);
      snackbarMessage(
        `An error occurred: ${error.response.data.error || "Unknown error"}`,
        "error"
      );
    }
  };
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const styles = {
    marginRight: "10px",
    color: "white",
  };
  return (
    <div className="account-shell">
      <>
        <Avatar
          src="/path-to-your-avatar-image.jpg"
          className="account-avatar"
          onClick={handleAvatarClick}
        />
        <Typography
          component="span"
          onClick={handleAvatarClick}
          className="account-link"
        >
          Account
        </Typography>
      </>
      <>
        <Button
          className="account-logout"
          style={logoutButtonStyles}
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
        >
          Logout
        </Button>
        <span className="account-actions">
          {role === "doctor" || role === "patient" ? (
            <>
                <Button
                variant="outlined"
                size="large"
                className="account-action-button"
                onClick={handleOpenDialogg}
              >
                <NotificationsIcon fontSize="small" sx={{ color: "grey" }} />
              </Button>
              <Button
                variant="outlined"
                size="large"
                className="account-action-button"
                startIcon={
                  <WalletIcon fontSize="large" sx={{ color: "grey" }} />
                }
                onClick={() => {
                  handleOpenDialog();
                }}
              >
                wallet
              </Button>
          
            </>
          ) : null}
        </span>
        {(role === "doctor" || role === "patient") && (
          <>
            <Button
              variant="outlined"
              size="large"
              sx={{ width: "10%", ml: "4%", mb: "17px", mt: "0px" }}
              startIcon={
                <QuestionAnswerIcon fontSize="large" sx={{ color: "grey" }} />
              }
              onClick={() => navigate("/chats")}
            >
              chats/video
            </Button>
            <div>
              <NavbarGen />
            </div>
          </>
        )}
      </>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleAvatarClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <List>
          <ListItem>
            <Typography sx={{ fontSize: "15px" }}>username:</Typography>{" "}
            <Typography sx={{ color: "blue", paddingLeft: "4px" }}>
              {username}
            </Typography>
          </ListItem>

          <ListItem
            button
            onClick={openChangePasswordDialog}
            startIcon={<LockResetIcon />}
          >
            Change Password
            <LockResetIcon />
          </ListItem>
        </List>
      </Popover>
      <Dialog open={openDialog} onClose={closeChangePasswordDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            label="Current Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            onChange={(e) => setCurrentPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />
          <TextField
            label="New Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            onChange={(e) => setNewPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />

          <TextField
            label="Confirm New Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            error={emptyFieldError || passwordError !== ""}
            helperText={emptyFieldError ? "Must enter a value" : passwordError}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeChangePasswordDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={savePassword} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDialogg} onClose={handleCloseDialog}>
        <DialogTitle>Notifications</DialogTitle>
        <DialogContent>
          {notifications?.map((notification, index) => (
            <div>{notification.message}</div>
          ))}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialogg}>Close</Button>
        </DialogActions>
      </Dialog>
      <WalletDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default AccountAvatar;
