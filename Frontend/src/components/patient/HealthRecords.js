import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import h from "./h.png";
import m from "./m.png";
import {
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Dialog,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import MedHistList from "./MedHistList.js";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../../Consts.js";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import AccountAvatar from "../Authentication/AccountAvatar.js";
const styles = {
  paper: {
    padding: "20px",
    width: "40%",
    marginBottom: "10px",
  },
  subHeader: {
    fontSize: "30px",
    color: "#fff",
  },
  accordion: {
    margin: "10px",
    backgroundColor: "#fffffc",
    width: "95%", // New green color for accordion background
  },
  accordionSummary: {
    backgroundColor: "#7251b5", // New green color for accordion summary
    color: "#fff",
  },
  card: {
    maxWidth: 400,
    margin: "10px",
    cursor: "pointer",
  },
  button: {
    color: "#fff",
  },
};
// ... (imports remain unchanged)

function HealthRecords() {
  const [selectedHealthRecord, setSelectedHealthRecord] = useState([]);
  const navigate = useNavigate();
  const { id, role } = useSelector((state) => state.user);
  useEffect(() => {
    const getHealthRecords = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/patient/viewPatientHealthRecords/${id}`
        );
        const healthRecords = response.data.HealthRecords.healthRecords;
        setSelectedHealthRecord(healthRecords);
      } catch (error) {
        console.error("Error fetching Health Record:", error);
      }
    };

    // Call the function when the component mounts
    getHealthRecords();
  }, [id]); // Add any dependencies that are used in the function, like 'id'

  return role === "patient" ? (
    <div className="health-records-page">
      <AccountAvatar />
      <main className="health-records-shell">
        <section className="health-records-heading">
          <div>
            <span>YOUR HEALTH</span>
            <h1>Health records</h1>
            <p>Review your clinical history and uploaded medical documents.</p>
          </div>
        </section>

        <section className="health-records-grid">
          <div className="health-records-visual">
            <img src={h} alt="Healthcare illustration" />
            <div className="health-records-visual-copy">
              <strong>Your records, organized.</strong>
              <span>Keep important health information accessible in one place.</span>
            </div>
          </div>

          <Paper className="health-records-card" elevation={0}>
            <div className="health-records-card-header">
              <div>
                <span>CLINICAL TIMELINE</span>
                <h2>Health records</h2>
              </div>
              <div className="health-records-count">{selectedHealthRecord.length}</div>
            </div>

            <div className="health-records-list">
              {selectedHealthRecord.length ? selectedHealthRecord.map((healthRecord) => (
                <Accordion key={healthRecord._id} className="health-record-item" disableGutters>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <div className="health-record-summary">
                      <strong>{healthRecord.description || "Health record"}</strong>
                      <span>{new Date(healthRecord.date).toLocaleString()}</span>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="health-record-details">
                      {healthRecord.labResults && <p><strong>Lab results:</strong> {healthRecord.labResults}</p>}
                      {healthRecord.medicalInformation && <p><strong>Medical information:</strong> {healthRecord.medicalInformation}</p>}
                      {healthRecord.primaryDiagnosis && <p><strong>Diagnosis:</strong> {healthRecord.primaryDiagnosis}</p>}
                      {healthRecord.treatment && <p><strong>Treatment:</strong> {healthRecord.treatment}</p>}
                    </div>
                  </AccordionDetails>
                </Accordion>
              )) : (
                <div className="health-record-empty">
                  <strong>No health records yet</strong>
                  <span>Your clinical records will appear here when available.</span>
                </div>
              )}
            </div>
          </Paper>
        </section>

        <section className="medical-history-section">
          <div className="medical-history-heading">
            <div>
              <span>DOCUMENTS</span>
              <h2>Medical history</h2>
              <p>Upload and manage supporting medical files.</p>
            </div>
            <img src={m} alt="Medical documents illustration" />
          </div>
          <div className="medical-history-list-card">
            <MedHistList />
          </div>
        </section>
      </main>
    </div>
