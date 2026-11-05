/*
 * Records the backend's real responses into Frontend/src/demo/fixtures.json so the frontend can run
 * with no backend at all ("demo mode", used for the GitHub Pages site).
 *
 *   1. Seed a throwaway DB:     npm run seed            (plus an admin: see README "Demo mode")
 *   2. Start the backend on it: MONGO_URI=... npm start
 *   3. Record:                  node scripts/record-demo-fixtures.js [http://localhost:10000/api]
 *
 * Only GET responses (and the login payloads) are stored; the demo mock replays them and shifts the
 * dates so appointments are always "upcoming" no matter when the site is opened.
 */
const fs = require("fs");
const path = require("path");

const API = process.argv[2] || "http://localhost:10000/api";
const PASSWORD = "Demo@1234";
const OUT = path.join(__dirname, "..", "..", "Frontend", "src", "demo", "fixtures.json");

const PATIENTS = ["nour.patient", "youssef.patient"];
const DOCTORS = ["dr.hany", "dr.mariam", "dr.omar"];
const ADMIN = "admin.demo";

const fixtures = { recordedAt: new Date().toISOString(), logins: {}, get: {} };

async function call(method, url, body) {
  const res = await fetch(API + url, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

async function rec(url) {
  const r = await call("GET", url);
  if (r.status >= 400) {
    console.warn(`  skip ${url} -> ${r.status}`);
    return null;
  }
  fixtures.get[url] = r.data;
  return r.data;
}

(async () => {
  for (const u of [...PATIENTS, ...DOCTORS, ADMIN]) {
    const r = await call("POST", "/login", { username: u, password: PASSWORD });
    if (r.status >= 400) throw new Error(`login failed for ${u}: ${r.status}`);
    fixtures.logins[u] = r.data;
  }
  const idOf = (u) => fixtures.logins[u].userData.fUser._id;
  const logIdOf = (u) => fixtures.logins[u].userData.logId;

  // shared lookups
  const doctors = (await rec("/patient/getAlldoctors")) || [];
  await rec("/admin/viewMedicine");
  const packs = ((await rec("/admin/viewHealthP")) || {}).HealthPack || [];
  await rec("/user/users");
  for (const d of doctors) {
    if (d.username) await rec(`/doctor/publicProfile/${encodeURIComponent(d.username)}`);
    await rec(`/patient/freeAppiontmentSlot/${d._id}`);
  }

  for (const u of PATIENTS) {
    const id = idOf(u);
    for (const p of [
      `/patient/${id}/notifications`, `/patient/MyDoctors/${id}`, `/patient/profile/${id}`,
      `/patient/viewAppoints/${id}`, `/patient/viewFamilyMembers/${id}`, `/patient/viewHealthPackagesPatient/${id}`,
      `/patient/viewWallet/${id}`, `/patient/getAllFiles/${id}`, `/patient/viewPatientHealthRecords/${id}`,
      `/chat/${logIdOf(u)}`,
    ]) await rec(p);
    const rx = (await rec(`/patient/viewPrescriptions/${id}`)) || [];
    for (const r of Array.isArray(rx) ? rx : rx.prescriptions || []) await rec(`/patient/viewSpecificPrescription/${r._id}`);
    for (const d of doctors) await rec(`/patient/calculateAmount/${d._id}/${id}`);
    for (const p of packs) await rec(`/patient/healthPackageInfo/${id}/${p._id}`);
  }

  for (const u of DOCTORS) {
    const id = idOf(u);
    for (const p of [
      `/doctor/${id}/notifications`, `/doctor/FollowUpRequests/${id}`, `/doctor/Mypatients/${id}`,
      `/doctor/appointmentPatients/${id}`, `/doctor/getContract/${id}`, `/doctor/getDr/${id}`, `/doctor/getPatients/${id}`,
      `/doctor/getPatientsByDoctorId/${id}`, `/doctor/patientsInUpcomingApointments/${id}`, `/doctor/viewWallet/${id}`,
      `/chat/${logIdOf(u)}`,
    ]) await rec(p);
  }

  for (const p of ["viewAdmin", "viewHealthP", "viewJoinedDr", "viewMedicine", "viewPatients", "viewPendDr"]) await rec(`/admin/${p}`);

  // never ship credentials, even demo hashes
  const strip = (v) => { if (Array.isArray(v)) v.forEach(strip); else if (v && typeof v === "object") { delete v.password; Object.values(v).forEach(strip); } };
  strip(fixtures);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(fixtures));
  console.log(`Recorded ${Object.keys(fixtures.get).length} responses for ${Object.keys(fixtures.logins).length} users -> ${OUT}`);
})().catch((e) => { console.error(e); process.exit(1); });
