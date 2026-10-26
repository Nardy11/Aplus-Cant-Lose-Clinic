import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import HealthAndSafetyRoundedIcon from "@mui/icons-material/HealthAndSafetyRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import FolderSharedRoundedIcon from "@mui/icons-material/FolderSharedRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { API_URL } from "../../Consts";
import { getNotifications } from "../../features/patientSlice.js";
import { Page, VisitCard, EmptyState, Skeleton } from "../../design/ui";
import { formatMoney, formatDateTime, isUpcoming, byStart, notificationTitle } from "../../design/format";

const HOW = [
  { icon: SearchRoundedIcon, title: "Choose a doctor", text: "Filter by specialty and see each doctor's price and next free time." },
  { icon: CalendarMonthRoundedIcon, title: "Pick a time and pay", text: "Pay from your wallet or by card. Your plan discount is already included." },
  { icon: VideocamRoundedIcon, title: "Meet by video", text: "Join from your phone or laptop, and message your doctor before and after." },
  { icon: MedicationRoundedIcon, title: "Keep everything together", text: "Prescriptions, records and documents land in your account." },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

function usePatientOverview(patientId) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    let active = true;
    const get = (path) => axios.get(`${API_URL}/patient/${path}`).then((r) => r.data).catch(() => null);
    Promise.all([
      get(`profile/${patientId}`),
      get(`viewAppoints/${patientId}`),
      get(`viewPrescriptions/${patientId}`),
      get(`viewHealthPackagesPatient/${patientId}`),
    ]).then(([profile, appts, presc, plans]) => {
      if (!active) return;
      if (!profile && !appts) setError(true);
      setData({
        profile: profile || {},
        appointments: appts?.Appointments || [],
        prescriptions: presc?.prescriptions || [],
        plan: (plans?.healthPackages || []).find((p) => p.isSubscribed) || null,
      });
    });
    return () => { active = false; };
  }, [patientId]);

  return { data, error };
}

function CareRow({ to, icon: Icon, label, value }) {
  return (
    <li>
      <Link to={to} className="ui-row">
        <span className="ui-row-icon"><Icon /></span>
        <span className="ui-row-body">
          <strong>{label}</strong>
          <span>{value}</span>
        </span>
        <ChevronRightRoundedIcon className="ui-row-end" />
      </Link>
    </li>
  );
}

function Home() {
  const dispatch = useDispatch();
  const patientId = useSelector((state) => state.user.id);
  const notifications = useSelector((state) => state.patient.notifications);
  const { data, error } = usePatientOverview(patientId);

  useEffect(() => {
    if (patientId) dispatch(getNotifications(patientId));
  }, [dispatch, patientId]);

  const firstName = (data?.profile?.name || "").split(" ")[0];
  const upcoming = (data?.appointments || []).filter(isUpcoming).sort(byStart);
  const [next, ...later] = upcoming;
  const toFill = (data?.prescriptions || []).filter((p) => p.status !== "filled").length;
  const family = data?.profile?.family?.length || 0;
  const unread = (Array.isArray(notifications) ? notifications : []).filter((n) => n && !n.seen).slice(0, 3);

  return (
    <Page>
      {/* A welcome first: who you are, what this place is for, and the one thing coming up. */}
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-hello">{firstName ? `${greeting()}, ${firstName}` : greeting()}</p>
          <h1>Healthcare that stays with you.</h1>
          <p className="home-lead">See a doctor by video, keep your prescriptions and records together, and look after your family from one place.</p>
          <div className="home-hero-actions">
            <Link to="/DoctorsList" className="ui-btn ui-btn--primary ui-btn--lg">Find a doctor</Link>
            <Link to="/Appointments" className="ui-btn ui-btn--lg">My appointments</Link>
          </div>
        </div>
        <div className="home-hero-visual">
          <img src="/doctors.jpg" alt="A doctor smiling, with her colleagues behind her" />
          <div className="home-hero-card">
            {!data ? (
              <Skeleton height={96} count={1} />
            ) : next ? (
              <VisitCard
                feature
                start={next.startDate}
                title={`Dr. ${next.drID?.name || "your doctor"}`}
                subtitle={next.drID?.speciality ? `Your next visit, ${next.drID.speciality}` : "Your next visit"}
                status={next.status}
              />
            ) : (
              <div className="home-hero-note">
                <CalendarMonthRoundedIcon />
                <div>
                  <strong>No visit booked</strong>
                  <span>Pick a doctor and a time, and it shows up here.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {error && <div className="ui-alert" role="alert" style={{ marginBottom: 16 }}>We couldn't load your care summary. Refresh the page to try again.</div>}

      <div className="ui-grid ui-grid-main">
        <div style={{ display: "grid", gap: 28, alignContent: "start" }}>
        <section aria-labelledby="coming-up" style={{ display: "grid", gap: 12 }}>
          <h2 id="coming-up" className="ui-section-title">Coming up</h2>
          {!data ? (
            <Skeleton height={86} count={2} />
          ) : later.length ? (
            <>
              <div className="ui-visits">
                {later.slice(0, 3).map((a) => (
                  <VisitCard
                    key={a._id}
                    start={a.startDate}
                    title={`Dr. ${a.drID?.name || "your doctor"}`}
                    subtitle={a.drID?.speciality}
                    status={a.status}
                  />
                ))}
              </div>
              <Link to="/Appointments" className="ui-btn ui-btn--ghost" style={{ justifySelf: "start" }}>See all appointments</Link>
            </>
          ) : (
            <div className="ui-card">
              <EmptyState
                icon={<CalendarMonthRoundedIcon />}
                title={next ? "That's your only visit for now" : "Nothing booked yet"}
                text="Browse doctors, see their open times and book in a minute."
                action={<Link to="/DoctorsList" className="ui-btn">Find a doctor</Link>}
              />
            </div>
          )}
        </section>

        <section className="ui-card" aria-labelledby="updates">
          <div className="ui-card-head">
            <h2 id="updates" className="ui-section-title">Updates</h2>
            <Link to="/Notifications" className="ui-btn ui-btn--ghost ui-btn--sm">See all</Link>
          </div>
          {unread.length ? (
            <ul className="ui-list">
              {unread.map((n) => (
                <li key={n._id} className="ui-row">
                  <span className="ui-row-icon"><NotificationsNoneRoundedIcon /></span>
                  <span className="ui-row-body">
                    <strong>{notificationTitle(n.type, n.entityType)}</strong>
                    <span>{n.message}</span>
                    <span>{formatDateTime(n.timestamp)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="You're all caught up" text="New bookings, prescriptions and plan changes will appear here." />
          )}
        </section>
        </div>

        <aside style={{ display: "grid", gap: 16 }}>
          <section className="ui-card" aria-labelledby="your-care">
            <div className="ui-card-head"><h2 id="your-care" className="ui-section-title">Your care</h2></div>
            {!data ? (
              <div className="ui-card-pad"><Skeleton height={44} count={4} /></div>
            ) : (
              <ul className="ui-list">
                <CareRow
                  to="/ViewHealthPackage"
                  icon={HealthAndSafetyRoundedIcon}
                  label={data.plan ? `${data.plan.type} plan` : "No plan yet"}
                  value={data.plan ? `${data.plan.doctorDisc}% off every doctor session` : "Save on sessions and medicine"}
                />
                <CareRow to="/Wallet" icon={AccountBalanceWalletRoundedIcon} label="Wallet" value={`${formatMoney(data.profile.wallet)} available`} />
                <CareRow to="/ListOfPrescriptions" icon={MedicationRoundedIcon} label="Prescriptions" value={toFill ? `${toFill} waiting to be filled` : "All filled"} />
                <CareRow to="/HealthRecords" icon={FolderSharedRoundedIcon} label="Health records" value="Diagnoses, lab results and documents" />
                <CareRow to="/viewfamilymembers" icon={GroupsRoundedIcon} label="Family" value={family ? `${family} ${family === 1 ? "person" : "people"} on your account` : "Add your family"} />
              </ul>
            )}
          </section>

        </aside>
      </div>

      <section className="home-how" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="ui-section-title">How a visit works</h2>
        <ol>
          {HOW.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <span className="ui-row-icon"><Icon /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>
    </Page>
  );
}

export default Home;
