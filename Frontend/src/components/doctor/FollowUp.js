import * as React from "react";
import axios from "axios";
import { useContext, useState } from "react";
import { useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import EventRepeatRoundedIcon from "@mui/icons-material/EventRepeatRounded";
import { ClinicDateTimeField } from "../common/ClinicFields";
import { API_URL } from "../../Consts";
import { SnackbarContext } from "../../App";
import ConfirmDialog from "../common/ConfirmDialog";
import { Avatar } from "../../design/ui";
import { formatDateTime } from "../../design/format";

// Books a follow-up visit for one of the doctor's patients.
function FollowUp({ buttonClassName = "ui-btn", onSaved }) {
  const notify = useContext(SnackbarContext);
  const { id } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState(null);
  const [patientId, setPatientId] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const openDialog = async () => {
    setOpen(true);
    try {
      const r = await axios.get(`${API_URL}/doctor/patientsInUpcomingApointments/${id}`);
      setPatients(r.data?.patients || []);
    } catch {
      setPatients([]);
    }
  };

  const reset = () => { setStartDate(null); setEndDate(null); setPatientId(""); setError(""); setSaving(false); };
  const requestClose = () => { if (startDate || endDate || patientId) setConfirmClose(true); else { setOpen(false); reset(); } };

  const save = async () => {
    if (!patientId) return setError("Choose the patient.");
    if (!startDate || !endDate) return setError("Choose when the visit starts and ends.");
    if (new Date(endDate) <= new Date(startDate)) return setError("The end has to be after the start.");
    setSaving(true);
    try {
      await axios.post(`${API_URL}/doctor/createFollowUpAppointment/${id}?patientID=${patientId}`, { startDate, endDate });
      const name = patients?.find((p) => p._id === patientId)?.name;
      notify?.(`Follow-up booked${name ? ` for ${name}` : ""}: ${formatDateTime(startDate)}`, "success");
      setOpen(false);
      reset();
      onSaved?.();
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error || "The follow-up couldn't be booked. Try again.");
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" className={buttonClassName} onClick={openDialog}>
        <EventRepeatRoundedIcon /> Book a follow-up
      </button>
      <Dialog open={open} onClose={requestClose} className="clinic-modern-dialog doctor-dialog" maxWidth="sm" fullWidth>
        <DialogTitle className="clinic-dialog-title">
          <div><span>FOLLOW-UP</span><h2>Book a follow-up visit</h2></div>
        </DialogTitle>
        <DialogContent style={{ display: "grid", gap: 14, paddingTop: 4 }}>
          <div className="ui-field">
            <span className="ui-label">Patient</span>
            {patients === null ? (
              <p className="clinic-dialog-copy" style={{ margin: 0 }}>Loading your patients...</p>
            ) : patients.length === 0 ? (
              <p className="clinic-dialog-copy" style={{ margin: 0 }}>You can book follow-ups for patients who have a visit with you. None yet.</p>
            ) : (
              <div className="pick-list" role="radiogroup" aria-label="Patient">
                {patients.map((p) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={patientId === p._id}
                    key={p._id}
                    className="pick-item"
                    onClick={() => setPatientId(p._id)}
                  >
                    <Avatar name={p.name} />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <ClinicDateTimeField value={startDate} onChange={setStartDate} label="Starts" />
          <ClinicDateTimeField value={endDate} onChange={setEndDate} label="Ends" />
          {error && <div className="ui-alert" role="alert">{error}</div>}
        </DialogContent>
        <DialogActions className="clinic-dialog-actions">
          <Button className="clinic-dialog-cancel" onClick={requestClose} disabled={saving}>Cancel</Button>
          <Button className="clinic-dialog-primary" onClick={save} disabled={saving}>{saving ? "Booking..." : "Book follow-up"}</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmClose}
        title="Discard this follow-up?"
        message="You picked a patient or a time but haven't booked the follow-up yet."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => { setConfirmClose(false); setOpen(false); reset(); }}
        onCancel={() => setConfirmClose(false)}
      />
    </>
  );
}

export default FollowUp;
