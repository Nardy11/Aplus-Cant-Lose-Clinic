import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { SnackbarContext } from "../../App";
import { addHpackages, deleteHpackages, updatePack, viewHealthP } from "../../features/adminSlice";
import { EmptyState, PageHead } from "../../design/ui";
import { formatMoney } from "../../design/format";
import { useConfirm } from "./adminParts";

const BLANK = { type: "", rate: "", doctorDisc: "", medicineDisc: "", familyDisc: "" };

const FIELDS = [
  { name: "rate", label: "Price per year (EGP)", min: 0, max: 1000000 },
  { name: "doctorDisc", label: "Doctor visits discount (%)", min: 0, max: 100 },
  { name: "medicineDisc", label: "Medicine discount (%)", min: 0, max: 100 },
  { name: "familyDisc", label: "Family members discount (%)", min: 0, max: 100 },
];

function PackageDialog({ pack, onClose }) {
  const dispatch = useDispatch();
  const toast = useContext(SnackbarContext);
  const editing = Boolean(pack?._id);
  const [form, setForm] = useState(() => (editing ? { ...BLANK, ...pack } : BLANK));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const data = {
      type: form.type.trim(),
      rate: Number(form.rate),
      doctorDisc: Number(form.doctorDisc),
      medicineDisc: Number(form.medicineDisc),
      familyDisc: Number(form.familyDisc),
    };
    try {
      await dispatch(editing ? updatePack({ id: pack._id, newData: data }) : addHpackages(data)).unwrap();
      await dispatch(viewHealthP());
      toast(editing ? `${data.type} was updated.` : `${data.type} was added.`, "success");
      onClose();
    } catch (err) {
      setError("The package could not be saved. Check the numbers and try again.");
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="xs" className="adm-dialog" aria-labelledby="adm-pack-title">
      <form onSubmit={submit}>
        <div className="adm-dialog-head">
          <h2 id="adm-pack-title">{editing ? `Edit ${pack.type}` : "New health package"}</h2>
          <button type="button" className="ui-icon-btn" onClick={onClose} aria-label="Close" disabled={saving}><CloseRoundedIcon /></button>
        </div>
        <div className="adm-dialog-body">
          {error && <div className="ui-alert" role="alert">{error}</div>}
          <div className="ui-field">
            <label htmlFor="pack-type">Package name</label>
            <input id="pack-type" name="type" className="ui-input" value={form.type} onChange={set} required maxLength={30} placeholder="For example, Gold" autoFocus />
          </div>
          {FIELDS.map((f) => (
            <div className="ui-field" key={f.name}>
              <label htmlFor={`pack-${f.name}`}>{f.label}</label>
              <input id={`pack-${f.name}`} name={f.name} className="ui-input" type="number" inputMode="numeric" min={f.min} max={f.max} step="1" value={form[f.name]} onChange={set} required />
            </div>
          ))}
        </div>
        <div className="adm-dialog-foot">
          <button type="button" className="ui-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="ui-btn ui-btn--primary" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Add package"}</button>
        </div>
      </form>
    </Dialog>
  );
}

export default function AdminPackages() {
  const dispatch = useDispatch();
  const toast = useContext(SnackbarContext);
  const packs = useSelector((s) => s.admin.hpackages) || [];
  const [editing, setEditing] = useState(null); // null closed, {} new, pack = edit
  const [dialog, ask] = useConfirm();

  const remove = (p) =>
    ask({
      title: `Delete the ${p.type} package?`,
      message: "Patients already on it keep their benefits until it expires, but nobody new can choose it.",
      confirmLabel: "Delete package",
      onConfirm: async () => {
        try {
          await dispatch(deleteHpackages(p._id)).unwrap();
          toast(`${p.type} was deleted.`, "success");
        } catch (e) {
          toast("The package could not be deleted. Try again.", "error");
        }
      },
    });

  return (
    <>
      <PageHead
        title="Health packages"
        lead="The yearly plans patients can buy. Changes show up on the patient side straight away."
        actions={<button type="button" className="ui-btn ui-btn--primary" onClick={() => setEditing({})}><AddRoundedIcon /> New package</button>}
      />
      {packs.length === 0 ? (
        <div className="ui-card">
          <EmptyState
            icon={<WorkspacePremiumRoundedIcon />}
            title="No packages yet"
            text="Add a package so patients can save on visits and medicine."
            action={<button type="button" className="ui-btn ui-btn--primary" onClick={() => setEditing({})}><AddRoundedIcon /> New package</button>}
          />
        </div>
      ) : (
        <div className="adm-plans">
          {packs.map((p) => (
            <article className="ui-plan" key={p._id}>
              <div className="ui-plan-name"><h3>{p.type}</h3></div>
              <div className="ui-plan-price">{formatMoney(p.rate)}<span>/ year</span></div>
              <ul>
                <li><strong>{p.doctorDisc}%</strong> off doctor visits</li>
                <li><strong>{p.medicineDisc}%</strong> off medicine</li>
                <li><strong>{p.familyDisc}%</strong> off for family members</li>
              </ul>
              <div className="adm-plan-actions">
                <button type="button" className="ui-btn ui-btn--sm" onClick={() => setEditing(p)}><EditRoundedIcon /> Edit</button>
                <button type="button" className="ui-btn ui-btn--sm ui-btn--danger" onClick={() => remove(p)}><DeleteOutlineRoundedIcon /> Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && <PackageDialog key={editing._id || "new"} pack={editing} onClose={() => setEditing(null)} />}
      {dialog}
    </>
  );
}
