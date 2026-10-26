import React from "react";
import { formatDate, formatMoney } from "../../design/format";

// The prescription as a document: letterhead, who and for whom, the medicines, a signature line and
// the clinic's seal (plus the pharmacy's seal once it has been paid and filled).
// `medActions(med)` lets the doctor's view put edit/remove buttons beside each medicine; those are
// marked data-html2canvas-ignore so they never end up in the downloaded PDF.
export default function PrescriptionSheet({ id, prescription, patientName, medActions }) {
  const rx = prescription || {};
  const doctor = rx.doctorID || {};
  const meds = rx.meds || [];
  const filled = rx.status === "filled";
  const total = meds.reduce((sum, m) => sum + Number(m.medID?.price || 0), 0);
  const number = String(rx._id || "").slice(-6).toUpperCase();

  return (
    <article id={id} className={`rxs ${filled ? "rxs--filled" : ""}`} aria-label="Prescription">
      <header className="rxs-head">
        <div className="rxs-brand">
          <img src="/brand-mark.png" alt="" />
          <div>
            <strong>El7a2ny</strong>
            <span>Virtual Clinic</span>
          </div>
        </div>
        <dl className="rxs-ref">
          <div><dt>Prescription</dt><dd>No. {number || "-"}</dd></div>
          <div><dt>Date</dt><dd>{formatDate(rx.datePrescribed)}</dd></div>
        </dl>
      </header>

      <section className="rxs-people">
        <div>
          <span className="rxs-label">Prescribed by</span>
          <strong>Dr. {doctor.name || "Unknown doctor"}</strong>
          {doctor.speciality && <span>{doctor.speciality}</span>}
          {doctor.affilation && <span>{doctor.affilation}</span>}
        </div>
        <div>
          <span className="rxs-label">Patient</span>
          <strong>{patientName || "Patient"}</strong>
          <span>{meds.length} {meds.length === 1 ? "medicine" : "medicines"}</span>
        </div>
      </section>

      <section className="rxs-body">
        <div className="rxs-rx" aria-hidden="true">&#8478;</div>
        <ul className="rxs-meds">
          {meds.map((m, i) => (
            <li key={m._id || m.medID?._id || i}>
              <div className="rxs-med-top">
                <strong>{m.medID?.name || "Medicine"}</strong>
                {m.medID?.price ? <span className="rxs-price">{formatMoney(m.medID.price)}</span> : null}
                {medActions ? <span className="rxs-actions" data-html2canvas-ignore="true">{medActions(m)}</span> : null}
              </div>
              {(m.medID?.activeElement || m.medID?.use) && (
                <p className="rxs-med-info">{[m.medID?.activeElement, m.medID?.use].filter(Boolean).join(", ")}</p>
              )}
              <p className="rxs-dosage"><span>How to take</span>{m.dosage || "As directed by your doctor"}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="rxs-foot">
        <div className="rxs-sign">
          <span className="rxs-line" />
          <strong>Dr. {doctor.name || ""}</strong>
          <small>Signed electronically</small>
        </div>
        <div className="rxs-stamps">
          <img className="rxs-stamp rxs-stamp--clinic" src="/Clinic%20Stamp.png" alt="El7a2ny Virtual Clinic seal" />
          {filled && <img className="rxs-stamp rxs-stamp--pharmacy" src="/Pharmacy%20Stamp.png" alt="El7a2ny Pharmacy seal" />}
        </div>
        <div className="rxs-total">
          <span>{filled ? "Paid" : "Total to pay"}</span>
          <strong>{total > 0 ? formatMoney(total) : "-"}</strong>
          <small className={filled ? "is-paid" : ""}>{filled ? "Filled by the pharmacy" : "Not filled yet"}</small>
        </div>
      </footer>
    </article>
  );
}
