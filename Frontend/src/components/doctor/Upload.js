import React, { useContext, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { API_URL } from "../../Consts.js";
import { SnackbarContext } from "../../App";

const DOCS = [
  { key: "id", label: "National ID", hint: "Front side, clearly readable" },
  { key: "degree", label: "Medical degree", hint: "Your university degree certificate" },
  { key: "license", label: "Medical license", hint: "Your current license to practise" },
];

// Step 2 of doctor sign-up: the documents the clinic reviews before approving the account.
function Upload() {
  const navigate = useNavigate();
  const notify = useContext(SnackbarContext);
  const doctorId = useSelector((state) => state.doctor.ndrID);
  const [files, setFiles] = useState({});
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const missing = DOCS.filter((d) => !files[d.key]);

  const send = async () => {
    if (!doctorId) return setError("We lost track of your sign-up. Start again from the doctor sign-up page.");
    if (missing.length) return setError(`Add your ${missing.map((d) => d.label.toLowerCase()).join(" and ")}.`);
    const form = new FormData();
    DOCS.forEach((d) => form.append("files", files[d.key]));
    setSending(true);
    setError("");
    try {
      await axios.post(`${API_URL}/doctor/upload/${doctorId}`, form);
      notify?.("Application sent. We'll email you once the clinic reviews it.", "success");
      navigate("/Login");
    } catch {
      setError("Upload failed. Check your connection and try again.");
      setSending(false);
    }
  };

  return (
    <main className="ui-auth-shell is-doctor-accent">
      <div className="ui-auth-card ui-auth-card--wide">
        <p className="upload-step">Step 2 of 2</p>
        <h1 className="ui-title">Upload your documents</h1>
        <p className="ui-lead">The clinic checks these before approving your account. Photos or PDFs work.</p>

        <div className="upload-list">
          {DOCS.map((d) => {
            const file = files[d.key];
            return (
              <label key={d.key} className={`upload-row ${file ? "is-done" : ""}`}>
                <span className="ui-row-icon">{file ? <CheckCircleRoundedIcon /> : <UploadFileRoundedIcon />}</span>
                <span className="upload-row-body">
                  <strong>{d.label}</strong>
                  <span>{file ? file.name : d.hint}</span>
                </span>
                <span className="ui-btn ui-btn--sm">{file ? "Replace" : "Choose file"}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="ui-sr-only"
                  onChange={(e) => setFiles((f) => ({ ...f, [d.key]: e.target.files?.[0] || f[d.key] }))}
                />
              </label>
            );
          })}
        </div>

        {error && <div className="ui-alert" role="alert">{error}</div>}

        <button type="button" className="ui-btn ui-btn--primary ui-btn--lg ui-btn--block" onClick={send} disabled={sending}>
          {sending ? "Sending..." : "Send application"}
        </button>
      </div>
    </main>
  );
}

export default Upload;
