import React, { useState, useEffect } from "react";
import download from "downloadjs";
import axios from "axios";
import { API_URL } from "../../Consts";
import MedHist from "./MedHist.js"

import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Snackbar,
  Box,
  Fab,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import Alert from "@mui/material/Alert";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import AccountAvatar from "../Authentication/AccountAvatar";
import ConfirmDialog from "../common/ConfirmDialog";

const MedHistList = () => {
  const [filesList, setFilesList] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { id, role } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const getFilesList = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/patient/getAllFiles/${id}`
        );
        setErrorMsg("");
        setFilesList(data);
      } catch (error) {
        error.response && setErrorMsg(error.response.data);
      }
    };
    getFilesList();
  }, [id]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const downloadFile = async (fid, path, mimetype) => {
    try {
      const result = await axios.get(
        `${API_URL}/patient/download/${fid}/${id}`,
        { responseType: "blob" }
      );
      const split = path.split("/");
      const filename = split[split.length - 1];
      setErrorMsg("");
      // Show Snackbar for download success
      setSnackbarMessage(`File ${filename} downloaded successfully`);
      setSnackbarOpen(true);
      download(result.data, filename, mimetype);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMsg("Error while downloading file. Try again later");
      }
    }
  };

  const reviewFile = async (fid, mimetype) => {
    const previewWindow = window.open("", "_blank");
    try {
      const result = await axios.get(
        `${API_URL}/patient/download/${fid}/${id}`,
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(new Blob([result.data], { type: mimetype }));
      if (previewWindow) {
        previewWindow.location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else {
        URL.revokeObjectURL(url);
        setErrorMsg("Please allow pop-ups to review this document.");
      }
    } catch (error) {
      if (previewWindow) previewWindow.close();
      setErrorMsg("Unable to open this document.");
    }
  };

  const deleteFile = async (fid, path) => {
    try {
      await axios.get(`${API_URL}/patient/delete/${fid}/${id}`);
      const filename = path.split("/").pop();
      setErrorMsg("");
      setSnackbarMessage(`File ${filename} deleted successfully`);
      setSnackbarOpen(true);
      setFilesList((current) => current.filter((file) => file._id !== fid));
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setErrorMsg("File not found");
      } else {
        setErrorMsg("Error while deleting file. Try again later");
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    await deleteFile(target._id, target.file_path);
  };

  return role === "patient" ? (
    <div className="medical-history-list">
      {errorMsg && <p className="errorMsg">{errorMsg}</p>}
      <div className="medical-history-toolbar">
        <div>
          <span>UPLOADED DOCUMENTS</span>
          <strong>{filesList.length} {filesList.length === 1 ? "document" : "documents"}</strong>
        </div>
        <button type="button" className="medical-history-add-button" onClick={handleOpen}>
          <AddIcon />
          Add document
        </button>
      </div>

      {filesList.length > 0 ? (
        <div className="medical-history-file-list">
          {filesList.map(({ _id, title, description, file_path, file_mimetype }) => (
            <div className="medical-history-file" key={_id}>
              <div className="medical-history-file-icon"><CloudDownloadIcon /></div>
              <div className="medical-history-file-copy">
                <strong>{title}</strong>
                <span>{description || "Medical document"}</span>
              </div>
              <div className="medical-history-file-actions">
                <button
                  type="button"
                  className="medical-history-file-action"
                  aria-label="Review document"
                  onClick={() => reviewFile(_id, file_mimetype)}
                >
                  <VisibilityRoundedIcon />
                  <span>Review</span>
                </button>
                <IconButton aria-label="download" onClick={() => downloadFile(_id, file_path, file_mimetype)}>
                  <CloudDownloadIcon />
                </IconButton>
                <IconButton aria-label="delete" onClick={() => setDeleteTarget({ _id, title, file_path })}>
                  <DeleteIcon />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="medical-history-empty">
          <CloudDownloadIcon />
          <strong>No documents yet</strong>
          <span>Add lab reports, scans or other supporting medical files.</span>
        </div>
      )}

      <MedHist open={open} onClose={handleClose} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this document?"
        message={deleteTarget ? `“${deleteTarget.title}” will be permanently removed from your medical history.` : ""}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">{snackbarMessage}</Alert>
      </Snackbar>
    </div>
  ) : (
    <Link to="/Login" className="login-fallback">Login</Link>
  );
};

export default MedHistList;
