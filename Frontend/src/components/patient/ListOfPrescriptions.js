import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Button, IconButton, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import { API_URL } from "../../Consts";
import DownloadPage from "./DownloadP";
import PrescriptionSheet from "../common/PrescriptionSheet";
import AccountAvatar from "../Authentication/AccountAvatar";
import { SnackbarContext } from "../../App";
import { viewPrescriptions } from "../../features/patientSlice";
import { Page, PageHead, StatusChip, EmptyState, Skeleton } from "../../design/ui";
import { formatDate, formatMoney } from "../../design/format";

const totalOf = (p) => (p?.meds || []).reduce((sum, m) => sum + Number(m.medID?.price || 0), 0);

export default function ListOfPrescriptions() {
  const dispatch = useDispatch();
  const location = useLocation();
  const snackbarMessage = useContext(SnackbarContext);
  const patientId = useSelector((state) => state.user.id);
  const rows = useSelector((state) => state.patient.presc);
  const focusedId = new URLSearchParams(location.search).get("prescriptionId");

  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [viewing, setViewing] = useState(null);
  const [paying, setPaying] = useState(null);
  const [busy, setBusy] = useState(false);
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    if (!patientId) return;
    dispatch(viewPrescriptions(patientId)).finally(() => setLoaded(true));
  }, [dispatch, patientId]);

  useEffect(() => {
    if (!patientId) return;
    axios.get(`${API_URL}/patient/profile/${patientId}`).then((r) => setPatientName(r.data?.name || "")).catch(() => {});
  }, [patientId]);

  const list = Array.isArray(rows) ? rows : [];

  useEffect(() => {
    if (!focusedId || !list.length) return;
    const target = list.find((r) => r._id === focusedId);
    if (target) setViewing(target);
  }, [focusedId, list.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list
      .filter((r) => !status || (status === "filled" ? r.status === "filled" : r.status !== "filled"))
      .filter((r) => !q || r.doctorID?.name?.toLowerCase().includes(q) || r.doctorID?.speciality?.toLowerCase().includes(q) || (r.meds || []).some((m) => m.medID?.name?.toLowerCase().includes(q)))
      .sort((a, b) => new Date(b.datePrescribed) - new Date(a.datePrescribed));
  }, [list, search, status]);

  const pay = async () => {
    setBusy(true);
    try {
      const r = await axios.post(`${API_URL}/patient/payPrescriptionWithWallet/${paying._id}/${patientId}`);
      snackbarMessage(`Paid ${formatMoney(r.data?.total ?? totalOf(paying))} from your wallet. Prescription filled.`, "success");
      if (viewing?._id === paying._id) setViewing(r.data?.prescription || null);
      setPaying(null);
      dispatch(viewPrescriptions(patientId));
    } catch (e) {
      snackbarMessage(e.response?.data?.error || "Payment didn't go through. Check your wallet balance.", "error");
    } finally {
      setBusy(false);
    }
  };

  const filtering = Boolean(search || status);

  return (
    <>
      <AccountAvatar />
      <Page>
        <PageHead title="Prescriptions" lead="Medicines your doctors prescribed. Pay from your wallet to have them filled." />

        <section className="ui-card" style={{ marginBottom: 20 }}>
          <div className="ui-toolbar" style={{ borderBottom: 0 }}>
            <div className="ui-field">
              <label htmlFor="rx-search">Doctor or medicine</label>
              <div className="ui-input-wrap">
                <SearchRoundedIcon />
                <input id="rx-search" className="ui-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" />
              </div>
            </div>
            <div className="ui-field" style={{ flex: "0 1 220px" }}>
              <label htmlFor="rx-status">Status</label>
              <select id="rx-status" className="ui-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All</option>
                <option value="unfilled">Not filled</option>
                <option value="filled">Filled</option>
              </select>
            </div>
            {filtering && <button type="button" className="ui-btn ui-btn--ghost" onClick={() => { setSearch(""); setStatus(""); }}>Clear filters</button>}
          </div>
        </section>

        {!loaded && !list.length ? (
          <Skeleton height={150} count={2} />
        ) : !shown.length ? (
          <div className="ui-card">
            <EmptyState
              icon={<MedicationRoundedIcon />}
              title={filtering ? "No prescriptions match" : "No prescriptions yet"}
              text={filtering ? "Clear the filters to see all your prescriptions." : "After a visit, prescriptions from your doctor appear here."}
              action={!filtering && <Link to="/DoctorsList" className="ui-btn">Find a doctor</Link>}
            />
          </div>
        ) : (
          <div className="ui-grid ui-grid-2">
            {shown.map((p) => {
              const total = totalOf(p);
              const filled = p.status === "filled";
              return (
                <article key={p._id} className={`ui-card rx-card ${focusedId === p._id ? "rx-card--focus" : ""}`}>
                  <header className="rx-head">
                    <div>
                      <h3>Dr. {p.doctorID?.name || "Unknown doctor"}</h3>
                      <p>{[p.doctorID?.speciality, formatDate(p.datePrescribed)].filter(Boolean).join(", ")}</p>
                    </div>
                    <StatusChip status={filled ? "filled" : "unfilled"} />
                  </header>
                  <ul className="rx-meds">
                    {(p.meds || []).map((m, i) => (
                      <li key={m._id || i}>
                        <MedicationRoundedIcon />
                        <span>
                          <strong>{m.medID?.name || "Medicine"}</strong>
                          <span>{m.dosage}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <footer className="rx-foot">
                    <div className="ui-price">
                      <strong>{formatMoney(total)}</strong>
                      <span>{filled ? "Paid" : "Total for medicines"}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" className="ui-btn ui-btn--sm" onClick={() => setViewing(p)}>View</button>
                      {!filled && total > 0 && (
                        <button type="button" className="ui-btn ui-btn--sm ui-btn--primary" onClick={() => setPaying(p)}>Pay {formatMoney(total)}</button>
                      )}
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </Page>

      <Dialog open={Boolean(viewing)} onClose={() => setViewing(null)} className="clinic-modern-dialog rx-sheet-dialog" maxWidth="md" fullWidth>
        {viewing && (
          <>
            <DialogContent className="rx-sheet-content">
              <IconButton className="clinic-dialog-close rx-sheet-close" onClick={() => setViewing(null)} aria-label="Close"><CloseRoundedIcon /></IconButton>
              <PrescriptionSheet id="pagetodownload" prescription={viewing} patientName={patientName} />
            </DialogContent>
            <DialogActions className="clinic-dialog-actions rx-sheet-actions">
              <DownloadPage rootElementId="pagetodownload" downloadFileName={`prescription-${String(viewing._id).slice(-6)}`} />
              {viewing.status !== "filled" && totalOf(viewing) > 0 ? (
                <Button className="clinic-dialog-primary" onClick={() => setPaying(viewing)}>Pay {formatMoney(totalOf(viewing))}</Button>
              ) : (
                <Button className="clinic-dialog-primary" onClick={() => setViewing(null)}>Done</Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={Boolean(paying)} onClose={() => !busy && setPaying(null)} className="clinic-modern-dialog prescription-checkout-dialog" maxWidth="xs" fullWidth>
        <DialogTitle className="clinic-dialog-title">
          <div><span>CHECKOUT</span><h2>Pay for medicines</h2></div>
          <IconButton className="clinic-dialog-close" onClick={() => !busy && setPaying(null)} aria-label="Close"><CloseRoundedIcon /></IconButton>
        </DialogTitle>
        <div className="prescription-checkout-body">
          <p>The total is taken from your clinic wallet and the prescription is marked as filled.</p>
          <div className="prescription-checkout-total"><span>Total</span><strong>{formatMoney(totalOf(paying))}</strong></div>
        </div>
        <div className="clinic-dialog-actions">
          <Button className="clinic-dialog-cancel" onClick={() => setPaying(null)} disabled={busy}>Cancel</Button>
          <Button className="clinic-dialog-primary" onClick={pay} disabled={busy}>{busy ? "Paying..." : "Pay from wallet"}</Button>
        </div>
      </Dialog>
    </>
  );
}
