const express = require("express");
const router = express.Router(); // Create an instance of the Express router
const Appointment = require("../Models/appointments");

const { getUser } = require("../controllers/userController");
const { addPrescription } = require("../controllers/drController");
const {
  addDoctor,
  getPatients,
  searchPatientByName,
  patientsInUpcomingApointments,
  editDoctor,
  doctorFilterAppointments,
  appointmentPatients,
  getDr,
  addAppointmentTimeSlot,
  createFollowUpAppointment,
  addHealthRecord,
  viewWallet,
  acceptContract,
  rescheduleAppointment,
  getDoctor,
  getDoctorNotifications,
  addDoctorNotification,
  updateDoctorNotifications,
  markDoctorNotificationSeen,
  markAllDoctorNotificationsSeen,
  sendDoctorEmail,
  updateDosageForMedicine,
  addMedicineToPrescription,
  deleteMedicineFromPrescription,
  getFollowUpRequests,
  acceptFollowUpRequest,
  rejectFollowUpRequest,
  cancelAppointment,
  getPatientsByDoctorId,
  viewPrescriptions
} = require("../controllers/drController");
const path = require('path');
const multer = require('multer');
const FileDr = require('../Models/fileDr');
const Doctor = require('../Models/doctor');

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, './files');
    },
    filename(req, file, cb) {
      cb(null, `${new Date().getTime()}_${file.originalname}`);
    }
  }),
  fileFilter(req, file, cb) {
    // Allow any file type
    cb(null, true);
  }
});

router.post(
  '/upload/:id',
  upload.array('files', 3), // Use upload.array to accept multiple files
  async (req, res) => {
    try {
      const files = req.files;

      const fileObjects = files.map((file, index) => ({
        title: index === 0 ? 'id' : index === 1 ? 'degree' : 'license',
        description: 'File description', // You can customize this
        file_path: file.path,
        file_mimetype: file.mimetype
      }));

      await FileDr.create({ files: fileObjects ,drID:req.params.id}); // Corrected typo

      res.send('Files uploaded successfully.');
    } catch (error) {
      console.error(error);
      res.status(400).send('Error while uploading files. Try again later.');
    }
  },
  (error, req, res, next) => {
    if (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  }
);

router.get('/download/:drId', async (req, res) => {
  try {
    // Find the doctor by ID
    const doctor = await Doctor.findById(req.params.drId);

    if (!doctor) {
      return res.status(404).send('Doctor not found');
    }

    // Check if the doctor has a contract
    if (!doctor.contract) {
      return res.status(404).send('Contract not found');
    }

    // Set the Content-Type header based on the file extension (assuming it's stored in the file field)
    const fileExtension = path.extname(doctor.contract.file);
    const mimeType = getMimeType(fileExtension);

    res.set({
      'Content-Type': mimeType,
    });

    // Send the file
    res.sendFile(path.join(__dirname, '..', doctor.contract.file));
  } catch (error) {
    console.error(error);
    res.status(500).send('Error while downloading file. Try again later.');
  }
});

const archiver = require('archiver');

router.get('/downloadf/:drId', async (req, res) => {
  try {
    // Find the doctor by ID
    const doctor = await FileDr.findOne({ drID: req.params.drId });

    if (!doctor) {
      return res.status(404).send('Doctor not found');
    }

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Compression level (maximum)
    });

    // Set the Content-Type header
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="files.zip"`,
    });

    // Pipe the archive to the response object
    archive.pipe(res);
console.log(doctor);
    // Add each file to the archive
    doctor.files.forEach((file, index) => {
      const fileContent = require('fs').readFileSync(path.join(__dirname, '..', file.file_path));
      archive.append(fileContent, { name: `${index + 1}_${file.title}${path.extname(file.file_path)}` });
    });

    // Finalize the archive
    archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error while downloading files. Try again later.');
  }
});




// Function to get MIME type based on file extension
function getMimeType(fileExtension) {
  switch (fileExtension.toLowerCase()) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.pdf':
      return 'application/pdf';
    // Add more cases for other file types as needed
    default:
      return 'application/octet-stream';
  }
}

router.get('/getContract/:id', async (req, res) => {
  const doctorId = req.params.id;

  try {
    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if the doctor has a contract
    if (!doctor.contract || !doctor.contract.file) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Return the contract file path
    res.json({ contract: doctor.contract });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
router.post("/addPrescription", addPrescription);
router.post("/getUser", getUser);
router.post("/addDoctor", addDoctor);
router.get("/getPatients/:id", getPatients);
router.get("/getDr/:id", getDr);
router.post("/addAppointmentSlot/:doctorId", addAppointmentTimeSlot);
router.get("/searchPatientByName", searchPatientByName);
router.get('/Mypatients/:doctorId', async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    // Find appointments with the given doctorId and populate the 'pID' field to get patient details
    const appointments = await Appointment.find({ drID: doctorId }).populate('pID', 'name');

    // Extract patient names from the appointments
    const patientNames = appointments
      .filter(appointment => appointment.pID) // Filter out appointments without patients
      .map(appointment => appointment.pID.name); // Extract patient names

    res.status(200).json({ patients: patientNames });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/createFollowUpAppointment/:drID", createFollowUpAppointment);
router.get(
  "/patientsInUpcomingApointments/:doctorId",
  patientsInUpcomingApointments
);
router.put("/editDoctor/:id", editDoctor);
router.get("/doctorFilterAppointments/:doctorId", doctorFilterAppointments);
router.get("/appointmentPatients/:doctorId", appointmentPatients);
router.put("/rescheduleAppointment/:appointmentId", rescheduleAppointment);


router.get("/getDoctor/:doctorId", getDoctor);

router.put("/acceptContract/:doctorId", acceptContract);

router.post("/addHealthRecord/:patientID", addHealthRecord);

router.get("/viewWallet/:doctorId",viewWallet );

router.get('/download/:drid', async (req, res) => {
  try {
    // Find the patient by ID
    const patient = await Doctor.findById(req.params.drid);

    if (!patient) {
      return res.status(404).send('Patient not found');
    }

    // Check if the patient has a contract
    if (!patient.contract || !patient.contract.file) {
      return res.status(404).send('Contract not found');
    }

    // Return the contract file path
    const contractRelativePath = patient.contract.file;
    const contractAbsolutePath = path.join(__dirname, '..', contractRelativePath);

    res.sendFile(contractAbsolutePath);
  } catch (error) {
    console.error(error);
    res.status(400).send('Error while downloading file. Try again later.');
  }
});






// Get doctor notifications
router.get('/:doctorId/notifications', getDoctorNotifications);
router.patch('/:doctorId/notifications/seen-all', markAllDoctorNotificationsSeen);
router.patch('/:doctorId/notifications/:notificationId/seen', markDoctorNotificationSeen);

// Add a new notification for a doctor
router.post('/:doctorId/notifications', addDoctorNotification);

// updated the notictaions array of a specific doctor
router.patch('/:doctorId/notifications', updateDoctorNotifications);
router.patch('/:doctorId/notifications/:notificationId/seen', markDoctorNotificationSeen);

// send email to a doctor
router.post('/:doctorId/send-email', sendDoctorEmail);
router.put('/update/:prescriptionID',  updateDosageForMedicine)

router.post('/add/:prescriptionID',  addMedicineToPrescription)

router.delete('/delete/:prescriptionID/:medID', deleteMedicineFromPrescription)
router.get("/FollowUpRequests/:doctorId",getFollowUpRequests);
router.delete("/rejectFollowUp/:id",rejectFollowUpRequest);
router.post("/acceptFollowUp/:id",acceptFollowUpRequest);
router.patch("/CancelAppointment/:aid/:did/:pid",cancelAppointment);
router.get("/getPatientsByDoctorId/:doctorId",getPatientsByDoctorId);
router.get("/viewPrescriptions/:patientId", viewPrescriptions);





module.exports = router;
