import { addPatient } from "../../features/patientSlice";
import { useNavigate } from "react-router-dom";
import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import "../../styles.css";
import { SnackbarContext } from "../../App";
import { NavLink } from "react-router-dom";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import ContactEmergencyRoundedIcon from "@mui/icons-material/ContactEmergencyRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

function RegisterAsPatient() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const snackbarMessage = useContext(SnackbarContext);

  const handleSubmit = (event) => {
    event.preventDefault();

    const emergencyContact = {
      fullName: event.target.elements.fullname.value,
      mobile: event.target.elements.mobile.value,
      relation: event.target.elements.relation.value,
    };

    const sampleData = {
      name: event.target.elements.name.value,
      email: event.target.elements.email.value,
      username: event.target.elements.username.value,
      dBirth: event.target.elements.dBirth.value,
      gender: event.target.elements.gender.value,
      password: event.target.elements.password.value,
      emergencyContact,
      mobile: event.target.elements.pmobile.value,
    };

    const response = dispatch(addPatient(sampleData));
    response.then((responseData) => {
      if (responseData.payload === undefined) {
        snackbarMessage("Registration could not be completed.", "error");
      } else {
        snackbarMessage("You have successfully registered", "success");
        navigate("/login");
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
            Create your A+ Clinic patient account to book appointments,
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
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                    title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
                    placeholder="At least 8 characters"
                    required
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="gender">Gender</label>
                  <select id="gender" name="Gender" defaultValue="male">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="none">Prefer not to say</option>
                  </select>
                </div>
                <div className="auth-field">
                  <label htmlFor="dBirth">Date of birth</label>
                  <input type="date" id="dBirth" max="2001-10-15" required />
                </div>
                <div className="auth-field">
                  <label htmlFor="pmobile">Mobile number</label>
                  <input type="tel" id="pmobile" placeholder="+20 1X XXX XXXX" required />
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
                  <input type="tel" id="mobile" placeholder="+20 1X XXX XXXX" required />
                </div>
                <div className="auth-field auth-field-wide">
                  <label htmlFor="relation">Relationship</label>
                  <input type="text" id="relation" placeholder="e.g. Parent, spouse, sibling" required />
                </div>
              </div>
            </div>

            <div className="auth-form-footer">
              <button type="submit" className="auth-submit">
                Create patient account
                <ArrowForwardRoundedIcon />
              </button>
              <span>
                Already have an account? <NavLink to="/login">Sign in</NavLink>
              </span>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default RegisterAsPatient;