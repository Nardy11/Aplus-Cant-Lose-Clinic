import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import download from "downloadjs";
import { useSelector } from "react-redux";
import { API_URL } from "../../Consts.js";
import { SnackbarContext } from "../../App";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import Button from "@mui/material/Button";
import AccountAvatar from "../Authentication/AccountAvatar";

export default function ContractDetails({ embedded = false }) {
  const { id, role } = useSelector((state) => state.user);
  const notify = useContext(SnackbarContext);
  const [contractPath, setContractPath] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try { const response = await axios.get(`${API_URL}/doctor/getContract/${id}`); const contract = response.data.contract || {}; setContractPath(contract.file || null); setAccepted(Boolean(contract.accepted)); }
    catch { setContractPath(null); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (role === "doctor") load(); }, [id, role]);

  const acceptContract = async () => {
    try { await axios.put(`${API_URL}/doctor/acceptContract/${id}`); setAccepted(true); notify?.("Contract accepted successfully.", "success"); }
    catch { notify?.("Unable to accept the contract.", "error"); }
  };

  const downloadContract = async () => {
    try { const response = await axios.get(`${API_URL}/doctor/download/${id}`, { responseType:"blob" }); download(response.data, "El7a2ny-Clinic-Contract.pdf", response.headers?.["content-type"] || "application/pdf"); }
    catch { notify?.("Unable to download the contract.", "error"); }
  };

  if (role !== "doctor") return null;

  const content = <section className={embedded ? "doctor-dialog-section" : "doctor-surface"} style={embedded ? undefined : { padding:24 }}>
    <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
      <div className="doctor-empty-icon" style={{ margin:0, flex:"0 0 46px", width:46, height:46 }}><DescriptionRoundedIcon /></div>
      <div style={{ flex:1 }}><span style={{ color:"#1769ff", fontSize:8, fontWeight:850, letterSpacing:".14em" }}>JOB DOCUMENTS</span><h2 style={{ margin:"5px 0 5px", color:"#2d3d54", fontSize:17 }}>Doctor contract</h2><p style={{ margin:0, color:"#8794a6", fontSize:9, lineHeight:1.5 }}>{accepted ? "Your contract has been accepted." : "Review and accept your clinic contract when it is available."}</p></div>
      {accepted && <CheckCircleRoundedIcon sx={{ color:"#278a68", fontSize:22 }} />}
    </div>
    <div className="doctor-detail" style={{ marginTop:16 }}><span>DOCUMENT STATUS</span><strong>{loading ? "Loading..." : contractPath ? (accepted ? "Accepted" : "Awaiting acceptance") : "No contract found"}</strong></div>
    {contractPath && <div className="doctor-action-row">{!accepted && <Button className="doctor-primary-button" onClick={acceptContract}>Accept contract</Button>}<Button className="doctor-secondary-button" onClick={downloadContract}><DownloadRoundedIcon sx={{ fontSize:15, mr:.5 }} />Download contract</Button></div>}
  </section>;

  if (embedded) return content;

  return (
    <>
      <AccountAvatar />
      <main className="doctor-page">
        <div className="doctor-page-shell">
          <section className="doctor-page-header">
            <div className="doctor-page-header-copy">
              <span>JOB DOCUMENTS</span>
              <h1>Credentials</h1>
              <p>Review your employment contract and keep your clinic documents accessible from one place.</p>
            </div>
            <div className="doctor-page-header-icon"><DescriptionRoundedIcon /></div>
          </section>
          {content}
        </div>
      </main>
    </>
  );
}