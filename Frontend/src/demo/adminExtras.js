/*
 * Extra sample people for the admin screens only, so the tables and the review queue don't look empty.
 * They are merged on top of the recorded fixtures and never appear on the patient or doctor side.
 */
const hex = (n) => `5f0000000000000000000${String(n).padStart(3, "0")}`;
const born = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).toISOString();

const doctor = (n, extra) => ({
  contract: { accepted: false },
  _id: hex(n),
  gender: "female",
  walletTransactions: [],
  notifications: [],
  docs: [],
  wallet: 0,
  __v: 0,
  ...extra,
});

const files = (n) => Array.from({ length: n }, (_, i) => ({ _id: hex(900 + i), name: i === 0 ? "medical-license.pdf" : "graduation-certificate.pdf" }));

const PENDING = [
  doctor(11, {
    name: "Amr Gaber", username: "dr.amr", email: "amr.gaber@example.test", speciality: "Neurology", gender: "male",
    Dbirth: born(1979, 8, 17), mobile: 1066778899, rate: 700, affilation: "Ain Shams University Hospitals", status: "pending",
    background: "Neurologist treating migraine, epilepsy and movement disorders. Eleven years at university hospitals and a visiting clinician in Riyadh.",
    docs: files(2),
  }),
  doctor(12, {
    name: "Rana Habib", username: "dr.rana", email: "rana.habib@example.test", speciality: "Ophthalmology",
    Dbirth: born(1990, 1, 29), mobile: 1033221100, rate: 520, affilation: "Magrabi Eye Hospital", status: "pending",
    background: "Ophthalmologist focused on cataract surgery and pediatric eye care.",
    docs: files(2),
  }),
];

const JOINED = [
  doctor(21, {
    name: "Karim Zaki", username: "dr.karim", email: "karim.zaki@example.test", speciality: "Orthopedics", gender: "male",
    Dbirth: born(1981, 3, 4), mobile: 1090011223, rate: 550, affilation: "Anglo American Hospital", status: "accepted",
    contract: { accepted: true }, background: "Orthopedic surgeon specialising in sports injuries and joint replacement.",
  }),
  doctor(22, {
    name: "Nadine Shafik", username: "dr.nadine", email: "nadine.shafik@example.test", speciality: "Pediatrics",
    Dbirth: born(1987, 12, 2), mobile: 1144556677, rate: 480, affilation: "Dar Al Fouad Hospital", status: "accepted",
    contract: { accepted: true }, background: "Pediatrician covering newborn care, vaccination and childhood asthma.",
  }),
];

const patient = (n, extra) => ({
  _id: hex(n), gender: "female", family: [], doctors: [], healthRecords: [], walletTransactions: [], notifications: [],
  records: [], cart: [], addresses: [], medHist: [], wallet: 0, __v: 0, ...extra,
});

const PATIENTS = (packs) => {
  const pack = (type) => packs.find((p) => p.type === type) || null;
  return [
    patient(31, {
      name: "Salma Eid", username: "salma.eid", email: "salma.eid@example.test", dBirth: born(1996, 2, 14), mobile: 1002345671,
      emergencyContact: { fullName: "Hossam Eid", mobile: 1002345999, relation: "brother" },
      hPackage: pack("Platinum"), hPStatus: "Subscribed",
    }),
    patient(32, {
      name: "Mostafa Radwan", username: "mostafa.radwan", email: "mostafa.radwan@example.test", gender: "male", dBirth: born(1969, 11, 30), mobile: 1118765432,
      emergencyContact: { fullName: "Dina Radwan", mobile: 1118765111, relation: "wife" },
      hPackage: pack("Silver"), hPStatus: "Subscribed",
    }),
    patient(33, {
      name: "Farah Naguib", username: "farah.naguib", email: "farah.naguib@example.test", dBirth: born(2001, 7, 8), mobile: 1553344221,
      hPackage: null, hPStatus: "Unsubscribed",
    }),
    patient(34, {
      name: "Tarek Soliman", username: "tarek.soliman", email: "tarek.soliman@example.test", gender: "male", dBirth: born(1985, 1, 22), mobile: 1227712345,
      emergencyContact: { fullName: "Heba Soliman", mobile: 1227712999, relation: "sister" },
      hPackage: pack("Gold"), hPStatus: "Subscribed",
    }),
  ];
};

const ADMINS = [
  {
    _id: hex(41), name: "Nadia Farouk", email: "nadia.farouk@example.test", username: "ops.nadia", role: "admin",
    isAdmin: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), __v: 0,
  },
];

export function applyAdminExtras(get) {
  const packs = (get["/admin/viewHealthP"] && get["/admin/viewHealthP"].HealthPack) || [];
  if (get["/admin/viewPendDr"]) get["/admin/viewPendDr"].pendDoctors.push(...PENDING);
  if (get["/admin/viewJoinedDr"]) get["/admin/viewJoinedDr"].joinDoctors.push(...JOINED);
  if (get["/admin/viewPatients"]) get["/admin/viewPatients"].patients.push(...PATIENTS(packs));
  if (get["/admin/viewAdmin"]) get["/admin/viewAdmin"].AdminView.push(...ADMINS);
  return get;
}
