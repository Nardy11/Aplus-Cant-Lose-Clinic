import React from "react";
import { Link } from "react-router-dom";

export default function Buttons() {
  return <div className="doctor-quick-links">
    <Link className="doctor-quick-link" to="/Profile">My profile</Link>
    <Link className="doctor-quick-link" to="/DocPatients">My appointments</Link>
    <Link className="doctor-quick-link" to="/PatientsList">My patients</Link>
  </div>;
}
