import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import download from "downloadjs";
import { useSelector } from "react-redux";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { API_URL } from "../../Consts.js";
import { SnackbarContext } from "../../App";
import AccountAvatar from "../Authentication/AccountAvatar";
import { Page, PageHead, Skeleton } from "../../design/ui";

export default function ContractDetails({ embedded = false, onContractAccepted }) {
  const { id, role } = useSelector((state) => state.user);
  const notify = useContext(SnackbarContext);
  const [contractPath, setContractPath] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (role !== "doctor" || !id) return;
    axios.get(`${API_URL}/doctor/getContract/${id}`)
      .then((r) => { const c = r.data.contract || {}; setContractPath(c.file || null); setAccepted(Boolean(c.accepted)); })
      .catch(() => setContractPath(null))
      .finally(() => setLoading(false));
  }, [id, role]);

  const acceptContract = async () => {
    setBusy(true);
    try {
      await axios.put(`${API_URL}/doctor/acceptContract/${id}`);
      setAccepted(true);
      notify?.("Contract accepted.", "success");
      onContractAccepted?.();
    } catch {
      notify?.("The contract couldn't be accepted. Try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  const downloadContract = async () => {
    try {
      const r = await axios.get(`${API_URL}/doctor/download/${id}`, { responseType: "blob" });
      download(r.data, "El7a2ny-Clinic-Contract.pdf", r.headers?.["content-type"] || "application/pdf");
    } catch {
      notify?.("The contract couldn't be downloaded. Try again.", "error");
    }
  };

  if (role !== "doctor") return null;

  // What is true about the contract, in plain words.
  const state = loading
    ? null
    : contractPath && !accepted
      ? { chip: ["warn", "Waiting for you"], text: "The clinic sent your contract. Read it, then accept it." }
      : accepted
        ? { chip: ["ok", "Accepted"], text: contractPath ? "You accepted your contract. Download a copy any time." : "Your contract is accepted. The clinic hasn't attached a copy; ask them if you need one." }
        : { chip: ["neutral", "Not sent yet"], text: "The clinic hasn't sent your contract yet. Check back here later." };

  const content = (
    <section className="ui-card ui-card-pad contract-card">
      <div className="contract-head">
        <span className="ui-row-icon"><DescriptionRoundedIcon /></span>
        <div>
          <h2 className="ui-section-title">Employment contract</h2>
          {state ? <p>{state.text}</p> : <Skeleton height={18} count={1} />}
        </div>
        {state && <span className={`ui-chip ui-chip--${state.chip[0]}`}>{state.chip[1]}</span>}
      </div>
      {contractPath && (
        <div className="contract-actions">
          <button type="button" className="ui-btn" onClick={downloadContract}><DownloadRoundedIcon /> Download</button>
          {!accepted && <button type="button" className="ui-btn ui-btn--primary" onClick={acceptContract} disabled={busy}>{busy ? "Accepting..." : "Accept contract"}</button>}
        </div>
      )}
    </section>
  );

  if (embedded) return content;

  return (
    <>
      <AccountAvatar />
      <Page>
        <PageHead title="Credentials" lead="Your employment contract with the clinic." />
        {content}
      </Page>
    </>
  );
}
