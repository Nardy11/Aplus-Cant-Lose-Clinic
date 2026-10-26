import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import EventRepeatRoundedIcon from "@mui/icons-material/EventRepeatRounded";
import { API_URL } from "../../Consts";
import { SnackbarContext } from "../../App";
import AccountAvatar from "../Authentication/AccountAvatar";
import { ClinicDateTimeField } from "../common/ClinicFields";
import ConfirmDialog from "../common/ConfirmDialog";
import { Page, PageHead, VisitCard, EmptyState, Skeleton } from "../../design/ui";
import { formatDateTime, byStart } from "../../design/format";

// "YYYY-MM-DDTHH:mm" in local time, the format the date-time field reads.
const toLocalInput = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function FollowUpRequests() {
  const id = useSelector((state) => state.user.id);
  const notify = useContext(SnackbarContext);
  const [requests, setRequests] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toReject, setToReject] = useState(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const r = await axios.get(`${API_URL}/doctor/FollowUpRequests/${id}`);
      setRequests(Array.isArray(r.data) ? r.data.sort((a, b) => byStart({ startDate: a.requestDate }, { startDate: b.requestDate })) : []);
    } catch {
      setRequests([]);
      notify?.("Follow-up requests didn't load. Refresh to try again.", "error");
    }
  };
  useEffect(() => { if (id) load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-fill the patient's requested time, 30 minutes long.
  const openSchedule = (row) => {
    setSelected(row);
    setError("");
    const s = row.requestDate && new Date(row.requestDate) > new Date() ? new Date(row.requestDate) : null;
    setStart(s ? toLocalInput(s) : "");
    setEnd(s ? toLocalInput(new Date(s.getTime() + 30 * 60000)) : "");
  };

  const accept = async () => {
    if (!start || !end) return setError("Choose when the visit starts and ends.");
    if (new Date(end) <= new Date(start)) return setError("The end has to be after the start.");
    setSaving(true);
    try {
      await axios.post(`${API_URL}/doctor/acceptFollowUp/${selected._id}`, { start, end });
      notify?.(`Follow-up booked with ${selected.patientName || "the patient"}: ${formatDateTime(start)}`, "success");
      setSelected(null);
      load();
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error || "The follow-up couldn't be booked. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const reject = async () => {
    const row = toReject;
    setToReject(null);
    try {
      await axios.delete(`${API_URL}/doctor/rejectFollowUp/${row._id}`);
      notify?.(`Declined ${row.patientName || "the patient"}'s request.`, "success");
      load();
    } catch {
      notify?.("The request couldn't be declined. Try again.", "error");
    }
  };

  return (
    <>
      <AccountAvatar />
      <Page>
        <PageHead title="Follow-up requests" lead="Patients asking to see you again. The time they asked for is filled in when you book." />

        {!requests ? (
          <Skeleton height={86} count={2} />
        ) : requests.length === 0 ? (
          <div className="ui-card">
            <EmptyState icon={<EventRepeatRoundedIcon />} title="No requests" text="When a patient asks for a follow-up visit, it shows up here." />
          </div>
        ) : (
          <div className="ui-visits">
            {requests.map((row) => (
              <VisitCard
                key={row._id}
                start={row.requestDate}
                title={row.patientName || "Patient"}
                subtitle={`Asked for ${formatDateTime(row.requestDate)}`}
                status="pending"
                actions={
                  <>
                    <button type="button" className="ui-btn ui-btn--sm ui-btn--danger" onClick={() => setToReject(row)}>Decline</button>
                    <button type="button" className="ui-btn ui-btn--sm ui-btn--primary" onClick={() => openSchedule(row)}>Book visit</button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </Page>

      <Dialog open={Boolean(selected)} onClose={() => !saving && setSelected(null)} fullWidth maxWidth="xs" className="clinic-modern-dialog doctor-dialog">
        <DialogTitle className="clinic-dialog-title">
          <div><span>FOLLOW-UP</span><h2>Book {selected?.patientName || "the patient"}</h2></div>
        </DialogTitle>
        <DialogContent style={{ display: "grid", gap: 14, paddingTop: 4 }}>
          {selected?.requestDate && <p className="clinic-dialog-copy" style={{ margin: 0 }}>They asked for {formatDateTime(selected.requestDate)}. Change it if that time doesn't work.</p>}
          <ClinicDateTimeField value={start} onChange={setStart} label="Starts" />
          <ClinicDateTimeField value={end} onChange={setEnd} label="Ends" />
          {error && <div className="ui-alert" role="alert">{error}</div>}
        </DialogContent>
        <DialogActions className="clinic-dialog-actions">
          <Button className="clinic-dialog-cancel" onClick={() => setSelected(null)} disabled={saving}>Cancel</Button>
          <Button className="clinic-dialog-primary" onClick={accept} disabled={saving}>{saving ? "Booking..." : "Book visit"}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toReject)}
        kicker="DECLINE REQUEST"
        title={`Decline ${toReject?.patientName || "this patient"}'s request?`}
        message="The request is removed from your list."
        confirmLabel="Decline"
        cancelLabel="Keep request"
        destructive
        onConfirm={reject}
        onCancel={() => setToReject(null)}
      />
    </>
  );
}
