import { addPatient } from "../../features/patientSlice";
import { useNavigate } from "react-router-dom";
import React, { useContext, useState } from "react";
import { useDispatch } from "react-redux";
import "../../styles.css";
import { SnackbarContext } from "../../App";
import { NavLink } from "react-router-dom";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import ContactEmergencyRoundedIcon from "@mui/icons-material/ContactEmergencyRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

// The server only accepts patients aged 18 or over; the form used to freeze this at 2001-10-15.
const latestBirth = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
};
// Mobile numbers are stored as numbers: keep digits only ("+20 10 1234 5678" -> 201012345678).
const digits = (value) => String(value).replace(/\D/g, "");

function RegisterAsPatient() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const snackbarMessage = useContext(SnackbarContext);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const emergencyContact = {
      fullName: event.target.elements.fullname.value.trim(),
      mobile: digits(event.target.elements.mobile.value),
      relation: event.target.elements.relation.value.trim(),
    };

    const sampleData = {
      name: event.target.elements.name.value.trim(),
      email: event.target.elements.email.value.trim(),
      username: event.target.elements.username.value.trim(),
      dBirth: event.target.elements.dBirth.value,
      gender: event.target.elements.gender.value,
      password: event.target.elements.password.value,
      emergencyContact,
      mobile: digits(event.target.elements.pmobile.value),
    };

    setSending(true);
    dispatch(addPatient(sampleData)).then((responseData) => {
      setSending(false);
      if (responseData.meta.requestStatus !== "fulfilled") {
        setError(responseData.payload || "We couldn't create your account. Check your details and try again.");
        event.target.scrollIntoView?.({ behavior: "smooth", block: "start" });
      } else {
        snackbarMessage("Account created. Sign in to continue.", "success");
        navigate("/Login");
      }
    });
  };

  return (
    <main className="auth-page">
      <section className="auth-layout">
        <aside className="auth-intro auth-intro-patient">
          <div className="auth-brand-mark"><PersonAddAltRoundedIcon /></div>
          <span className="auth-eyebrow">PATIENT ACCOUNT</span>
          <h1>Start your care journey.</h1>
          <p>
            Create your El7a2ny Clinic patient account to book appointments,
            manage prescriptions, and keep your healthcare information in one place.
          </p>
          <div className="auth-trust">
            <span>01</span>
            <div><strong>Your details</strong><small>Private account information</small></div>
          </div>
          <div className="auth-trust">
            <span>02</span>
            <div><strong>Emergency contact</strong><small>Available when it matters</small></div>
          </div>
          <div className="auth-trust">
            <span>03</span>
            <div><strong>Ready to use</strong><small>Sign in after registration</small></div>
          </div>
        </aside>

        <div className="auth-card auth-register-card">
          <div className="auth-card-header">
            <div>
              <span className="auth-eyebrow">CREATE ACCOUNT</span>
              <h2>Patient registration</h2>
              <p>Enter your information to create your account.</p>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-section">
              <div className="auth-section-heading">
                <span>01</span>
                <div><strong>Personal information</strong><small>Your basic account details</small></div>
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
                  <small className="auth-hint">You must be 18 or older to create an account.</small>
                </div>
                <div className="auth-field">
                  <label htmlFor="pmobile">Mobile number</label>
                  <input type="tel" id="pmobile" inputMode="tel" placeholder="01012345678" pattern="\+?[0-9 ]{10,15}" title="Digits only, for example 01012345678" required />
                </div>
              </div>
            </div>

            <div className="auth-section">
              <div className="auth-section-heading">
                <span className="auth-section-icon"><ContactEmergencyRoundedIcon /></span>
                <div><strong>Emergency contact</strong><small>Someone we can contact if needed</small></div>
              </div>

              <div className="auth-grid">
                <div className="auth-field">
                  <label htmlFor="fullname">Full name</label>
                  <input type="text" id="fullname" placeholder="Contact's full name" required />
                </div>
                <div className="auth-field">
                  <label htmlFor="mobile">Mobile number</label>
                  <input type="tel" id="mobile" inputMode="tel" placeholder="01012345678" pattern="\+?[0-9 ]{10,15}" title="Digits only, for example 01012345678" required />
                </div>
                <div className="auth-field auth-field-wide">
                  <label htmlFor="relation">Relationship</label>
                  <input type="text" id="relation" placeholder="e.g. Parent, spouse, sibling" required />
                </div>
              </div>
            </div>

            {error && <div className="ui-alert" role="alert">{error}</div>}

            <div className="auth-form-footer">
              <button type="submit" className="auth-submit" disabled={sending}>
                {sending ? "Creating account..." : "Create patient account"}
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

export default RegisterAsPatient;