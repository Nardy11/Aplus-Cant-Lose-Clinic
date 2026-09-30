import React, { useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, useLocation, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Typography,
  Badge,
  IconButton,
  Container,
  Snackbar,
} from "@mui/material";
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
import MuiAlert from "@mui/material/Alert";
import DoctorProfileDialog from "./doctor/DoctorProfileDialog";

const patientItems = [
  { to: "/viewfamilymembers", label: "Family", sub: "Members", icon: FamilyRestroomRoundedIcon },
  { to: "/Appointments", label: "My", sub: "Appointments", icon: CalendarMonthRoundedIcon },
  { to: "/HealthRecords", label: "Health records", sub: "Medical history", icon: MedicalInformationRoundedIcon },
  { to: "/ListOfPrescriptions", label: "My", sub: "Prescriptions", icon: VaccinesRoundedIcon },
  { to: "/ViewHealthPackage", label: "Health", sub: "Packages", icon: LocalHospitalRoundedIcon },
];

const doctorItems = [
  { to: "/PatientsList", label: "My", sub: "Patients", icon: SickRoundedIcon },
  { to: "/DocPatients", label: "Appointments", sub: "", icon: PendingActionsRoundedIcon },
  { to: "/FollowUpRequests", label: "Follow ups", sub: "", icon: GroupRoundedIcon },
  { to: "/Prescription", label: "Prescriptions", sub: "", icon: PendingActionsRoundedIcon },
];

export default function NavbarGen() {
  const role = useSelector((state) => state.user.role);
  const location = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!role || (role !== "patient" && role !== "doctor")) return null;

  const items = role === "patient" ? patientItems : doctorItems;

  return (
    <div className="clinic-nav-shell">
      <AppBar position="static" className="clinic-main-nav" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar disableGutters className="clinic-nav-toolbar">
            <Link to="/Home" className="clinic-home-button" aria-label="Home">
              <HomeRoundedIcon />
            </Link>

            <Box className="clinic-nav-items">
              {items.map(({ to, label, sub, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <NavLink key={to} to={to} className="clinic-nav-link">
                    <Button className={`clinic-nav-item ${active ? "active" : ""}`}>
                      <Icon className="clinic-nav-icon" />
                      <span className="clinic-nav-label">
                        <strong>{label}</strong>
                        {sub && <small>{sub}</small>}
                      </span>
                    </Button>
                  </NavLink>
                );
              })}

              {role === "doctor" && (
                <Button
                  className="clinic-nav-item"
                  onClick={() => setDialogOpen(true)}
                >
                  <Badge badgeContent={1} color="error">
                    <BadgeRoundedIcon className="clinic-nav-icon" />
                  </Badge>
                  <span className="clinic-nav-label">
                    <strong>Job</strong>
                    <small>Credentials</small>
                  </span>
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <DoctorProfileDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
      />

      <Snackbar
        open={false}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MuiAlert elevation={3} variant="filled" severity="info">
          Appointment is rescheduled!!
        </MuiAlert>
      </Snackbar>
    </div>
  );
}
