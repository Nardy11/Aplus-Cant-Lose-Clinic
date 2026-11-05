import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { SnackbarContext } from "../../App";
import { createAdmin, deleteAdmin, viewAdmin } from "../../features/adminSlice";
import { PageHead } from "../../design/ui";
import { PASSWORD_HINT, PASSWORD_PATTERN } from "../../design/password";
import { Person, plural, useConfirm } from "./adminParts";

export default function AdminTeam() {
  const dispatch = useDispatch();
  const toast = useContext(SnackbarContext);
  const admins = useSelector((s) => s.admin.admins) || [];
  const me = useSelector((s) => s.user.username);
  const [form, setForm] = useState({ username: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dialog, ask] = useConfirm();

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await dispatch(createAdmin({ username: form.username.trim(), password: form.password })).unwrap();
      await dispatch(viewAdmin());
      toast(`${form.username.trim()} is now an administrator.`, "success");
      setForm({ username: "", password: "" });
    } catch (err) {
      setError(typeof err === "string" ? err : "The administrator could not be added. Try again.");
    }
    setBusy(false);
  };

  const remove = (a) =>
    ask({
      title: `Remove ${a.username}?`,
      message: "They lose access to this console straight away.",
      confirmLabel: "Remove administrator",
      onConfirm: async () => {
        try {
          await dispatch(deleteAdmin(a._id)).unwrap();
          toast(`${a.username} was removed.`, "success");
        } catch (e) {
          toast("The administrator could not be removed. Try again.", "error");
        }
      },
    });

  return (
    <>
      <PageHead title="Administrators" lead="People who can sign in to this console." />
      <div className="adm-split">
        <section className="ui-card">
          <div className="ui-card-head">
            <h2 className="ui-section-title">Current team</h2>
            <span className="ui-toolbar-count">{plural(admins.length, "administrator")}</span>
          </div>
          <ul className="adm-list">
            {admins.map((a) => {
              const mine = a.username === me;
              return (
                <li key={a._id}>
                  <Person name={a.name || a.username} sub={a.name && a.name !== a.username ? a.username : "Administrator"} />
                  {mine ? (
                    <span className="ui-chip ui-chip--accent">You</span>
                  ) : (
                    <button type="button" className="ui-icon-btn adm-remove" aria-label={`Remove ${a.username}`} title={`Remove ${a.username}`} onClick={() => remove(a)}>
                      <DeleteOutlineRoundedIcon />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <form className="ui-card ui-card-pad adm-form" onSubmit={add}>
          <h2 className="ui-section-title">Add an administrator</h2>
          {error && <div className="ui-alert" role="alert">{error}</div>}
          <div className="ui-field">
            <label htmlFor="adm-username">Username</label>
            <input id="adm-username" className="ui-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="off" required />
          </div>
          <div className="ui-field">
            <label htmlFor="adm-password">Password</label>
            <div className="ui-auth-password">
              <input
                id="adm-password"
                className="ui-input"
                type={show ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                pattern={PASSWORD_PATTERN}
                title={PASSWORD_HINT}
                autoComplete="new-password"
                required
              />
              <button type="button" className="ui-icon-btn" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
                {show ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
              </button>
            </div>
            <span className="adm-hint">{PASSWORD_HINT}</span>
          </div>
          <button type="submit" className="ui-btn ui-btn--primary" disabled={busy}>{busy ? "Adding..." : "Add administrator"}</button>
        </form>
      </div>
      {dialog}
    </>
  );
}
