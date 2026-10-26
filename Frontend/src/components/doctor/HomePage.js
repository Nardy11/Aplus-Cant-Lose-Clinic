import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import EventRepeatRoundedIcon from "@mui/icons-material/EventRepeatRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { API_URL } from "../../Consts";
import { Page, PageHead, VisitCard, EmptyState, Skeleton, Avatar } from "../../design/ui";
import { formatMoney, formatDate, formatTime, relativeDay, isUpcoming, byStart, dayKey, ageFrom } from "../../design/format";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

function useDoctorDay(doctorId) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!doctorId) return;
    let active = true;
    const get = (path) => axios.get(`${API_URL}/doctor/${path}`).then((r) => r.data).catch(() => null);
    Promise.all([get(`getDr/${doctorId}`), get(`appointmentPatients/${doctorId}`), get(`FollowUpRequests/${doctorId}`)]).then(
      ([dr, appts, followUps]) => {
        if (!active) return;
        setData({
          info: dr?.dr || {},
          appointments: Array.isArray(appts) ? appts : [],
          followUps: Array.isArray(followUps) ? followUps : [],
        });
      }
    );
    return () => { active = false; };
  }, [doctorId]);
  return data;
}

function HomePage() {
  const doctorId = useSelector((state) => state.user.id);
  const data = useDoctorDay(doctorId);

  const booked = (data?.appointments || []).filter(isUpcoming).sort(byStart);
  const todayKey = dayKey(new Date());
  const today = booked.filter((a) => dayKey(a.startDate) === todayKey);
  const weekEnd = Date.now() + 7 * 86400000;
  const thisWeek = booked.filter((a) => new Date(a.startDate).getTime() <= weekEnd);
  const openSlots = (data?.appointments || []).filter((a) => !a.pID && a.status === "Not_Reserved" && new Date(a.startDate) > new Date());
  const next = booked[0];
  const firstName = (data?.info?.name || "").split(" ")[0];

  const lead = !data
    ? "Loading your schedule..."
    : today.length
      ? `You have ${today.length} ${today.length === 1 ? "visit" : "visits"} today.`
      : next
        ? `No visits today. Next: ${relativeDay(next.startDate)}, ${formatTime(next.startDate)}.`
        : "No visits booked yet.";

  const agenda = today.length ? today : booked.slice(0, 4);
  const visitActions = () => (
    <>
      <Link to="/chats" className="ui-btn ui-btn--sm">Message</Link>
      <Link to="/PatientsList" className="ui-btn ui-btn--sm ui-btn--soft">Patient file</Link>
    </>
  );

  return (
    <Page>
      <PageHead
        title={firstName ? `${greeting()}, Dr. ${firstName}` : greeting()}
        lead={lead}
        actions={<Link to="/DocPatients" className="ui-btn ui-btn--primary"><AddRoundedIcon /> Add open times</Link>}
      />

      <div className="ui-stats" style={{ marginBottom: 24 }}>
        <Link to="/DocPatients" className="ui-stat"><span>Visits today</span><strong>{data ? today.length : "-"}</strong><small>{today[0] ? `First at ${formatTime(today[0].startDate)}` : "Nothing booked today"}</small></Link>
        <Link to="/DocPatients" className="ui-stat"><span>Next 7 days</span><strong>{data ? thisWeek.length : "-"}</strong><small>{openSlots.length} open {openSlots.length === 1 ? "time" : "times"} left</small></Link>
        <Link to="/FollowUpRequests" className="ui-stat"><span>Follow-up requests</span><strong>{data ? data.followUps.length : "-"}</strong><small>{data?.followUps.length ? "Waiting for your answer" : "All answered"}</small></Link>
        <Link to="/Wallet" className="ui-stat"><span>Wallet</span><strong>{data ? formatMoney(data.info.wallet) : "-"}</strong><small>Session payments</small></Link>
      </div>

      <div className="ui-grid ui-grid-main">
        <section style={{ display: "grid", gap: 12 }}>
          <h2 className="ui-section-title">{today.length ? "Today" : "Coming up"}</h2>
          {!data ? (
            <Skeleton height={86} count={3} />
          ) : agenda.length ? (
            <div className="ui-visits">
              {agenda.map((a, i) => {
                const age = ageFrom(a.pID?.dBirth);
                return (
                  <VisitCard
                    key={a._id}
                    feature={i === 0 && today.length > 0}
                    start={a.startDate}
                    title={a.pID?.name || "Patient"}
                    subtitle={[age != null ? `${age} years` : null, a.pID?.gender && a.pID.gender !== "none" ? a.pID.gender : null, !today.length ? formatDate(a.startDate) : null].filter(Boolean).join(", ")}
                    status={a.status}
                    actions={visitActions()}
                  >
                    {a.Description && a.Description !== "Video visit" && <span className="ui-visit-note">{a.Description}</span>}
                  </VisitCard>
                );
              })}
            </div>
          ) : (
            <div className="ui-card">
              <EmptyState
                icon={<EventAvailableRoundedIcon />}
                title="No visits booked"
                text={openSlots.length ? `You have ${openSlots.length} open times. Patients can book them now.` : "Add open times so patients can book you."}
                action={<Link to="/DocPatients" className="ui-btn ui-btn--primary">Add open times</Link>}
              />
            </div>
          )}
          {data && today.length > 0 && booked.length > today.length && (
            <Link to="/DocPatients" className="ui-btn ui-btn--ghost" style={{ justifySelf: "start" }}>See the rest of your schedule</Link>
          )}
          {data && openSlots.length === 0 && agenda.length > 0 && (
            <p className="ui-lead" style={{ margin: 0 }}>You have no open times left. <Link to="/DocPatients">Add some</Link> so new patients can book.</p>
          )}
        </section>

        <aside className="ui-card">
          <div className="ui-card-head">
            <h2 className="ui-section-title">Follow-up requests</h2>
            {data?.followUps.length > 0 && <Link to="/FollowUpRequests" className="ui-btn ui-btn--ghost ui-btn--sm">Review</Link>}
          </div>
          {!data ? (
            <div className="ui-card-pad"><Skeleton height={44} count={2} /></div>
          ) : data.followUps.length ? (
            <ul className="ui-list">
              {data.followUps.slice(0, 5).map((f) => (
                <li key={f._id}>
                  <Link to="/FollowUpRequests" className="ui-row">
                    <Avatar name={f.patientName} />
                    <span className="ui-row-body">
                      <strong>{f.patientName || "Patient"}</strong>
                      <span>Wants a visit {relativeDay(f.requestDate)}, {formatTime(f.requestDate)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<EventRepeatRoundedIcon />} title="No requests" text="When a patient asks for a follow-up visit, it shows up here." />
          )}
        </aside>
      </div>
    </Page>
  );
}

export default HomePage;
