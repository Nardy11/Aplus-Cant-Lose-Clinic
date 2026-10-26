import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { viewFamilyMembers } from "../../features/patientSlice";
import { API_URL } from "../../Consts";
import { SnackbarContext } from "../../App";
import AccountAvatar from "../Authentication/AccountAvatar";
import ConfirmDialog from "../common/ConfirmDialog";
import { Page, PageHead, EmptyState, Skeleton, Avatar } from "../../design/ui";

const EMPTY = { fullName: "", NID: "", age: "", gender: "male", relation: "spouse" };
const RELATIONS = [["spouse", "Spouse"], ["child", "Child"]];
const GENDERS = [["male", "Male"], ["female", "Female"], ["none", "Not specified"]];
const label = (list, value) => list.find(([v]) => v === value)?.[1] || value;

function Field({ id, label: text, error, children }) {
  return (
    <div className="ui-field">
      <label htmlFor={id}>{text}</label>
      {children}
      {error && <span className="ui-field-error" role="alert">{error}</span>}
    </div>
  );
}

// Add and edit share one form. Returns an error map; empty means valid.
const validate = (f) => {
  const e = {};
  if (!f.fullName.trim()) e.fullName = "Enter their full name.";
  if (!/^\d{14}$/.test(String(f.NID))) e.NID = "A national ID is 14 digits.";
  const age = Number(f.age);
  if (!Number.isInteger(age) || age < 1 || age > 120) e.age = "Enter an age from 1 to 120.";
  return e;
};

export default function FamilyMembers() {
  const dispatch = useDispatch();
  const notify = useContext(SnackbarContext);
  const { id: patientId, role } = useSelector((state) => state.user);
  const members = useSelector((state) => state.patient.fMembers);
  const [loaded, setLoaded] = useState(false);

  const [form, setForm] = useState(null);              // { index|null, values }
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(null);      // { member, index }
  const [linking, setLinking] = useState(false);
  const [link, setLink] = useState({ by: "email", value: "", relation: "spouse" });
  const [linkError, setLinkError] = useState("");

  const refresh = () => dispatch(viewFamilyMembers({ patientId })).finally(() => setLoaded(true));
  useEffect(() => { if (patientId) refresh(); }, [patientId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (role !== "patient") return <Link to="/Login" className="login-fallback">Sign in</Link>;

  const list = Array.isArray(members) ? members.filter((m) => m && !Array.isArray(m)) : [];
  const set = (key) => (e) => setForm((f) => ({ ...f, values: { ...f.values, [key]: e.target.value } }));

  const openAdd = () => { setErrors({}); setForm({ index: null, values: EMPTY }); };
  const openEdit = (m, index) => {
    setErrors({});
    setForm({ index, values: { fullName: m.fullName || "", NID: String(m.NID ?? ""), age: String(m.age ?? ""), gender: m.gender || "none", relation: m.relation || "spouse" } });
  };

  const save = async (ev) => {
    ev.preventDefault();
    const e = validate(form.values);
    setErrors(e);
    if (Object.keys(e).length) return;
    const body = { ...form.values, fullName: form.values.fullName.trim(), NID: Number(form.values.NID), age: Number(form.values.age) };
    setSaving(true);
    try {
      if (form.index === null) await axios.post(`${API_URL}/patient/addFamilyMember/${patientId}`, body);
      else await axios.patch(`${API_URL}/patient/familyMember/${patientId}/${form.index}`, body);
      notify?.(form.index === null ? `${body.fullName} added to your family` : `${body.fullName} updated`, "success");
      setForm(null);
      refresh();
    } catch (err) {
      setErrors({ form: err.response?.data?.error || "That didn't save. Check the details and try again." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const { member, index } = removing;
    setRemoving(null);
    try {
      await axios.delete(`${API_URL}/patient/familyMember/${patientId}/${index}`);
      notify?.(`${member.fullName} removed from your family`, "success");
      refresh();
    } catch (err) {
      notify?.(err.response?.data?.error || "They couldn't be removed. Try again.", "error");
    }
  };

  const submitLink = async (ev) => {
    ev.preventDefault();
    setLinkError("");
    const value = link.value.trim();
    if (!value) return setLinkError(link.by === "email" ? "Enter their email address." : "Enter their mobile number.");
    setSaving(true);
    try {
      const body = link.by === "email" ? { type: "email", email: value, relation: link.relation } : { type: "phoneNumber", phoneNumber: value, relation: link.relation };
      await axios.post(`${API_URL}/patient/addFamilyLink/${patientId}`, body);
      notify?.("Linked. You can now book visits and plans for them.", "success");
      setLinking(false);
      setLink({ by: "email", value: "", relation: "spouse" });
      refresh();
    } catch (err) {
      setLinkError(err.response?.data?.error || "We couldn't link that account. Check the details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AccountAvatar />
      <Page>
        <PageHead
          title="Family"
          lead="People on your account. Link someone who has their own account to book visits and plans for them."
          actions={
            <>
              <button type="button" className="ui-btn" onClick={() => { setLinkError(""); setLinking(true); }}><LinkRoundedIcon /> Link an account</button>
              <button type="button" className="ui-btn ui-btn--primary" onClick={openAdd}><GroupAddRoundedIcon /> Add a member</button>
            </>
          }
        />

        {!loaded && !list.length ? (
          <div className="ui-grid ui-grid-3"><Skeleton height={170} count={3} /></div>
        ) : list.length === 0 ? (
          <div className="ui-card">
            <EmptyState
              icon={<GroupsRoundedIcon />}
              title="No family members yet"
              text="Add your spouse or children, or link a family member who already has an account."
              action={<button type="button" className="ui-btn ui-btn--primary" onClick={openAdd}>Add a member</button>}
            />
          </div>
        ) : (
          <div className="ui-grid ui-grid-3">
            {list.map((m, index) => {
              const linked = Boolean(m.pid);
              return (
                <article className="ui-card fam-card" key={m._id || index}>
                  <header>
                    <Avatar name={m.fullName} />
                    <div>
                      <h3>{m.fullName}</h3>
                      <p>{label(RELATIONS, m.relation)}{m.age ? `, ${m.age} years` : ""}</p>
                    </div>
                    <span className={`ui-chip ${linked ? "ui-chip--accent" : ""}`}>{linked ? "Own account" : "Not linked"}</span>
                  </header>
                  <dl>
                    <div><dt>Gender</dt><dd>{label(GENDERS, m.gender)}</dd></div>
                    {!linked && <div><dt>National ID</dt><dd>{m.NID}</dd></div>}
                  </dl>
                  <footer>
                    {!linked && <button type="button" className="ui-btn ui-btn--sm" onClick={() => openEdit(m, index)}>Edit</button>}
                    <button type="button" className="ui-btn ui-btn--sm ui-btn--danger" onClick={() => setRemoving({ member: m, index })}>Remove</button>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </Page>

      <Dialog open={Boolean(form)} onClose={() => !saving && setForm(null)} className="clinic-modern-dialog" maxWidth="xs" fullWidth>
        <form onSubmit={save} noValidate>
          <DialogTitle className="clinic-dialog-title">
            <div><span>FAMILY</span><h2>{form?.index === null ? "Add a family member" : "Edit family member"}</h2></div>
          </DialogTitle>
          <DialogContent style={{ display: "grid", gap: 14, paddingTop: 4 }}>
            {form && (
              <>
                <Field id="fm-name" label="Full name" error={errors.fullName}>
                  <input id="fm-name" className="ui-input" value={form.values.fullName} onChange={set("fullName")} autoFocus />
                </Field>
                <Field id="fm-nid" label="National ID" error={errors.NID}>
                  <input id="fm-nid" className="ui-input" inputMode="numeric" value={form.values.NID} onChange={set("NID")} placeholder="14 digits" />
                </Field>
                <Field id="fm-age" label="Age" error={errors.age}>
                  <input id="fm-age" className="ui-input" inputMode="numeric" value={form.values.age} onChange={set("age")} placeholder="Years" />
                </Field>
                <Field id="fm-rel" label="Relation">
                  <select id="fm-rel" className="ui-input" value={form.values.relation} onChange={set("relation")}>
                    {RELATIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </Field>
                <Field id="fm-gender" label="Gender">
                  <select id="fm-gender" className="ui-input" value={form.values.gender} onChange={set("gender")}>
                    {GENDERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </Field>
                {errors.form && <div className="ui-alert" role="alert">{errors.form}</div>}
              </>
            )}
          </DialogContent>
          <DialogActions className="clinic-dialog-actions">
            <Button className="clinic-dialog-cancel" onClick={() => setForm(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" className="clinic-dialog-primary" disabled={saving}>{saving ? "Saving..." : form?.index === null ? "Add member" : "Save changes"}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={linking} onClose={() => !saving && setLinking(false)} className="clinic-modern-dialog" maxWidth="xs" fullWidth>
        <form onSubmit={submitLink} noValidate>
          <DialogTitle className="clinic-dialog-title">
            <div><span>FAMILY</span><h2>Link an existing account</h2></div>
          </DialogTitle>
          <DialogContent style={{ display: "grid", gap: 14, paddingTop: 4 }}>
            <p className="clinic-dialog-copy" style={{ margin: 0 }}>They need their own El7a2ny patient account. Once linked, you can book visits and plans for them.</p>
            <Field id="lk-by" label="Find them by">
              <select id="lk-by" className="ui-input" value={link.by} onChange={(e) => setLink({ ...link, by: e.target.value, value: "" })}>
                <option value="email">Email address</option>
                <option value="phone">Mobile number</option>
              </select>
            </Field>
            <Field id="lk-value" label={link.by === "email" ? "Email address" : "Mobile number"}>
              <input id="lk-value" className="ui-input" type={link.by === "email" ? "email" : "tel"} value={link.value} onChange={(e) => setLink({ ...link, value: e.target.value })} autoFocus />
            </Field>
            <Field id="lk-rel" label="They are your">
              <select id="lk-rel" className="ui-input" value={link.relation} onChange={(e) => setLink({ ...link, relation: e.target.value })}>
                {RELATIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            {linkError && <div className="ui-alert" role="alert">{linkError}</div>}
          </DialogContent>
          <DialogActions className="clinic-dialog-actions">
            <Button className="clinic-dialog-cancel" onClick={() => setLinking(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" className="clinic-dialog-primary" disabled={saving}>{saving ? "Linking..." : "Link account"}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(removing)}
        kicker="REMOVE MEMBER"
        title={`Remove ${removing?.member?.fullName || "this member"}?`}
        message={removing?.member?.pid ? "They're taken off your family list. Their own account isn't deleted." : "They're taken off your family list."}
        confirmLabel="Remove"
        cancelLabel="Keep"
        destructive
        onConfirm={remove}
        onCancel={() => setRemoving(null)}
      />
    </>
  );
}
