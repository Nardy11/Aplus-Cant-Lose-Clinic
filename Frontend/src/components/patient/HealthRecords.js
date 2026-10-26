import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import FolderSharedRoundedIcon from "@mui/icons-material/FolderSharedRounded";
import { API_URL } from "../../Consts.js";
import AccountAvatar from "../Authentication/AccountAvatar.js";
import MedHistList from "./MedHistList.js";
import { Page, PageHead, EmptyState, Skeleton } from "../../design/ui";
import { formatDate } from "../../design/format";

const FACTS = [
  ["primaryDiagnosis", "Diagnosis"],
  ["treatment", "Treatment"],
  ["labResults", "Lab results"],
  ["medicalInformation", "Notes"],
];

function HealthRecords() {
  const { id, role } = useSelector((state) => state.user);
  const [records, setRecords] = useState(null);

  useEffect(() => {
    if (!id) return;
    axios.get(`${API_URL}/patient/viewPatientHealthRecords/${id}`)
      .then((r) => {
        const list = r.data?.HealthRecords?.healthRecords || [];
        setRecords([...list].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)));
      })
      .catch(() => setRecords([]));
  }, [id]);

  if (role !== "patient") return <Link to="/Login" className="login-fallback">Sign in</Link>;

  return (
    <>
      <AccountAvatar />
      <Page>
        <PageHead title="Health records" lead="What your doctors recorded after your visits, and the documents you keep here." />

        <section style={{ display: "grid", gap: 12, marginBottom: 32 }}>
          <h2 className="ui-section-title">From your doctors</h2>
          {!records ? (
            <Skeleton height={130} count={2} />
          ) : records.length === 0 ? (
            <div className="ui-card">
              <EmptyState icon={<FolderSharedRoundedIcon />} title="No records yet" text="After a visit, your doctor can add a diagnosis, treatment and lab results here." />
            </div>
          ) : (
            <div className="ui-grid ui-grid-2">
              {records.map((r) => (
                <article className="ui-card hr-card" key={r._id}>
                  <header>
                    <h3>{r.description || "Health record"}</h3>
                    <span className="ui-chip">{formatDate(r.date)}</span>
                  </header>
                  <dl>
                    {FACTS.filter(([key]) => r[key]).map(([key, label]) => (
                      <div key={key}>
                        <dt>{label}</dt>
                        <dd>{r[key]}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
          )}
        </section>

        <MedHistList />
      </Page>
    </>
  );
}

export default HealthRecords;
