import React from "react";
import { Link } from "react-router-dom";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

export default function ButtonBar() {
  return <div className="doctor-page-header" style={{ marginBottom: 0 }}>
    <div className="doctor-page-header-copy"><span>PATIENT CARE</span><h1>Patients</h1><p>Review and manage the patients connected to your clinic.</p></div>
    <Link to="/Home" className="doctor-home-button" aria-label="Home"><HomeRoundedIcon /></Link>
  </div>;
}
