import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Keep editing",
  destructive = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      className="clinic-modern-dialog clinic-confirm-dialog"
      aria-labelledby="clinic-confirm-title"
    >
      <DialogTitle className="clinic-dialog-title" id="clinic-confirm-title">
        <div>
          <span>{destructive ? "CONFIRM DELETE" : "UNSAVED CHANGES"}</span>
          <h2>{title}</h2>
        </div>
        <IconButton
          className="clinic-dialog-close"
          onClick={onCancel}
          aria-label="Close confirmation"
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="clinic-confirm-content">
        <div className={`clinic-confirm-icon ${destructive ? "is-danger" : ""}`}>
          <WarningAmberRoundedIcon />
        </div>
        <p>{message}</p>
      </DialogContent>
      <DialogActions className="clinic-dialog-actions clinic-confirm-actions">
        <Button onClick={onCancel} className="clinic-dialog-cancel">
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          className={destructive ? "clinic-confirm-danger" : "clinic-dialog-primary"}
          variant="contained"
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
