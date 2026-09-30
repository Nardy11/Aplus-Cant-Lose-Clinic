import React, { useState, useRef } from "react";
import Dropzone from "react-dropzone";
import axios from "axios";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { API_URL } from "../../Consts.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

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
  const dropRef = useRef();

  const handleInputChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
  };

  const onDrop = (files) => {
    const [uploadedFile] = files;
    setFile(uploadedFile);

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewSrc(fileReader.result);
    };

    fileReader.readAsDataURL(uploadedFile);
    setIsPreviewAvailable(uploadedFile.name.match(/\.(pdf|jpeg|jpg|png)$/));
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
    <Dialog open={open} onClose={onClose} className="clinic-modern-dialog medical-history-dialog">
      <DialogTitle className="clinic-dialog-title"><div><span>HEALTH FILE</span><h2>Add medical history</h2></div><button type="button" className="clinic-native-close" onClick={onClose} aria-label="Close">×</button></DialogTitle>
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
            {previewSrc && (
              <div className="preview-container">
                {isPreviewAvailable ? (
                  file.name.match(/\.(jpeg|jpg|png|pdf)$/) ? (
                    <img
                      className="preview-image"
                      src={previewSrc}
                      alt="Preview"
                    />
                  ) : (
                    <div className="pdf-preview">
                      <Document file={previewSrc}>
                        <Page pageNumber={1} />
                      </Document>
                    </div>
                  )
                ) : (
                  <div className="preview-message">
                    <p>No preview available for this file</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogActions className="clinic-dialog-actions medical-history-actions">
            <button type="submit" className="clinic-dialog-primary medical-history-submit">
              Add
            </button>
          </DialogActions>
        </form>
      </DialogContent>
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
