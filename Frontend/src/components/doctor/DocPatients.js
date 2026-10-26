import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import { appointmentPatients } from "../../features/doctorSlice";
import { API_URL } from "../../Consts";
import { SnackbarContext } from "../../App";
import FreeAppointment from "./FreeAppointment";
import FollowUp from "./FollowUp";
import RescheduleAppointment from "./DocRescheduleAppointment";
import ConfirmDialog from "../common/ConfirmDialog";
import AccountAvatar from "../Authentication/AccountAvatar";
import { Page, PageHead, VisitCard, EmptyState, Skeleton } from "../../design/ui";
import { formatDate, formatDateTime, byStart, ageFrom } from "../../design/format";

const VIEWS = [
  { value: "booked", label: "Booked visits" },
  { value: "open", label: "Open times" },
  { value: "past", label: "Past and cancelled" },
];

export default function DocPatients() {
  const dispatch = useDispatch();
  const notify = useContext(SnackbarContext);
  const { id, role } = useSelector((state) => state.user);
  const appointments = useSelector((state) => state.doctor.appointments);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("booked");
  const [search, setSearch] = useState("");
  const [toCancel, setToCancel] = useState(null);

  const refresh = () => id && dispatch(appointmentPatients(id)).finally(() => setLoaded(true));
  useEffect(() => { refresh(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useMemo(() => {
    const now = new Date();
    const all = Array.isArray(appointments) ? appointments : [];
    const q = search.trim().toLowerCase();
    const matches = (a) => !q || a.pID?.name?.toLowerCase().includes(q);
    const ahead = (a) => new Date(a.startDate) >= now;
    return {
      booked: all.filter((a) => a.pID && (a.status === "upcoming" || a.status === "rescheduled") && ahead(a) && matches(a)).sort(byStart),
      open: all.filter((a) => !a.pID && a.status === "Not_Reserved" && ahead(a)).sort(byStart),
      past: all.filter((a) => a.pID && !((a.status === "upcoming" || a.status === "rescheduled") && ahead(a)) && matches(a)).sort((a, b) => byStart(b, a)),
    };
  }, [appointments, search]);

  const cancelVisit = async () => {
    const a = toCancel;
    setToCancel(null);
    try {
      await axios.patch(`${API_URL}/doctor/CancelAppointment/${a._id}/${a.drID?._id || a.drID}/${a.pID._id}`);
      notify?.(`Cancelled ${a.pID?.name || "the patient"}'s visit. They have been notified.`, "success");
      refresh();
    } catch (e) {
      notify?.(e.response?.data?.message || "The visit couldn't be cancelled. Try again.", "error");
    }
  };

  if (role !== "doctor") return null;

  const list = groups[view];
  const empty = {
    booked: search ? ["No booked visits match", "Try another name."] : ["No booked visits", "When patients book your open times, the visits show up here."],
    open: ["No open times", "Add open times so patients can book you."],
    past: search ? ["No past visits match", "Try another name."] : ["No past visits yet", "Completed and cancelled visits show up here."],
  }[view];

  return (
    <>
      <AccountAvatar />
      <Page>
        <PageHead
          title="Schedule"
          lead="Your booked visits and the open times patients can book."
          actions={
            <>
              <FollowUp onSaved={refresh} />
              <FreeAppointment onSaved={refresh} />
            </>
          }
        />

        <section className="ui-card" style={{ marginBottom: 20 }}>
          <div className="ui-toolbar" style={{ borderBottom: 0 }}>
            <div className="ui-tabs" role="tablist" aria-label="Schedule view">
              {VIEWS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  role="tab"
                  aria-selected={view === v.value}
                  className="ui-tab"
                  onClick={() => setView(v.value)}
                >
                  {v.label}
                  <span className="ui-tab-count">{groups[v.value].length}</span>
                </button>
              ))}
            </div>
            {view !== "open" && (
              <div className="ui-field" style={{ flex: "0 1 280px", marginLeft: "auto" }}>
                <label htmlFor="sched-search" className="ui-sr-only">Patient name</label>
                <div className="ui-input-wrap">
                  <SearchRoundedIcon />
                  <input id="sched-search" className="ui-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient" />
                </div>
              </div>
            )}
          </div>
        </section>

        {!loaded && !appointments?.length ? (
          <Skeleton height={86} count={3} />
        ) : list.length === 0 ? (
          <div className="ui-card">
            <EmptyState
              icon={<EventAvailableRoundedIcon />}
              title={empty[0]}
              text={empty[1]}
              action={view === "open" ? <FreeAppointment onSaved={refresh} /> : null}
            />
          </div>
        ) : (
          <div className="ui-visits">
            {list.map((a) => {
              if (view === "open") {
                return (
                  <VisitCard key={a._id} open start={a.startDate} title="Open time" subtitle={`${formatDate(a.startDate)}. Patients can book this.`} />
                );
              }
              const age = ageFrom(a.pID?.dBirth);
              const live = a.status === "upcoming" || a.status === "rescheduled";
              return (
                <VisitCard
                  key={a._id}
                  start={a.startDate}
                  title={a.pID?.name || "Patient"}
                  subtitle={[formatDate(a.startDate), age != null ? `${age} years` : null].filter(Boolean).join(", ")}
                  status={a.status}
                  muted={a.status === "cancelled"}
                  actions={
                    view === "booked" && live ? (
                      <>
                        <RescheduleAppointment appointmentID={a._id} patientName={a.pID?.name} onSaved={refresh} />
                        <button type="button" className="ui-btn ui-btn--sm ui-btn--danger" onClick={() => setToCancel(a)}>Cancel visit</button>
                      </>
                    ) : null
                  }
                >
                  {String(a.Description || "").toLowerCase().includes("follow") && <span className="ui-chip">Follow-up</span>}
                  {a.Description && a.Description !== "Video visit" && !String(a.Description).toLowerCase().includes("follow") && (
                    <span className="ui-visit-note">{a.Description}</span>
                  )}
                </VisitCard>
              );
            })}
          </div>
        )}
      </Page>

      <ConfirmDialog
        open={Boolean(toCancel)}
        kicker="CANCEL VISIT"
        title={`Cancel ${toCancel?.pID?.name || "this patient"}'s visit?`}
        message={toCancel ? `The visit on ${formatDateTime(toCancel.startDate)} will be cancelled and the patient notified.` : ""}
        confirmLabel="Cancel visit"
        cancelLabel="Keep visit"
        destructive
        onConfirm={cancelVisit}
        onCancel={() => setToCancel(null)}
      />
    </>
  );
}
