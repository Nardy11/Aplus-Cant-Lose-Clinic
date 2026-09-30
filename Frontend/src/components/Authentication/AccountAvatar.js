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
import { WalletDialog } from "../WalletDialog.js";
import { SnackbarContext } from "../../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getNotifications } from "../../features/patientSlice.js";
import { getNotificationsd } from "../../features/doctorSlice.js";
import NavbarGen from "../NavbarGen";
import { API_URL } from "../../Consts";

const AccountAvatar = () => {
  const snackbarMessage = useContext(SnackbarContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username, role, id, pic } = useSelector((state) => state.user);

  const [accountAnchor, setAccountAnchor] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emptyFieldError, setEmptyFieldError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (role === "doctor") dispatch(getNotificationsd(id));
    if (role === "patient") dispatch(getNotifications(id));
  }, [dispatch, id, role]);

  const patientNotifications = useSelector((state) => state.patient.notifications);
  const doctorNotifications = useSelector((state) => state.doctor.notifications);
  const notifications = role === "doctor" ? doctorNotifications : patientNotifications;

  const handleLogout = () => {
    dispatch(logout()).then(() => navigate("/Login")).catch(console.error);
  };

  const openPassword = () => {
    setPasswordOpen(true);
    setAccountAnchor(null);
  };

  const closePassword = () => {
    setPasswordOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordError("");
    setEmptyFieldError(false);
    setShowPassword(false);
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
            <strong>A+ Clinic</strong>
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
                  onClick={() => setNotificationsOpen(true)}
                  aria-label="Notifications"
                >
                  <NotificationsNoneRoundedIcon />
                  {notifications?.length > 0 && <span className="clinic-notification-dot" />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Wallet">
                <IconButton
                  className="clinic-utility-button"
                  onClick={() => setWalletOpen(true)}
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

          <Tooltip title="Logout">
            <IconButton className="clinic-logout-button" onClick={handleLogout} aria-label="Logout">
              <LogoutRoundedIcon />
            </IconButton>
          </Tooltip>
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
        <MenuItem onClick={openPassword}>
          <ListItemIcon><LockResetIcon fontSize="small" /></ListItemIcon>
          Change password
        </MenuItem>
      </Menu>

      <Dialog
        open={passwordOpen}
        onClose={closePassword}
        className="clinic-modern-dialog"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="clinic-dialog-title">
          <div>
            <span>SECURITY</span>
            <h2>Change password</h2>
          </div>
          <IconButton onClick={closePassword}><CloseRoundedIcon /></IconButton>
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
          <Button onClick={closePassword} className="clinic-dialog-cancel">Cancel</Button>
          <Button onClick={savePassword} variant="contained" className="clinic-dialog-primary">Save password</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        className="clinic-modern-dialog"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="clinic-dialog-title">
          <div>
            <span>UPDATES</span>
            <h2>Notifications</h2>
          </div>
          <IconButton onClick={() => setNotificationsOpen(false)}><CloseRoundedIcon /></IconButton>
        </DialogTitle>
        <DialogContent className="clinic-dialog-content clinic-notifications-content">
          {notifications?.length ? notifications.map((notification, index) => (
            <div className="clinic-notification-item" key={notification._id || index}>
              <span className="clinic-notification-icon"><NotificationsNoneRoundedIcon /></span>
              <div>
                <strong>{notification.type || "Clinic update"}</strong>
                <p>{notification.message}</p>
              </div>
            </div>
          )) : (
            <div className="clinic-empty-state">
              <NotificationsNoneRoundedIcon />
              <strong>No new notifications</strong>
              <span>You're all caught up.</span>
            </div>
          )}
        </DialogContent>
        <DialogActions className="clinic-dialog-actions">
          <Button onClick={() => setNotificationsOpen(false)} className="clinic-dialog-primary">Done</Button>
        </DialogActions>
      </Dialog>

      <WalletDialog open={walletOpen} onClose={() => setWalletOpen(false)} />
    </header>
  );
};

export default AccountAvatar;
