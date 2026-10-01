import React, { useState, useContext } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import axios from "axios";
import { API_URL } from "../../Consts.js";
import { ClinicDateTimeField } from "../common/ClinicFields";
import { SnackbarContext } from "../../App";
import ConfirmDialog from "../common/ConfirmDialog";

function RescheduleAppointment({ appointment }) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const [saving, setSaving] = useState(false);
  const snackbarMessage = useContext(SnackbarContext);

  const resetForm = () => {
    setStartDate("");
    setEndDate("");
    setSaving(false);
  };

  const hasDraft = Boolean(startDate || endDate);

  const requestClose = () => {
    if (hasDraft) {
      setConfirmClose(true);
    } else {
      resetForm();
      setOpen(false);
    }
  };

  const confirmDiscard = () => {
    setConfirmClose(false);
    resetForm();
    setOpen(false);
  };

  const handleReschedule = async () => {
    if (!startDate || !endDate) {
      snackbarMessage("Select both the start and end date/time.", "error");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      snackbarMessage("The end time must be after the start time.", "error");
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put(
        `${API_URL}/patient/rescheduleAppointment/${appointment._id}`,
        { startDate, endDate }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to reschedule the appointment.");
      }

      snackbarMessage("Appointment rescheduled successfully.", "success");
      resetForm();
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      snackbarMessage(
        error.response?.data?.message || error.message || "Unable to reschedule the appointment.",
        "error"
      );
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        className="appointment-action-button appointment-reschedule-button"
        onClick={() => {
          resetForm();
          setOpen(true);
        }}
      >
        Reschedule
      </Button>

      <Dialog
        open={open}
        onClose={requestClose}
        className="clinic-modern-dialog reschedule-appointment-dialog"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="clinic-dialog-title">
          <div>
            <span>CARE SCHEDULE</span>
            <h2>Reschedule appointment</h2>
          </div>
          <IconButton
            className="clinic-dialog-close"
            onClick={requestClose}
            aria-label="Close"
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className="reschedule-dialog-content">
          <ClinicDateTimeField
            label="Start date & time"
            value={startDate}
            onChange={setStartDate}
          />
          <ClinicDateTimeField
            label="End date & time"
            value={endDate}
            onChange={setEndDate}
          />
          <p className="reschedule-dialog-hint">
            Choose a time that does not overlap another appointment.
          </p>
        </DialogContent>

        <DialogActions className="clinic-dialog-actions">
          <Button
            onClick={requestClose}
            className="clinic-dialog-cancel"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            className="clinic-dialog-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Reschedule"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmClose}
        title="Discard reschedule changes?"
        message="Your selected dates and times have not been saved. Leaving now will remove them."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={confirmDiscard}
        onCancel={() => setConfirmClose(false)}
      />
    </>
  );
}

export default RescheduleAppointment;
