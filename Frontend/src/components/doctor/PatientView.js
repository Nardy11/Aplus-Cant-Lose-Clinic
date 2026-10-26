import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import download from "downloadjs";
import { useDispatch, useSelector } from "react-redux";
import { API_URL } from "../../Consts";
import { getPatients, addHealthRecord } from "../../features/doctorSlice";
import AccountAvatar from "../Authentication/AccountAvatar";
import ConfirmDialog from "../common/ConfirmDialog";
import { ClinicSearchField, ClinicDateField } from "../common/ClinicFields";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MedicalInformationRoundedIcon from "@mui/icons-material/MedicalInformationRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { SnackbarContext } from "../../App";

const initials = (name = "") => name.split(" ").filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase() || "P";

export default function PatientView() {
  const dispatch = useDispatch();
  const notify = React.useContext(SnackbarContext);
  const { id: doctorId, role } = useSelector((state) => state.user);
  const { patientsList = [], loading } = useSelector((state) => state.doctor);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [healthDialog, setHealthDialog] = useState(false);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [form, setForm] = useState({ date:"", description:"", labResults:"", medicalInformation:"", primaryDiagnosis:"", treatment:"" });
  const [saving, setSaving] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => { if (doctorId) dispatch(getPatients(doctorId)); }, [dispatch, doctorId]);

  const filteredPatients = useMemo(() => patientsList.filter((patient) => {
    const q = search.trim().toLowerCase();
    return !q || [patient.name, patient.email, patient.username, patient.mobile].filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
  }), [patientsList, search]);

  const resetForm = () => setForm({ date:"", description:"", labResults:"", medicalInformation:"", primaryDiagnosis:"", treatment:"" });
  const hasDraft = Object.values(form).some(Boolean);
  const closeHealth = () => { if (hasDraft) setConfirmClose(true); else { setHealthDialog(false); resetForm(); } };

  const saveHealthRecord = async (event) => {
    event.preventDefault();
    if (!selectedPatient) return;
    setSaving(true);
    try {
      await dispatch(addHealthRecord({ patientID: selectedPatient._id, healthRecordData: { ...form, doctorID: doctorId } })).unwrap();
      notify?.("Health record added successfully.", "success");
      setHealthDialog(false);
      resetForm();
      dispatch(getPatients(doctorId));
    } catch (error) {
      notify?.("Unable to add the health record.", "error");
    } finally { setSaving(false); }
  };

  const downloadFile = async (patientId, file) => {
    try {
      const response = await axios.get(`${API_URL}/patient/download/${file._id}/${patientId}`, { responseType:"blob" });
      download(response.data, (file.file_path || file.title || "medical-document").split("/").pop(), file.file_mimetype);
    } catch { notify?.("Unable to download this document.", "error"); }
  };

  if (role !== "doctor") return null;

  return (
    <>
      <AccountAvatar />
      <main className="doctor-page">
      <div className="doctor-page-shell">
        <div className="ui-page-head">
          <div>
            <h1 className="ui-title">Patients</h1>
            <p className="ui-lead">Everyone with a visit booked with you. Open their medical history or add a health record.</p>
          </div>
        </div>

        <section className="doctor-surface">
          <div className="doctor-toolbar">
            <div className="search-field"><ClinicSearchField value={search} onChange={setSearch} placeholder="Search by name, email or mobile" /></div>
            <div className="doctor-toolbar-spacer" />
            <span className="ui-toolbar-count">{filteredPatients.length} {filteredPatients.length === 1 ? "patient" : "patients"}</span>
          </div>

          {loading && !patientsList.length ? <div className="doctor-empty-state"><strong>Loading patients...</strong></div> : filteredPatients.length ? (
            <div className="doctor-card-grid">
              {filteredPatients.map((patient) => {
                const records = patient.healthRecords || [];
                const history = patient.medHist || [];
                return <article className="doctor-patient-card" key={patient._id}>
                  <div className="doctor-patient-card-head"><div className="doctor-person-avatar">{initials(patient.name)}</div><div><h3>{patient.name || "Unnamed patient"}</h3><p>{patient.email || patient.username || "Patient account"}</p></div></div>
                  <div className="doctor-patient-card-details">
                    <div className="doctor-detail"><span>Gender</span><strong>{patient.gender || "—"}</strong></div>
                    <div className="doctor-detail"><span>Mobile</span><strong>{patient.mobile || "—"}</strong></div>
                    <div className="doctor-detail"><span>Health records</span><strong>{records.length}</strong></div>
                    <div className="doctor-detail"><span>Medical files</span><strong>{history.length}</strong></div>
                  </div>
                  <div className="doctor-row-actions" style={{ marginTop:14 }}>
                    <button className="doctor-secondary-button" onClick={() => { setSelectedPatient(patient); setHistoryDialog(true); }}><VisibilityRoundedIcon sx={{ fontSize:15, mr:.5, verticalAlign:"middle" }} />Medical history</button>
                    <button className="doctor-secondary-button" onClick={() => { setSelectedPatient(patient); setHealthDialog(true); }}><AddCircleOutlineRoundedIcon sx={{ fontSize:15, mr:.5, verticalAlign:"middle" }} />Add record</button>
                  </div>
                </article>;
              })}
            </div>
          ) : <div className="doctor-empty-state"><div className="doctor-empty-icon"><PersonRoundedIcon /></div><h3>{search ? "No matching patients" : "No patients yet"}</h3><p>{search ? "Try a different name, email, username or mobile number." : "Patients connected to your doctor account will appear here."}</p></div>}
        </section>
      </div>

      <Dialog open={healthDialog} onClose={closeHealth} fullWidth maxWidth="md" className="doctor-dialog">
        <DialogTitle className="doctor-dialog-title"><div><span>CLINICAL RECORD</span><h2>Add health record</h2></div><IconButton className="doctor-dialog-close" onClick={closeHealth}><CloseRoundedIcon /></IconButton></DialogTitle>
        <DialogContent className="doctor-dialog-content">
          <div className="doctor-dialog-section"><h3>{selectedPatient?.name || "Patient"}</h3><p>Add a structured clinical note to this patient account.</p>
            <form id="doctor-health-record-form" onSubmit={saveHealthRecord} className="doctor-form-grid">
              {[[ "date","Date","date" ],["description","Description","text"],["labResults","Lab results","text"],["medicalInformation","Medical information","text"],["primaryDiagnosis","Primary diagnosis","text"],["treatment","Treatment","text"]].map(([key,label,type]) => (
                <div className="doctor-form-field" key={key}>
                  <label htmlFor={"health-"+key}>{label}</label>
                  {key === "date" ? (
                    <ClinicDateField value={form[key]} onChange={(value) => setForm({ ...form, [key]: value })} placeholder="Select date" />
                  ) : (
                    <input id={"health-"+key} type={type} value={form[key]} required onChange={(e) => setForm({ ...form, [key]:e.target.value })} />
                  )}
                </div>
              ))}
            </form>
          </div>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2.5 }}><Button className="doctor-secondary-button" onClick={closeHealth}>Cancel</Button><Button className="doctor-primary-button" type="submit" form="doctor-health-record-form" disabled={saving}>{saving ? "Saving..." : "Save record"}</Button></DialogActions>
      </Dialog>

      <Dialog open={historyDialog} onClose={() => setHistoryDialog(false)} fullWidth maxWidth="md" className="doctor-dialog">
        <DialogTitle className="doctor-dialog-title"><div><span>MEDICAL FILES</span><h2>{selectedPatient?.name || "Patient"} · Medical history</h2></div><IconButton className="doctor-dialog-close" onClick={() => setHistoryDialog(false)}><CloseRoundedIcon /></IconButton></DialogTitle>
        <DialogContent className="doctor-dialog-content">
          {(selectedPatient?.medHist || []).length ? (selectedPatient.medHist.map((file, index) => <div className="doctor-dialog-section" key={file._id || index}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}><div><h3>{file.title || "Medical document"}</h3><p>{file.description || file.file_mimetype || "Medical file"}</p></div><Button className="doctor-secondary-button" onClick={() => downloadFile(selectedPatient._id, file)}><DownloadRoundedIcon sx={{ fontSize:15, mr:.5 }} />Download</Button></div></div>)) : <div className="doctor-empty-state"><div className="doctor-empty-icon"><MedicalInformationRoundedIcon /></div><h3>No medical files</h3><p>This patient does not have uploaded medical-history documents yet.</p></div>}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmClose} title="Discard health record?" message="You have entered clinical information. If you close this form now, the unsaved changes will be lost." confirmLabel="Discard" cancelLabel="Keep editing" destructive onConfirm={() => { setConfirmClose(false); setHealthDialog(false); resetForm(); }} onCancel={() => setConfirmClose(false)} />
      </main>
    </>
  );
}