import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AccountAvatar from "./Authentication/AccountAvatar";
import { API_URL } from "../Consts";

const iconFor = (type = "") => {
  const normalized = type.toLowerCase();
  if (normalized.includes("appointment")) return <EventRoundedIcon />;
  if (normalized.includes("prescription")) return <MedicationRoundedIcon />;
  if (normalized.includes("follow")) return <AssignmentTurnedInRoundedIcon />;
  return <NotificationsNoneRoundedIcon />;
};

const formatType = (type = "") =>
  type
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (value) => value.toUpperCase());

export default function NotificationsPage() {
  const { id, role } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !["patient", "doctor"].includes(role)) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const endpoint =
          role === "doctor"
            ? `${API_URL}/doctor/${id}/notifications`
            : `${API_URL}/patient/${id}/notifications`;

        const response = await axios.get(endpoint);
        const items = [...(response.data.notifications || [])].sort(
          (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
        );

        if (active) setNotifications(items);

        if (role === "patient") {
          try {
            const doctorResponse = await axios.get(`${API_URL}/patient/getAlldoctors`);
            if (active) {
              const doctorData = Array.isArray(doctorResponse.data)
                ? doctorResponse.data
                : doctorResponse.data?.doctors || [];
              setDoctors(doctorData);
            }
          } catch (doctorError) {
            console.error("Unable to load doctor details for notifications:", doctorError);
          }
        }
      } catch (error) {
        console.error("Unable to load notifications:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [id, role]);

  const subtitle = useMemo(
    () =>
      role === "doctor"
        ? "Updates about your appointments and clinic activity."
        : "Updates about your appointments and care.",
    [role]
  );

  const getDoctorForNotification = (notification) => {
    if (role !== "patient") return null;
    const message = String(notification.message || "").toLowerCase();
    return (
      doctors.find((doctor) =>
        message.includes(String(doctor.name || "").toLowerCase())
      ) || null
    );
  };

  const getNotificationDestination = (notification) => {
    const type = notification.entityType;
    const id = notification.entityId;

    if (type === "Appointment" && id) {
      return `/Appointments?appointmentId=${encodeURIComponent(id)}`;
    }
    if (type === "Prescription" && id) {
      return `/ListOfPrescriptions?prescriptionId=${encodeURIComponent(id)}`;
    }
    if (type === "FollowUp" && id) {
      return `/Appointments?followUpId=${encodeURIComponent(id)}`;
    }
    if (type === "HealthRecord") {
      return "/HealthRecords";
    }
    if (type === "HealthPackage") {
      return "/ViewHealthPackage";
    }
    return null;
  };

  const markNotificationSeen = async (notification) => {
    if (!notification?._id || notification.seen) return;

    const endpoint =
      role === "doctor"
        ? `${API_URL}/doctor/${id}/notifications/${notification._id}/seen`
        : `${API_URL}/patient/${id}/notifications/${notification._id}/seen`;

    try {
      await axios.patch(endpoint);
      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id ? { ...item, seen: true } : item
        )
      );
    } catch (error) {
      console.error("Unable to mark notification as seen:", error);
    }
  };

  const openNotification = async (notification) => {
    await markNotificationSeen(notification);
    const destination = getNotificationDestination(notification);
    if (destination) {
      navigate(destination);
      return;
    }

    if (notification.type?.toLowerCase().includes("appointment")) {
      navigate("/Appointments");
      return;
    }
    if (notification.message?.toLowerCase().includes("prescription")) {
      navigate("/ListOfPrescriptions");
      return;
    }
    if (notification.message?.toLowerCase().includes("follow")) {
      navigate("/Appointments");
    }
  };

  return (
    <main className="clinic-list-page">
      <AccountAvatar />
      <div className="clinic-list-shell">
        <button
          type="button"
          className="clinic-page-back"
          onClick={() => navigate("/Home")}
        >
          <ArrowBackRoundedIcon />
          Back to home
        </button>

        <section className="clinic-list-heading">
          <div>
            <span>UPDATES</span>
            <h1>Notifications</h1>
            <p>{subtitle}</p>
          </div>
          <div className="clinic-list-heading-icon">
            <NotificationsNoneRoundedIcon />
          </div>
        </section>

        <section className="clinic-list-card">
          {loading ? (
            <div className="clinic-list-empty">
              <strong>Loading notifications...</strong>
            </div>
          ) : notifications.length ? (
            <div className="clinic-notification-list">
              {notifications.map((notification, index) => {
                const doctor = getDoctorForNotification(notification);
                const destination = getNotificationDestination(notification);

                return (
                  <button
                    type="button"
                    className={`clinic-notification-row ${notification.seen ? "is-seen" : "is-unseen"}`}
                    key={notification._id || index}
                    onClick={() => openNotification(notification)}
                    aria-label={`Open ${notification.message || "clinic notification"}`}
                  >
                    <div className="clinic-notification-row-icon">
                      {iconFor(notification.type)}
                    </div>

                    <div className="clinic-notification-row-copy">
                      <div>
                        <strong>
                          {formatType(notification.type || "Clinic update")}
                        </strong>
                        <time>
                          {notification.timestamp
                            ? new Date(notification.timestamp).toLocaleString([], {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "Recent update"}
                        </time>
                      </div>

                      <p>{notification.message}</p>

                      {doctor ? (
                        <div className="clinic-notification-doctor">
                          <div className="clinic-notification-doctor-heading">
                            <span>DOCTOR DETAILS</span>
                            <strong>{doctor.name}</strong>
                          </div>
                          <div className="clinic-notification-doctor-grid">
                            <span>
                              <small>Speciality</small>
                              <strong>{doctor.speciality || "Not provided"}</strong>
                            </span>
                            <span>
                              <small>Age</small>
                              <strong>
                                {doctor.Dbirth
                                  ? Math.max(
                                      0,
                                      Math.floor(
                                        (Date.now() - new Date(doctor.Dbirth).getTime()) /
                                          (365.2425 * 24 * 60 * 60 * 1000)
                                      )
                                    )
                                  : "Not provided"}
                              </strong>
                            </span>
                            <span>
                              <small>Email</small>
                              <strong>{doctor.email || "Not provided"}</strong>
                            </span>
                            <span>
                              <small>Phone</small>
                              <strong>{doctor.mobile || "Not provided"}</strong>
                            </span>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="clinic-notification-row-action">
                      <span>{destination ? "Open" : "View"}</span>
                      <ArrowForwardRoundedIcon />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="clinic-list-empty">
              <div className="clinic-list-empty-icon">
                <NotificationsNoneRoundedIcon />
              </div>
              <strong>No notifications yet</strong>
              <span>New clinic updates will appear here.</span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}