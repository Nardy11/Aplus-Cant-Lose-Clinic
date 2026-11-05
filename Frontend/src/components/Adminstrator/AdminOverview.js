import React from "react";
import { useSelector } from "react-redux";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { EmptyState, PageHead } from "../../design/ui";
import { formatMoney } from "../../design/format";
import { RequestCard } from "./AdminRequests";
import { plural } from "./adminParts";

export default function AdminOverview({ go }) {
  const { pdoctors, jdoctors, patients, hpackages } = useSelector((s) => s.admin);
  const pending = pdoctors || [];
  const packs = hpackages || [];

  const stats = [
    { key: "patients", label: "Patients", value: (patients || []).length },
    { key: "doctors", label: "Doctors", value: (jdoctors || []).length },
    { key: "requests", label: "Join requests", value: pending.length, hot: pending.length > 0 },
    { key: "packages", label: "Health packages", value: packs.length },
  ];

  return (
    <>
      <PageHead title="Overview" lead="What needs a decision, and how the clinic looks right now." />

      <div className="adm-stats">
        {stats.map((s) => (
          <button type="button" key={s.key} className={`adm-stat ${s.hot ? "adm-stat--hot" : ""}`} onClick={() => go(s.key)}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div className="adm-overview-grid">
        <section aria-labelledby="adm-next">
          <div className="adm-block-head">
            <h2 id="adm-next" className="ui-section-title">Needs your decision</h2>
            {pending.length > 1 && (
              <button type="button" className="adm-link" onClick={() => go("requests")}>
                See all {pending.length} requests
              </button>
            )}
          </div>
          {pending.length === 0 ? (
            <div className="ui-card">
              <EmptyState icon={<TaskAltRoundedIcon />} title="You're all caught up" text="No doctors are waiting for a review." />
            </div>
          ) : (
            <>
              <RequestCard doctor={pending[0]} compact />
              {pending.length > 1 && <p className="adm-after">{plural(pending.length - 1, "more request")} waiting after this one.</p>}
            </>
          )}
        </section>

        <section aria-labelledby="adm-packs" className="ui-card">
          <div className="ui-card-head">
            <h2 id="adm-packs" className="ui-section-title">Packages on sale</h2>
            <button type="button" className="adm-link" onClick={() => go("packages")}>Manage</button>
          </div>
          {packs.length === 0 ? (
            <EmptyState title="No packages yet" text="Add one so patients can save on visits." />
          ) : (
            <ul className="adm-list">
              {packs.map((p) => (
                <li key={p._id}>
                  <div className="adm-pack-line">
                    <strong>{p.type}</strong>
                    <span>{p.doctorDisc}% off visits, {p.medicineDisc}% off medicine</span>
                  </div>
                  <span className="adm-price">{formatMoney(p.rate)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
