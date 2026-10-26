import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { API_URL } from "../Consts";
import { VisitCard } from "../design/ui";
import { formatMoney } from "../design/format";

const STEPS = [
  { icon: SearchRoundedIcon, title: "Choose a doctor", text: "Filter by specialty and see each doctor's background and session price." },
  { icon: EventAvailableRoundedIcon, title: "Pick a time", text: "Open slots are listed by day. Pay from your clinic wallet or by card." },
  { icon: VideocamRoundedIcon, title: "Meet by video", text: "Join the call from your browser. Chat with your doctor before and after." },
  { icon: MedicationRoundedIcon, title: "Get your prescription", text: "Prescriptions and notes land in your records, ready to fill." },
];

const DOCTOR_POINTS = [
  "Your whole schedule, with open slots you set yourself",
  "Follow-up requests from your patients, accepted in one click",
  "Prescriptions and health records written in the portal",
  "Session payments credited to your clinic wallet",
];

// Tomorrow at 11:00, for the sample visit card in the hero.
const sampleStart = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(11, 0, 0, 0);
  return d;
};

export default function Landing() {
  const { logged, role } = useSelector((state) => state.user);
  const signedIn = logged && (role === "patient" || role === "doctor");
  const [plans, setPlans] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/admin/viewHealthP`)
      .then((r) => setPlans(Array.isArray(r.data?.HealthPack) ? r.data.HealthPack : []))
      .catch(() => setPlans([]));
  }, []);

  return (
    <main className="land">
      <section className="land-hero">
        <div className="land-hero-copy">
          <h1>See a doctor from home, today.</h1>
          <p>Book a video visit with a licensed doctor, then keep every prescription and record in one place.</p>
          <div className="land-hero-actions">
            <Link to={signedIn ? "/DoctorsList" : "/RegisterAsPatient"} className="ui-btn ui-btn--primary ui-btn--lg">
              Book a visit
            </Link>
            <Link to="/RegisterAsDoctor" className="ui-btn ui-btn--lg">I'm a doctor</Link>
          </div>
        </div>
        <div className="land-hero-visual">
          <img src="/doctors.jpg" alt="A doctor smiling, with her colleagues behind her" />
          <div className="land-hero-card">
            <VisitCard
              feature
              start={sampleStart()}
              title="Video visit with your cardiologist"
              subtitle="30 minutes, from your phone or laptop"
              status="upcoming"
            />
          </div>
        </div>
      </section>

      <section className="land-section">
        <h2 className="land-h2">How a visit works</h2>
        <ol className="land-steps">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <span className="ui-row-icon"><Icon /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="land-section">
        <div className="land-doctors">
          <div>
            <h2 className="land-h2">Your practice, online</h2>
            <p className="ui-lead">Doctors on El7a2ny see patients by video and run their practice from one workspace.</p>
            <Link to="/RegisterAsDoctor" className="ui-btn ui-btn--lg land-doctor-cta">Apply as a doctor</Link>
          </div>
          <ul>
            {DOCTOR_POINTS.map((point) => (
              <li key={point}><CheckRoundedIcon />{point}</li>
            ))}
          </ul>
        </div>
      </section>

      {plans && plans.length > 0 && (
        <section className="land-section">
          <h2 className="land-h2">Save on every visit with a plan</h2>
          <p className="ui-lead">Plans cut the price of doctor sessions and medicine, for you and your family.</p>
          <div className="ui-grid ui-grid-3" style={{ marginTop: 22 }}>
            {plans.map((plan) => (
              <article className="ui-plan" key={plan._id}>
                <div className="ui-plan-name"><h3>{plan.type}</h3></div>
                <div className="ui-plan-price">{formatMoney(plan.rate)}<span>/ year</span></div>
                <ul>
                  <li><strong>{plan.doctorDisc}%</strong> off doctor sessions</li>
                  <li><strong>{plan.medicineDisc}%</strong> off medicine</li>
                  <li><strong>{plan.familyDisc}%</strong> off family plans</li>
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="land-footer">
        <span className="app-brand">
          <img src="/brand-mark.png" alt="" />
          <span><strong>El7a2ny</strong><small>Virtual clinic</small></span>
        </span>
        <nav aria-label="Footer">
          <Link to="/Login">Sign in</Link>
          <Link to="/RegisterAs">Create account</Link>
        </nav>
      </footer>
    </main>
  );
}
