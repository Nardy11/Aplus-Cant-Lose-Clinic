import React, { useState, useRef } from "react";
import Dropzone from "react-dropzone";
import axios from "axios";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { API_URL } from "../../Consts.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ConfirmDialog from "../common/ConfirmDialog";

import { Link } from "react-router-dom";
import Typography from "@mui/material/Typography";

const MedHist = ({ open, onClose }) => {
  const { id, role } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };
  const [file, setFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState("");
  const [state, setState] = useState({
    title: "",
    description: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isPreviewAvailable, setIsPreviewAvailable] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const dropRef = useRef();

  const handleInputChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
  };

  const onDrop = (files) => {
    const [uploadedFile] = files;
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setPreviewSrc(URL.createObjectURL(uploadedFile));
    setIsPreviewAvailable(/\.(pdf|jpeg|jpg|png)$/i.test(uploadedFile.name));
    setErrorMsg("");
  };

  const resetForm = () => {
    setFile(null);
    setPreviewSrc("");
    setIsPreviewAvailable(false);
    setReviewOpen(false);
    setState({ title: "", description: "" });
    setErrorMsg("");
  };

  const hasUnsavedChanges = Boolean(
    state.title.trim() || state.description.trim() || file
  );

  const requestClose = () => {
    if (hasUnsavedChanges) {
      setConfirmCloseOpen(true);
    } else {
      resetForm();
      onClose();
    }
  };

  const discardAndClose = () => {
    setConfirmCloseOpen(false);
    resetForm();
    onClose();
  };

  const handleOnSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log("hi");

      const { title, description } = state;
      if (title.trim() !== "" && description.trim() !== "") {
        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("title", title);
          formData.append("description", description);
          setErrorMsg("");
          await axios.post(`${API_URL}/patient/upload/${id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          console.log("hi");
          setSnackbarSeverity("success");
          setSnackbarMessage("File uploaded successfully");
          setSnackbarOpen(true);

          resetForm();
          onClose(); // Close the dialog
        } else {
          setErrorMsg("Please select a file to add.");
        }
      } else {
        setErrorMsg("Please enter all the field values.");
      }
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Error while uploading file. Try again later.");
      setSnackbarOpen(true);

      console.error(error);

      error.response && setErrorMsg(error.response.data);
    }
  };

  return role === "patient" ? (
    <Dialog open={open} onClose={requestClose} className="clinic-modern-dialog medical-history-dialog">
      <DialogTitle className="clinic-dialog-title">
        <div>
          <span>HEALTH FILE</span>
          <h2>Add medical history</h2>
        </div>
        <IconButton className="clinic-dialog-close" onClick={requestClose} aria-label="Close">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="clinic-dialog-content medical-history-content">
        <form onSubmit={handleOnSubmit} className="medical-history-form">
          {errorMsg && <p className="errorMsg">{errorMsg}</p>}
          <div>
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={state.title || ""}
              placeholder="Enter title"
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <input
              type="text"
              id="description"
              name="description"
              value={state.description || ""}
              placeholder="Enter description"
              onChange={handleInputChange}
            />
          </div>
          <div className="medical-history-upload">
            <Dropzone onDrop={onDrop}>
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps({ className: "drop-zone" })}
                  ref={dropRef}
                >
                  <input {...getInputProps()} />
                  <p>Drag and drop a file OR click here to select a file</p>
                  {file && (
                    <div>
                      <strong>Selected file:</strong> {file.name}
                    </div>
                  )}
                </div>
              )}
            </Dropzone>
            {file && (
              <div className="medical-history-selected-file">
                <div>
                  <strong>{file.name}</strong>
                  <span>{Math.max(1, Math.round(file.size / 1024))} KB</span>
                </div>
                <Button
                  type="button"
                  className="medical-history-review-button"
                  onClick={() => setReviewOpen(true)}
                >
                  Review file
                </Button>
              </div>
            )}
          </div>
          <DialogActions className="clinic-dialog-actions medical-history-actions">
            <Button type="button" onClick={requestClose} className="clinic-dialog-cancel">
              Cancel
            </Button>
            <Button type="submit" variant="contained" className="clinic-dialog-primary medical-history-submit">
              Add
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} className="clinic-modern-dialog medical-history-review-dialog">
        <DialogTitle className="clinic-dialog-title">
          <div>
            <span>DOCUMENT REVIEW</span>
            <h2>{file?.name || "Uploaded file"}</h2>
          </div>
          <IconButton className="clinic-dialog-close" onClick={() => setReviewOpen(false)} aria-label="Close review">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="medical-history-review-content">
          {file?.type?.startsWith("image/") ? (
            <img src={previewSrc} alt="Medical document preview" className="medical-history-full-preview" />
          ) : file?.type === "application/pdf" || /\.pdf$/i.test(file?.name || "") ? (
            <iframe
              src={previewSrc}
              title="PDF document preview"
              className="medical-history-pdf-preview"
            />
          ) : (
            <div className="clinic-empty-state">
              <strong>Preview is not available</strong>
              <span>This file can still be uploaded and downloaded from your medical history.</span>
            </div>
          )}
        </DialogContent>
        <DialogActions className="clinic-dialog-actions">
          <Button onClick={() => setReviewOpen(false)} className="clinic-dialog-primary">Done</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmCloseOpen}
        title="Discard this medical history?"
        message="You have entered unsaved information. If you leave now, your title, description, and selected file will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={discardAndClose}
        onCancel={() => setConfirmCloseOpen(false)}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Dialog>
  ) : (
    <>
      <Link to="/Login" sx={{ left: "100%" }}>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            display: { xs: "none", sm: "flex" },
            fontSize: "20px",
            margin: "auto",
          }}
        >
          Login
        </Typography>
      </Link>
    </>
  );
};

export default MedHist;
