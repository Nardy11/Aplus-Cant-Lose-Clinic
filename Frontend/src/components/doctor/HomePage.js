import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import WalletRoundedIcon from "@mui/icons-material/WalletRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import { getPatients, appointmentPatients, getDr } from "../../features/doctorSlice";

function HomePage() {
  const dispatch = useDispatch();
  const { id, username } = useSelector((state) => state.user);
  const { patientsList = [], appointments = [], info = {}, notifications = [], loading } = useSelector((state) => state.doctor);

  useEffect(() => {
    if (!id) return;
    dispatch(getPatients(id));
    dispatch(appointmentPatients(id));
    dispatch(getDr(id));
  }, [dispatch, id]);

  const upcoming = appointments.filter((a) => a?.status === "upcoming" || (a?.startDate && new Date(a.startDate) > new Date())).slice(0, 4);
  const doctorName = info?.name || username || "Doctor";

  return (
    <main className="doctor-page">
      <div className="doctor-page-shell">
        <section className="doctor-home-hero">
          <div className="doctor-welcome">
            <span>EL7A2NY CLINIC · DOCTOR PORTAL</span>
            <h1>Welcome back, Dr. {doctorName}.</h1>
            <p>Keep your patients moving forward with one calm workspace for appointments, follow-ups, prescriptions, records, and clinic activity.</p>
          </div>
          <div className="doctor-quick-card">
            <span>QUICK ACCESS</span>
            <h2>Today at a glance</h2>
            <p>{upcoming.length ? "You have " + upcoming.length + " upcoming visit" + (upcoming.length === 1 ? "" : "s") + " in your current schedule." : "Your schedule is clear right now."}</p>
            <div className="doctor-quick-links">
              <Link className="doctor-quick-link" to="/PatientsList"><GroupRoundedIcon />Patients</Link>
              <Link className="doctor-quick-link" to="/DocPatients"><EventAvailableRoundedIcon />Schedule</Link>
              <Link className="doctor-quick-link" to="/Prescription"><AssignmentRoundedIcon />Prescriptions</Link>
              <Link className="doctor-quick-link" to="/FollowUpRequests"><DescriptionRoundedIcon />Follow ups</Link>
            </div>
          </div>
        </section>

        <section className="doctor-stats">
          <div className="doctor-stat"><span>My patients</span><strong>{patientsList.length}</strong><small>Patients connected to your clinic care</small></div>
          <div className="doctor-stat"><span>Appointments</span><strong>{appointments.length}</strong><small>Appointments currently returned by your schedule</small></div>
          <div className="doctor-stat"><span>Upcoming</span><strong>{upcoming.length}</strong><small>Visits requiring your attention</small></div>
          <div className="doctor-stat"><span>Notifications</span><strong>{notifications.length}</strong><small>Recent clinic updates</small></div>
        </section>

        <section className="doctor-surface" style={{ marginBottom: 18 }}>
          <div className="doctor-toolbar">
            <div><span style={{ color:"#1769ff", fontSize:8, fontWeight:850, letterSpacing:".14em" }}>SCHEDULE</span><div style={{ color:"#33435a", fontSize:17, fontWeight:800, marginTop:3 }}>Upcoming appointments</div></div>
            <div className="doctor-toolbar-spacer" />
            <Link to="/DocPatients" style={{ textDecoration:"none" }}><button type="button" className="doctor-secondary-button" style={{ minWidth: 190, whiteSpace: "nowrap", justifyContent: "center", display: "inline-flex", alignItems: "center" }}>
  View full schedule <ArrowForwardRoundedIcon sx={{ fontSize: 15, ml: .5 }} />
</button></Link>
          </div>

          {loading && !appointments.length ? <div className="doctor-empty-state"><strong>Loading your schedule...</strong></div> : upcoming.length ? (
            <div className="doctor-appointment-list">
              {upcoming.map((appointment, index) => {
                const patient = appointment?.pID;
                const date = appointment?.startDate ? new Date(appointment.startDate) : null;
                return <div className="doctor-appointment-card" key={appointment?._id || index}>
                  <div className="doctor-appointment-date"><div className="doctor-appointment-date-icon"><CalendarMonthRoundedIcon sx={{ fontSize:19 }} /></div><div><strong>{patient?.name || "Patient appointment"}</strong><span>{date && !Number.isNaN(date.getTime()) ? date.toLocaleString([], { dateStyle:"medium", timeStyle:"short" }) : "Scheduled visit"}</span></div></div>
                  <span className="doctor-status">{appointment?.status || "upcoming"}</span>
                  <Link to="/DocPatients" style={{ textDecoration:"none" }}><button className="doctor-secondary-button">Manage</button></Link>
                </div>;
              })}
            </div>
          ) : <div className="doctor-empty-state"><div className="doctor-empty-icon"><EventAvailableRoundedIcon /></div><h3>No upcoming appointments</h3><p>Your next appointments will appear here as soon as patients are scheduled.</p></div>}
        </section>

        <section className="doctor-card-grid" style={{ padding:0, gridTemplateColumns:"repeat(3, 1fr)" }}>
          <Link to="/Wallet" className="doctor-patient-card" style={{ textDecoration:"none" }}><div className="doctor-patient-card-head"><div className="doctor-person-avatar"><WalletRoundedIcon sx={{ fontSize:18 }} /></div><div><h3>Wallet</h3><p>Review your clinic account activity</p></div></div></Link>
          <Link to="/Notifications" className="doctor-patient-card" style={{ textDecoration:"none" }}><div className="doctor-patient-card-head"><div className="doctor-person-avatar"><NotificationsNoneRoundedIcon sx={{ fontSize:18 }} /></div><div><h3>Notifications</h3><p>Review every clinic update</p></div></div></Link>
          <Link to="/Contract" className="doctor-patient-card" style={{ textDecoration:"none" }}><div className="doctor-patient-card-head"><div className="doctor-person-avatar"><DescriptionRoundedIcon sx={{ fontSize:18 }} /></div><div><h3>Credentials</h3><p>Review your job documents</p></div></div></Link>
        </section>
      </div>
    </main>
  );
}

export default HomePage;