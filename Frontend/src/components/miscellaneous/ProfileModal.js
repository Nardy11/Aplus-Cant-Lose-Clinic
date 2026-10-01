import React, { useState } from "react";
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
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";

const valueOrFallback = (value, fallback = "Not provided") =>
  value === undefined || value === null || String(value).trim() === ""
    ? fallback
    : value;

const ProfileModal = ({ user, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!children || !user) return null;

  const roleLabel =
    user.role === "doctor"
      ? "Doctor"
      : user.role === "patient"
        ? "Patient"
        : "Clinic member";

  const specialty = user.speciality || user.specialty;
  const phone = user.mobile || user.phone;
  const affiliation = user.affilation || user.affiliation;

  return (
    <>
      <button
        type="button"
        className="profile-modal-trigger"
        onClick={() => setIsOpen(true)}
        aria-label={`Open ${user.name || "member"} profile`}
      >
        {children}
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        fullWidth
        maxWidth="sm"
        className="clinic-modern-dialog profile-modal-dialog"
      >
        <DialogTitle className="clinic-dialog-title">
          <div>
            <span>PROFILE</span>
            <h2>{user.name || "Clinic member"}</h2>
          </div>
          <button
            type="button"
            className="clinic-dialog-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close profile"
          >
            <CloseRoundedIcon />
          </button>
        </DialogTitle>

        <DialogContent className="clinic-dialog-content profile-modal-content">
          <section className="profile-modal-hero">
            <Avatar
              alt={user.name || "Clinic member"}
              src={user.pic || undefined}
              className="profile-modal-avatar"
            >
              {(user.name || "C").charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <span>{roleLabel}</span>
              <h3>{user.name || "Clinic member"}</h3>
              <p>
                {specialty
                  ? valueOrFallback(specialty)
                  : "Private clinic conversation profile"}
              </p>
            </div>
          </section>

          <section className="profile-modal-details">
            <div className="profile-modal-detail">
              <EmailRoundedIcon />
              <div>
                <small>Email</small>
                <strong>{valueOrFallback(user.email)}</strong>
              </div>
            </div>

            <div className="profile-modal-detail">
              <PhoneRoundedIcon />
              <div>
                <small>Phone</small>
                <strong>{valueOrFallback(phone)}</strong>
              </div>
            </div>

            {specialty ? (
              <div className="profile-modal-detail">
                <LocalHospitalRoundedIcon />
                <div>
                  <small>Specialty</small>
                  <strong>{valueOrFallback(specialty)}</strong>
                </div>
              </div>
            ) : null}

            {affiliation ? (
              <div className="profile-modal-detail">
                <LocalHospitalRoundedIcon />
                <div>
                  <small>Hospital affiliation</small>
                  <strong>{valueOrFallback(affiliation)}</strong>
                </div>
              </div>
            ) : null}
          </section>
        </DialogContent>

        <DialogActions className="clinic-dialog-actions">
          <Button
            onClick={() => setIsOpen(false)}
            className="clinic-dialog-primary"
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileModal;
