import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editDoctorCredentials, getDr } from "../../features/doctorSlice";
import { SnackbarContext } from "../../App";
import ConfirmDialog from "../common/ConfirmDialog";
import ContractDetails from "./Contract";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";

export default function DoctorProfileDialog({ open, handleClose, onContractAccepted }) {
  const dispatch = useDispatch();
  const notify = useContext(SnackbarContext);
  const id = useSelector((state) => state.user.id);
  const info = useSelector((state) => state.doctor.info || {});
  const [form, setForm] = useState({ email:"", rate:"", affiliation:"" });
  const [confirmClose, setConfirmClose] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (id) dispatch(getDr(id)); }, [dispatch, id]);
  useEffect(() => { if (open) setForm({ email:info.email || "", rate:info.rate ?? "", affiliation:info.affilation || "" }); }, [open, info.email, info.rate, info.affilation]);

  const dirty = form.email !== (info.email || "") || String(form.rate) !== String(info.rate ?? "") || form.affiliation !== (info.affilation || "");
  const requestClose = () => { if (dirty) setConfirmClose(true); else handleClose(); };
  const save = async () => {
    setSaving(true);
    try { await dispatch(editDoctorCredentials({ id, email:form.email, rate:form.rate, affilation:form.affiliation })).unwrap(); notify?.("Credentials updated successfully.", "success"); handleClose(); }
    catch { notify?.("Unable to update credentials.", "error"); }
    finally { setSaving(false); }
  };

  return <Dialog open={Boolean(open)} onClose={requestClose} fullWidth maxWidth="md" className="doctor-dialog">
    <DialogTitle className="doctor-dialog-title"><div><span>DOCTOR ACCOUNT</span><h2>Credentials</h2></div><IconButton className="doctor-credentials-close" onClick={requestClose} aria-label="Close credentials"><CloseRoundedIcon /></IconButton></DialogTitle>
    <DialogContent className="doctor-dialog-content">
      <section className="doctor-dialog-section"><div style={{ display:"flex", gap:11, alignItems:"center" }}><div className="doctor-empty-icon" style={{ width:42, height:42, flex:"0 0 42px", margin:0 }}><BadgeRoundedIcon /></div><div><h3>Professional information</h3><p>Keep your contact details and consultation rate up to date.</p></div></div>
        <div className="doctor-form-grid">
          <div className="doctor-form-field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email:e.target.value })} /></div>
          <div className="doctor-form-field"><label>Hourly rate</label><input type="number" min="0" value={form.rate} onChange={(e) => setForm({ ...form, rate:e.target.value })} /></div>
          <div className="doctor-form-field" style={{ gridColumn:"1 / -1" }}><label>Hospital affiliation</label><input value={form.affiliation} onChange={(e) => setForm({ ...form, affiliation:e.target.value })} /></div>
        </div>
        <div className="doctor-action-row"><Button className="doctor-secondary-button" onClick={requestClose}>Cancel</Button><Button className="doctor-primary-button" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button></div>
      </section>
      <div style={{ marginTop:12 }}><ContractDetails embedded /></div>
    </DialogContent>
    <DialogActions sx={{ display:"none" }} />
    <ConfirmDialog open={confirmClose} title="Discard credential changes?" message="You have edited your professional information. If you close now, those changes will be lost." confirmLabel="Discard" cancelLabel="Keep editing" destructive onConfirm={() => { setConfirmClose(false); handleClose(); }} onCancel={() => setConfirmClose(false)} />
  </Dialog>;
}