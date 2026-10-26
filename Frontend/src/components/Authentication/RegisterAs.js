import React from "react";
import { Link } from "react-router-dom";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

// Account type chooser. Was a dialog the /RegisterAs route never opened.
const RegisterOptions = () => (
  <main className="ui-auth-shell">
    <div className="ui-auth-card ui-auth-card--wide">
      <h1 className="ui-title">Create your account</h1>
      <p className="ui-lead">Choose how you will use El7a2ny Clinic. You can't switch account type later.</p>

      <div className="choice-grid">
        <Link to="/RegisterAsPatient" className="choice choice--patient">
          <span className="choice-icon"><PersonRoundedIcon /></span>
          <strong>I'm a patient</strong>
          <span>Book video visits, keep prescriptions and records, and add your family.</span>
          <em>Sign up as a patient <ArrowForwardRoundedIcon /></em>
        </Link>
        <Link to="/RegisterAsDoctor" className="choice choice--doctor">
          <span className="choice-icon"><MedicalServicesRoundedIcon /></span>
          <strong>I'm a doctor</strong>
          <span>Run your schedule, see patients online and write prescriptions. We review every application.</span>
          <em>Apply as a doctor <ArrowForwardRoundedIcon /></em>
        </Link>
      </div>

      <p className="ui-auth-foot">
        Already have an account? <Link to="/Login">Sign in</Link>
      </p>
    </div>
  </main>
);

export default RegisterOptions;
