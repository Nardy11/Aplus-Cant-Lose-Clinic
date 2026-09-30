import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../Consts";
import { SnackbarContext } from "../../App";
import AccountAvatar from "../Authentication/AccountAvatar";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";

export default function FollowUpRequests() {
  const id = useSelector((state) => state.user.id);
  const notify = useContext(SnackbarContext);
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const response = await axios.get(`${API_URL}/doctor/FollowUpRequests/${id}`); setRequests(Array.isArray(response.data) ? response.data : []); }
    catch { notify?.("Unable to load follow-up requests.", "error"); setRequests([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (id) load(); }, [id]);

  const reject = async (requestId) => {
    try { const response = await axios.delete(`${API_URL}/doctor/rejectFollowUp/${requestId}`); setRequests(Array.isArray(response.data) ? response.data : requests.filter((r) => r._id !== requestId)); notify?.("Follow-up request rejected.", "success"); }
    catch { notify?.("Unable to reject the follow-up request.", "error"); }
  };

  const accept = async () => {
    if (!start || !end) { notify?.("Choose both start and end times.", "error"); return; }
    try {
      const response = await axios.post(`${API_URL}/doctor/acceptFollowUp/${selected._id}`, { start: start.toDate(), end: end.toDate() });
      setRequests(Array.isArray(response.data) ? response.data : requests.filter((r) => r._id !== selected._id));
      notify?.("Follow-up scheduled successfully.", "success");
      setSelected(null); setStart(null); setEnd(null);
    } catch { notify?.("Unable to schedule the follow-up.", "error"); }
  };

  return (
    <>
      <AccountAvatar />
      <main className="doctor-page">
    <div className="doctor-page-shell">
      <section className="doctor-page-header"><div className="doctor-page-header-copy"><span>CONTINUITY OF CARE</span><h1>Follow-up requests</h1><p>Review requests from your patients and schedule the next visit without leaving the portal.</p></div><div className="doctor-page-header-icon"><GroupRoundedIcon /></div></section>
      <section className="doctor-stats">
        <div className="doctor-stat"><span>Requests</span><strong>{requests.length}</strong><small>Current follow-up requests</small></div>
        <div className="doctor-stat"><span>Pending</span><strong>{requests.length}</strong><small>Requests awaiting an action</small></div>
        <div className="doctor-stat"><span>Workflow</span><strong>2</strong><small>Accept and reject actions</small></div>
        <div className="doctor-stat"><span>Status</span><strong>{loading ? "..." : "Ready"}</strong><small>Request feed status</small></div>
      </section>

      <section className="doctor-surface">
        <div className="doctor-toolbar"><div><span style={{ color:"#1769ff", fontSize:8, fontWeight:850, letterSpacing:".13em" }}>REQUEST QUEUE</span><div style={{ color:"#33435a", fontSize:17, fontWeight:800, marginTop:3 }}>Patient follow-ups</div></div><div className="doctor-toolbar-spacer" /></div>
        {loading ? <div className="doctor-empty-state"><strong>Loading follow-up requests...</strong></div> : requests.length ? <div className="doctor-appointment-list">
          {requests.map((row, index) => <article className="doctor-appointment-card" key={row._id || index}>
            <div className="doctor-appointment-date"><div className="doctor-appointment-date-icon"><GroupRoundedIcon sx={{ fontSize:18 }} /></div><div><strong>{row.patientName || "Patient"}</strong><span>{row.date || row.requestDate ? new Date(row.date || row.requestDate).toLocaleString([], { dateStyle:"medium", timeStyle:"short" }) : "Request date unavailable"}</span></div></div>
            <span className="doctor-status warning">Pending</span>
            <div className="doctor-row-actions"><button className="doctor-secondary-button doctor-danger-button" onClick={() => reject(row._id)}><CloseRoundedIcon sx={{ fontSize:14, mr:.4, verticalAlign:"middle" }} />Reject</button><button className="doctor-primary-button" onClick={() => { setSelected(row); setStart(null); setEnd(null); }}><CheckRoundedIcon sx={{ fontSize:14, mr:.4, verticalAlign:"middle" }} />Schedule</button></div>
          </article>)}
        </div> : <div className="doctor-empty-state"><div className="doctor-empty-icon"><GroupRoundedIcon /></div><h3>No follow-up requests</h3><p>New requests from your patients will appear here.</p></div>}
      </section>
    </div>

    <Dialog open={Boolean(selected)} onClose={() => { setSelected(null); setStart(null); setEnd(null); }} fullWidth maxWidth="sm" className="doctor-dialog">
      <DialogTitle className="doctor-dialog-title"><div><span>SCHEDULE FOLLOW-UP</span><h2>{selected?.patientName || "Patient"}</h2></div><IconButton className="doctor-dialog-close" onClick={() => setSelected(null)}><CloseRoundedIcon /></IconButton></DialogTitle>
      <DialogContent className="doctor-dialog-content">
        <div className="doctor-dialog-section"><h3>Choose the next visit</h3><p>Set a start and end time for this follow-up request.</p>
          <div className="doctor-form-grid">
            <div className="doctor-form-field"><label>Start time</label><LocalizationProvider dateAdapter={AdapterDayjs}><DateTimePicker value={start} onChange={setStart} minDateTime={dayjs()} slotProps={{ textField:{ fullWidth:true } }} /></LocalizationProvider></div>
            <div className="doctor-form-field"><label>End time</label><LocalizationProvider dateAdapter={AdapterDayjs}><DateTimePicker value={end} onChange={setEnd} minDateTime={start || dayjs()} slotProps={{ textField:{ fullWidth:true } }} /></LocalizationProvider></div>
          </div>
        </div>
      </DialogContent>
      <DialogActions sx={{ px:3, pb:2.5 }}><Button className="doctor-secondary-button" onClick={() => setSelected(null)}>Cancel</Button><Button className="doctor-primary-button" onClick={accept}><CalendarMonthRoundedIcon sx={{ fontSize:15, mr:.5 }} />Schedule follow-up</Button></DialogActions>
    </Dialog>
      </main>
    </>
  );
}