import * as React from 'react';
import { Paper, Tooltip, Button, Avatar, Container, Menu, Typography, IconButton, Toolbar, Box, AppBar } from '@mui/material';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import WalletIcon from '@mui/icons-material/Wallet';
import { NavLink } from 'react-router-dom';
import PermPhoneMsgIcon from '@mui/icons-material/PermPhoneMsg';
import { WalletDialog } from '../WalletDialog.js';
import {useState} from 'react'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { getNotifications } from '../../features/patientSlice.js';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';


function Home() {
  const patientId = useSelector((state) => state.user.id);
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.patient.notifications);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (patientId) dispatch(getNotifications(patientId));
  }, [dispatch, patientId]);

  return (
    <main className="patient-home">
      <section className="patient-hero">
        <div className="patient-hero-copy">
          <span className="patient-kicker">A+ CLINIC · PATIENT PORTAL</span>
          <h1>Healthcare that stays<br />with you.</h1>
          <p>
            Find trusted doctors, manage appointments, and keep your
            healthcare journey organized in one simple place.
          </p>
          <div className="patient-hero-actions">
            <NavLink to="/DoctorsList" className="patient-primary-action">
              Find a doctor
            </NavLink>
            <NavLink to="/Appointments" className="patient-secondary-action">
              View appointments
            </NavLink>
          </div>
        </div>

        <div className="patient-hero-visual">
          <div className="patient-hero-image-wrap">
            <img src="/doctors.jpg" alt="Healthcare professionals" />
          </div>
          <div className="patient-hero-badge">
            <span className="patient-hero-badge-dot" />
            <div>
              <strong>Care, simplified</strong>
              <small>Appointments · Records · Prescriptions</small>
            </div>
          </div>
        </div>
      </section>

      <section className="patient-quick-grid">
        <NavLink to="/DoctorsList" className="patient-quick-card">
          <span className="patient-quick-number">01</span>
          <div>
            <strong>Find doctors</strong>
            <small>Browse specialties and profiles</small>
          </div>
          <span className="patient-quick-arrow">→</span>
        </NavLink>
        <NavLink to="/Appointments" className="patient-quick-card">
          <span className="patient-quick-number">02</span>
          <div>
            <strong>Appointments</strong>
            <small>Manage your upcoming visits</small>
          </div>
          <span className="patient-quick-arrow">→</span>
        </NavLink>
        <NavLink to="/HealthRecords" className="patient-quick-card">
          <span className="patient-quick-number">03</span>
          <div>
            <strong>Health records</strong>
            <small>Keep your medical information close</small>
          </div>
          <span className="patient-quick-arrow">→</span>
        </NavLink>
      </section>

      <Snackbar open={false} anchorOrigin={{ vertical: "top", horizontal: "left" }}>
        <MuiAlert elevation={3} variant="filled" severity="info">
          Appointment is rescheduled!!
        </MuiAlert>
      </Snackbar>
    </main>
  );
}
export default Home;
