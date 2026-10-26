import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import download from "downloadjs";
import axios from "axios";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { API_URL } from "../../Consts";
import { SnackbarContext } from "../../App";
import MedHist from "./MedHist.js";
import ConfirmDialog from "../common/ConfirmDialog";
import { EmptyState } from "../../design/ui";

// The patient's own uploaded documents (lab reports, scans). Also used inside Health records.
const MedHistList = () => {
  const notify = useContext(SnackbarContext);
  const { id, role } = useSelector((state) => state.user);
  const [files, setFiles] = useState(null);
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const load = () =>
    axios.get(`${API_URL}/patient/getAllFiles/${id}`)
      .then((r) => { setFiles(Array.isArray(r.data) ? r.data : []); setError(""); })
      .catch((e) => { setFiles([]); if (e.response && typeof e.response.data === "string") setError(e.response.data); });

  useEffect(() => { if (id) load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBlob = (fid) => axios.get(`${API_URL}/patient/download/${fid}/${id}`, { responseType: "blob" });

  const save = async (file) => {
    try {
      const r = await fetchBlob(file._id);
      const name = file.file_path.split("/").pop();
      download(r.data, name, file.file_mimetype);
      notify?.(`Saved ${file.title}`, "success");
    } catch {
      notify?.("The document couldn't be downloaded. Try again.", "error");
    }
  };

  const review = async (file) => {
    try {
      const r = await fetchBlob(file._id);
      setPreview({ url: URL.createObjectURL(new Blob([r.data], { type: file.file_mimetype })), mimetype: file.file_mimetype, title: file.title });
    } catch {
      notify?.("The document couldn't be opened. Try again.", "error");
    }
  };

  const closePreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const remove = async () => {
    const f = deleteTarget;
    setDeleteTarget(null);
    try {
      await axios.get(`${API_URL}/patient/delete/${f._id}/${id}`);
      setFiles((list) => list.filter((x) => x._id !== f._id));
      notify?.(`Deleted ${f.title}`, "success");
    } catch (e) {
      notify?.(e.response?.status === 404 ? "That document is already gone." : "The document couldn't be deleted. Try again.", "error");
    }
  };

  if (role !== "patient") return null;

  return (
    <section className="ui-card">
      <div className="ui-card-head">
        <div>
          <h2 className="ui-section-title">Your documents</h2>
          <p>{files ? `${files.length} ${files.length === 1 ? "file" : "files"}. Lab reports, scans and other papers your doctors may need.` : "Loading..."}</p>
        </div>
        <button type="button" className="ui-btn ui-btn--primary" onClick={() => setAdding(true)}>
          <AddRoundedIcon /> Add document
        </button>
      </div>

      {error && <div className="ui-alert" role="alert" style={{ margin: 16 }}>{error}</div>}

      {files && files.length === 0 ? (
        <EmptyState icon={<DescriptionRoundedIcon />} title="No documents yet" text="Add a lab report or scan so your doctor can see it before your visit." />
      ) : (
        <ul className="ui-list">
          {(files || []).map((f) => (
            <li key={f._id} className="ui-row doc-row">
              <span className="ui-row-icon"><DescriptionRoundedIcon /></span>
              <span className="ui-row-body">
                <strong>{f.title}</strong>
                <span>{f.description || "Medical document"}</span>
              </span>
              <span className="doc-actions">
                <button type="button" className="ui-btn ui-btn--sm" onClick={() => review(f)}><VisibilityRoundedIcon /> View</button>
                <button type="button" className="ui-icon-btn" aria-label={`Download ${f.title}`} onClick={() => save(f)}><DownloadRoundedIcon /></button>
                <button type="button" className="ui-icon-btn" aria-label={`Delete ${f.title}`} onClick={() => setDeleteTarget(f)}><DeleteOutlineRoundedIcon /></button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={Boolean(preview)} onClose={closePreview} className="clinic-modern-dialog medical-history-preview-dialog" maxWidth="lg" fullWidth>
        <DialogTitle className="clinic-dialog-title">
          <div><span>DOCUMENT</span><h2>{preview?.title}</h2></div>
          <IconButton className="clinic-dialog-close" onClick={closePreview} aria-label="Close"><CloseRoundedIcon /></IconButton>
        </DialogTitle>
        <DialogContent className="medical-history-preview-content">
          {preview?.mimetype?.startsWith("image/") ? (
            <img src={preview.url} alt={preview.title || "Medical document"} className="medical-history-preview-image" />
          ) : preview?.mimetype === "application/pdf" ? (
            <iframe src={preview.url} title={preview.title || "Medical document"} className="medical-history-preview-frame" />
          ) : (
            <EmptyState icon={<VisibilityRoundedIcon />} title="No preview for this file type" text="Download it to open the original." />
          )}
        </DialogContent>
      </Dialog>

      <MedHist open={adding} onClose={() => { setAdding(false); load(); }} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        kicker="DELETE DOCUMENT"
        title="Delete this document?"
        message={deleteTarget ? `"${deleteTarget.title}" is removed from your records for good.` : ""}
        confirmLabel="Delete"
        cancelLabel="Keep it"
        destructive
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
};

export default MedHistList;
