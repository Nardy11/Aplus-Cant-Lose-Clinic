import React, { useEffect, useMemo, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
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
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AccountAvatar from "../Authentication/AccountAvatar";
import ConfirmDialog from "../common/ConfirmDialog";
import { editDoctorCredentials, getDr } from "../../features/doctorSlice";
import { syncProfile } from "../../features/userSlice";
import { SnackbarContext } from "../../App";

const defaultAvatar = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

const formatStatus = (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : "Not provided";
const normalizeDocs = (docs) => Array.isArray(docs) ? docs.map((doc) => ({ url: doc?.url || "", desc: doc?.desc || "" })) : [];

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
    name: "", email: "", username: "", speciality: "", Dbirth: "", gender: "none",
    rate: "", affiliation: "", background: "", pic: "", status: "pending",
    contractAccepted: false, docs: [],
  });

  useEffect(() => {
    if (id) dispatch(getDr(id));
  }, [dispatch, id]);

  useEffect(() => {
    setForm({
      name: info.name || "",
      email: info.email || "",
      username: info.username || "",
      speciality: info.speciality || "",
      Dbirth: info.Dbirth ? new Date(info.Dbirth).toISOString().slice(0, 10) : "",
      gender: info.gender || "none",
      rate: info.rate ?? "",
      affiliation: info.affilation || info.affiliation || "",
      background: info.background || "",
      pic: info.pic || accountPic || defaultAvatar,
      status: info.status || "pending",
      contractAccepted: Boolean(info.contract?.accepted),
      docs: normalizeDocs(info.docs),
    });
  }, [info, accountPic]);

  const original = useMemo(() => ({
    name: info.name || "",
    email: info.email || "",
    username: info.username || "",
    speciality: info.speciality || "",
    Dbirth: info.Dbirth ? new Date(info.Dbirth).toISOString().slice(0, 10) : "",
    gender: info.gender || "none",
    rate: info.rate ?? "",
    affiliation: info.affilation || info.affiliation || "",
    background: info.background || "",
    pic: info.pic || accountPic || defaultAvatar,
    status: info.status || "pending",
    contractAccepted: Boolean(info.contract?.accepted),
    docs: normalizeDocs(info.docs),
  }), [info, accountPic]);

  const dirty = editing && JSON.stringify(form) !== JSON.stringify(original);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const requestCancel = () => {
    if (dirty) setConfirmClose(true);
    else setEditing(false);
  };

  const cancelEditing = () => {
    setConfirmClose(false);
    setForm(original);
    setEditing(false);
  };

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify?.("Please choose an image file.", "error");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      notify?.("Profile photos must be 4 MB or smaller.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update("pic", String(reader.result || ""));
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const save = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.username.trim() || !form.speciality.trim() || form.rate === "" || !form.affiliation.trim()) {
      notify?.("Name, username, specialty, email, hourly rate, and hospital affiliation are required.", "error");
      return;
    }

    setSaving(true);
    try {
      const result = await dispatch(editDoctorCredentials({
        id,
        name: form.name.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        Dbirth: form.Dbirth || null,
        gender: form.gender,
        rate: Number(form.rate),
        speciality: form.speciality.trim(),
        affiliation: form.affiliation.trim(),
        background: form.background.trim(),
        pic: form.pic.trim() || defaultAvatar,
        status: form.status,
        contractAccepted: Boolean(form.contractAccepted),
        docs: form.docs.filter((doc) => doc.url.trim()).map((doc) => ({ url: doc.url.trim(), desc: doc.desc.trim() })),
      })).unwrap();

      const updatedUser = result?.data?.user;
      dispatch(syncProfile({
        username: updatedUser?.username || form.username.trim(),
        pic: updatedUser?.pic || form.pic.trim() || defaultAvatar,
      }));
      await dispatch(getDr(id));
      setEditing(false);
      notify?.("Profile updated successfully.", "success");
    } catch (error) {
      notify?.(error?.response?.data?.error || error?.message || "Unable to update your profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, options = {}) => (
    <div className="doctor-profile-edit-field">
      <label>{label}</label>
      <TextField
        fullWidth
        value={form[key]}
        onChange={(event) => update(key, event.target.value)}
        size="small"
        variant="outlined"
        type={options.type || "text"}
        multiline={Boolean(options.multiline)}
        minRows={options.minRows}
        select={Boolean(options.select)}
        placeholder={options.placeholder}
        inputProps={options.inputProps}
      >
        {options.children}
      </TextField>
    </div>
  );

  const profileFields = [
    { label: "Username", value: info.username || "Not provided", icon: BadgeRoundedIcon, key: "username" },
    { label: "Specialty", value: info.speciality || info.specialty || "Not provided", icon: LocalHospitalRoundedIcon, key: "speciality" },
    { label: "Date of birth", value: info.Dbirth ? new Date(info.Dbirth).toLocaleDateString() : "Not provided", icon: CalendarMonthRoundedIcon, key: "Dbirth" },
    { label: "Gender", value: formatStatus(info.gender), icon: WcRoundedIcon, key: "gender" },
  ];

  return (
    <main className="doctor-profile-page">
      <AccountAvatar />
      <div className="doctor-profile-shell">
        <button type="button" className="doctor-profile-back" onClick={() => navigate("/Home")}>
          <ArrowBackRoundedIcon /> Back to home
        </button>

        <section className="doctor-profile-hero">
          <div className="doctor-profile-avatar-wrap">
            <Avatar src={editing ? form.pic : (info.pic || accountPic || defaultAvatar)} alt={info.name || "Doctor"} className="doctor-profile-avatar" />
            {editing && (
              <label className="doctor-profile-photo-button">
                <AddPhotoAlternateRoundedIcon sx={{ fontSize: 17 }} />
                Change photo
                <input type="file" accept="image/*" onChange={handlePhoto} hidden />
              </label>
            )}
          </div>
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

        {!editing ? (
          <section className="doctor-profile-grid">
            {profileFields.map(({ label, value, icon: Icon }) => (
              <article className="doctor-profile-card" key={label}>
                <div className="doctor-profile-card-icon"><Icon /></div>
                <div className="doctor-profile-card-content"><span>{label}</span><strong>{value}</strong></div>
              </article>
            ))}
            <article className="doctor-profile-card">
              <div className="doctor-profile-card-icon"><BadgeRoundedIcon /></div>
              <div className="doctor-profile-card-content"><span>Account status</span><Chip className={`doctor-profile-status-chip status-${info.status || "pending"}`} label={formatStatus(info.status)} size="small" /></div>
            </article>
            <article className="doctor-profile-card">
              <div className="doctor-profile-card-icon"><DescriptionRoundedIcon /></div>
              <div className="doctor-profile-card-content"><span>Contract</span><Chip className={`doctor-profile-status-chip ${info.contract?.accepted ? "contract-accepted" : "contract-pending"}`} label={info.contract?.accepted ? "Accepted" : "Not accepted"} size="small" /></div>
            </article>
            <article className="doctor-profile-card">
              <div className="doctor-profile-card-icon"><PaymentsRoundedIcon /></div>
              <div className="doctor-profile-card-content"><span>Hourly rate</span><strong>{info.rate != null ? `$${info.rate}` : "Not provided"}</strong></div>
            </article>
            <article className="doctor-profile-card">
              <div className="doctor-profile-card-icon"><WorkOutlineRoundedIcon /></div>
              <div className="doctor-profile-card-content"><span>Hospital affiliation</span><strong>{info.affilation || info.affiliation || "Not provided"}</strong></div>
            </article>
            <article className="doctor-profile-card doctor-profile-card-wide">
              <div className="doctor-profile-card-icon"><MailOutlineRoundedIcon /></div>
              <div className="doctor-profile-card-content"><span>Email</span><strong>{info.email || "Not provided"}</strong></div>
            </article>
            <article className="doctor-profile-card doctor-profile-card-wide">
              <div className="doctor-profile-card-icon"><WorkOutlineRoundedIcon /></div>
              <div className="doctor-profile-card-content"><span>Professional background</span><strong className="doctor-profile-long-value">{info.background || "Not provided"}</strong></div>
            </article>
            <article className="doctor-profile-card doctor-profile-card-wide">
              <div className="doctor-profile-card-icon"><DescriptionRoundedIcon /></div>
              <div className="doctor-profile-card-content">
                <span>Credential documents</span>
                {info.docs?.length ? info.docs.map((doc, index) => (
                  <a key={`${doc.url}-${index}`} href={doc.url} target="_blank" rel="noreferrer" className="doctor-profile-document-link">
                    <DescriptionRoundedIcon sx={{ fontSize: 16 }} /><span>{doc.desc || `Credential ${index + 1}`}</span>
                  </a>
                )) : <strong>Not provided</strong>}
              </div>
            </article>
          </section>
        ) : (
          <section className="doctor-profile-edit-grid">
            {field("Full name", "name")}
            {field("Username", "username")}
            {field("Specialty", "speciality")}
            {field("Email", "email", { type: "email" })}
            {field("Date of birth", "Dbirth", { type: "date", inputProps: { max: new Date().toISOString().slice(0, 10) } })}
            {field("Gender", "gender", { select: true, children: [
              <MenuItem key="male" value="male">Male</MenuItem>,
              <MenuItem key="female" value="female">Female</MenuItem>,
              <MenuItem key="none" value="none">Not specified</MenuItem>,
            ]})}
            {field("Hourly rate", "rate", { type: "number", inputProps: { min: 0, step: "0.01" } })}
            {field("Hospital affiliation", "affiliation")}
            {field("Account status", "status", { select: true, children: [
              <MenuItem key="pending" value="pending">Pending</MenuItem>,
              <MenuItem key="accepted" value="accepted">Accepted</MenuItem>,
              <MenuItem key="rejected" value="rejected">Rejected</MenuItem>,
            ]})}
            <div className="doctor-profile-edit-field">
              <label>Contract</label>
              <div className="doctor-profile-contract-toggle">
                <Chip className={`doctor-profile-status-chip ${form.contractAccepted ? "contract-accepted" : "contract-pending"}`} label={form.contractAccepted ? "Accepted" : "Not accepted"} size="small" />
                <Button disableRipple type="button" className="doctor-profile-inline-action" onClick={() => update("contractAccepted", !form.contractAccepted)}>
                  {form.contractAccepted ? "Mark not accepted" : "Mark accepted"}
                </Button>
              </div>
            </div>
            {field("Professional background", "background", { multiline: true, minRows: 4, placeholder: "Education, experience, certifications, and clinical focus." })}

            <div className="doctor-profile-edit-field doctor-profile-photo-field">
              <label>Profile photo</label>
              <div className="doctor-profile-photo-editor">
                <Avatar src={form.pic || defaultAvatar} className="doctor-profile-photo-preview" />
                <div>
                  <label className="doctor-profile-upload-button">
                    <AddPhotoAlternateRoundedIcon sx={{ fontSize: 17 }} /> Upload new photo
                    <input type="file" accept="image/*" onChange={handlePhoto} hidden />
                  </label>
                  <Button disableRipple type="button" className="doctor-profile-inline-action" onClick={() => update("pic", defaultAvatar)}>Use default avatar</Button>
                </div>
              </div>
            </div>

            <div className="doctor-profile-edit-field doctor-profile-card-wide">
              <label>Photo URL (optional)</label>
              <TextField fullWidth value={form.pic.startsWith("data:") ? "" : form.pic} onChange={(event) => update("pic", event.target.value)} size="small" variant="outlined" placeholder="https://..." />
            </div>

            <div className="doctor-profile-docs-editor doctor-profile-card-wide">
              <div className="doctor-profile-docs-editor-head">
                <label>Credential documents</label>
                <Button disableRipple type="button" className="doctor-profile-inline-action" onClick={() => update("docs", [...form.docs, { url: "", desc: "" }])}>
                  <AddRoundedIcon sx={{ fontSize: 16 }} /> Add document
                </Button>
              </div>
              {form.docs.map((doc, index) => (
                <div className="doctor-profile-doc-row" key={index}>
                  <TextField fullWidth size="small" label="Description" value={doc.desc} onChange={(event) => update("docs", form.docs.map((item, i) => i === index ? { ...item, desc: event.target.value } : item))} />
                  <TextField fullWidth size="small" label="Document URL" value={doc.url} onChange={(event) => update("docs", form.docs.map((item, i) => i === index ? { ...item, url: event.target.value } : item))} />
                  <Button disableRipple type="button" className="doctor-profile-delete-doc" aria-label="Remove credential document" onClick={() => update("docs", form.docs.filter((_, i) => i !== index))}>
                    <DeleteOutlineRoundedIcon />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="doctor-profile-note">
          <div className="doctor-profile-note-icon"><LinkRoundedIcon /></div>
          <div>
            <strong>Profile controls</strong>
            <p>Personal, professional, account, contract, photo, and credential details are managed from this profile. Financial wallet history and system notifications remain protected records.</p>
          </div>
        </section>
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
