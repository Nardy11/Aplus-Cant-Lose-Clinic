import React from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { formatTime, relativeDay, statusInfo, initials } from "./format";

export function Page({ children, className = "" }) {
  return <main className={`ui-page ${className}`}>{children}</main>;
}

export function PageHead({ title, lead, actions, back }) {
  const navigate = useNavigate();
  return (
    <>
      {back && (
        <button type="button" className="ui-back" onClick={() => navigate(back === true ? -1 : back)}>
          <ArrowBackRoundedIcon /> Back
        </button>
      )}
      <div className="ui-page-head">
        <div>
          <h1 className="ui-title">{title}</h1>
          {lead && <p className="ui-lead">{lead}</p>}
        </div>
        {actions && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{actions}</div>}
      </div>
    </>
  );
}

export function StatusChip({ status, children }) {
  const { label, tone } = statusInfo(status);
  return <span className={`ui-chip ui-chip--${tone}`}>{children || label}</span>;
}

// The signature: a visit leads with its time, then who and what.
export function VisitCard({ start, title, subtitle, status, actions, feature = false, open = false, muted = false, children }) {
  const cls = ["ui-visit", feature && "ui-visit--feature", open && "ui-visit--open", muted && "ui-visit--muted"].filter(Boolean).join(" ");
  return (
    <article className={cls}>
      <div className="ui-visit-time">
        <strong>{formatTime(start)}</strong>
        <span>{relativeDay(start)}</span>
      </div>
      <div className="ui-visit-body">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
        {(status || children) && (
          <div className="ui-visit-meta">
            {status && <StatusChip status={status} />}
            {children}
          </div>
        )}
      </div>
      {actions && <div className="ui-visit-actions">{actions}</div>}
    </article>
  );
}

export function EmptyState({ icon, title, text, action }) {
  return (
    <div className="ui-empty">
      {icon && <div className="ui-empty-icon">{icon}</div>}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ height = 76, count = 3, gap = 10 }) {
  return (
    <div style={{ display: "grid", gap }} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ui-skeleton" style={{ height }} />
      ))}
    </div>
  );
}

export function Avatar({ name, src, size }) {
  return (
    <span className={`ui-avatar ${size === "lg" ? "ui-avatar--lg" : ""}`} aria-hidden="true">
      {src ? <img src={src} alt="" /> : initials(name)}
    </span>
  );
}
