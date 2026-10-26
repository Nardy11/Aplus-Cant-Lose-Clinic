import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import { API_URL } from "../../Consts.js";
import { SnackbarContext } from "../../App";
import AccountAvatar from "../Authentication/AccountAvatar.js";
import { Page, PageHead, EmptyState, Skeleton, Avatar } from "../../design/ui";
import { formatMoney, formatTime, formatDateTime, relativeDay, dayKey, byStart } from "../../design/format";

// Book one of a doctor's open slots, for yourself or a family member with their own account.
export default function AvailableApp() {
  const snackbarMessage = useContext(SnackbarContext);
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const patientId = useSelector((state) => state.user.id);
  const username = useSelector((state) => state.user.username);

  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState(null);
  const [price, setPrice] = useState(null);
  const [profile, setProfile] = useState(null);
  const [familyAccounts, setFamilyAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [forWho, setForWho] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    axios.get(`${API_URL}/patient/getAlldoctors`)
      .then((r) => active && setDoctor((r.data || []).find((d) => d._id === doctorId) || false))
      .catch(() => active && setDoctor(false));
    axios.get(`${API_URL}/patient/freeAppiontmentSlot/${doctorId}`)
      .then((r) => active && setSlots((r.data?.Appointments || []).filter((a) => new Date(a.startDate) > new Date()).sort(byStart)))
      .catch(() => active && setSlots([]));
    return () => { active = false; };
  }, [doctorId]);

  useEffect(() => {
    if (!patientId) return;
    let active = true;
    axios.get(`${API_URL}/patient/calculateAmount/${doctorId}/${patientId}`)
      .then((r) => active && setPrice(r.data))
      .catch(() => active && setPrice(false));
    axios.get(`${API_URL}/patient/profile/${patientId}`)
      .then(async (r) => {
        if (!active) return;
        setProfile(r.data);
        // Family members can be booked only if they have their own patient account.
        const linked = (r.data?.family || []).filter((f) => f.pid);
        const accounts = await Promise.all(
          linked.map((f) =>
            axios.get(`${API_URL}/patient/profile/${f.pid}`)
              .then((p) => ({ name: f.fullName, relation: f.relation, username: p.data?.username }))
              .catch(() => null)
          )
        );
        if (active) setFamilyAccounts(accounts.filter((a) => a?.username));
      })
      .catch(() => active && setProfile(false));
    return () => { active = false; };
  }, [doctorId, patientId]);

  const days = useMemo(() => {
    const groups = new Map();
    for (const s of slots || []) {
      const key = dayKey(s.startDate);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(s);
    }
    return [...groups.values()];
  }, [slots]);

  const amount = price ? price.amount : null;
  const balance = Number(profile?.wallet || 0);
  const visitFor = forWho || username;
  const forMe = !forWho;
  const canAfford = amount != null && balance >= amount;

  const assignVisit = () =>
    axios.patch(`${API_URL}/patient/reserveAppointmentSlot/${selected._id}`, {
      username: visitFor,
      Description: reason.trim() || "Video visit",
    });

  const payWithWallet = async () => {
    setBusy(true);
    setError("");
    try {
      await axios.post(`${API_URL}/patient/payAppWithWallet/`, {
        patientID: patientId,
        amount,
        drID: doctorId,
        appointmentID: selected._id,
      });
      // Payment books the slot under the payer; assign it to the family member and save the reason.
      await assignVisit();
      snackbarMessage(`Booked: ${formatDateTime(selected.startDate)} with Dr. ${doctor?.name || ""}`, "success");
      navigate("/Appointments");
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error || "Booking failed. Your wallet was not charged if the time is still shown as open.");
      setBusy(false);
    }
  };

  const payByCard = async () => {
    setBusy(true);
    setError("");
    try {
      await assignVisit();
      const r = await axios.post(`${API_URL}/patient/createAppointmentCheckoutSession/${amount}/${selected._id}/${patientId}`);
      window.location = r.data.url;
    } catch (e) {
      setError(e.response?.data?.error || "Card payment couldn't start. Try again or pay from your wallet.");
      setBusy(false);
    }
  };

  return (
    <>
      <AccountAvatar />
      <Page>
        <PageHead back="/DoctorsList" title={doctor ? `Book Dr. ${doctor.name}` : "Book a visit"} lead={doctor ? `${doctor.speciality}, ${doctor.affilation}` : undefined} />

        {doctor === false ? (
          <div className="ui-card"><EmptyState title="We couldn't find this doctor" text="They may no longer be taking patients." action={<Link className="ui-btn" to="/DoctorsList">Back to doctors</Link>} /></div>
        ) : (
          <div className="ui-grid ui-grid-main">
            <section className="ui-card">
              <div className="ui-card-head"><h2 className="ui-section-title">Choose a time</h2></div>
              <div className="ui-card-pad">
                {!slots ? (
                  <Skeleton height={46} count={3} />
                ) : days.length === 0 ? (
                  <EmptyState icon={<EventBusyRoundedIcon />} title="No open times right now" text="This doctor hasn't opened new times. Check back soon or choose another doctor." action={<Link className="ui-btn" to="/DoctorsList">See other doctors</Link>} />
                ) : (
                  days.map((group) => (
                    <div className="ui-day" key={dayKey(group[0].startDate)}>
                      <h3 className="ui-day-label">
                        {relativeDay(group[0].startDate)}
                        <span>{group.length} {group.length === 1 ? "time" : "times"}</span>
                      </h3>
                      <div className="ui-slots">
                        {group.map((s) => (
                          <button type="button" key={s._id} className="ui-slot" aria-pressed={selected?._id === s._id} onClick={() => { setSelected(s); setError(""); }}>
                            {formatTime(s.startDate)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <aside className="ui-card booking-summary">
              <div className="ui-card-head">
                {doctor ? (
                  <div className="ui-doc-head">
                    <Avatar name={doctor.name} />
                    <div><h3>Dr. {doctor.name}</h3><p>{doctor.speciality}</p></div>
                  </div>
                ) : <Skeleton height={44} count={1} />}
              </div>
              <div className="ui-card-pad" style={{ display: "grid", gap: 16 }}>
                <div className="booking-line">
                  <span>Time</span>
                  <strong>{selected ? formatDateTime(selected.startDate) : "Pick a time"}</strong>
                </div>
                <div className="booking-line">
                  <span>Price</span>
                  <strong>
                    {amount == null ? "..." : formatMoney(amount)}
                    {price?.discount ? <small> includes {price.discount}% plan discount</small> : null}
                  </strong>
                </div>

                {familyAccounts.length > 0 && (
                  <div className="ui-field">
                    <label htmlFor="visit-for">Who is this visit for?</label>
                    <select id="visit-for" className="ui-input" value={forWho} onChange={(e) => setForWho(e.target.value)}>
                      <option value="">Me</option>
                      {familyAccounts.map((f) => <option key={f.username} value={f.username}>{f.name} ({f.relation})</option>)}
                    </select>
                  </div>
                )}

                <div className="ui-field">
                  <label htmlFor="visit-reason">Reason for visit (optional)</label>
                  <textarea id="visit-reason" className="ui-input booking-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="A few words help your doctor prepare" />
                </div>

                {error && <div className="ui-alert" role="alert">{error}</div>}

                <button type="button" className="ui-btn ui-btn--primary ui-btn--lg ui-btn--block" disabled={!selected || busy || !canAfford} onClick={payWithWallet}>
                  <AccountBalanceWalletRoundedIcon /> {busy ? "Booking..." : `Pay ${amount != null ? formatMoney(amount) : ""} from wallet`}
                </button>
                <p className="booking-note">
                  Wallet balance: {formatMoney(balance)}
                  {amount != null && !canAfford ? ". Not enough for this visit, pay by card instead." : ""}
                </p>
                <button type="button" className="ui-btn ui-btn--block" disabled={!selected || busy || amount == null} onClick={payByCard}>
                  <CreditCardRoundedIcon /> Pay by card
                </button>
                {!forMe && <p className="booking-note">You pay for this visit. It will appear in your family member's appointments.</p>}
              </div>
            </aside>
          </div>
        )}
      </Page>
    </>
  );
}
