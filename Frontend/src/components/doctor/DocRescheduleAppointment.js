import * as React from "react";
import axios from "axios";
import { useContext, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { ClinicDateTimeField } from "../common/ClinicFields";
import { API_URL } from "../../Consts";
import { SnackbarContext } from "../../App";
import ConfirmDialog from "../common/ConfirmDialog";
import { formatDateTime } from "../../design/format";

// Moves one booked visit to a new time. (The old dialog also listed patients, which did nothing.)
function RescheduleAppointment({ appointmentID, patientName, buttonClassName = "ui-btn ui-btn--sm", onSaved }) {
  const notify = useContext(SnackbarContext);
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const reset = () => { setStartDate(null); setEndDate(null); setError(""); setSaving(false); };
  const requestClose = () => { if (startDate || endDate) setConfirmClose(true); else { setOpen(false); reset(); } };

  const save = async () => {
    if (!startDate || !endDate) return setError("Choose the new start and end.");
    if (new Date(endDate) <= new Date(startDate)) return setError("The end has to be after the start.");
    setSaving(true);
    try {
      await axios.put(`${API_URL}/doctor/rescheduleAppointment/${appointmentID}`, { startDate, endDate });
      notify?.(`Visit moved to ${formatDateTime(startDate)}${patientName ? `. ${patientName} is notified.` : ""}`, "success");
      setOpen(false);
      reset();
      onSaved?.();
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error || "The visit couldn't be moved. Try again.");
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" className={buttonClassName} onClick={() => setOpen(true)}>Reschedule</button>
      <Dialog open={open} onClose={requestClose} className="clinic-modern-dialog doctor-dialog" maxWidth="xs" fullWidth>
        <DialogTitle className="clinic-dialog-title">
          <div><span>RESCHEDULE</span><h2>{patientName ? `Move ${patientName}'s visit` : "Move this visit"}</h2></div>
        </DialogTitle>
        <DialogContent style={{ display: "grid", gap: 14, paddingTop: 4 }}>
          <ClinicDateTimeField value={startDate} onChange={setStartDate} label="New start" />
          <ClinicDateTimeField value={endDate} onChange={setEndDate} label="New end" />
          {error && <div className="ui-alert" role="alert">{error}</div>}
        </DialogContent>
        <DialogActions className="clinic-dialog-actions">
          <Button className="clinic-dialog-cancel" onClick={requestClose} disabled={saving}>Cancel</Button>
          <Button className="clinic-dialog-primary" onClick={save} disabled={saving}>{saving ? "Moving..." : "Move visit"}</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmClose}
        title="Discard the new time?"
        message="You picked a new time but haven't moved the visit yet."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => { setConfirmClose(false); setOpen(false); reset(); }}
        onCancel={() => setConfirmClose(false)}
      />
    </>
  );
}

export default RescheduleAppointment;
