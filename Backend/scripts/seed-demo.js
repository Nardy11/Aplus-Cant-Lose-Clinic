/*
 * Demo data for trying the clinic locally.
 *
 *   npm run seed
 *
 * Creates 3 doctors, 2 patients, health packages, medicines, a week of appointments, prescriptions
 * (one paid, one not), a wallet history and a follow-up request, in a DEDICATED database
 * (AplusClinicDemo) so it never touches real data. Run it again to reset the demo.
 *
 * Safety: this script only ever connects to a local MongoDB, and only wipes a database whose name
 * ends in "Demo" unless you pass --yes.
 */
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const URI = process.env.SEED_MONGO_URI || "mongodb://127.0.0.1:27017/AplusClinicDemo";
const DEMO_PASSWORD = "Demo@1234";

const isLocal = /^mongodb:\/\/(127\.0\.0\.1|localhost)[:/]/.test(URI);
const dbName = (URI.split("/").pop() || "").split("?")[0];
if (!isLocal) {
  console.error("Refusing to seed: SEED_MONGO_URI must point at a local MongoDB (127.0.0.1 or localhost).");
  process.exit(1);
}
if (!dbName.endsWith("Demo") && !process.argv.includes("--yes")) {
  console.error(`Refusing to wipe "${dbName}": only databases ending in "Demo" are reset without --yes.`);
  process.exit(1);
}

const M = (name) => require(path.join(__dirname, "..", "Models", name));
const day = (offset, hour = 10, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, minute, 0, 0);
  return d;
};
const plusMinutes = (d, m) => new Date(d.getTime() + m * 60000);
const birth = (y, m, d) => new Date(Date.UTC(y, m - 1, d)); // the sign-up form stores UTC midnight

(async () => {
  await mongoose.connect(URI);
  const [User, Doctor, Patient, Appointment, HPackages, Prescription, FollowUp, Medicine, StripePayment] = [
    "user", "doctor", "patient", "appointments", "hpackages", "prescription", "followUps", "medicine", "stripePayment",
  ].map(M);
  await Promise.all([User, Doctor, Patient, Appointment, HPackages, Prescription, FollowUp, Medicine, StripePayment].map((m) => m.deleteMany({})));

  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const packs = await HPackages.insertMany([
    { type: "Silver", rate: 3600, doctorDisc: 40, medicineDisc: 20, familyDisc: 10 },
    { type: "Gold", rate: 6000, doctorDisc: 60, medicineDisc: 30, familyDisc: 15 },
    { type: "Platinum", rate: 9000, doctorDisc: 80, medicineDisc: 40, familyDisc: 20 },
  ]);

  const meds = await Medicine.insertMany([
    { name: "Panadol Extra", activeElement: "Paracetamol 500mg + Caffeine", price: 38, use: "Pain and fever", amount: 120 },
    { name: "Augmentin 1g", activeElement: "Amoxicillin + Clavulanic acid", price: 142, use: "Bacterial infections", amount: 60 },
    { name: "Concor 5mg", activeElement: "Bisoprolol", price: 96, use: "Blood pressure", amount: 80 },
    { name: "Glucophage 850", activeElement: "Metformin", price: 54, use: "Type 2 diabetes", amount: 90 },
    { name: "Nexium 40mg", activeElement: "Esomeprazole", price: 210, use: "Acid reflux", amount: 40 },
  ]);

  const doctorSeeds = [
    { username: "dr.hany", name: "Hany El-Sayed", email: "hany.elsayed@example.test", speciality: "Cardiology", gender: "male", rate: 650, affilation: "Dar Al Fouad Hospital", background: "Consultant cardiologist, 14 years in interventional cardiology and hypertension care.", mobile: 1012345678 },
    { username: "dr.mariam", name: "Mariam Abdelaziz", email: "mariam.abdelaziz@example.test", speciality: "Dermatology", gender: "female", rate: 500, affilation: "Cleopatra Hospital", background: "Dermatologist focused on acne, eczema and pediatric skin conditions.", mobile: 1098765432 },
    { username: "dr.omar", name: "Omar Fathy", email: "omar.fathy@example.test", speciality: "Internal Medicine", gender: "male", rate: 420, affilation: "As-Salam International", background: "Internist managing diabetes, thyroid disorders and preventive checkups.", mobile: 1123456789 },
  ];
  const doctors = [];
  for (const d of doctorSeeds) {
    const hany = d.username === "dr.hany";
    doctors.push(await Doctor.create({
      ...d, status: "accepted", Dbirth: birth(1982, 5, 12), contract: { accepted: true },
      wallet: hany ? 4875 : 0,
      walletTransactions: hany ? [
        { amount: 650, balanceAfter: 3575, direction: "credit", type: "appointment_payment", description: "Appointment payment from Nour Ibrahim", timestamp: day(-20) },
        { amount: 650, balanceAfter: 4225, direction: "credit", type: "appointment_payment", description: "Appointment payment from Nour Ibrahim", timestamp: day(-6) },
        { amount: 650, balanceAfter: 4875, direction: "credit", type: "appointment_payment", description: "Appointment payment from Youssef Hamdy", timestamp: day(-2) },
      ] : [],
    }));
    await User.create({ username: d.username, name: d.name, email: d.email, role: "doctor", password: hash });
  }
  const [hany, mariam, omar] = doctors;

  const nour = await Patient.create({
    username: "nour.patient", name: "Nour Ibrahim", email: "nour.ibrahim@example.test", gender: "female", mobile: 1001122334,
    dBirth: birth(1991, 9, 3), emergencyContact: { fullName: "Karim Ibrahim", mobile: 1005566778, relation: "spouse" },
    family: [
      { fullName: "Karim Ibrahim", NID: 29001011234567, age: 35, gender: "male", relation: "spouse" },
      { fullName: "Salma Karim", NID: 31805121234567, age: 7, gender: "female", relation: "child" },
    ],
    doctors: [{ doctorID: hany._id }, { doctorID: omar._id }],
    hPackage: packs[1]._id, hPStatus: "Subscribed", SubDate: day(-40),
    healthRecords: [
      { date: day(-60), description: "Annual checkup", labResults: "HbA1c 5.9%, LDL 128 mg/dL", medicalInformation: "Mild dyslipidemia", primaryDiagnosis: "Pre-diabetes", treatment: "Diet plan, recheck in 3 months" },
      { date: day(-20), description: "Cardiology review", labResults: "ECG normal sinus rhythm", medicalInformation: "Occasional palpitations", primaryDiagnosis: "Benign palpitations", treatment: "Reduce caffeine, Concor 5mg as needed" },
    ],
    wallet: 1250,
    walletTransactions: [
      { amount: 2000, balanceAfter: 2000, direction: "credit", type: "topup", description: "Wallet top-up", timestamp: day(-30) },
      { amount: 390, balanceAfter: 1610, direction: "debit", type: "appointment_payment", description: "Appointment with Dr. Hany El-Sayed", timestamp: day(-20) },
      { amount: 360, balanceAfter: 1250, direction: "debit", type: "appointment_payment", description: "Appointment with Dr. Hany El-Sayed", timestamp: day(-6) },
    ],
    notifications: [
      { message: `Your visit with Dr. Hany El-Sayed on ${day(2, 11).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}, 11:00 is booked.`, type: "AppointmentScheduled", entityType: "Appointment", timestamp: day(-1) },
      { message: "Dr. Omar Fathy added a new prescription for you.", type: "info", entityType: "Prescription", timestamp: day(-3) },
      { message: "Your Gold health package renews next month.", type: "info", entityType: "HealthPackage", seen: true, timestamp: day(-10) },
    ],
  });
  await User.create({ username: nour.username, name: nour.name, email: nour.email, role: "patient", password: hash });

  const youssef = await Patient.create({ username: "youssef.patient", name: "Youssef Hamdy", email: "youssef.hamdy@example.test", gender: "male", mobile: 1227788990, dBirth: birth(1978, 2, 20), doctors: [{ doctorID: hany._id }] });
  await User.create({ username: youssef.username, name: youssef.name, email: youssef.email, role: "patient", password: hash });

  const visit = (dr, pt, start, status, minutes = 30) => ({ drID: dr._id, pID: pt && pt._id, startDate: start, endDate: plusMinutes(start, minutes), status });
  await Appointment.insertMany([
    visit(hany, nour, day(2, 11), "upcoming"),
    visit(hany, youssef, day(1, 13), "upcoming"),
    visit(hany, youssef, day(4, 16, 30), "rescheduled"),
    visit(omar, nour, day(6, 9, 30), "upcoming"),
    visit(hany, nour, day(-6, 12), "completed"),
    visit(hany, nour, day(-20, 10), "completed"),
    visit(mariam, nour, day(-12, 15), "cancelled"),
    ...[3, 3, 5, 5, 7].map((d, i) => visit(hany, null, day(d, [10, 14, 11, 17, 12][i]), "Not_Reserved")),
    ...[2, 4, 4].map((d, i) => visit(mariam, null, day(d, [12, 10, 15][i]), "Not_Reserved")),
    ...[1, 6].map((d, i) => visit(omar, null, day(d, [18, 11][i]), "Not_Reserved")),
  ]);

  await Prescription.insertMany([
    { patientID: nour._id, doctorID: hany._id, datePrescribed: day(-6), status: "filled", meds: [{ medID: meds[2]._id, dosage: "1 tablet each morning" }] },
    { patientID: nour._id, doctorID: omar._id, datePrescribed: day(-3), status: "unfilled", meds: [{ medID: meds[3]._id, dosage: "1 tablet twice daily after meals" }, { medID: meds[4]._id, dosage: "1 capsule before breakfast" }] },
    { patientID: youssef._id, doctorID: hany._id, datePrescribed: day(-9), status: "unfilled", meds: [{ medID: meds[0]._id, dosage: "As needed, max 4 per day" }] },
  ]);

  await FollowUp.create({ drID: hany._id, pID: nour._id, patientName: nour.name, requestDate: day(9, 10) });
  await Doctor.updateOne({ _id: hany._id }, { $push: { notifications: { $each: [
    { message: `Nour Ibrahim booked a visit on ${day(2, 11).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}, 11:00.`, type: "AppointmentScheduled", entityType: "Appointment", timestamp: day(-1) },
    { message: "Nour Ibrahim requested a follow-up visit.", type: "info", entityType: "FollowUp", timestamp: day(0, 8) },
  ] } } });

  console.log(`\nDemo data ready in "${dbName}".\n`);
  console.log("  Patient   nour.patient  /  " + DEMO_PASSWORD);
  console.log("  Doctor    dr.hany       /  " + DEMO_PASSWORD + "   (also dr.mariam, dr.omar)\n");
  console.log(`Start the backend against it:  MONGO_URI=${URI} npm start\n`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
