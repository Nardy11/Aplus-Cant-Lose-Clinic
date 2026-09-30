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
          <span className="patient-kicker">EL7A2NY CLINIC · PATIENT PORTAL</span>
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

      <section className="patient-home-overview">
        <article className="patient-home-panel">
          <div className="patient-home-panel-heading">
            <div>
              <span>YOUR CARE HUB</span>
              <h2>Everything you need, in one place</h2>
              <p>Jump straight into the parts of your care you use most.</p>
            </div>
            <span className="patient-home-status-pill">Patient portal</span>
          </div>

          <div className="patient-home-action-list">
            <NavLink to="/MedHistList" className="patient-home-action">
              <MedicalInformationIcon />
              <strong>Medical documents</strong>
              <small>Upload, review and download your health files.</small>
            </NavLink>
            <NavLink to="/ListOfPrescriptions" className="patient-home-action">
              <VaccinesIcon />
              <strong>Prescriptions</strong>
              <small>Review medicines and prescription details.</small>
            </NavLink>
            <NavLink to="/viewfamilymembers" className="patient-home-action">
              <FamilyRestroomIcon />
              <strong>Family members</strong>
              <small>Manage the people connected to your care.</small>
            </NavLink>
          </div>
        </article>

        <article className="patient-home-panel patient-home-notification">
          <div className="patient-home-panel-heading">
            <div>
              <span>RECENT ACTIVITY</span>
              <h2>Clinic updates</h2>
              <p>Your latest notifications.</p>
            </div>
            <NotificationsIcon sx={{ color: "#1769ff", fontSize: 20 }} />
          </div>

          {notifications?.length ? (
            <div className="clinic-notification-item">
              <span className="clinic-notification-icon"><NotificationsIcon /></span>
              <div>
                <strong>{notifications[0].type || "Clinic update"}</strong>
                <p>{notifications[0].message}</p>
              </div>
            </div>
          ) : (
            <div className="patient-home-notification-empty">
              <NotificationsIcon />
              <div>
                <strong>You're all caught up</strong>
                <span>No new clinic notifications right now.</span>
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="patient-home-essentials">
        <div className="patient-home-essentials-heading">
          <div>
            <span>CARE ESSENTIALS</span>
            <h2>Keep your health journey organized</h2>
            <p>Everything important is one tap away, with the same calm interface throughout the clinic.</p>
          </div>
        </div>

        <div className="patient-home-essentials-grid">
          <NavLink to="/Appointments" className="patient-home-essential-card">
            <span className="patient-home-essential-icon"><CalendarMonthIcon /></span>
            <div>
              <strong>Plan your visits</strong>
              <small>Book, review and reschedule appointments from one place.</small>
            </div>
            <span className="patient-home-essential-arrow">→</span>
          </NavLink>

          <NavLink to="/MedHistList" className="patient-home-essential-card">
            <span className="patient-home-essential-icon"><MedicalInformationIcon /></span>
            <div>
              <strong>Keep records close</strong>
              <small>Review your medical documents without leaving the portal.</small>
            </div>
            <span className="patient-home-essential-arrow">→</span>
          </NavLink>

          <NavLink to="/ListOfPrescriptions" className="patient-home-essential-card">
            <span className="patient-home-essential-icon"><VaccinesIcon /></span>
            <div>
              <strong>Stay on top of medication</strong>
              <small>Review prescriptions, medicines and their current status.</small>
            </div>
            <span className="patient-home-essential-arrow">→</span>
          </NavLink>

          <NavLink to="/viewfamilymembers" className="patient-home-essential-card">
            <span className="patient-home-essential-icon"><FamilyRestroomIcon /></span>
            <div>
              <strong>Manage family care</strong>
              <small>Keep family members connected to the right care information.</small>
            </div>
            <span className="patient-home-essential-arrow">→</span>
          </NavLink>
        </div>
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
