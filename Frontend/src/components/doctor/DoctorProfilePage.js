import React, { useEffect, useMemo, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import WcRoundedIcon from "@mui/icons-material/WcRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import AccountAvatar from "../Authentication/AccountAvatar";
import ConfirmDialog from "../common/ConfirmDialog";
import { editDoctorCredentials, getDr } from "../../features/doctorSlice";
import { syncProfile } from "../../features/userSlice";
import { SnackbarContext } from "../../App";

const defaultAvatar = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

const DoctorProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notify = useContext(SnackbarContext);
  const { id, pic: accountPic } = useSelector((state) => state.user);
  const info = useSelector((state) => state.doctor.info || {});
  const [editing, setEditing] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    rate: "",
    affiliation: "",
    background: "",
    pic: "",
  });

  useEffect(() => {
    if (id) dispatch(getDr(id));
  }, [dispatch, id]);

  useEffect(() => {
    setForm({
      name: info.name || "",
      email: info.email || "",
      rate: info.rate ?? "",
      affiliation: info.affilation || info.affiliation || "",
      background: info.background || "",
      pic: info.pic || accountPic || defaultAvatar,
    });
  }, [info, accountPic]);

  const original = useMemo(() => ({
    name: info.name || "",
    email: info.email || "",
    rate: info.rate ?? "",
    affiliation: info.affilation || info.affiliation || "",
    background: info.background || "",
    pic: info.pic || accountPic || defaultAvatar,
  }), [info, accountPic]);

  const dirty = editing && JSON.stringify(form) !== JSON.stringify(original);

  const requestCancel = () => {
    if (dirty) setConfirmClose(true);
    else setEditing(false);
  };

  const cancelEditing = () => {
    setConfirmClose(false);
    setForm(original);
    setEditing(false);
  };

  const save = async () => {
    if (!form.name.trim() || !form.email.trim() || form.rate === "" || !form.affiliation.trim()) {
      notify?.("Name, email, hourly rate, and hospital affiliation are required.", "error");
      return;
    }

    setSaving(true);
    try {
      const result = await dispatch(editDoctorCredentials({
        id,
        name: form.name.trim(),
        email: form.email.trim(),
        rate: Number(form.rate),
        affiliation: form.affiliation.trim(),
        background: form.background.trim(),
        pic: form.pic.trim() || defaultAvatar,
      })).unwrap();

      const updatedUser = result?.data?.user;
      dispatch(syncProfile({
        username: updatedUser?.username || info.username,
        pic: updatedUser?.pic || form.pic.trim() || defaultAvatar,
      }));

      await dispatch(getDr(id));
      setEditing(false);
      notify?.("Profile updated successfully.", "success");
    } catch (error) {
      notify?.(error?.message || error?.response?.data?.error || "Unable to update your profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const profileFields = [
    { label: "Username", value: info.username || "Not provided", icon: BadgeRoundedIcon },
    { label: "Specialty", value: info.speciality || info.specialty || "Not provided", icon: LocalHospitalRoundedIcon },
    { label: "Date of birth", value: info.Dbirth ? new Date(info.Dbirth).toLocaleDateString() : "Not provided", icon: CalendarMonthRoundedIcon },
    { label: "Gender", value: info.gender || "Not provided", icon: WcRoundedIcon },
    { label: "Account status", value: info.status ? info.status.charAt(0).toUpperCase() + info.status.slice(1) : "Not provided", icon: BadgeRoundedIcon },
    { label: "Contract", value: info.contract?.accepted ? "Accepted" : "Not accepted", icon: DescriptionRoundedIcon },
  ];

  return (
    <main className="doctor-profile-page">
      <AccountAvatar />
      <div className="doctor-profile-shell">
        <button type="button" className="doctor-profile-back" onClick={() => navigate("/Home")}>
          <ArrowBackRoundedIcon /> Back to home
        </button>

        <section className="doctor-profile-hero">
          <Avatar
            src={editing ? form.pic : (info.pic || accountPic || defaultAvatar)}
            alt={info.name || "Doctor"}
            sx={{ width: 92, height: 92, boxShadow: "0 14px 36px rgba(18, 38, 63, .16)" }}
          />
          <div className="doctor-profile-hero-copy">
            <span>DOCTOR PROFILE</span>
            <h1>{info.name || "Doctor profile"}</h1>
            <p>{info.speciality || info.specialty || "Medical professional"} · {info.affilation || info.affiliation || "Clinic profile"}</p>
          </div>
          {!editing ? (
            <Button disableRipple type="button" className="doctor-profile-edit" onClick={() => setEditing(true)}>
              <EditRoundedIcon sx={{ fontSize: 16, mr: .6 }} /> Edit profile
            </Button>
          ) : (
            <div className="doctor-profile-edit-actions">
              <Button disableRipple type="button" className="doctor-profile-cancel" onClick={requestCancel}>
                <CloseRoundedIcon sx={{ fontSize: 16, mr: .4 }} /> Cancel
              </Button>
              <Button disableRipple type="button" className="doctor-profile-save" onClick={save} disabled={saving}>
                <SaveRoundedIcon sx={{ fontSize: 16, mr: .5 }} /> {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          )}
        </section>

        <section className="doctor-profile-grid">
          {profileFields.map(({ label, value, icon: Icon }) => (
            <article className="doctor-profile-card" key={label}>
              <div className="doctor-profile-card-icon"><Icon /></div>
              <div className="doctor-profile-card-content">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            </article>
          ))}

          <article className="doctor-profile-card">
            <div className="doctor-profile-card-icon"><PaymentsRoundedIcon /></div>
            <div className="doctor-profile-card-content">
              <span>Hourly rate</span>
              {editing ? (
                <TextField fullWidth type="number" min={0} value={form.rate} onChange={(event) => setForm({ ...form, rate: event.target.value })} size="small" variant="outlined" />
              ) : (
                <strong>{info.rate != null ? `$${info.rate}` : "Not provided"}</strong>
              )}
            </div>
          </article>

          <article className="doctor-profile-card">
            <div className="doctor-profile-card-icon"><WorkOutlineRoundedIcon /></div>
            <div className="doctor-profile-card-content">
              <span>Hospital affiliation</span>
              {editing ? (
                <TextField fullWidth value={form.affiliation} onChange={(event) => setForm({ ...form, affiliation: event.target.value })} size="small" variant="outlined" />
              ) : (
                <strong>{info.affilation || info.affiliation || "Not provided"}</strong>
              )}
            </div>
          </article>

          <article className="doctor-profile-card doctor-profile-card-wide">
            <div className="doctor-profile-card-icon"><MailOutlineRoundedIcon /></div>
            <div className="doctor-profile-card-content">
              <span>Email</span>
              {editing ? (
                <TextField fullWidth value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" size="small" variant="outlined" />
              ) : (
                <strong>{info.email || "Not provided"}</strong>
              )}
            </div>
          </article>

          <article className="doctor-profile-card doctor-profile-card-wide">
            <div className="doctor-profile-card-icon"><WorkOutlineRoundedIcon /></div>
            <div className="doctor-profile-card-content">
              <span>Professional background</span>
              {editing ? (
                <TextField multiline minRows={3} fullWidth value={form.background} onChange={(event) => setForm({ ...form, background: event.target.value })} size="small" variant="outlined" placeholder="Describe education, experience, certifications, and clinical focus." />
              ) : (
                <strong style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{info.background || "Not provided"}</strong>
              )}
            </div>
          </article>

          {editing && (
            <>
              <article className="doctor-profile-card doctor-profile-card-wide">
                <div className="doctor-profile-card-icon"><BadgeRoundedIcon /></div>
                <div className="doctor-profile-card-content">
                  <span>Full name</span>
                  <TextField fullWidth value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} size="small" variant="outlined" />
                </div>
              </article>

              <article className="doctor-profile-card doctor-profile-card-wide">
                <div className="doctor-profile-card-icon"><LinkRoundedIcon /></div>
                <div className="doctor-profile-card-content">
                  <span>Profile photo URL</span>
                  <TextField fullWidth value={form.pic} onChange={(event) => setForm({ ...form, pic: event.target.value })} size="small" variant="outlined" placeholder="https://..." />
                </div>
              </article>
            </>
          )}
        </section>

        <section className="doctor-profile-note">
          <div className="doctor-profile-note-icon"><DescriptionRoundedIcon /></div>
          <div>
            <strong>Professional credentials</strong>
            <p>
              {info.docs?.length
                ? `${info.docs.length} credential document${info.docs.length === 1 ? "" : "s"} are linked to your profile.`
                : "No credential documents are linked to this profile yet."}
            </p>
          </div>
        </section>

        {info.docs?.length > 0 && (
          <section className="doctor-profile-documents">
            {info.docs.map((doc, index) => (
              <a key={`${doc.url}-${index}`} href={doc.url} target="_blank" rel="noreferrer" className="doctor-profile-document-link">
                <DescriptionRoundedIcon sx={{ fontSize: 16 }} />
                <span>{doc.desc || `Credential ${index + 1}`}</span>
              </a>
            ))}
          </section>
        )}
      </div>

      <ConfirmDialog
        open={confirmClose}
        title="Discard profile changes?"
        message="You have edited your doctor profile. If you leave edit mode now, those changes will be lost."
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
