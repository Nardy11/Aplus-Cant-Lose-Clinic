import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../Consts";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import FolderSharedRoundedIcon from "@mui/icons-material/FolderSharedRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HealthAndSafetyRoundedIcon from "@mui/icons-material/HealthAndSafetyRounded";
import EventRepeatRoundedIcon from "@mui/icons-material/EventRepeatRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import DoctorProfileDialog from "./doctor/DoctorProfileDialog";

export const patientNav = [
  { to: "/Home", label: "Home", icon: HomeRoundedIcon, tab: true },
  { to: "/DoctorsList", label: "Find a doctor", tabLabel: "Doctors", icon: SearchRoundedIcon, tab: true },
  { to: "/Appointments", label: "Appointments", tabLabel: "Visits", icon: CalendarMonthRoundedIcon, tab: true },
  { to: "/ListOfPrescriptions", label: "Prescriptions", tabLabel: "Medicines", icon: MedicationRoundedIcon, tab: true },
  { to: "/HealthRecords", label: "Health records", icon: FolderSharedRoundedIcon },
  { to: "/viewfamilymembers", label: "Family", icon: GroupsRoundedIcon },
  { to: "/ViewHealthPackage", label: "Plans", icon: HealthAndSafetyRoundedIcon },
];

export const doctorNav = [
  { to: "/Home", label: "Today", icon: HomeRoundedIcon, tab: true },
  { to: "/DocPatients", label: "Schedule", icon: CalendarMonthRoundedIcon, tab: true },
  { to: "/PatientsList", label: "Patients", icon: GroupsRoundedIcon, tab: true },
  { to: "/FollowUpRequests", label: "Follow-ups", icon: EventRepeatRoundedIcon, tab: true },
  { to: "/Prescription", label: "Prescriptions", icon: MedicationRoundedIcon },
];

export function MobileTabBar() {
  const role = useSelector((state) => state.user.role);

  useEffect(() => {
    document.body.classList.add("has-tabbar");
    return () => document.body.classList.remove("has-tabbar");
  }, []);

  if (role !== "patient" && role !== "doctor") return null;
  const items = (role === "doctor" ? doctorNav : patientNav).filter((i) => i.tab);

  // Portalled to <body>: the header's backdrop-filter would otherwise trap position:fixed.
  return createPortal(
    <nav className="ui-tabbar" aria-label="Main">
      {items.map(({ to, label, tabLabel, icon: Icon }) => (
        <NavLink key={to} to={to}>
          <Icon />
          {tabLabel || label}
        </NavLink>
      ))}
      <NavLink to="/chats">
        <ChatBubbleOutlineRoundedIcon />
        Chats
      </NavLink>
    </nav>,
    document.body
  );
}

export default function NavbarGen() {
  const { role, id } = useSelector((state) => state.user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contractPending, setContractPending] = useState(false);

  useEffect(() => {
    if (role !== "doctor" || !id) {
      setContractPending(false);
      return;
    }
    let active = true;
    axios.get(`${API_URL}/doctor/getContract/${id}`)
      .then((response) => {
        if (!active) return;
        const contract = response.data?.contract;
        setContractPending(Boolean(contract?.file && !contract?.accepted));
      })
      .catch(() => {
        if (active) setContractPending(false);
      });
    return () => { active = false; };
  }, [id, role]);

  if (role !== "patient" && role !== "doctor") return null;
  const items = role === "patient" ? patientNav : doctorNav;

  return (
    <>
      <nav className="app-nav" aria-label="Primary">
        {items.map(({ to, label }) => (
          <NavLink key={to} to={to} className="app-nav-link">
            {label}
          </NavLink>
        ))}
        {role === "doctor" && (
          <button type="button" className="app-nav-link" onClick={() => setDialogOpen(true)}>
            Credentials
            {contractPending && <span className="app-nav-flag" aria-label="Contract waiting for your review" />}
          </button>
        )}
      </nav>

      {role === "doctor" && (
        <DoctorProfileDialog
          open={dialogOpen}
          handleClose={() => setDialogOpen(false)}
          onContractAccepted={() => setContractPending(false)}
        />
      )}
    </>
  );
}
