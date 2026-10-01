import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import axios from "axios";
import { API_URL } from "../../Consts";

const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const age = Math.floor(
    (Date.now() - new Date(birthDate).getTime()) /
      (365.2425 * 24 * 60 * 60 * 1000)
  );
  return Number.isFinite(age) && age >= 0 ? age : null;
};

const displayValue = (value) =>
  value === undefined || value === null || value === "" ? "Not provided" : value;

const ProfileModal = ({ user, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen || !user?.username) return;

    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      try {
        if (user.role === "doctor") {
          const response = await axios.get(`${API_URL}/patient/getAlldoctors`);
          const doctors = Array.isArray(response.data)
            ? response.data
            : response.data?.doctors || [];
          const match = doctors.find(
            (doctor) =>
              doctor.username === user.username ||
              doctor.email === user.email
          );
          if (active) setProfile({ ...user, ...(match || {}) });
        } else if (user.role === "patient") {
          const idResponse = await axios.get(
            `${API_URL}/patient/patientID/${encodeURIComponent(user.username)}`
          );
          const patientId = idResponse.data?._id || idResponse.data?.id;
          if (patientId) {
            const response = await axios.get(`${API_URL}/patient/profile/${patientId}`);
            if (active) setProfile({ ...user, ...(response.data || {}) });
          }
        }
      } catch (error) {
        console.error("Unable to load chat profile:", error);
        if (active) setProfile(user);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [isOpen, user]);

  const age = useMemo(
    () => calculateAge(profile?.Dbirth || profile?.dBirth),
    [profile]
  );

  const address = Array.isArray(profile?.addresses)
    ? profile.addresses.map((item) => item?.location).filter(Boolean).join(", ")
    : profile?.address;

  return (
    <>
      {children ? (
        <div className="chat-profile-trigger" onClick={handleOpen} role="button" tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") handleOpen();
          }}>
          {children}
        </div>
      ) : null}

      <Dialog
        open={isOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        className="clinic-profile-dialog"
      >
        <DialogTitle className="clinic-profile-dialog-title">
          <div>
            <span>PROFILE</span>
            <h2>{profile?.name || user?.name || "Profile"}</h2>
          </div>
        </DialogTitle>

        <DialogContent className="clinic-profile-dialog-content">
          {loading ? (
            <div className="clinic-profile-loading">Loading profile…</div>
          ) : (
            <>
              <div className="clinic-profile-hero">
                <Avatar
                  alt={profile?.name || user?.name || "Profile"}
                  src={profile?.pic || user?.pic || undefined}
                  className="clinic-profile-dialog-avatar"
                />
                <div>
                  <strong>{profile?.name || user?.name || "Profile"}</strong>
                  <span>{profile?.role === "doctor" ? "Doctor" : "Patient"}</span>
                </div>
              </div>

              <Divider />

              <div className="clinic-profile-detail-grid">
                <div><small>Age</small><strong>{displayValue(age)}</strong></div>
                <div><small>Gender</small><strong>{displayValue(profile?.gender)}</strong></div>
                <div><small>Email</small><strong>{displayValue(profile?.email || user?.email)}</strong></div>
                <div><small>Phone / Mobile</small><strong>{displayValue(profile?.mobile)}</strong></div>
                <div><small>Speciality</small><strong>{displayValue(profile?.speciality)}</strong></div>
                <div><small>Hospital affiliation</small><strong>{displayValue(profile?.affilation)}</strong></div>
                <div><small>Address</small><strong>{displayValue(address)}</strong></div>
                {profile?.role === "doctor" && (
                  <>
                    <div><small>Rate</small><strong>{displayValue(profile?.rate)}</strong></div>
                    <div className="clinic-profile-detail-wide">
                      <small>Professional background</small>
                      <strong>{displayValue(profile?.background)}</strong>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>

        <DialogActions className="clinic-dialog-actions">
          <Button onClick={handleClose} className="clinic-dialog-primary">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileModal;
