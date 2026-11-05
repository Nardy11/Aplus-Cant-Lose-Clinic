/*
 * Demo mode: an in-browser stand-in for the Express/MongoDB backend.
 *
 * It is installed as axios' default adapter (see ./install.js), so no component changes were needed.
 * Responses come from fixtures.json, which is recorded from the real backend by
 * Backend/scripts/record-demo-fixtures.js. Dates are shifted so the seeded appointments are always
 * in the future. Changes you make (book, cancel, ...) live in sessionStorage for the tab only.
 */
import { AxiosError } from "axios";
import raw from "./fixtures.json";

const DAY = 86400000;
const STORE_KEY = "clinic-demo-state-v1";
const ISO = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/;
const KEEP_DATES = new Set(["dBirth", "Dbirth", "birth", "dob"]); // birthdays don't move with the clock
const DEMO_PASSWORD = "Demo@1234"; // public: shown on the sign-in page
const HEX = /^[0-9a-f]{24}$/;

const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const shiftDays = Math.round((startOfDay(Date.now()) - startOfDay(raw.recordedAt)) / DAY);

function shifted(value, key) {
  if (typeof value === "string") {
    return ISO.test(value) && !KEEP_DATES.has(key) ? new Date(new Date(value).getTime() + shiftDays * DAY).toISOString() : value;
  }
  if (Array.isArray(value)) return value.map((v) => shifted(v, key));
  if (value && typeof value === "object") {
    const out = {};
    for (const k of Object.keys(value)) out[k] = shifted(value[k], k);
    return out;
  }
  return value;
}

function load() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || "null");
    if (saved && saved.recordedAt === raw.recordedAt && saved.day === startOfDay(Date.now())) return saved.get;
  } catch (e) { /* storage unavailable: start fresh */ }
  return shifted(raw.get);
}
const get = load();
const logins = shifted(raw.logins);

const persist = () => {
  try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ recordedAt: raw.recordedAt, day: startOfDay(Date.now()), get })); } catch (e) { /* ignore */ }
};

// ---------- small helpers ----------
const newId = () => Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
const clone = (v) => JSON.parse(JSON.stringify(v));
const hexIds = (path) => path.split("/").filter((s) => HEX.test(s));

function walk(node, fn) {
  if (Array.isArray(node)) node.forEach((n) => walk(n, fn));
  else if (node && typeof node === "object") { fn(node); Object.values(node).forEach((v) => walk(v, fn)); }
}
const everywhere = (fn) => Object.values(get).forEach((v) => walk(v, fn));

function removeById(id) {
  const strip = (node) => {
    if (Array.isArray(node)) {
      for (let i = node.length - 1; i >= 0; i--) {
        if (node[i] && node[i]._id === id) node.splice(i, 1);
        else strip(node[i]);
      }
    } else if (node && typeof node === "object") Object.values(node).forEach(strip);
  };
  Object.values(get).forEach(strip);
}
const setWhere = (id, patch) => everywhere((o) => { if (o._id === id) Object.assign(o, patch); });
const findFirst = (pred) => { let hit = null; everywhere((o) => { if (!hit && pred(o)) hit = o; }); return hit; };
const listKeys = (needle) => Object.keys(get).filter((k) => k.includes(needle));

// ---------- booking ----------
function bookSlot({ slotId, patientId, amount }) {
  const slot = findFirst((o) => o._id === slotId && o.startDate && o.drID);
  if (!slot) return false;
  const booked = { ...clone(slot), status: "upcoming", pID: patientId };
  removeById(slotId);
  const mine = get[`/patient/viewAppoints/${patientId}`];
  if (mine && Array.isArray(mine.Appointments)) mine.Appointments.push(booked);
  const dr = booked.drID && booked.drID._id;
  const theirs = dr && get[`/doctor/appointmentPatients/${dr}`];
  if (Array.isArray(theirs)) {
    const patient = findFirst((o) => o._id === patientId && o.username);
    theirs.push({ ...clone(booked), drID: dr, pID: patient ? clone(patient) : patientId });
  }
  if (amount) {
    const w = get[`/patient/viewWallet/${patientId}`];
    if (w && w.patient) {
      w.patient.wallet = Math.max(0, (w.patient.wallet || 0) - amount);
      (w.patient.walletTransactions = w.patient.walletTransactions || []).push({
        amount, balanceAfter: w.patient.wallet, direction: "debit", type: "appointment_payment",
        description: `Appointment with Dr. ${booked.drID.name || ""}`.trim(), timestamp: new Date().toISOString(),
      });
    }
  }
  return true;
}

// ---------- request handling ----------
const NOTE = "Demo mode: this change only lasts for this browser tab.";
const ok = (data = { message: NOTE }, status = 200) => ({ status, data });
const fail = (status, data) => ({ status, data });

function parseBody(data) {
  if (!data) return {};
  if (typeof data === "string") { try { return JSON.parse(data); } catch (e) { return {}; } }
  if (typeof FormData !== "undefined" && data instanceof FormData) { const o = {}; data.forEach((v, k) => { o[k] = typeof v === "string" ? v : "[file]"; }); return o; }
  return typeof data === "object" ? data : {};
}

function handle(method, path, body, config) {
  const ids = hexIds(path);
  const last = ids[ids.length - 1];

  if (method === "POST" && path === "/login") {
    const entry = logins[body.username];
    if (!entry || body.password !== DEMO_PASSWORD) return fail(401, { error: "Invalid credentials" });
    return ok(clone(entry), 201);
  }
  if (path === "/logout") return ok({ message: "Logged out" });

  if (method === "GET") {
    if (path in get) return ok(clone(get[path]));
    if (/\/(download|downloadf)\//.test(path) || config.responseType === "blob") {
      return ok(new Blob(["This is a sample file from the demo."], { type: "text/plain" }));
    }
    if (path.startsWith("/patient/delete/")) { removeById(ids[0]); return ok(); }
    if (path.startsWith("/patient/checkout/confirm/")) return ok({ paid: true, status: "paid", message: "Payment confirmed (demo)" });
    return fail(404, { message: "Not available in the demo", error: "Not available in the demo" });
  }

  // Writes ------------------------------------------------------------------------------------------
  if (/CancelAppointment/.test(path)) { setWhere(ids[0], { status: "cancelled" }); persist(); return ok({ message: "Appointment cancelled" }); }
  if (/payAppWithWallet/.test(path)) {
    const done = bookSlot({ slotId: body.appointmentID, patientId: body.patientID, amount: Number(body.amount) || 0 });
    persist();
    return done ? ok({ message: "Appointment booked" }) : fail(400, { message: "That time was just taken. Pick another one." });
  }
  if (/checkout\/visit/.test(path)) {
    bookSlot({ slotId: body.appointmentId, patientId: body.payerId, amount: 0 });
    persist();
    return ok({ url: `${window.location.origin}${process.env.PUBLIC_URL || ""}/Appointments` });
  }
  if (/checkout\/plan/.test(path)) return ok({ url: `${window.location.origin}${process.env.PUBLIC_URL || ""}/ViewHealthPackage` });
  if (/addAppointmentSlot/.test(path)) {
    const drId = ids[0];
    const dr = findFirst((o) => o._id === drId && o.speciality);
    const slot = { _id: newId(), startDate: body.startDate, endDate: body.endDate, drID: dr ? clone(dr) : drId, status: "Not_Reserved" };
    Object.keys(get).filter((k) => k.startsWith("/patient/freeAppiontmentSlot/")).forEach((k) => {
      const list = get[k].Appointments;
      if (Array.isArray(list) && list[0] && list[0].drID && list[0].drID._id === drId) list.push(slot);
    });
    persist();
    return ok({ message: "Slot added", appointment: slot }, 201);
  }
  if (/\/seen-all$/.test(path)) { everywhere((o) => { if (Array.isArray(o.notifications)) o.notifications.forEach((n) => { n.seen = true; }); }); persist(); return ok(); }
  if (/\/seen$/.test(path)) { setWhere(ids[ids.length - 1], { seen: true }); persist(); return ok(); }
  if (method === "DELETE" || /reject(FollowUp)/.test(path) || /acceptFollowUp/.test(path)) {
    if (last) removeById(last);
    persist();
    return ok({ message: "Done" });
  }
  if (/addPack$/.test(path)) {
    const pack = { _id: newId(), ...body };
    (get["/admin/viewHealthP"].HealthPack = get["/admin/viewHealthP"].HealthPack || []).push(pack);
    persist();
    return ok({ message: "Package added", HealthPack: pack }, 201);
  }
  if (/updatePack/.test(path)) { setWhere(last, body); persist(); return ok({ message: "Package updated" }); }
  if (/familyMember/.test(path) && method === "PATCH") { setWhere(ids[1] || last, body); persist(); return ok(); }
  if (/sendResetEmail|sendAcceptEmail|sendRejectEmail/.test(path)) return ok({ message: "Email sent (demo)" });
  if (/\/message$/.test(path) && method === "POST") return ok({ _id: newId(), content: body.content, createdAt: new Date().toISOString() });
  return ok({ message: NOTE }, method === "POST" ? 201 : 200);
}

export default function demoAdapter(config) {
  return new Promise((resolve, reject) => {
    const url = new URL(config.url, window.location.origin);
    const path = url.pathname.replace(/^.*?\/api(?=\/|$)/, "") || "/";
    const result = handle((config.method || "get").toUpperCase(), path, parseBody(config.data), config);
    const response = { data: result.data, status: result.status, statusText: String(result.status), headers: {}, config, request: {} };
    setTimeout(() => {
      if (result.status >= 200 && result.status < 300) resolve(response);
      else reject(new AxiosError(`Request failed with status code ${result.status}`, result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST, config, {}, response));
    }, 120);
  });
}
