import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DocProfile from "./components/doctor/DoctorProfileDialog";
import PatientProfile from "./components/patient/PatientProfile";

export default function ProfileDirect() {
  const role = useSelector((state) => state.user.role);
  const navigate = useNavigate();

  if (role === "patient") return <PatientProfile />;
  if (role === "doctor") return <DocProfile open handleClose={() => navigate("/Home")} />;
  return null;
}
