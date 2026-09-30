import React, { useEffect, useMemo, useState, useContext } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { appointmentPatients } from "../../features/doctorSlice";
import { API_URL } from "../../Consts";
import { SnackbarContext } from "../../App";
import FreeAppointment from "./FreeAppointment";
import FollowUp from "./FollowUp";
import RescheduleAppointment from "./DocRescheduleAppointment";
import { ClinicSearchField, ClinicDateField, ClinicSelectField } from "../common/ClinicFields";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import MoreTimeRoundedIcon from "@mui/icons-material/MoreTimeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function DocPatients() {
  const dispatch = useDispatch();
  const notify = useContext(SnackbarContext);
  const { id, role } = useSelector((state) => state.user);
  const appointments = useSelector((state) => state.doctor.appointments || []);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Any");
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  useEffect(() => { if (id) dispatch(appointmentPatients(id)); }, [dispatch, id]);

  const filtered = useMemo(() => appointments.filter((appointment) => {
    const patientName = appointment?.pID?.name || "";
    const matchesSearch = !search || patientName.toLowerCase().includes(search.toLowerCase());
    const start = appointment?.startDate ? new Date(appointment.startDate) : null;
    const matchesDate = !date || (start && start.toISOString().slice(0,10) === date);
    const matchesStatus = status === "Any" || appointment?.status === status;
    const matchesUpcoming = !upcomingOnly || (start && start > new Date());
    return matchesSearch && matchesDate && matchesStatus && matchesUpcoming;
  }), [appointments, search, date, status, upcomingOnly]);

  const cancelAppointment = async (appointment) => {
    try {
      await axios.patch(`${API_URL}/doctor/CancelAppointment/${appointment._id}/${appointment.drID}/${appointment.pID._id}`);
      notify?.("Appointment cancelled successfully.", "success");
      dispatch(appointmentPatients(id));
    } catch { notify?.("Unable to cancel the appointment.", "error"); }
  };

  if (role !== "doctor") return null;

  return <main className="doctor-page">
    <div className="doctor-page-shell">
      <section className="doctor-page-header">
        <div className="doctor-page-header-copy"><span>CLINIC SCHEDULE</span><h1>Appointments</h1><p>Manage your patient visits, free time slots, follow-up requests, and rescheduling from one consistent workspace.</p></div>
        <div className="doctor-page-header-icon"><CalendarMonthRoundedIcon /></div>
      </section>

      <section className="doctor-stats">
        <div className="doctor-stat"><span>Total</span><strong>{appointments.length}</strong><small>Appointments in your schedule</small></div>
        <div className="doctor-stat"><span>Showing</span><strong>{filtered.length}</strong><small>Matches current filters</small></div>
        <div className="doctor-stat"><span>Upcoming</span><strong>{appointments.filter((a) => a.status === "upcoming").length}</strong><small>Visits still ahead</small></div>
        <div className="doctor-stat"><span>Cancelled</span><strong>{appointments.filter((a) => a.status === "cancelled").length}</strong><small>Cancelled visits</small></div>
      </section>

      <section className="doctor-surface">
        <div className="doctor-toolbar" style={{ flexWrap:"wrap" }}>
          <ClinicSearchField value={search} onChange={setSearch} placeholder="Search patient name..." className="doctor-appointment-search" />
          <ClinicDateField value={date} onChange={setDate} placeholder="Start date" />
          <ClinicSelectField value={status} onChange={setStatus} ariaLabel="Status" options={[{value:"Any",label:"Any status"},{value:"upcoming",label:"Upcoming"},{value:"completed",label:"Completed"},{value:"cancelled",label:"Cancelled"},{value:"rescheduled",label:"Rescheduled"}]} />
          <label className="doctor-upcoming-toggle"><input type="checkbox" checked={upcomingOnly} onChange={(e) => setUpcomingOnly(e.target.checked)} /><span>Upcoming only</span></label>
          <button className="doctor-secondary-button" onClick={() => { setSearch(""); setDate(""); setStatus("Any"); setUpcomingOnly(false); }}>Reset</button>
          <div className="doctor-toolbar-spacer" />
          <FreeAppointment />
          <FollowUp />
        </div>

        {filtered.length ? <div className="doctor-appointment-list">
          {filtered.map((appointment, index) => {
            const patient = appointment?.pID;
            const start = appointment?.startDate ? new Date(appointment.startDate) : null;
            const statusClass = appointment?.status === "completed" ? "success" : appointment?.status === "cancelled" ? "danger" : appointment?.status === "upcoming" ? "warning" : "";
            return <article className="doctor-appointment-card" key={appointment?._id || index}>
              <div className="doctor-appointment-date"><div className="doctor-appointment-date-icon"><PersonRoundedIcon sx={{ fontSize:18 }} /></div><div><strong>{patient?.name || "Unknown patient"}</strong><span>{start && !Number.isNaN(start.getTime()) ? start.toLocaleString([], { dateStyle:"medium", timeStyle:"short" }) : "Date unavailable"}</span></div></div>
              <span className={`doctor-status ${statusClass}`}>{appointment?.status || "unknown"}{String(appointment?.Description || "").toLowerCase().includes("follow up") ? " · Follow up" : ""}</span>
              <div className="doctor-row-actions">
                {appointment?.status === "upcoming" && <RescheduleAppointment appointmentID={appointment._id} /> }
                {appointment?.status === "upcoming" && <button className="doctor-secondary-button doctor-danger-button" onClick={() => cancelAppointment(appointment)}><CloseRoundedIcon sx={{ fontSize:14, mr:.4, verticalAlign:"middle" }} />Cancel</button>}
              </div>
            </article>;
          })}
        </div> : <div className="doctor-empty-state"><div className="doctor-empty-icon"><EventAvailableRoundedIcon /></div><h3>{appointments.length ? "No appointments match these filters" : "No appointments yet"}</h3><p>{appointments.length ? "Adjust the filters or reset the toolbar to see your full schedule." : "Scheduled patient visits will appear here."}</p></div>}
      </section>
    </div>
  </main>;
}