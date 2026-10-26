import * as React from "react";
import axios from "axios";
import { useContext, useState } from "react";
import { useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { ClinicDateTimeField } from "../common/ClinicFields";
import { API_URL } from "../../Consts";
import { SnackbarContext } from "../../App";
import ConfirmDialog from "../common/ConfirmDialog";
import { formatDateTime } from "../../design/format";

// Opens one bookable time on the doctor's schedule.
function FreeAppointment({ buttonClassName = "ui-btn ui-btn--primary", onSaved }) {
  const notify = useContext(SnackbarContext);
  const { id } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const reset = () => { setStartDate(null); setEndDate(null); setError(""); setSaving(false); };
  const requestClose = () => { if (startDate || endDate) setConfirmClose(true); else { setOpen(false); reset(); } };

  const save = async () => {
    if (!startDate || !endDate) return setError("Choose when the time starts and ends.");
    if (new Date(endDate) <= new Date(startDate)) return setError("The end has to be after the start.");
    if (new Date(startDate) <= new Date()) return setError("Choose a time in the future.");
    setSaving(true);
    try {
      await axios.post(`${API_URL}/doctor/addAppointmentSlot/${id}`, { startDate, endDate });
      notify?.(`Open time added: ${formatDateTime(startDate)}`, "success");
      setOpen(false);
      reset();
      onSaved?.();
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error || "The time couldn't be added. Try again.");
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" className={buttonClassName} onClick={() => setOpen(true)}>
        <AddRoundedIcon /> Add open time
      </button>
      <Dialog open={open} onClose={requestClose} className="clinic-modern-dialog doctor-dialog" maxWidth="xs" fullWidth>
        <DialogTitle className="clinic-dialog-title">
          <div><span>SCHEDULE</span><h2>Add an open time</h2></div>
        </DialogTitle>
        <DialogContent style={{ display: "grid", gap: 14, paddingTop: 4 }}>
          <p className="clinic-dialog-copy" style={{ margin: 0 }}>Patients can book this time once you add it.</p>
          <ClinicDateTimeField value={startDate} onChange={setStartDate} label="Starts" />
          <ClinicDateTimeField value={endDate} onChange={setEndDate} label="Ends" />
          {error && <div className="ui-alert" role="alert">{error}</div>}
        </DialogContent>
        <DialogActions className="clinic-dialog-actions">
          <Button className="clinic-dialog-cancel" onClick={requestClose} disabled={saving}>Cancel</Button>
          <Button className="clinic-dialog-primary" onClick={save} disabled={saving}>{saving ? "Adding..." : "Add open time"}</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmClose}
        title="Discard this time?"
        message="You picked a time but haven't added it yet."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => { setConfirmClose(false); setOpen(false); reset(); }}
        onCancel={() => setConfirmClose(false)}
      />
    </>
  );
}

export default FreeAppointment;
