import React, { useContext } from "react";
import "../../styles.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerDoctor } from "../../features/doctorSlice";
import { NavLink } from "react-router-dom";
import { SnackbarContext } from "../../App";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

function RegisterAsDoctor() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const snackbarMessage = useContext(SnackbarContext);

  const handleSubmit = (event) => {
    event.preventDefault();

    const sampleData = {
      name: event.target.elements.name.value,
      email: event.target.elements.email.value,
      username: event.target.elements.username.value,
      dBirth: event.target.elements.dBirth.value,
      gender: event.target.elements.gender.value,
      password: event.target.elements.password.value,
      rate: event.target.elements.rate.value,
      affilation: event.target.elements.affilation.value,
      background: event.target.elements.background.value,
      speciality: event.target.elements.speciality.value,
    };

    const response = dispatch(registerDoctor(sampleData));
    response.then((responseData) => {
      if (responseData.payload === undefined) {
        snackbarMessage("Registration could not be completed.", "error");
      } else {
        snackbarMessage(
          "Registration submitted. Upload your documents to continue.",
          "success"
        );
        navigate("/upload");
      }
    });
  };

  return (
    <main className="auth-page">
      <section className="auth-layout">
        <aside className="auth-intro auth-intro-doctor">
          <div className="auth-brand-mark"><MedicalServicesRoundedIcon /></div>
          <span className="auth-eyebrow">DOCTOR ACCOUNT</span>
          <h1>Bring your practice online.</h1>
          <p>
            Join A+ Clinic to manage appointments, patient records,
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
                <div><strong>Account details</strong><small>Your A+ Clinic login information</small></div>
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
                  <input type="date" id="dBirth" max="2002-10-15" required />
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
                  <div className="auth-input-prefix"><span>$</span><input type="number" id="rate" min="0" step="0.01" placeholder="10.00" required /></div>
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

            <div className="auth-form-footer">
              <button type="submit" className="auth-submit">
                Continue registration
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

export default RegisterAsDoctor;