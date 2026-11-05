import React, { useContext, useState } from "react";
import axios from "axios";
import download from "downloadjs";
import { useDispatch, useSelector } from "react-redux";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { API_URL } from "../../Consts";
import { SnackbarContext } from "../../App";
import { acceptDr, rejectDr, viewJoinedDr } from "../../features/adminSlice";
import { EmptyState, PageHead } from "../../design/ui";
import { ageFrom, formatMoney } from "../../design/format";
import { Person, plural, useConfirm } from "./adminParts";

export function RequestCard({ doctor, compact = false }) {
  const dispatch = useDispatch();
  const toast = useContext(SnackbarContext);
  const [busy, setBusy] = useState("");
  const [dialog, ask] = useConfirm();

  const docs = Array.isArray(doctor.docs) ? doctor.docs.length : 0;
  const age = ageFrom(doctor.Dbirth);

  const review = async (kind) => {
    setBusy(kind);
    try {
      await dispatch(kind === "accept" ? acceptDr(doctor._id) : rejectDr(doctor._id)).unwrap();
      if (kind === "accept") dispatch(viewJoinedDr());
      toast(kind === "accept" ? `Dr. ${doctor.name} was accepted. They will get an email.` : `${doctor.name}'s request was declined. They will get an email.`, "success");
    } catch (e) {
      toast("The email could not be sent, so nothing changed. Try again.", "error");
      setBusy("");
    }
  };

  const downloadDocs = async () => {
    setBusy("docs");
    try {
      const r = await axios.get(`${API_URL}/doctor/downloadf/${doctor._id}`, { responseType: "blob" });
      const match = String(r.headers?.["content-disposition"] || "").match(/filename="?([^"]+)"?/);
      download(r.data, match ? match[1] : `${doctor.username || "applicant"}-documents.zip`, r.headers?.["content-type"]);
    } catch (e) {
      toast("The documents could not be downloaded. Try again.", "error");
    }
    setBusy("");
  };

  return (
    <article className={`adm-request ${compact ? "adm-request--lead" : ""}`}>
      <header>
        <Person name={doctor.name} sub={`${doctor.speciality || "Speciality not given"}, ${doctor.affilation || "no affiliation"}`} />
        <span className="ui-chip ui-chip--warn">Waiting</span>
      </header>

      <dl className="adm-facts">
        <div><dt>Hourly rate</dt><dd>{formatMoney(doctor.rate)}</dd></div>
        <div><dt>Age</dt><dd>{age ? `${age}, ${doctor.gender || "not given"}` : doctor.gender || "Not given"}</dd></div>
        <div><dt>Username</dt><dd>{doctor.username}</dd></div>
      </dl>

      {doctor.background && <p className="adm-request-bio">{doctor.background}</p>}

      <div className="adm-contact">
        {doctor.email && <span><MailOutlineRoundedIcon aria-hidden="true" />{doctor.email}</span>}
        {doctor.mobile && <span><PhoneRoundedIcon aria-hidden="true" />{doctor.mobile}</span>}
      </div>

      <footer>
        <button type="button" className="ui-btn ui-btn--ghost ui-btn--sm" onClick={downloadDocs} disabled={busy === "docs" || docs === 0}>
          <DownloadRoundedIcon />
          {docs === 0 ? "No documents uploaded" : `Download ${plural(docs, "document")}`}
        </button>
        <div className="adm-actions">
          <button
            type="button"
            className="ui-btn ui-btn--danger"
            disabled={Boolean(busy)}
            onClick={() =>
              ask({
                kicker: "DECLINE REQUEST",
                title: `Decline ${doctor.name}?`,
                message: "They will be told by email that their request was declined. This cannot be undone.",
                confirmLabel: "Decline request",
                onConfirm: () => review("reject"),
              })
            }
          >
            <CloseRoundedIcon /> Decline
          </button>
          <button type="button" className="ui-btn ui-btn--primary" disabled={Boolean(busy)} onClick={() => review("accept")}>
            <CheckRoundedIcon /> {busy === "accept" ? "Accepting..." : "Accept"}
          </button>
        </div>
      </footer>
      {dialog}
    </article>
  );
}

export default function AdminRequests() {
  const pending = useSelector((s) => s.admin.pdoctors) || [];
  return (
    <>
      <PageHead
        title="Join requests"
        lead="Doctors who applied to practice here. Check their documents, then accept or decline."
      />
      {pending.length === 0 ? (
        <div className="ui-card">
          <EmptyState
            icon={<TaskAltRoundedIcon />}
            title="No requests waiting"
            text="New doctor applications show up here as soon as someone signs up."
          />
        </div>
      ) : (
        <div className="adm-stack">
          {pending.map((d) => <RequestCard key={d._id} doctor={d} />)}
        </div>
      )}
    </>
  );
}
