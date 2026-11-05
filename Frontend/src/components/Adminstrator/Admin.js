import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { Skeleton } from "../../design/ui";
import "./admin.css";
import { useAdminData } from "./adminParts";
import AdminOverview from "./AdminOverview";
import AdminRequests from "./AdminRequests";
import { AdminDoctors, AdminPatients } from "./AdminPeople";
import AdminPackages from "./AdminPackages";
import AdminTeam from "./AdminTeam";

const SECTIONS = [
  { key: "overview", label: "Overview", Icon: DashboardRoundedIcon },
  { key: "requests", label: "Join requests", Icon: HowToRegRoundedIcon, count: "pdoctors" },
  { key: "doctors", label: "Doctors", Icon: MedicalServicesRoundedIcon, count: "jdoctors" },
  { key: "patients", label: "Patients", Icon: PeopleAltRoundedIcon, count: "patients" },
  { key: "packages", label: "Health packages", Icon: WorkspacePremiumRoundedIcon, count: "hpackages" },
  { key: "team", label: "Administrators", Icon: AdminPanelSettingsRoundedIcon, count: "admins" },
];

export default function Admin() {
  const [params, setParams] = useSearchParams();
  const admin = useSelector((s) => s.admin);
  const { loaded, failed, reload } = useAdminData();
  const navRef = useRef(null);

  const current = SECTIONS.some((s) => s.key === params.get("section")) ? params.get("section") : "overview";
  // On phones the rail scrolls sideways; keep the active tab in view.
  const currentKey = params.get("section");
  useEffect(() => {
    const el = navRef.current && navRef.current.querySelector(".is-current");
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest", inline: "center" });
  }, [currentKey]);

  const go = (key) => {
    setParams(key === "overview" ? {} : { section: key });
    window.scrollTo({ top: 0 });
  };

  const body = {
    overview: <AdminOverview go={go} />,
    requests: <AdminRequests />,
    doctors: <AdminDoctors />,
    patients: <AdminPatients />,
    packages: <AdminPackages />,
    team: <AdminTeam />,
  }[current];

  return (
    <div className="adm-shell">
      <nav className="adm-nav" aria-label="Admin sections" ref={navRef}>
        {SECTIONS.map(({ key, label, Icon, count }) => {
          const n = count ? (admin[count] || []).length : null;
          const hot = key === "requests" && n > 0;
          return (
            <button
              type="button"
              key={key}
              className={`adm-nav-item ${current === key ? "is-current" : ""} ${hot ? "is-hot" : ""}`}
              aria-current={current === key ? "page" : undefined}
              onClick={() => go(key)}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {loaded && n !== null && <em>{n}</em>}
            </button>
          );
        })}
      </nav>

      <main className="adm-main">
        {!loaded ? (
          <Skeleton height={72} count={5} />
        ) : failed ? (
          <div className="ui-card ui-card-pad adm-failed" role="alert">
            <strong>Some of the clinic data did not load.</strong>
            <p>Check your connection, then try again.</p>
            <button type="button" className="ui-btn ui-btn--primary" onClick={reload}>Try again</button>
          </div>
        ) : (
          body
        )}
      </main>
    </div>
  );
}
