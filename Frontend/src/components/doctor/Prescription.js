import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { API_URL } from "../../Consts";
import { SnackbarContext } from "../../App";
import AccountAvatar from "../Authentication/AccountAvatar";
import ConfirmDialog from "../common/ConfirmDialog";
import { ClinicDateTimeField } from "../common/ClinicFields";
import { Page, PageHead, EmptyState, Skeleton, Avatar, StatusChip } from "../../design/ui";
import { formatDate } from "../../design/format";

const localInput = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

// Pick from the clinic's medicine list. Typing a new name used to create a price-less medicine
// that the patient could then never pay for.
function MedicineSelect({ id, medicines, value, onChange }) {
  return (
    <select id={id} className="ui-input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Choose a medicine</option>
      {medicines.map((m) => (
        <option key={m._id} value={m.name}>{m.name}{m.use ? `, ${m.use}` : ""}</option>
      ))}
    </select>
  );
}

const Prescriptions = () => {
  const doctorId = useSelector((state) => state.user.id);
  const notify = useContext(SnackbarContext);

  const [patients, setPatients] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(null);                 // patient whose prescriptions are listed
  const [list, setList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const [writing, setWriting] = useState(null);           // patient we are writing a new prescription for
  const [form, setForm] = useState({ medicine: "", dosage: "", date: localInput() });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [details, setDetails] = useState(null);           // prescription id being viewed
  const [medForm, setMedForm] = useState(null);           // { mode: "add" | "edit", medId?, medicine, dosage }
  const [medError, setMedError] = useState("");
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!doctorId) return;
    axios.get(`${API_URL}/doctor/getPatientsByDoctorId/${doctorId}`)
      .then((r) => setPatients(Array.isArray(r.data?.patients) ? r.data.patients : []))
      .catch(() => setPatients([]));
    axios.get(`${API_URL}/admin/viewMedicine`)
      .then((r) => setMedicines((r.data?.medicines || []).sort((a, b) => String(a.name).localeCompare(String(b.name)))))
      .catch(() => setMedicines([]));
  }, [doctorId]);

  const load = useCallback(async (patient) => {
    setListLoading(true);
    try {
      const r = await axios.get(`${API_URL}/patient/viewPrescriptions/${patient._id}`);
      const rows = Array.isArray(r.data?.prescriptions) ? r.data.prescriptions : [];
      setList(rows.sort((a, b) => new Date(b.datePrescribed) - new Date(a.datePrescribed)));
    } catch {
      setList([]);
      notify?.("Prescriptions didn't load. Try again.", "error");
    } finally {
      setListLoading(false);
    }
  }, [notify]);

  const toggle = (patient) => {
    if (open?._id === patient._id) return setOpen(null);
    setOpen(patient);
    load(patient);
  };

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (patients || []).filter((p) => !q || p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q));
  }, [patients, search]);

  const current = list.find((p) => p._id === details) || null;
  const mine = current && String(current.doctorID?._id) === String(doctorId);
  const locked = current?.status === "filled"; // paid by the patient: no more changes

  const startWriting = (patient) => { setWriting(patient); setForm({ medicine: "", dosage: "", date: localInput() }); setFormError(""); };

  const submitNew = async (e) => {
    e.preventDefault();
    if (!form.medicine) return setFormError("Choose a medicine.");
    if (!form.dosage.trim()) return setFormError("Write the dosage, for example: 1 tablet twice a day after meals.");
    setSaving(true);
    try {
      await axios.post(`${API_URL}/doctor/addPrescription`, {
        medName: form.medicine,
        dosage: form.dosage.trim(),
        patientID: writing._id,
        doctorID: doctorId,
        datePrescribed: form.date ? new Date(form.date) : new Date(),
      });
      notify?.(`Prescription added for ${writing.name}`, "success");
      const patient = writing;
      setWriting(null);
      setOpen(patient);
      load(patient);
    } catch (err) {
      setFormError(err.response?.data?.error || "The prescription wasn't saved. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveMed = async (e) => {
    e.preventDefault();
    if (!medForm.dosage.trim()) return setMedError("Write the dosage.");
    if (medForm.mode === "add" && !medForm.medicine) return setMedError("Choose a medicine.");
    setSaving(true);
    try {
      if (medForm.mode === "add") await axios.post(`${API_URL}/doctor/add/${current._id}`, { medName: medForm.medicine, dosage: medForm.dosage.trim() });
      else await axios.put(`${API_URL}/doctor/update/${current._id}`, { medID: medForm.medId, dosage: medForm.dosage.trim() });
      notify?.(medForm.mode === "add" ? "Medicine added" : "Dosage updated", "success");
      setMedForm(null);
      load(open);
    } catch (err) {
      setMedError(err.response?.data?.message || "That didn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const removeMed = async () => {
    const m = removing;
    setRemoving(null);
    try {
      await axios.delete(`${API_URL}/doctor/delete/${current._id}/${m.medID._id}`);
      notify?.(`${m.medID.name} removed`, "success");
      load(open);
    } catch (err) {
      notify?.(err.response?.data?.message || "The medicine couldn't be removed. Try again.", "error");
    }
  };

  return (
    <>
      <AccountAvatar />
      <Page>
        <PageHead title="Prescriptions" lead="Pick a patient to see their prescriptions, or write a new one." />

        <section className="ui-card">
          <div className="ui-toolbar">
            <div className="ui-field">
              <label htmlFor="rx-patient-search" className="ui-sr-only">Search patients</label>
              <div className="ui-input-wrap">
                <SearchRoundedIcon />
                <input id="rx-patient-search" className="ui-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" />
              </div>
            </div>
            <span className="ui-toolbar-count" style={{ marginLeft: "auto" }}>{shown.length} {shown.length === 1 ? "patient" : "patients"}</span>
          </div>

          <div className="ui-card-pad">
            {!patients ? (
              <Skeleton height={96} count={2} />
            ) : shown.length === 0 ? (
              <EmptyState icon={<GroupsRoundedIcon />} title={search ? "No patients match" : "No patients yet"} text={search ? "Try another name." : "Patients appear here once they book a visit with you."} />
            ) : (
              <div className="rxp-grid">
                {shown.map((p) => {
                  const isOpen = open?._id === p._id;
                  return (
                    <article className="ui-card rxp-card" key={p._id}>
                      <header>
                        <Avatar name={p.name} />
                        <div>
                          <h3>{p.name}</h3>
                          <p>{p.email}</p>
                        </div>
                        <div className="rxp-actions">
                          <button type="button" className="ui-btn ui-btn--sm" aria-expanded={isOpen} onClick={() => toggle(p)}>{isOpen ? "Hide" : "View prescriptions"}</button>
                          <button type="button" className="ui-btn ui-btn--sm ui-btn--primary" onClick={() => startWriting(p)}><AddRoundedIcon /> New prescription</button>
                        </div>
                      </header>
                      {isOpen && (
                        <div className="rxp-list">
                          {listLoading ? (
                            <Skeleton height={52} count={2} />
                          ) : list.length === 0 ? (
                            <p className="rxp-empty">No prescriptions for {p.name} yet.</p>
                          ) : (
                            list.map((rx) => (
                              <button type="button" className="rxp-row" key={rx._id} onClick={() => { setDetails(rx._id); setMedForm(null); }}>
                                <MedicationRoundedIcon />
                                <span>
                                  <strong>{(rx.meds || []).map((m) => m.medID?.name).filter(Boolean).join(", ") || "Prescription"}</strong>
                                  <small>{formatDate(rx.datePrescribed)}{String(rx.doctorID?._id) !== String(doctorId) && rx.doctorID?.name ? `, Dr. ${rx.doctorID.name}` : ""}</small>
                                </span>
                                <StatusChip status={rx.status === "filled" ? "filled" : "unfilled"} />
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </Page>

      {/* New prescription */}
      <Dialog open={Boolean(writing)} onClose={() => !saving && setWriting(null)} className="clinic-modern-dialog" maxWidth="xs" fullWidth>
        <form onSubmit={submitNew} noValidate>
          <DialogTitle className="clinic-dialog-title"><div><span>PRESCRIPTION</span><h2>New prescription for {writing?.name}</h2></div></DialogTitle>
          <DialogContent style={{ display: "grid", gap: 14, paddingTop: 4 }}>
            <div className="ui-field">
              <label htmlFor="rx-medicine">Medicine</label>
              <MedicineSelect id="rx-medicine" medicines={medicines} value={form.medicine} onChange={(v) => setForm({ ...form, medicine: v })} />
              {medicines.length === 0 && <span className="auth-hint">The medicine list is empty. Ask the clinic admin to add medicines.</span>}
            </div>
            <div className="ui-field">
              <label htmlFor="rx-dosage">Dosage</label>
              <textarea id="rx-dosage" rows={2} className="ui-input" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="e.g. 1 tablet twice a day after meals" />
            </div>
            <ClinicDateTimeField value={form.date} onChange={(v) => setForm({ ...form, date: v })} label="Prescribed on" />
            {formError && <div className="ui-alert" role="alert">{formError}</div>}
          </DialogContent>
          <DialogActions className="clinic-dialog-actions">
            <Button className="clinic-dialog-cancel" onClick={() => setWriting(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" className="clinic-dialog-primary" disabled={saving}>{saving ? "Saving..." : "Add prescription"}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* One prescription */}
      <Dialog open={Boolean(current)} onClose={() => setDetails(null)} className="clinic-modern-dialog" maxWidth="sm" fullWidth>
        {current && (
          <>
            <DialogTitle className="clinic-dialog-title">
              <div><span>PRESCRIPTION, {formatDate(current.datePrescribed).toUpperCase()}</span><h2>{open?.name}</h2></div>
              <IconButton className="clinic-dialog-close" onClick={() => setDetails(null)} aria-label="Close"><CloseRoundedIcon /></IconButton>
            </DialogTitle>
            <DialogContent style={{ display: "grid", gap: 14, paddingTop: 4 }}>
              {(locked || !mine) && (
                <div className="rxp-note">
                  {locked ? "The patient has paid for this prescription, so it can't be changed." : `Written by Dr. ${current.doctorID?.name || "another doctor"}. You can read it but not change it.`}
                </div>
              )}
              <ul className="rxp-meds">
                {(current.meds || []).map((m) => (
                  <li key={m._id || m.medID?._id}>
                    <div>
                      <strong>{m.medID?.name || "Medicine"}</strong>
                      <span>{[m.medID?.activeElement, m.medID?.use].filter(Boolean).join(", ")}</span>
                      <em>{m.dosage}</em>
                    </div>
                    {mine && !locked && (
                      <div className="rxp-med-actions">
                        <button type="button" className="ui-icon-btn" aria-label={`Change dosage of ${m.medID?.name}`} onClick={() => { setMedError(""); setMedForm({ mode: "edit", medId: m.medID._id, dosage: m.dosage || "" }); }}><EditRoundedIcon /></button>
                        <button type="button" className="ui-icon-btn" aria-label={`Remove ${m.medID?.name}`} onClick={() => setRemoving(m)}><DeleteOutlineRoundedIcon /></button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {medForm && (
                <form className="rxp-medform" onSubmit={saveMed} noValidate>
                  {medForm.mode === "add" && (
                    <div className="ui-field">
                      <label htmlFor="rx-add-med">Medicine</label>
                      <MedicineSelect id="rx-add-med" medicines={medicines} value={medForm.medicine || ""} onChange={(v) => setMedForm({ ...medForm, medicine: v })} />
                    </div>
                  )}
                  <div className="ui-field">
                    <label htmlFor="rx-med-dosage">{medForm.mode === "add" ? "Dosage" : "New dosage"}</label>
                    <input id="rx-med-dosage" className="ui-input" value={medForm.dosage} onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })} autoFocus />
                  </div>
                  {medError && <div className="ui-alert" role="alert">{medError}</div>}
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button type="button" className="ui-btn ui-btn--sm" onClick={() => setMedForm(null)} disabled={saving}>Cancel</button>
                    <button type="submit" className="ui-btn ui-btn--sm ui-btn--primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                  </div>
                </form>
              )}
            </DialogContent>
            <DialogActions className="clinic-dialog-actions">
              {mine && !locked && !medForm && (
                <Button className="clinic-dialog-cancel" onClick={() => { setMedError(""); setMedForm({ mode: "add", medicine: "", dosage: "" }); }}>Add a medicine</Button>
              )}
              <Button className="clinic-dialog-primary" onClick={() => setDetails(null)}>Done</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <ConfirmDialog
        open={Boolean(removing)}
        kicker="REMOVE MEDICINE"
        title={`Remove ${removing?.medID?.name || "this medicine"}?`}
        message="It is taken off this prescription."
        confirmLabel="Remove"
        cancelLabel="Keep it"
        destructive
        onConfirm={removeMed}
        onCancel={() => setRemoving(null)}
      />
    </>
  );
};

export default Prescriptions;
