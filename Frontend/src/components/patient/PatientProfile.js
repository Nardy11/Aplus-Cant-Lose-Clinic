import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { API_URL } from "../../Consts";
import { updateProfile } from "../../features/userSlice";
import AccountAvatar from "../Authentication/AccountAvatar";
import ConfirmDialog from "../common/ConfirmDialog";
import {
  Avatar,
  Button,
  IconButton,
  TextField,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ContactEmergencyRoundedIcon from "@mui/icons-material/ContactEmergencyRounded";
import MaleRoundedIcon from "@mui/icons-material/MaleRounded";
import FemaleRoundedIcon from "@mui/icons-material/FemaleRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate } from "react-router-dom";

const emptyProfile = {
  name: "",
  email: "",
  username: "",
  dBirth: "",
  gender: "none",
  mobile: "",
  emergencyContact: { fullName: "", mobile: "", relation: "" },
  address: "",
  pic: "",
};

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const normalizeProfile = (data = {}) => ({
  name: data.name || "",
  email: data.email || "",
  username: data.username || "",
  dBirth: toDateInput(data.dBirth),
  gender: data.gender || "none",
  mobile: data.mobile ? String(data.mobile) : "",
  emergencyContact: {
    fullName: data.emergencyContact?.fullName || "",
    mobile: data.emergencyContact?.mobile ? String(data.emergencyContact.mobile) : "",
    relation: data.emergencyContact?.relation || "",
  },
  address: data.addresses?.[0]?.location || "",
  pic: data.pic || "",
});

const resizeImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const max = 640;
        const scale = Math.min(1, max / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function PatientProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, role, username: accountUsername } = useSelector((state) => state.user);

  const [profile, setProfile] = useState(emptyProfile);
  const [savedProfile, setSavedProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || role !== "patient") return;
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`${API_URL}/patient/profile/${id}`);
        if (!active) return;
        const normalized = normalizeProfile(response.data);
        setProfile(normalized);
        setSavedProfile(normalized);
      } catch (err) {
        if (active) {
          setError(err.response?.data?.error || "Unable to load your profile.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [id, role]);

  const dirty = useMemo(
    () => JSON.stringify(profile) !== JSON.stringify(savedProfile),
    [profile, savedProfile]
  );

  const updateField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const updateEmergency = (field, value) => {
    setProfile((current) => ({
      ...current,
      emergencyContact: { ...current.emergencyContact, [field]: value },
    }));
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    try {
      const image = await resizeImage(file);
      setProfile((current) => ({ ...current, pic: image }));
      setError("");
      setEditing(true);
    } catch {
      setError("The selected image could not be processed.");
    }
  };

  const requestCancel = () => {
    if (dirty) {
      setConfirmDiscard(true);
      return;
    }
    setEditing(false);
  };

  const discardChanges = () => {
    setConfirmDiscard(false);
    setProfile(savedProfile);
    setEditing(false);
    setError("");
  };

  const save = async () => {
    if (!profile.name.trim() || !profile.email.trim() || !profile.username.trim()) {
      setError("Name, email and username are required.");
      return;
    }

    const mobileDigits = profile.mobile.replace(/\D/g, "");
    if (!mobileDigits) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const result = await dispatch(updateProfile({
        id,
        name: profile.name.trim(),
        email: profile.email.trim(),
        username: profile.username.trim(),
        dBirth: profile.dBirth || null,
        mobile: Number(mobileDigits),
        emergencyContact: {
          fullName: profile.emergencyContact.fullName.trim(),
          mobile: profile.emergencyContact.mobile.replace(/\D/g, ""),
          relation: profile.emergencyContact.relation.trim(),
        },
        address: profile.address.trim(),
        pic: profile.pic,
      }));

      if (updateProfile.rejected.match(result)) {
        throw new Error(result.payload || "Unable to update profile.");
      }

      const normalized = normalizeProfile(result.payload.profile);
      setProfile(normalized);
      setSavedProfile(normalized);
      setEditing(false);
    } catch (err) {
      setError(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (role !== "patient") {
    return null;
  }

  return (
    <main className="patient-profile-page">
      <AccountAvatar />

      <div className="patient-profile-shell">
        <button type="button" className="patient-profile-back" onClick={() => navigate("/Home")}>
          <ArrowBackRoundedIcon />
          Back to home
        </button>

        <section className="patient-profile-hero-card">
          <div className="patient-profile-identity">
            <div className="patient-profile-avatar-wrap">
              <Avatar src={profile.pic || undefined} className="patient-profile-avatar">
                <PersonRoundedIcon />
              </Avatar>
              {editing && (
                <label className="patient-profile-photo-button" htmlFor="patient-profile-photo">
                  <CameraAltRoundedIcon />
                  <input id="patient-profile-photo" type="file" accept="image/*" onChange={handlePhotoChange} />
                </label>
              )}
            </div>

            <div className="patient-profile-identity-copy">
              <span>MY PROFILE</span>
              <h1>{profile.name || accountUsername || "Patient"}</h1>
              <p>{profile.email || "Manage your personal information and contact details."}</p>
              <div className="patient-profile-meta">
                <span>@{profile.username || accountUsername}</span>
                <span className={profile.gender === "female" ? "gender-female" : "gender-male"}>
                  {profile.gender === "female" ? <FemaleRoundedIcon /> : <MaleRoundedIcon />}
                  {profile.gender === "female" ? "Female" : profile.gender === "male" ? "Male" : "Not specified"}
                </span>
              </div>
            </div>
          </div>

          <div className="patient-profile-hero-actions">
            {!editing ? (
              <Button
                className="patient-profile-edit-button"
                variant="contained"
                startIcon={<EditRoundedIcon />}
                onClick={() => setEditing(true)}
              >
                Edit profile
              </Button>
            ) : (
              <>
                <Button
                  className="patient-profile-cancel-button"
                  startIcon={<CloseRoundedIcon />}
                  onClick={requestCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  className="patient-profile-save-button"
                  variant="contained"
                  startIcon={<SaveRoundedIcon />}
                  onClick={save}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </>
            )}
          </div>
        </section>

        {error && <div className="patient-profile-error">{error}</div>}

        <section className="patient-profile-grid">
          <article className="patient-profile-card">
            <div className="patient-profile-card-heading">
              <div className="profile-card-icon"><PersonRoundedIcon /></div>
              <div><span>PERSONAL INFORMATION</span><h2>About you</h2></div>
            </div>

            <div className="patient-profile-fields">
              <ProfileField icon={<PersonRoundedIcon />} label="Full name" value={profile.name} editing={editing} onChange={(value) => updateField("name", value)} />
              <ProfileField icon={<EmailRoundedIcon />} label="Email address" value={profile.email} editing={editing} type="email" onChange={(value) => updateField("email", value)} />
              <ProfileField icon={<BadgeRoundedIcon />} label="Username" value={profile.username} editing={editing} onChange={(value) => updateField("username", value)} />
              <ProfileField icon={<PhoneRoundedIcon />} label="Mobile number" value={profile.mobile} editing={editing} type="tel" onChange={(value) => updateField("mobile", value)} />
              <ProfileField icon={<CalendarMonthRoundedIcon />} label="Date of birth" value={profile.dBirth} editing={editing} type="date" onChange={(value) => updateField("dBirth", value)} />
              <div className="patient-profile-readonly-field">
                <span className="profile-field-icon"><LockRoundedIcon /></span>
                <div><small>Gender</small><strong>{profile.gender === "female" ? "Female" : profile.gender === "male" ? "Male" : "Not specified"}</strong></div>
                <span className={profile.gender === "female" ? "profile-gender-symbol female" : "profile-gender-symbol male"}>
                  {profile.gender === "female" ? <FemaleRoundedIcon /> : <MaleRoundedIcon />}
                </span>
              </div>
              <ProfileField icon={<HomeRoundedIcon />} label="Address" value={profile.address} editing={editing} onChange={(value) => updateField("address", value)} fullWidth />
            </div>
          </article>

          <article className="patient-profile-card">
            <div className="patient-profile-card-heading">
              <div className="profile-card-icon emergency"><ContactEmergencyRoundedIcon /></div>
              <div><span>EMERGENCY CONTACT</span><h2>Someone we can reach</h2></div>
            </div>

            <div className="patient-profile-fields">
              <ProfileField icon={<PersonRoundedIcon />} label="Full name" value={profile.emergencyContact.fullName} editing={editing} onChange={(value) => updateEmergency("fullName", value)} />
              <ProfileField icon={<PhoneRoundedIcon />} label="Mobile number" value={profile.emergencyContact.mobile} editing={editing} type="tel" onChange={(value) => updateEmergency("mobile", value)} />
              <ProfileField icon={<BadgeRoundedIcon />} label="Relationship" value={profile.emergencyContact.relation} editing={editing} onChange={(value) => updateEmergency("relation", value)} fullWidth />
            </div>

            {!editing && (
              <div className="patient-profile-security-note">
                <LockRoundedIcon />
                <div><strong>Gender is protected</strong><span>Your registered gender can be viewed here but is not editable.</span></div>
              </div>
            )}
          </article>
        </section>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard profile changes?"
        message="You have edited your profile. If you leave edit mode now, those changes will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        destructive
        onConfirm={discardChanges}
        onCancel={() => setConfirmDiscard(false)}
      />
    </main>
  );
}

function ProfileField({ icon, label, value, editing, onChange, type = "text", fullWidth = false }) {
  if (!editing) {
    return (
      <div className={`patient-profile-view-field ${fullWidth ? "full-width" : ""}`}>
        <span className="profile-field-icon">{icon}</span>
        <div><small>{label}</small><strong>{value || "Not provided"}</strong></div>
      </div>
    );
  }

  return (
    <div className={`patient-profile-edit-field ${fullWidth ? "full-width" : ""}`}>
      <TextField
        fullWidth
        label={label}
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        variant="outlined"
        size="small"
        InputLabelProps={type === "date" ? { shrink: true } : undefined}
      />
    </div>
  );
}
