import React, { useContext, useState } from "react";
import "../../styles.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerDoctor } from "../../features/doctorSlice";
import { NavLink } from "react-router-dom";
import { SnackbarContext } from "../../App";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

// Latest allowed birth date: doctors are at least 24 (the old form froze this at 2002-10-15).
const latestBirth = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 24);
  return d.toISOString().slice(0, 10);
};

function RegisterAsDoctor() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const snackbarMessage = useContext(SnackbarContext);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    const form = event.target;

    const sampleData = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      username: form.elements.username.value.trim(),
      dBirth: form.elements.dBirth.value,
      gender: form.elements.gender.value,
      password: form.elements.password.value,
      rate: form.elements.rate.value,
      affilation: form.elements.affilation.value.trim(),
      background: form.elements.background.value.trim(),
      speciality: form.elements.speciality.value.trim(),
    };

    setSending(true);
    dispatch(registerDoctor(sampleData)).then((responseData) => {
      setSending(false);
      if (responseData.meta.requestStatus !== "fulfilled") {
        setError(responseData.payload || "We couldn't submit your application. Check your details and try again.");
        form.scrollIntoView?.({ behavior: "smooth", block: "start" });
      } else {
        snackbarMessage("Details saved. Now upload your documents.", "success");
        navigate("/upload");
      }
    });
  };

  return (
    <main className="auth-page is-doctor-accent">
      <section className="auth-layout">
        <aside className="auth-intro auth-intro-doctor">
          <div className="auth-brand-mark"><MedicalServicesRoundedIcon /></div>
          <span className="auth-eyebrow">DOCTOR ACCOUNT</span>
          <h1>Bring your practice online.</h1>
          <p>
            Join El7a2ny Clinic to manage appointments, patient records,
            prescriptions, and your professional profile from one workspace.
          </p>
          <div className="auth-trust">
            <span>01</span>
            <div><strong>Professional profile</strong><small>Speciality and credentials</small></div>
          </div>
          <div className="auth-trust">
            <span>02</span>
            <div><strong>Verification</strong><small>Documents are reviewed</small></div>
          </div>
          <div className="auth-trust">
            <span>03</span>
            <div><strong>Clinic workspace</strong><small>Manage your patients</small></div>
          </div>
        </aside>

        <div className="auth-card auth-register-card">
          <div className="auth-card-header">
            <div>
              <span className="auth-eyebrow">CREATE ACCOUNT</span>
              <h2>Doctor registration</h2>
              <p>Tell us about yourself and your professional background.</p>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-section">
              <div className="auth-section-heading">
                <span>01</span>
                <div><strong>Account details</strong><small>Your El7a2ny Clinic login information</small></div>
              </div>

              <div className="auth-grid">
                <div className="auth-field">
                  <label htmlFor="username">Username</label>
                  <input type="text" id="username" placeholder="Choose a username" required />
                </div>
                <div className="auth-field">
                  <label htmlFor="name">Full name</label>
                  <input type="text" id="name" placeholder="Your full name" required />
                </div>
                <div className="auth-field auth-field-wide">
                  <label htmlFor="email">Email address</label>
                  <input type="email" id="email" placeholder="you@example.com" required />
                </div>
                <div className="auth-field">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}"
                    title="At least 8 characters, with a number, a symbol, an uppercase letter and a lowercase letter"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                  />
                  <small className="auth-hint">8 or more characters, with an uppercase letter, a lowercase letter, a number and a symbol such as ! or @.</small>
                </div>
                <div className="auth-field">
                  <label htmlFor="gender">Gender</label>
                  <select id="gender" name="Gender" defaultValue="male" className="clinic-native-select">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="none">Prefer not to say</option>
                  </select>
                </div>
                <div className="auth-field">
                  <label htmlFor="dBirth">Date of birth</label>
                  <input type="date" id="dBirth" max={latestBirth()} required />
                </div>
              </div>
            </div>

            <div className="auth-section">
              <div className="auth-section-heading">
                <span>02</span>
                <div><strong>Professional profile</strong><small>Information patients will see</small></div>
              </div>

              <div className="auth-grid">
                <div className="auth-field">
                  <label htmlFor="speciality">Speciality</label>
                  <input type="text" id="speciality" placeholder="e.g. Cardiology" required />
                </div>
                <div className="auth-field">
                  <label htmlFor="rate">Hourly rate</label>
                  <div className="auth-input-prefix"><span>EGP</span><input type="number" id="rate" min="0" step="1" placeholder="500" required /></div>
                </div>
                <div className="auth-field auth-field-wide">
                  <label htmlFor="affilation">Hospital / affiliation</label>
                  <input type="text" id="affilation" placeholder="Hospital or clinic" required />
                </div>
                <div className="auth-field auth-field-wide">
                  <label htmlFor="background">Educational background</label>
                  <input type="text" id="background" placeholder="Degree, university, certifications..." required />
                </div>
              </div>
            </div>

            <div className="auth-note">
              <BadgeRoundedIcon />
              <div><strong>Verification required</strong><span>After registration, upload your professional documents for review.</span></div>
            </div>

            {error && <div className="ui-alert" role="alert">{error}</div>}

            <div className="auth-form-footer">
              <button type="submit" className="auth-submit" disabled={sending}>
                {sending ? "Saving..." : "Continue to documents"}
                <ArrowForwardRoundedIcon />
              </button>
              <span>
                Already have an account? <NavLink to="/Login">Sign in</NavLink>
              </span>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default RegisterAsDoctor;