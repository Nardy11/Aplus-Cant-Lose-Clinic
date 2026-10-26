import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import { viewAppoints } from "../../features/patientSlice";
import { API_URL } from "../../Consts.js";
import { SnackbarContext } from "../../App";
import AccountAvatar from "../Authentication/AccountAvatar.js";
import RescheduleAppointment from "./PatRescheduleAppointment";
import ConfirmDialog from "../common/ConfirmDialog";
import { Page, PageHead, VisitCard, EmptyState, Skeleton } from "../../design/ui";
import { formatDate, formatDateTime, byStart } from "../../design/format";

const STATUS_FILTERS = [
  { value: "", label: "Any status" },
  { value: "upcoming", label: "Upcoming" },
  { value: "rescheduled", label: "Rescheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function Appointments() {
  const dispatch = useDispatch();
  const snackbarMessage = useContext(SnackbarContext);
  const location = useLocation();
  const focusedId = new URLSearchParams(location.search).get("appointmentId");
  const patientId = useSelector((state) => state.user.id);
  const rows = useSelector((state) => state.patient.appoints);
  const loading = useSelector((state) => state.patient.loading);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [toCancel, setToCancel] = useState(null);
  const [requested, setRequested] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    dispatch(viewAppoints(patientId)).finally(() => setLoaded(true));
  }, [dispatch, patientId]);

  useEffect(() => {
    if (!focusedId || !rows?.length) return;
    const t = window.setTimeout(() => {
      document.getElementById(`appointment-${focusedId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    return () => window.clearTimeout(t);
  }, [focusedId, rows]);

  const { upcoming, past } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (Array.isArray(rows) ? rows : [])
      .filter((r) => !status || r.status === status)
      .filter((r) => !q || r.drID?.name?.toLowerCase().includes(q) || r.drID?.speciality?.toLowerCase().includes(q));
    const now = new Date();
    const isAhead = (r) => (r.status === "upcoming" || r.status === "rescheduled") && new Date(r.startDate) >= now;
    return {
      upcoming: list.filter(isAhead).sort(byStart),
      past: list.filter((r) => !isAhead(r)).sort((a, b) => byStart(b, a)),
    };
  }, [rows, search, status]);

  const cancelVisit = async () => {
    const a = toCancel;
    setToCancel(null);
    try {
      await axios.patch(`${API_URL}/patient/CancelAppointment/${a._id}/${a.drID?._id}/${a.pID}`);
      snackbarMessage(`Cancelled your visit with Dr. ${a.drID?.name || ""}`, "success");
      dispatch(viewAppoints(patientId));
    } catch (e) {
      snackbarMessage(e.response?.data?.message || "The visit couldn't be cancelled. Try again.", "error");
    }
  };

  const requestFollowUp = async (a) => {
    setRequested((ids) => [...ids, a._id]);
    try {
      await axios.post(`${API_URL}/patient/requestFollowUp/${a.pID}/${a.drID?._id}`);
      snackbarMessage(`Follow-up requested from Dr. ${a.drID?.name || ""}`, "success");
    } catch (e) {
      setRequested((ids) => ids.filter((id) => id !== a._id));
      snackbarMessage("The follow-up request didn't go through. Try again.", "error");
    }
  };

  const filtering = Boolean(search || status);
  const ready = loaded || (Array.isArray(rows) && rows.length > 0);

  const card = (a) => (
    <div key={a._id} id={`appointment-${a._id}`} className={focusedId === a._id ? "ui-focus-ring" : undefined}>
      <VisitCard
        start={a.startDate}
        title={`Dr. ${a.drID?.name || "Unknown doctor"}`}
        subtitle={[a.drID?.speciality, formatDate(a.startDate)].filter(Boolean).join(", ")}
        status={a.status}
        muted={a.status === "cancelled"}
        actions={
          a.status === "upcoming" || a.status === "rescheduled" ? (
            <>
              <RescheduleAppointment appointment={a} buttonClassName="ui-btn ui-btn--sm" />
              <button type="button" className="ui-btn ui-btn--sm ui-btn--danger" onClick={() => setToCancel(a)}>Cancel visit</button>
            </>
          ) : a.status === "completed" ? (
            <button type="button" className="ui-btn ui-btn--sm ui-btn--soft" disabled={requested.includes(a._id)} onClick={() => requestFollowUp(a)}>
              {requested.includes(a._id) ? "Follow-up requested" : "Request follow-up"}
            </button>
          ) : null
        }
      >
        {a.Description && a.Description !== "Video visit" && <span className="ui-visit-note">{a.Description}</span>}
      </VisitCard>
    </div>
  );

  return (
    <>
      <AccountAvatar />
      <Page>
        <PageHead
          title="Appointments"
          lead="Your visits, soonest first. Reschedule or cancel upcoming ones here."
          actions={<Link to="/DoctorsList" className="ui-btn ui-btn--primary">Book a visit</Link>}
        />

        <section className="ui-card" style={{ marginBottom: 24 }}>
          <div className="ui-toolbar" style={{ borderBottom: 0 }}>
            <div className="ui-field">
              <label htmlFor="appt-search">Doctor or specialty</label>
              <div className="ui-input-wrap">
                <SearchRoundedIcon />
                <input id="appt-search" className="ui-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" />
              </div>
            </div>
            <div className="ui-field" style={{ flex: "0 1 220px" }}>
              <label htmlFor="appt-status">Status</label>
              <select id="appt-status" className="ui-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {filtering && <button type="button" className="ui-btn ui-btn--ghost" onClick={() => { setSearch(""); setStatus(""); }}>Clear filters</button>}
          </div>
        </section>

        {!ready || (loading && !rows?.length) ? (
          <Skeleton height={86} count={3} />
        ) : upcoming.length === 0 && past.length === 0 ? (
          <div className="ui-card">
            <EmptyState
              icon={<CalendarMonthRoundedIcon />}
              title={filtering ? "No visits match these filters" : "No visits yet"}
              text={filtering ? "Clear the filters to see all your visits." : "Book a video visit with a doctor. It will appear here."}
              action={filtering
                ? <button type="button" className="ui-btn" onClick={() => { setSearch(""); setStatus(""); }}>Clear filters</button>
                : <Link to="/DoctorsList" className="ui-btn ui-btn--primary">Find a doctor</Link>}
            />
          </div>
        ) : (
          <div style={{ display: "grid", gap: 28 }}>
            {upcoming.length > 0 && (
              <section style={{ display: "grid", gap: 12 }}>
                <h2 className="ui-section-title">Upcoming</h2>
                <div className="ui-visits">{upcoming.map(card)}</div>
              </section>
            )}
            {past.length > 0 && (
              <section style={{ display: "grid", gap: 12 }}>
                <h2 className="ui-section-title">Past and cancelled</h2>
                <div className="ui-visits">{past.map(card)}</div>
              </section>
            )}
          </div>
        )}
      </Page>

      <ConfirmDialog
        open={Boolean(toCancel)}
        kicker="CANCEL VISIT"
        title="Cancel this visit?"
        message={toCancel ? `Your visit with Dr. ${toCancel.drID?.name || ""} on ${formatDateTime(toCancel.startDate)} will be cancelled and the time freed for other patients.` : ""}
        confirmLabel="Cancel visit"
        cancelLabel="Keep visit"
        destructive
        onConfirm={cancelVisit}
        onCancel={() => setToCancel(null)}
      />
    </>
  );
}
