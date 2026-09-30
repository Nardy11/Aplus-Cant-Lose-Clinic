import React, { useState, useEffect, useContext } from "react";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/userSlice";
import WalletIcon from "@mui/icons-material/Wallet";
import LockResetIcon from "@mui/icons-material/LockReset";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { SnackbarContext } from "../../App";
import { getNotifications } from "../../features/patientSlice.js";
import { getNotificationsd } from "../../features/doctorSlice.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavbarGen from "../NavbarGen";
import { API_URL } from "../../Consts";
import ConfirmDialog from "../common/ConfirmDialog";

const AccountAvatar = () => {
  const snackbarMessage = useContext(SnackbarContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username, role, id, pic } = useSelector((state) => state.user);

  const [accountAnchor, setAccountAnchor] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emptyFieldError, setEmptyFieldError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPasswordClose, setConfirmPasswordClose] = useState(false);
  const [notificationBadgeVisible, setNotificationBadgeVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (role === "doctor") dispatch(getNotificationsd(id));
    if (role === "patient") dispatch(getNotifications(id));
  }, [dispatch, id, role]);

  const patientNotifications = useSelector((state) => state.patient.notifications);
  const doctorNotifications = useSelector((state) => state.doctor.notifications);
  const rawNotifications = role === "doctor" ? doctorNotifications : patientNotifications;
  const notifications = Array.isArray(rawNotifications) ? rawNotifications.filter(Boolean) : [];
  useEffect(() => {
    setNotificationBadgeVisible(notifications.length > 0);
  }, [notifications.length]);

  const handleLogout = () => {
    dispatch(logout()).then(() => navigate("/Login")).catch(console.error);
  };

  const openPassword = () => {
    setPasswordOpen(true);
    setAccountAnchor(null);
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordError("");
    setEmptyFieldError(false);
    setShowPassword(false);
  };

  const closePassword = () => {
    setPasswordOpen(false);
    resetPasswordForm();
  };

  const hasPasswordDraft = Boolean(currentPassword || newPassword || confirmNewPassword);

  const requestPasswordClose = () => {
    if (hasPasswordDraft) {
      setConfirmPasswordClose(true);
    } else {
      closePassword();
    }
  };

  const discardPasswordChanges = () => {
    setConfirmPasswordClose(false);
    closePassword();
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setEmptyFieldError(true);
      setPasswordError("");
      return;
    }

    if (newPassword === currentPassword) {
      setEmptyFieldError(false);
      setPasswordError("Your new password must be different from the current password.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setEmptyFieldError(false);
      setPasswordError("The two new passwords do not match.");
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,}$/.test(newPassword)) {
      setEmptyFieldError(false);
      setPasswordError("Use at least 8 characters, one uppercase letter and one special character.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/changePass/${username}`, {
        oldPassword: currentPassword,
        newPassword,
        username,
      });

      if (response.data.message) {
        snackbarMessage("Password changed successfully. Please sign in again.", "success");
        closePassword();
        dispatch(logout()).then(() => navigate("/Login"));
      } else {
        snackbarMessage(response.data.error || "Unable to change password.", "error");
      }
    } catch (error) {
      snackbarMessage(error.response?.data?.error || "Unable to change password.", "error");
    }
  };

  return (
    <header className="clinic-header">
      <div className="clinic-header-inner">
        <div className="clinic-identity">
          <div className="clinic-brand-mark"><MedicalServicesRoundedIcon /></div>
          <div className="clinic-brand-copy">
            <strong>El7a2ny Clinic</strong>
            <span>{role === "doctor" ? "Doctor portal" : role === "patient" ? "Patient portal" : "Clinic portal"}</span>
          </div>
        </div>

        <NavbarGen />

        <div className="clinic-header-actions">
          {(role === "doctor" || role === "patient") && (
            <>
              <Tooltip title="Notifications">
                <IconButton
                  className="clinic-utility-button"
                  onClick={async () => {
                    setNotificationBadgeVisible(false);
                    try {
                      const notificationUrl = role === "doctor"
                        ? API_URL + "/doctor/" + id + "/notifications"
                        : API_URL + "/patient/" + id + "/notifications";
                      await axios.patch(notificationUrl, { notifications: [] });
                    } catch (error) {
                      console.error("Unable to mark notifications as read:", error);
                    }
                    navigate("/Notifications");
                  }
                  aria-label="Notifications"
                >
                  <NotificationsNoneRoundedIcon />
                  {notificationBadgeVisible && notifications?.length > 0 && (
                    <span className="clinic-notification-badge">
                      {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Wallet">
                <IconButton
                  className="clinic-utility-button"
                  onClick={() => navigate("/Wallet")}
                  aria-label="Wallet"
                >
                  <WalletIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Chats and video">
                <IconButton
                  className="clinic-utility-button"
                  onClick={() => navigate("/chats")}
                  aria-label="Chats and video"
                >
                  <ChatBubbleOutlineRoundedIcon />
                </IconButton>
              </Tooltip>
            </>
          )}

          <Divider orientation="vertical" flexItem className="clinic-header-divider" />

          <button className="clinic-profile-button" onClick={(e) => setAccountAnchor(e.currentTarget)}>
            <Avatar src={pic || undefined} className="clinic-profile-avatar" />
            <span>
              <strong>{username || "Account"}</strong>
              <small>Profile</small>
            </span>
          </button>

        </div>
      </div>

      <Menu
        anchorEl={accountAnchor}
        open={Boolean(accountAnchor)}
        onClose={() => setAccountAnchor(null)}
        className="clinic-account-menu"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <div className="clinic-account-menu-head">
          <Avatar src={pic || undefined} className="clinic-menu-avatar" />
          <div>
            <strong>{username}</strong>
            <span>{role}</span>
          </div>
        </div>
        <Divider />
        <MenuItem onClick={() => { setAccountAnchor(null); navigate("/Profile"); }}>
          <ListItemIcon><PersonRoundedIcon fontSize="small" /></ListItemIcon>
          View profile
        </MenuItem>
        <MenuItem onClick={openPassword}>
          <ListItemIcon><LockResetIcon fontSize="small" /></ListItemIcon>
          Change password
        </MenuItem>
        <MenuItem onClick={handleLogout} className="clinic-account-logout-item">
          <ListItemIcon><LogoutRoundedIcon fontSize="small" /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Dialog
        open={passwordOpen}
        onClose={requestPasswordClose}
        className="clinic-modern-dialog"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="clinic-dialog-title">
          <div>
            <span>SECURITY</span>
            <h2>Change password</h2>
          </div>
          <IconButton className="clinic-dialog-close" onClick={requestPasswordClose} aria-label="Close"><CloseRoundedIcon /></IconButton>
        </DialogTitle>
        <DialogContent className="clinic-dialog-content">
          <p className="clinic-dialog-copy">Update your password securely. You will be signed out after a successful change.</p>

          <TextField
            label="Current password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={emptyFieldError}
            InputProps={{ endAdornment: <IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton> }}
          />
          <TextField
            label="New password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={Boolean(passwordError)}
            InputProps={{ endAdornment: <IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton> }}
          />
          <TextField
            label="Confirm new password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            error={emptyFieldError || Boolean(passwordError)}
            helperText={emptyFieldError ? "All password fields are required." : passwordError}
            InputProps={{ endAdornment: <IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton> }}
          />
        </DialogContent>
        <DialogActions className="clinic-dialog-actions">
          <Button onClick={requestPasswordClose} className="clinic-dialog-cancel">Cancel</Button>
          <Button onClick={savePassword} variant="contained" className="clinic-dialog-primary">Save password</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmPasswordClose}
        title="Discard password changes?"
        message="You have entered password information. If you leave now, the unsaved changes will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={discardPasswordChanges}
        onCancel={() => setConfirmPasswordClose(false)}
      />

    </header>
  );
};

export default AccountAvatar;
