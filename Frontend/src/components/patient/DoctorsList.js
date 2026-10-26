import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import { API_URL } from "../../Consts";
import AccountAvatar from "../Authentication/AccountAvatar";
import { Page, PageHead, EmptyState, Skeleton, Avatar } from "../../design/ui";
import { formatMoney, formatTime, relativeDay, sessionPrice, byStart } from "../../design/format";

export default function DoctorsList() {
  const patientId = useSelector((state) => state.user.id);
  const [doctors, setDoctors] = useState(null);
  const [nextSlot, setNextSlot] = useState({});
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(false);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [openOnly, setOpenOnly] = useState(false);

  useEffect(() => {
    let active = true;
    axios
      .get(`${API_URL}/patient/getAlldoctors`)
      .then(async (r) => {
        if (!active) return;
        const list = (Array.isArray(r.data) ? r.data : []).filter((d) => !d.status || d.status === "accepted");
        setDoctors(list);
        // Earliest free slot per doctor, so patients see availability before clicking.
        const now = Date.now();
        const entries = await Promise.all(
          list.map((d) =>
            axios
              .get(`${API_URL}/patient/freeAppiontmentSlot/${d._id}`)
              .then((s) => [d._id, (s.data?.Appointments || []).filter((a) => new Date(a.startDate) > now).sort(byStart)[0] || null])
              .catch(() => [d._id, null])
          )
        );
        if (active) setNextSlot(Object.fromEntries(entries));
      })
      .catch(() => active && setError(true));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!patientId) return;
    axios
      .get(`${API_URL}/patient/viewHealthPackagesPatient/${patientId}`)
      .then((r) => setPlan((r.data?.healthPackages || []).find((p) => p.isSubscribed) || null))
      .catch(() => setPlan(null));
  }, [patientId]);

  const specialties = useMemo(
    () => [...new Set((doctors || []).map((d) => d.speciality).filter(Boolean))].sort(),
    [doctors]
  );

  const shown = (doctors || []).filter((d) => {
    if (name && !d.name?.toLowerCase().includes(name.trim().toLowerCase())) return false;
    if (specialty && d.speciality !== specialty) return false;
    if (openOnly && !nextSlot[d._id]) return false;
    return true;
  });

  const clear = () => { setName(""); setSpecialty(""); setOpenOnly(false); };
  const filtering = Boolean(name || specialty || openOnly);

  return (
    <>
      <AccountAvatar />
      <Page>
        <PageHead
          title="Find a doctor"
          lead={plan ? `Prices include your ${plan.type} plan discount of ${plan.doctorDisc}% on sessions.` : "Every doctor here is reviewed by the clinic. Prices are per session."}
        />

        <section className="ui-card">
          <div className="ui-toolbar">
            <div className="ui-field">
              <label htmlFor="doc-name">Doctor name</label>
              <div className="ui-input-wrap">
                <SearchRoundedIcon />
                <input id="doc-name" className="ui-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Search by name" />
              </div>
            </div>
            <div className="ui-field">
              <label htmlFor="doc-spec">Specialty</label>
              <select id="doc-spec" className="ui-input" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                <option value="">All specialties</option>
                {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <label className="ui-check">
              <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} />
              Has open times
            </label>
            {filtering && <button type="button" className="ui-btn ui-btn--ghost" onClick={clear}>Clear filters</button>}
          </div>

          <div className="ui-card-pad">
            {error ? (
              <EmptyState title="Doctors didn't load" text="Check your connection and refresh the page." />
            ) : !doctors ? (
              <div className="ui-grid ui-grid-3"><Skeleton height={230} count={3} /></div>
            ) : shown.length === 0 ? (
              <EmptyState
                icon={<PersonSearchRoundedIcon />}
                title={filtering ? "No doctors match these filters" : "No doctors yet"}
                text={filtering ? "Try another specialty or clear the filters." : "Doctors appear here once the clinic approves them."}
                action={filtering && <button type="button" className="ui-btn" onClick={clear}>Clear filters</button>}
              />
            ) : (
              <div className="ui-grid ui-grid-3">
                {shown.map((d) => {
                  const slot = nextSlot[d._id];
                  const full = sessionPrice(d.rate);
                  const price = sessionPrice(d.rate, plan?.doctorDisc);
                  return (
                    <article className="ui-doc" key={d._id}>
                      <div className="ui-doc-head">
                        <Avatar name={d.name} />
                        <div>
                          <h3>Dr. {d.name}</h3>
                          <p>{d.speciality}</p>
                        </div>
                      </div>
                      <div>
                        <p className="ui-doc-about">{d.background}</p>
                        <div className="ui-doc-facts">
                          <span>{d.affilation}</span>
                          <span>
                            {slot === undefined ? "Checking times..." : slot ? `Next free: ${relativeDay(slot.startDate)}, ${formatTime(slot.startDate)}` : "No open times"}
                          </span>
                        </div>
                      </div>
                      <div className="ui-doc-foot">
                        <div className="ui-price">
                          <strong>{price !== full && <s>{formatMoney(full)}</s>}{formatMoney(price)}</strong>
                          <span>per session</span>
                        </div>
                        <Link to={`/appointmentPatientss/${d._id}`} className={`ui-btn ${slot ? "ui-btn--primary" : ""}`}>
                          {slot ? "Book a time" : "View profile"}
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </Page>
    </>
  );
}
