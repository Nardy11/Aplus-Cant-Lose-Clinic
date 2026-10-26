import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
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
import { Page, PageHead, VisitCard, EmptyState, Skeleton } from "../../design/ui";
import { formatMoney, formatDateTime, isUpcoming, byStart, notificationTitle } from "../../design/format";

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
      <PageHead
        title={firstName ? `${greeting()}, ${firstName}` : greeting()}
        lead="Your next visit, medicines and plan, in one place."
        actions={
          <Link to="/DoctorsList" className="ui-btn ui-btn--primary">
            <SearchRoundedIcon /> Find a doctor
          </Link>
        }
      />

      {error && <div className="ui-alert" role="alert" style={{ marginBottom: 16 }}>We couldn't load your care summary. Refresh the page to try again.</div>}

      <div className="ui-grid ui-grid-main">
        <section aria-labelledby="next-visit" style={{ display: "grid", gap: 14 }}>
          <h2 id="next-visit" className="ui-section-title">Next visit</h2>
          {!data ? (
            <Skeleton height={112} count={1} />
          ) : next ? (
            <VisitCard
              feature
              start={next.startDate}
              title={`Dr. ${next.drID?.name || "your doctor"}`}
              subtitle={next.drID?.speciality}
              status={next.status}
              actions={
                <>
                  <Link to="/chats" className="ui-btn ui-btn--primary">Message doctor</Link>
                  <Link to="/Appointments" className="ui-btn">Manage</Link>
                </>
              }
            />
          ) : (
            <div className="ui-card">
              <EmptyState
                icon={<CalendarMonthRoundedIcon />}
                title="No visits booked"
                text="Find a doctor and book a video visit. It will show up here."
                action={<Link to="/DoctorsList" className="ui-btn ui-btn--primary">Find a doctor</Link>}
              />
            </div>
          )}

          {later.length > 0 && (
            <>
              <h2 className="ui-section-title" style={{ marginTop: 14 }}>Coming up</h2>
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
              {later.length > 3 && <Link to="/Appointments" className="ui-btn ui-btn--ghost">See all appointments</Link>}
            </>
          )}
        </section>

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
                <CareRow
                  to="/Wallet"
                  icon={AccountBalanceWalletRoundedIcon}
                  label="Wallet"
                  value={`${formatMoney(data.profile.wallet)} available`}
                />
                <CareRow
                  to="/ListOfPrescriptions"
                  icon={MedicationRoundedIcon}
                  label="Prescriptions"
                  value={toFill ? `${toFill} waiting to be filled` : "All filled"}
                />
                <CareRow
                  to="/HealthRecords"
                  icon={FolderSharedRoundedIcon}
                  label="Health records"
                  value="Diagnoses, lab results and documents"
                />
                <CareRow
                  to="/viewfamilymembers"
                  icon={GroupsRoundedIcon}
                  label="Family"
                  value={family ? `${family} ${family === 1 ? "person" : "people"} on your account` : "Add your family"}
                />
              </ul>
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
        </aside>
      </div>
    </Page>
  );
}

export default Home;
