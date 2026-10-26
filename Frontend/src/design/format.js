// Display helpers shared by every page, so raw values never reach the screen.

const LOCALE = "en-GB";

const toDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatTime = (value) => {
  const d = toDate(value);
  return d ? d.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", hour12: false }) : "--:--";
};

export const formatDate = (value, opts = {}) => {
  const d = toDate(value);
  return d ? d.toLocaleDateString(LOCALE, { day: "numeric", month: "short", year: "numeric", ...opts }) : "Date not set";
};

export const formatDateTime = (value) => {
  const d = toDate(value);
  return d ? `${formatDate(d)}, ${formatTime(d)}` : "Date not set";
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// "Today", "Tomorrow", "Yesterday", or "Tue 27 Oct".
export const relativeDay = (value) => {
  const d = toDate(value);
  if (!d) return "";
  const diff = Math.round((startOfDay(d) - startOfDay(new Date())) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return d.toLocaleDateString(LOCALE, { weekday: "short", day: "numeric", month: "short" });
};

export const dayKey = (value) => {
  const d = toDate(value);
  return d ? startOfDay(d).toISOString() : "none";
};

// Birthdays are stored as UTC midnight; reading them in local time shifts the day.
export const formatBirthDate = (value) => {
  const d = toDate(value);
  return d ? d.toLocaleDateString(LOCALE, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "Not provided";
};

export const ageFrom = (value) => {
  const d = toDate(value);
  if (!d) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age -= 1;
  return age;
};

export const formatMoney = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "EGP 0";
  return `EGP ${Math.round(n).toLocaleString(LOCALE)}`;
};

// Session price rule shared with the backend's /calculateAmount:
// doctor's hourly rate + 10% clinic markup, minus the package's doctor discount.
export const sessionPrice = (rate, discountPercent = 0) =>
  Math.round(Number(rate || 0) * 1.1 * (1 - Number(discountPercent || 0) / 100));

const STATUS = {
  upcoming: { label: "Upcoming", tone: "accent" },
  rescheduled: { label: "Rescheduled", tone: "warn" },
  completed: { label: "Completed", tone: "ok" },
  cancelled: { label: "Cancelled", tone: "danger" },
  not_reserved: { label: "Open slot", tone: "neutral" },
  filled: { label: "Filled", tone: "ok" },
  unfilled: { label: "Not filled", tone: "warn" },
  pending: { label: "Pending", tone: "warn" },
  accepted: { label: "Accepted", tone: "ok" },
  rejected: { label: "Rejected", tone: "danger" },
  subscribed: { label: "Active", tone: "ok" },
  unsubscribed: { label: "Not subscribed", tone: "neutral" },
};

export const statusInfo = (raw) => {
  const key = String(raw || "").trim().toLowerCase();
  return STATUS[key] || { label: key ? key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : "Unknown", tone: "neutral" };
};

const NOTIFICATION_TITLES = {
  AppointmentScheduled: "Appointment booked",
  AppointmentRescheduled: "Appointment rescheduled",
  AppointmentCanceled: "Appointment cancelled",
  info: "Update",
};

const ENTITY_TITLES = {
  Prescription: "New prescription",
  HealthPackage: "Plan update",
  HealthRecord: "Health record added",
  FollowUp: "Follow-up",
  FamilyMember: "Family update",
  Patient: "Patient update",
  Doctor: "Doctor update",
};

// Specific types win; generic "info" falls back to what the notification is about.
export const notificationTitle = (type, entityType) =>
  (type && type !== "info" && NOTIFICATION_TITLES[type]) || ENTITY_TITLES[entityType] || NOTIFICATION_TITLES[type] || "Update";

export const initials = (name) =>
  String(name || "")
    .replace(/^dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("") || "?";

export const isBooked = (appointment) => Boolean(appointment?.pID) && statusInfo(appointment?.status).label !== "Open slot";

export const isUpcoming = (appointment) => {
  const s = String(appointment?.status || "").toLowerCase();
  const d = toDate(appointment?.startDate);
  return (s === "upcoming" || s === "rescheduled") && Boolean(appointment?.pID) && (!d || d >= startOfDay(new Date()));
};

export const byStart = (a, b) => (toDate(a?.startDate)?.getTime() || 0) - (toDate(b?.startDate)?.getTime() || 0);
