import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AccountAvatar from "../Authentication/AccountAvatar";
import { API_URL } from "../../Consts";

const iconFor = (type = "") => type.toLowerCase().includes("appointment") ? <EventRoundedIcon /> : <InfoOutlinedIcon />;

export default function NotificationsPage() {
  const { id, role } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !["patient", "doctor"].includes(role)) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await axios.get(role === "doctor" ? `${API_URL}/doctor/${id}/notifications` : `${API_URL}/patient/${id}/notifications`);
        if (active) setNotifications([...(response.data.notifications || [])].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id, role]);

  const subtitle = useMemo(() => role === "doctor" ? "Updates about your appointments and clinic activity." : "Updates about your appointments and care.", [role]);

  return (
    <main className="clinic-list-page">
      <AccountAvatar />
      <div className="clinic-list-shell">
        <button type="button" className="clinic-page-back" onClick={() => navigate("/Home")}><ArrowBackRoundedIcon />Back to home</button>
        <section className="clinic-list-heading">
          <div><span>UPDATES</span><h1>Notifications</h1><p>{subtitle}</p></div>
          <div className="clinic-list-heading-icon"><NotificationsNoneRoundedIcon /></div>
        </section>
        <section className="clinic-list-card">
          {loading ? <div className="clinic-list-empty"><strong>Loading notifications...</strong></div> : notifications.length ? (
            <div className="clinic-notification-list">
              {notifications.map((notification, index) => (
                <article className="clinic-notification-row" key={notification._id || index}>
                  <div className="clinic-notification-row-icon">{iconFor(notification.type)}</div>
                  <div className="clinic-notification-row-copy">
                    <div><strong>{notification.type || "Clinic update"}</strong><time>{notification.timestamp ? new Date(notification.timestamp).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Recent update"}</time></div>
                    <p>{notification.message}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="clinic-list-empty"><div className="clinic-list-empty-icon"><NotificationsNoneRoundedIcon /></div><strong>No notifications yet</strong><span>New clinic updates will appear here.</span></div>
          )}
        </section>
      </div>
    </main>
  );
}