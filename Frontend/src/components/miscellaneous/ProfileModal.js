import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import axios from "axios";
import { API_URL } from "../../Consts";

const valueOrFallback = (value, fallback = "Not provided") =>
  value === undefined || value === null || String(value).trim() === ""
    ? fallback
    : value;

const ProfileModal = ({ user, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (!isOpen || !user?.username || user?.role !== "doctor") return;

    let active = true;

    const loadDoctorProfile = async () => {
      try {
        setLoadingProfile(true);
        const { data } = await axios.get(
          `${API_URL}/doctor/publicProfile/${encodeURIComponent(user.username)}`
        );
        if (active) setDoctorProfile(data?.doctor || null);
      } catch (error) {
        console.error("Unable to load doctor profile:", error);
        if (active) setDoctorProfile(null);
      } finally {
        if (active) setLoadingProfile(false);
      }
    };

    loadDoctorProfile();

    return () => {
      active = false;
    };
  }, [isOpen, user?.username, user?.role]);

  if (!children || !user) return null;

  const profile = doctorProfile || user;
  const specialty = profile.speciality || profile.specialty;
  const affiliation = profile.affilation || profile.affiliation;
  const rate = profile.rate;

  const close = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        className="profile-modal-trigger"
        onClick={() => setIsOpen(true)}
        aria-label={`Open ${profile.name || "member"} profile`}
      >
        {children}
      </button>

      <Dialog
        open={isOpen}
        onClose={close}
        fullWidth
        maxWidth="sm"
        className="clinic-modern-dialog profile-modal-dialog"
      >
        <DialogTitle className="clinic-dialog-title">
          <div>
            <span>DOCTOR PROFILE</span>
            <h2>{profile.name || "Doctor"}</h2>
          </div>
          <button
            type="button"
            className="clinic-dialog-close"
            onClick={close}
            aria-label="Close doctor profile"
          >
            <CloseRoundedIcon />
          </button>
        </DialogTitle>

        <DialogContent className="clinic-dialog-content profile-modal-content">
          <section className="profile-modal-hero">
            <Avatar
              alt={profile.name || "Doctor"}
              src={profile.pic || undefined}
              className="profile-modal-avatar"
            >
              {(profile.name || "D").charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <span>DOCTOR</span>
              <h3>{profile.name || "Doctor"}</h3>
              <p>{specialty || "Medical specialist"}</p>
            </div>
          </section>

          {loadingProfile ? (
            <div className="profile-modal-loading">Loading doctor profile…</div>
          ) : (
            <section className="profile-modal-details">
              <div className="profile-modal-detail">
                <EmailRoundedIcon />
                <div>
                  <small>Email</small>
                  <strong>{valueOrFallback(profile.email)}</strong>
                </div>
              </div>

              <div className="profile-modal-detail">
                <LocalHospitalRoundedIcon />
                <div>
                  <small>Specialty</small>
                  <strong>{valueOrFallback(specialty)}</strong>
                </div>
              </div>

              <div className="profile-modal-detail">
                <PaymentsRoundedIcon />
                <div>
                  <small>Hourly rate</small>
                  <strong>
                    {rate === undefined || rate === null || rate === ""
                      ? "Not provided"
                      : `${rate} / hour`}
                  </strong>
                </div>
              </div>

              <div className="profile-modal-detail">
                <LocalHospitalRoundedIcon />
                <div>
                  <small>Hospital affiliation</small>
                  <strong>{valueOrFallback(affiliation)}</strong>
                </div>
              </div>
            </section>
          )}
        </DialogContent>

        <DialogActions className="clinic-dialog-actions">
          <Button
            onClick={close}
            className="clinic-dialog-primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileModal;
