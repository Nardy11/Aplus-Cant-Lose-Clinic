import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, useLocation, Link } from "react-router-dom";
import { Box, Button, Badge, Tooltip } from "@mui/material";
import axios from "axios";
import { API_URL } from "../Consts";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import FamilyRestroomRoundedIcon from "@mui/icons-material/FamilyRestroomRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import MedicalInformationRoundedIcon from "@mui/icons-material/MedicalInformationRounded";
import VaccinesRoundedIcon from "@mui/icons-material/VaccinesRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import SickRoundedIcon from "@mui/icons-material/SickRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import DoctorProfileDialog from "./doctor/DoctorProfileDialog";

const patientItems = [
  { to: "/viewfamilymembers", label: "Family", sub: "Members", icon: FamilyRestroomRoundedIcon },
  { to: "/Appointments", label: "Appointments", sub: "My visits", icon: CalendarMonthRoundedIcon },
  { to: "/HealthRecords", label: "Health records", sub: "Medical history", icon: MedicalInformationRoundedIcon },
  { to: "/ListOfPrescriptions", label: "Prescriptions", sub: "My medicines", icon: VaccinesRoundedIcon },
  { to: "/ViewHealthPackage", label: "Health packages", sub: "Plans & coverage", icon: LocalHospitalRoundedIcon },
];

const doctorItems = [
  { to: "/PatientsList", label: "Patients", sub: "My patients", icon: SickRoundedIcon },
  { to: "/DocPatients", label: "Appointments", sub: "My schedule", icon: PendingActionsRoundedIcon },
  { to: "/FollowUpRequests", label: "Follow ups", sub: "Requests", icon: GroupRoundedIcon },
  { to: "/Prescription", label: "Prescriptions", sub: "Patient care", icon: PendingActionsRoundedIcon },
];

export default function NavbarGen() {
  const { role, id } = useSelector((state) => state.user);
  const location = useLocation();
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

  if (!role || (role !== "patient" && role !== "doctor")) return null;

  const items = role === "patient" ? patientItems : doctorItems;

  return (
    <>
      <nav className="clinic-primary-nav" aria-label="Primary navigation">
        <Tooltip title="Home" placement="bottom">
          <Link
            to="/Home"
            className={`clinic-home-button ${location.pathname === "/Home" ? "active" : ""}`}
            aria-label="Home"
          >
            <HomeRoundedIcon />
          </Link>
        </Tooltip>

        <Box className="clinic-nav-items">
          {items.map(({ to, label, sub, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <NavLink key={to} to={to} className="clinic-nav-link">
                <Button className={`clinic-nav-item ${active ? "active" : ""}`}>
                  <Icon className="clinic-nav-icon" />
                  <span className="clinic-nav-label">
                    <strong>{label}</strong>
                    <small>{sub}</small>
                  </span>
                </Button>
              </NavLink>
            );
          })}

          {role === "doctor" && (
            <Button className="clinic-nav-item" onClick={() => setDialogOpen(true)}>
              <Badge badgeContent={contractPending ? 1 : 0} color="primary" invisible={!contractPending} sx={{ "& .MuiBadge-badge": { minWidth: 15, height: 15, borderRadius: "999px", fontSize: 8, fontWeight: 800, border: "2px solid #fff", boxShadow: "0 2px 6px rgba(23,105,255,.18)" } }}>
                <BadgeRoundedIcon className="clinic-nav-icon" />
              </Badge>
              <span className="clinic-nav-label">
                <strong>Credentials</strong>
                <small>Job documents</small>
              </span>
            </Button>
          )}
        </Box>
      </nav>

      <DoctorProfileDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
      />
    </>
  );
}
