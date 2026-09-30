const express = require("express");
const router = express.Router(); // Create an instance of the Express router
const multer = require("multer");
const Patient = require("../Models/patient");
const Doctor = require("../Models/doctor");
const Appointment = require("../Models/appointments");
const path = require("path");

const {
  addPatient,
  addFamilyMember,
  viewFamilyMembers,
  viewDoctors,
  AddFromPrescToCart,
  searchDoctorsByNameOrspeciality,
  searchDoctorsByspecialityOrAvailability,
  viewPrescriptions,
  patientFilterAppointments,
  createAppointment,
  rescheduleAppointment,
  viewAppoints,
  viewSpecificPrescription,
  getAlldoctors,
  freeAppiontmentSlot,
  reserveAppointmentSlot,
  appointmentPatients,
  subscribeToHealthPackage,
  unSubscribeToHealthPackage,
  viewHealthPackagesPatient,
  payWithWallet,
  viewWallet,
  ccSubscriptionPayment,
  healthPackageInfo,
  createCheckoutSession,
  viewPatientHealthRecords,
  successCreditCardPayment,
  createAppointmentCheckoutSession,
  cancelAppointment,
  getPatientNotifications,
  addPatientNotification,
  updatePatientNotifications,
  sendPatientEmail,
  requestFollowUp,
  sendEmail,
  getID,
  payWithWalletF,
  getPatientProfile,
  updatePatientProfile,
} = require("../controllers/paController");

const { getUser } = require("../controllers/userController");
const { types } = require("util");

router.post("/createAppointment/:patientID", createAppointment);
router.post("/addPatient", addPatient);
router.post("/addFamilyMember/:patientId", addFamilyMember);
router.get("/viewFamilyMembers/:patientId", viewFamilyMembers);
router.get("/viewDoctors/:patientId", viewDoctors);
router.get(
  "/searchDoctorsByNameOrspeciality/:patientId",
  searchDoctorsByNameOrspeciality
);
router.get(
  "/searchDoctorsBySpecialtyOrAvailability/:patientId",
  searchDoctorsByspecialityOrAvailability
);
router.get("/viewPrescriptions/:patientId", viewPrescriptions);
//const { rescheduleAppointment } = require("../controllers/paController");
router.put("/rescheduleAppointment/:appointmentId", rescheduleAppointment);
router.get("/patientFilterAppointments", patientFilterAppointments);
router.get("/viewAppoints/:patientId", viewAppoints);
router.get("/freeAppiontmentSlot/:doctorId", freeAppiontmentSlot); //used to show all the free slots of specific doctor
router.patch("/reserveAppointmentSlot/:AppointmentId", reserveAppointmentSlot);
router.get("/getUser", getUser);
router.get("/getAlldoctors", getAlldoctors);
router.get("/viewSpecificPrescription/:id", viewSpecificPrescription);
router.get("/appointmentPatients/:doctorId", appointmentPatients);
router.get("/viewPatientHealthRecords/:patientid", viewPatientHealthRecords);

router.patch("/SubscriptionPayment/:patientId/:healthPackageId", payWithWallet);
router.patch(
  "/SubscriptionPaymentF/:patientId/:healthPackageId/:id",
  payWithWalletF
);
router.patch(
  "/CCSubscriptionPayment/:patientId/:healthPackageId",
  ccSubscriptionPayment
);
router.patch(
  "/successCreditCardPayment/:patientID/:appointmentID",
  successCreditCardPayment
);
const calculateAge = (birthDate) => {
  const today = new Date();
  const dob = new Date(birthDate);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
};

// Assuming your existing Express route
router.post("/addFamilyLink/:patientId", async (req, res) => {
  const { patientId } = req.params;
  const { type, relation } = req.body;

  try {
    // Remove the unnecessary initializations
    let patientToUpdate;
    let familyMember;

    if (type === "email") {
      const email = req.body.email;

      familyMember = await Patient.findOne({ email });

      if (!familyMember) {
        throw new Error("Family member not found with the provided email.");
      }

      // Find the patient with the provided ID
      patientToUpdate = await Patient.findById(patientId);

      if (!patientToUpdate) {
        throw new Error("Patient not found with the provided ID.");
      }

      // Check if the family member is already in the family array using email
      const isAlreadyFamily = patientToUpdate.family.some(
        (member) => member.email === email
      );

      if (isAlreadyFamily) {
        throw new Error("Family member is already added to the patient.");
      }

      const ag = calculateAge(familyMember.dBirth);
      // Add the family member to the patient's family array with the provided relation
      patientToUpdate.family.push({
        fullName: familyMember.name,
        NID: 12345678912,
        age: ag,
        gender: familyMember.gender,
        relation,
        pid: familyMember._id, // Assign the related patient's ID to pid
      });

      // Save the updated patient
      await patientToUpdate.save();
    } else {
      familyMember = await Patient.findOne({ mobile: req.body.phoneNumber });

      if (!familyMember) {
        throw new Error(
          "Family member not found with the provided phone number."
        );
      }

      // Find the patient with the provided ID
      patientToUpdate = await Patient.findById(patientId);

      if (!patientToUpdate) {
        throw new Error("Patient not found with the provided ID.");
      }

      // Check if the family member is already in the family array using phone number
      const isAlreadyFamily = patientToUpdate.family.some(
        (member) => member.phoneNumber === req.body.phoneNumber
      );

      if (isAlreadyFamily) {
        throw new Error("Family member is already added to the patient.");
      }

      const ag = calculateAge(familyMember.dBirth);
      // Add the family member to the patient's family array with the provided relation
      patientToUpdate.family.push({
        fullName: familyMember.name,
        NID: 12345678912,
        age: ag,
        gender: familyMember.gender,
        relation,
        pid: familyMember._id, // Assign the related patient's ID to pid
      });

      // Save the updated patient
      await patientToUpdate.save();
    }

    res.json({ success: true, updatedPatient: patientToUpdate });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Updated addFamilyMemberByEmailAndId function
async function addFamilyMemberByEmailAndId(email, patientId, relation, type) {
  try {
    consolr.log("hi");
    const familyMember = null;
    // Find the patient with the provided email
    if (type === "email") {
      familyMember = await Patient.findOne({ email });
    } else {
      familyMember = await Patient.findOne({ mobile: email });
    }
    console.log(familyMember);

    if (!familyMember) {
      throw new Error("Family member not found with the provided email.");
    }

    // Find the patient with the provided ID
    const patientToUpdate = await Patient.findById(patientId);
    consolr.log(patientId);
    if (!patientToUpdate) {
      throw new Error("Patient not found with the provided ID.");
    }

    // Check if the family member is already in the family array
    const isAlreadyFamily = patientToUpdate.family.some(
      (member) => member.email === email
    );

    if (isAlreadyFamily) {
      throw new Error("Family member is already added to the patient.");
    }
    const ag = calculateAge(familyMember.dBirth);
    // Add the family member to the patient's family array with the provided relation
    patientToUpdate.family.push({
      fullName: familyMember.name,
      NID: 12345678912,
      age: ag,
      gender: familyMember.gender,
      relation,
      pid: familyMember._id, // Assign the related patient's ID to pid
    });

    // Save the updated patient
    await patientToUpdate.save();

    return patientToUpdate;
  } catch (error) {
    throw error;
  }
}

const fs = require("fs").promises; // Import the 'fs' module for file deletion

router.patch("/subscribeToHealthPackage", subscribeToHealthPackage);
router.patch("/unSubscribeToHealthPackage", unSubscribeToHealthPackage);

router.get("/viewHealthPackagesPatient/:patientId", viewHealthPackagesPatient);
router.get("/AddFromPrescToCart/:prescriptionId", AddFromPrescToCart);

router.get("/viewWallet/:patientId", viewWallet);
router.get("/healthPackageInfo/:patientId/:healthPackageId", healthPackageInfo);

router.get("/createCheckoutSession/:pid/:id", createCheckoutSession);
router.post(
  "/createAppointmentCheckoutSession/:amount/:appointmentId/:patientId",
  createAppointmentCheckoutSession
);
router.get("/MyDoctors/:patientId", async (req, res) => {
  try {
    const patientId = req.params.patientId;

    // Find appointments with the given patientId and populate the 'drID' field to get doctor details
    const appointments = await Appointment.find({ pID: patientId }).populate(
      "drID",
      "name"
    );

    // Extract doctor names from the appointments
    const doctorNames = appointments
      .filter((appointment) => appointment.drID) // Filter out appointments without doctors
      .map((appointment) => appointment.drID.name); // Extract doctor names

    res.status(200).json({ doctors: doctorNames });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/scheduleAppointment", async (req, res) => {
  try {
    const { doctorId, patientId, appointmentId } = req.body;

    // Check if the doctor and patient exist
    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);

    if (!doctor || !patient) {
      return res.status(404).json({ message: "Doctor or Patient not found" });
    }
    console.log(req.body);
    // Check if the appointment exists
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      drID: doctorId,
      // Appointment not associated with any patient initially
    });

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "Appointment not found or already scheduled" });
    }

    // Associate the appointment with the patient
    appointment.pID = patientId;
    console.log(doctor.rate);
    // Calculate appointment price based on doctor's rate and patient's health package
    let appointmentPrice = doctor.rate * 100;
    console.log(patient.populate("hPackage"));
    //  if (patient.hPStatus === 'Subscribed' && patient.hPackage) {
    //   // Assuming hPackage has a price field
    //    appointmentPrice -= patient.populate('hPackage').rate;
    //  }

    // Save changes to the appointment
    await appointment.save();

    res.json({
      message: "Appointment scheduled successfully",
      appointmentPrice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/calculateAmount/:drId/:patientId", async (req, res) => {
  try {
    // Check if the doctor and patient exist
    const doctor = await Doctor.findById(req.params.drId);
    const patient = await Patient.findById(req.params.patientId).populate(
      "hPackage"
    );

    if (!doctor || !patient) {
      return res.status(404).json({ message: "Doctor or Patient not found" });
    }

    // Calculate amount based on doctor's rate and patient's health package
    let amount = doctor.rate * 100;

    if (patient.hPStatus === "Subscribed" && patient.hPackage) {
      // Assuming hPackage has a rate field
      amount -= patient.hPackage.rate;
    }

    res.json({ amount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/payAppWithWallet", async (req, res) => {
  try {
    const { patientID, amount, drID, appointmentID } = req.body;

    // Check if the patient, doctor, and appointment exist
    const patient = await Patient.findById(patientID);
    const doctor = await Doctor.findById(drID);
    const appointment = await Appointment.findById(appointmentID);

    if (!patient || !doctor || !appointment) {
      return res
        .status(404)
        .json({ message: "Patient, Doctor, or Appointment not found" });
    }

    // Check if the patient has enough balance in the wallet
    if (patient.wallet < amount) {
      return res
        .status(400)
        .json({ message: "Insufficient funds in the wallet" });
    }

    // Deduct the amount from the patient's wallet and credit the doctor.
    patient.wallet -= amount;
    patient.walletTransactions.push({
      amount: -Number(amount),
      balanceAfter: patient.wallet,
      direction: "debit",
      type: "appointment_payment",
      description: `Appointment payment to Dr. ${doctor.name}`,
    });

    doctor.wallet = Number(doctor.wallet || 0) + Number(amount);
    doctor.walletTransactions.push({
      amount: Number(amount),
      balanceAfter: doctor.wallet,
      direction: "credit",
      type: "appointment_payment",
      description: `Appointment payment from ${patient.name}`,
    });

    // Update the appointment details
    appointment.pID = patientID;
    appointment.status = "upcoming"; // Adjust the status accordingly

    // Save changes to the patient and appointment
    await Promise.all([patient.save(), doctor.save(), appointment.save()]);

    res.json({ message: "Payment successful", newBalance: patient.wallet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "./medHist");
    },
    filename(req, file, cb) {
      cb(null, `${new Date().getTime()}_${file.originalname}`);
    },
  }),

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png|pdf)$/)) {
      return cb(
        new Error(
          "only upload files with jpg, jpeg, png, pdf, doc, docx, xslx, xls format."
        )
      );
    }
    cb(undefined, true); // continue with upload
  },
});

router.post("/upload/:id", upload.single("file"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const { path, mimetype } = req.file;

    // Find the patient by ID
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).send("Patient not found");
    }

    // Add the uploaded file to the patient's medHist attribute
    patient.medHist.push({
      title,
      description,
      file_path: path,
      file_mimetype: mimetype,
    });

    // Save the updated patient
    await patient.save();

    // Save the file details to your File model if needed

    res.send("File uploaded and added to patient's medHist successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while uploading file. Try again later.");
  }
});

router.get("/getAllFiles/:id", async (req, res) => {
  try {
    // Find the patient by ID
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).send("Patient not found");
    }
    console.log(patient);

    // Extract files from the medHist attribute
    const files = patient.medHist;
    console.log(files);
    // Sort files by creation date if they have a createdAt property
    const sortedByCreationDate = files.sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );

    res.send(sortedByCreationDate);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error while getting list of files. Try again later.");
  }
});

router.get("/download/:id/:pid", async (req, res) => {
  try {
    // Find the patient by ID
    const patient = await Patient.findById(req.params.pid);

    if (!patient) {
      return res.status(404).send("Patient not found");
    }

    // Find the file by ID in the medHist attribute
    const file = patient.medHist.find(
      (f) => f._id.toString() === req.params.id
    );

    if (!file) {
      return res.status(404).send("File not found");
    }

    res.set({
      "Content-Type": file.file_mimetype,
    });

    res.sendFile(path.join(__dirname, "..", file.file_path));
  } catch (error) {
    console.error(error);
    res.status(400).send("Error while downloading file. Try again later.");
  }
});

router.get("/delete/:id/:pid", async (req, res) => {
  try {
    // Find the patient by ID
    const patient = await Patient.findById(req.params.pid);

    if (!patient) {
      return res.status(404).send("Patient not found");
    }

    // Find the file by ID in the medHist attribute
    const fileIndex = patient.medHist.findIndex(
      (f) => f._id.toString() === req.params.id
    );

    if (fileIndex === -1) {
      return res.status(404).send("File not found");
    }

    // Delete the file from the file system
    //  await fs.unlink(path.join(__dirname, 'medHist', patient.medHist[fileIndex].file_path));

    // Remove the file from the medHist array
    patient.medHist.splice(fileIndex, 1);

    // Save the updated patient
    await patient.save();

    res.send("File deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(400).send("Error while deleting file. Try again later.");
  }
});

router.patch("/CancelAppointment/:aid/:did/:pid", cancelAppointment);

// Get patient notifications
router.get("/:patientId/notifications", getPatientNotifications);

// Add a new notification for a patient
router.post("/:patientId/notifications", addPatientNotification);

// updated the notictaions array of a specific patient
router.patch("/:patientId/notifications", updatePatientNotifications);

// send email to a patient
router.post("/:patientId/send-email", sendPatientEmail);
router.post("/requestFollowUp/:pid/:did", requestFollowUp);
router.get("/profile/:patientId", getPatientProfile);
router.patch("/profile/:patientId", updatePatientProfile);

router.get("/patientID/:username", getID);

module.exports = router;
