import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DoctorProfilePage from "./components/doctor/DoctorProfilePage";
import AccountAvatar from "./components/Authentication/AccountAvatar";
import PatientProfile from "./components/patient/PatientProfile";

export default function ProfileDirect() {
  const role = useSelector((state) => state.user.role);
  const navigate = useNavigate();

  if (role === "patient") return <PatientProfile />;
  if (role === "doctor") return <DoctorProfilePage />;
  return null;
}
