import React, { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccountAvatar from "../Authentication/AccountAvatar";
import ConfirmDialog from "../common/ConfirmDialog";
import { editDoctorCredentials, getDr } from "../../features/doctorSlice";
import { SnackbarContext } from "../../App";

const DoctorProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notify = useContext(SnackbarContext);
  const { id } = useSelector((state) => state.user);
  const info = useSelector((state) => state.doctor.info || {});
  const [editing, setEditing] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email:"", rate:"", affiliation:"" });

  useEffect(() => { if (id) dispatch(getDr(id)); }, [dispatch, id]);
  useEffect(() => {
    setForm({
      email: info.email || "",
      rate: info.rate ?? "",
      affiliation: info.affilation || info.affiliation || "",
    });
  }, [info.email, info.rate, info.affilation, info.affiliation]);

  const dirty = editing && (
    form.email !== (info.email || "") ||
    String(form.rate) !== String(info.rate ?? "") ||
    form.affiliation !== (info.affilation || info.affiliation || "")
  );

  const startEditing = () => setEditing(true);
  const requestCancel = () => {
    if (dirty) setConfirmClose(true);
    else setEditing(false);
  };
  const cancelEditing = () => {
    setConfirmClose(false);
    setEditing(false);
    setForm({
      email: info.email || "",
      rate: info.rate ?? "",
      affiliation: info.affilation || info.affiliation || "",
    });
  };

  const save = async () => {
    if (!form.email || form.rate === "" || !form.affiliation.trim()) {
      notify?.("Email, hourly rate, and hospital affiliation are required.", "error");
      return;
    }
    setSaving(true);
    try {
      await dispatch(editDoctorCredentials({
        id,
        email: form.email.trim(),
        rate: Number(form.rate),
        affiliation: form.affiliation.trim(),
      })).unwrap();
      await dispatch(getDr(id));
      setEditing(false);
      notify?.("Profile updated successfully.", "success");
    } catch (error) {
      notify?.(error?.message || "Unable to update your profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { label:"Specialty", value:info.speciality || info.specialty || "Not provided", icon:LocalHospitalRoundedIcon, editable:false },
    { label:"Email", key:"email", value:form.email, icon:MailOutlineRoundedIcon, editable:true, type:"email" },
    { label:"Hourly rate", key:"rate", value:form.rate, icon:PaymentsRoundedIcon, editable:true, type:"number" },
    { label:"Hospital affiliation", key:"affiliation", value:form.affiliation, icon:BadgeRoundedIcon, editable:true, type:"text" },
  ];

  return (
    <main className="doctor-profile-page">
      <AccountAvatar />
      <div className="doctor-profile-shell">
        <button type="button" className="doctor-profile-back" onClick={() => navigate("/Home")}>
          <ArrowBackRoundedIcon /> Back to home
        </button>

        <section className="doctor-profile-hero">
          <div className="doctor-profile-avatar"><BadgeRoundedIcon /></div>
          <div className="doctor-profile-hero-copy">
            <span>DOCTOR PROFILE</span>
            <h1>{info.name || "Doctor profile"}</h1>
            <p>View and update your professional information and clinic details.</p>
          </div>
          {!editing ? (
            <Button disableRipple type="button" className="doctor-profile-edit" onClick={startEditing}>
              <EditRoundedIcon sx={{ fontSize:16, mr:.6 }} /> Edit profile
            </Button>
          ) : (
            <div className="doctor-profile-edit-actions">
              <Button disableRipple type="button" className="doctor-profile-cancel" onClick={requestCancel}>
                <CloseRoundedIcon sx={{ fontSize:16, mr:.4 }} /> Cancel
              </Button>
              <Button disableRipple type="button" className="doctor-profile-save" onClick={save} disabled={saving}>
                <SaveRoundedIcon sx={{ fontSize:16, mr:.5 }} /> {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          )}
        </section>

        <section className="doctor-profile-grid">
          {fields.map(({ label, key, value, icon:Icon, editable, type }) => (
            <article className={editable && editing ? "doctor-profile-card doctor-profile-card-editing" : "doctor-profile-card"} key={label}>
              <div className="doctor-profile-card-icon"><Icon /></div>
              <div className="doctor-profile-card-content">
                <span>{label}</span>
                {editable && editing ? (
                  <input
                    className="doctor-profile-input"
                    type={type}
                    min={type === "number" ? "0" : undefined}
                    value={value}
                    onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                    aria-label={label}
                  />
                ) : (
                  <strong>{editable ? value || "Not provided" : value}</strong>
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="doctor-profile-note">
          <div className="doctor-profile-note-icon"><BadgeRoundedIcon /></div>
          <div>
            <strong>Professional profile</strong>
            <p>Specialty is managed by the clinic. You can update your email, consultation rate, and hospital affiliation here.</p>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmClose}
        title="Discard profile changes?"
        message="You have edited your professional information. If you leave edit mode now, those changes will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={cancelEditing}
        onCancel={() => setConfirmClose(false)}
      />
    </main>
  );
};

export default DoctorProfilePage;
