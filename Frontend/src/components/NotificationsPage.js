import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import HealthAndSafetyRoundedIcon from "@mui/icons-material/HealthAndSafetyRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AccountAvatar from "./Authentication/AccountAvatar";
import { API_URL } from "../Consts";
import { getNotifications } from "../features/patientSlice";
import { getNotificationsd } from "../features/doctorSlice";
import { Page, PageHead, EmptyState, Skeleton } from "../design/ui";
import { notificationTitle, formatTime, relativeDay, dayKey } from "../design/format";

const iconFor = (n) => {
  const type = `${n.type || ""} ${n.entityType || ""}`.toLowerCase();
  if (type.includes("appointment")) return <EventRoundedIcon />;
  if (type.includes("prescription")) return <MedicationRoundedIcon />;
  if (type.includes("follow")) return <AssignmentTurnedInRoundedIcon />;
  if (type.includes("healthpackage")) return <HealthAndSafetyRoundedIcon />;
  return <NotificationsNoneRoundedIcon />;
};

// Where a notification leads, per role. Doctors have no /Appointments page.
const destinationFor = (n, role) => {
  const { entityType, entityId } = n;
  const enc = encodeURIComponent;
  if (role === "doctor") {
    if (entityType === "Appointment") return "/DocPatients";
    if (entityType === "FollowUp") return "/FollowUpRequests";
    if (entityType === "Patient") return "/PatientsList";
    if (entityType === "Prescription") return "/Prescription";
    return null;
  }
  if (entityType === "Appointment" && entityId) return `/Appointments?appointmentId=${enc(entityId)}`;
  if (entityType === "Prescription" && entityId) return `/ListOfPrescriptions?prescriptionId=${enc(entityId)}`;
  if (entityType === "FollowUp") return "/Appointments";
  if (entityType === "HealthRecord") return "/HealthRecords";
  if (entityType === "HealthPackage") return "/ViewHealthPackage";
  if (entityType === "FamilyMember") return "/viewfamilymembers";
  return null;
};

export default function NotificationsPage() {
  const { id, role } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const base = role === "doctor" ? `${API_URL}/doctor/${id}/notifications` : `${API_URL}/patient/${id}/notifications`;
  const refreshBadge = () => dispatch(role === "doctor" ? getNotificationsd(id) : getNotifications(id));

  useEffect(() => {
    if (!id || !["patient", "doctor"].includes(role)) return;
    let active = true;
    axios.get(base)
      .then((r) => active && setNotifications([...(r.data.notifications || [])].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))))
      .catch(() => active && setNotifications([]));
    if (role === "patient") {
      axios.get(`${API_URL}/patient/getAlldoctors`)
        .then((r) => active && setDoctors(Array.isArray(r.data) ? r.data : r.data?.doctors || []))
        .catch(() => {});
    }
    return () => { active = false; };
  }, [id, role]); // eslint-disable-line react-hooks/exhaustive-deps

  const doctorFor = (n) => {
    if (role !== "patient") return null;
    const message = String(n.message || "").toLowerCase();
    return doctors.find((d) => d.name && message.includes(d.name.toLowerCase())) || null;
  };

  const markSeen = async (n) => {
    if (!n?._id || n.seen) return;
    setNotifications((list) => list.map((x) => (x._id === n._id ? { ...x, seen: true } : x)));
    try {
      await axios.patch(`${base}/${n._id}/seen`);
      refreshBadge();
    } catch {
      setNotifications((list) => list.map((x) => (x._id === n._id ? { ...x, seen: false } : x)));
    }
  };

  const markAll = async () => {
    const unread = (notifications || []).filter((n) => !n.seen);
    if (!unread.length) return;
    setNotifications((list) => list.map((n) => ({ ...n, seen: true })));
    try {
      await axios.patch(`${base}/seen-all`);
      refreshBadge();
    } catch {
      setNotifications((list) => list.map((n) => (unread.some((u) => u._id === n._id) ? { ...n, seen: false } : n)));
    }
  };

  const open = async (n) => {
    await markSeen(n);
    const to = destinationFor(n, role);
    if (to) navigate(to);
  };

  const groups = useMemo(() => {
    const byDay = new Map();
    for (const n of notifications || []) {
      const key = dayKey(n.timestamp);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(n);
    }
    return [...byDay.values()];
  }, [notifications]);

  const unreadCount = (notifications || []).filter((n) => !n.seen).length;

  return (
    <>
      <AccountAvatar />
      <Page>
        <PageHead
          back="/Home"
          title="Notifications"
          lead={unreadCount ? `${unreadCount} unread` : "You're all caught up."}
          actions={
            <button type="button" className="ui-btn" onClick={markAll} disabled={!unreadCount}>Mark all as read</button>
          }
        />

        {!notifications ? (
          <Skeleton height={72} count={4} />
        ) : groups.length === 0 ? (
          <div className="ui-card">
            <EmptyState icon={<NotificationsNoneRoundedIcon />} title="No notifications yet" text="Bookings, prescriptions and plan changes show up here." />
          </div>
        ) : (
          <div style={{ display: "grid", gap: 22 }}>
            {groups.map((group) => (
              <section key={dayKey(group[0].timestamp)} className="ui-day">
                <h2 className="ui-day-label">{relativeDay(group[0].timestamp)}</h2>
                <ul className="ui-card ui-list">
                  {group.map((n) => {
                    const doctor = doctorFor(n);
                    const to = destinationFor(n, role);
                    return (
                      <li key={n._id}>
                        <button type="button" className={`ui-row notif-row ${n.seen ? "" : "is-unread"}`} onClick={() => open(n)}>
                          <span className="ui-row-icon">{iconFor(n)}</span>
                          <span className="ui-row-body">
                            <strong>{notificationTitle(n.type, n.entityType)}</strong>
                            <span>{n.message}</span>
                            {doctor?.speciality && <span className="notif-meta">{doctor.speciality}</span>}
                          </span>
                          <span className="notif-end">
                            <time>{formatTime(n.timestamp)}</time>
                            {to && <ChevronRightRoundedIcon />}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Page>
    </>
  );
}
