const Doctor = require("../Models/doctor");
const Pharmacist = require("../Models/pharmacist");
const User = require("../Models/user");
const Patient = require("../Models/patient");
const validator = require("validator");
const Appointment = require("../Models/appointments");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const FollowUp=require("../Models/followUps");
const Medicine = require("../Models/medicine");
function generateToken(data) {
  return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
}

const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      username,
      Dbirth,
      gender,
      rate, speciality,
      affilation,
      background,
      docs,
      password,

    } = req.body;
    console.log(req.body);
    // Validate input fields
    if (
      !name ||
      !email ||
      !username ||
      !Dbirth ||
      !gender ||
      !rate ||
      !affilation ||
      !background ||
      !docs ||
      !password || !speciality
    ) {
      // return res.status(400).json({ error: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if the username is already in use
    const userFound = await User.findOne({ username });
    if (userFound) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const emailFound = await Patient.findOne({ email });
    const emailFound2 = await Doctor.findOne({ email });
    const emailFound3 = await Pharmacist.findOne({ email });
    if (emailFound || emailFound2 || emailFound3) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Password strength validation
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ error: "Password not strong enough" });
    }

    // Calculate age based on date of birth
    const today = new Date();
    const birthDate = new Date(Dbirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Check if the doctor is at least 18 years old and not over 150 years old
    if (age < 18 || age > 150) {
      return res.status(400).json({ error: "Doctor must be at least 18 and within reasonable age" });
    }

    // Default status is "pending"
    const status = "pending";

    // Create the Doctor and user records
    const doctor = await Doctor.create({
      name,
      email,
      username,
      Dbirth,
      gender,
      rate,
      affilation,
      background,
      docs,
      speciality,
      status,
    });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      username,
      password: hashedPassword,
      role: "doctor",
      email,name
    });
    const data = {
      _id: doctor._id,
    };

    const token = generateToken(data);
    res
      .status(201)
      .json({ message: "Doctor created successfully", doctor, token ,id:doctor._id});
  } catch (error) {
    console.error("Error creating doctor:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const searchPatientByName = async (req, res) => {
  try {
    const { name } = req.query;

    // Validate the 'name' parameter
    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ error: "Invalid or missing 'name' parameter" });
    }

    // Perform the patient search by name (partial match)
    const patients = await Patient.find({
      name: { $regex: name, $options: "i" },
    });

    if (patients.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Send a successful response with a 200 status code
    res
      .status(200)
      .json({ message: "Patients retrieved successfully", patients });
  } catch (error) {
    console.error("Error searching for patients by name:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const patientsInUpcomingApointments = async (req, res) => {
  try {
    const { doctorId } = req.params; // Assuming the doctor's ID is provided in the request parameters

    const currentDate = new Date();

    // Find upcoming appointments for the specific doctor where the appointment date is greater than the current date
    const upcomingAppointments = await Appointment.find({
      drID: doctorId,
      startDate: { $gt: currentDate },
    });

    if (!upcomingAppointments || upcomingAppointments.length === 0) {
      return res.status(404).json({
        error: "No upcoming appointments found for the specified doctor",
      });
    }

    // Extract patient IDs from upcoming appointments
    const patientIds = upcomingAppointments.map(
      (appointment) => appointment.pID
    );

    // Find the associated patients
    const patients = await Patient.find({ _id: { $in: patientIds } });

    if (!patients || patients.length === 0) {
      return res
        .status(404)
        .json({ error: "No patients found for upcoming appointments" });
    }

    return res
      .status(200)
      .json({ message: "Patients in upcoming appointments", patients });
  } catch (error) {
    console.error("Error retrieving patients in upcoming appointments:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



const editDoctor = async (req, res) => {
  const { id } = req.params;
  const { name, email, rate, affiliation, affilation, background, pic } = req.body;
  const hospitalAffiliation = affiliation ?? affilation;

  if (
    name === undefined &&
    email === undefined &&
    rate === undefined &&
    hospitalAffiliation === undefined &&
    background === undefined &&
    pic === undefined
  ) {
    return res.status(400).json({ error: "At least one profile field is required" });
  }

  try {
    const existingDoctor = await Doctor.findById(id);
    if (!existingDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const normalizedName = typeof name === "string" ? name.trim() : name;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : email;
    const normalizedAffiliation = typeof hospitalAffiliation === "string"
      ? hospitalAffiliation.trim()
      : hospitalAffiliation;
    const normalizedBackground = typeof background === "string" ? background.trim() : background;
    const normalizedPic = typeof pic === "string" ? pic.trim() : pic;

    if (normalizedEmail && normalizedEmail !== existingDoctor.email) {
      const emailExists =
        (await Doctor.findOne({ email: normalizedEmail, _id: { $ne: id } })) ||
        (await Patient.findOne({ email: normalizedEmail })) ||
        (await Pharmacist.findOne({ email: normalizedEmail })) ||
        (await User.findOne({ email: normalizedEmail, username: { $ne: existingDoctor.username } }));

      if (emailExists) {
        return res.status(409).json({ error: "Email is already in use." });
      }
    }

    const doctorUpdate = {};
    if (normalizedName !== undefined) doctorUpdate.name = normalizedName;
    if (normalizedEmail !== undefined) doctorUpdate.email = normalizedEmail;
    if (rate !== undefined) doctorUpdate.rate = Number(rate);
    if (normalizedAffiliation !== undefined) doctorUpdate.affilation = normalizedAffiliation;
    if (normalizedBackground !== undefined) doctorUpdate.background = normalizedBackground;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: doctorUpdate },
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const user = await User.findOne({ username: existingDoctor.username });
    if (user) {
      const userUpdate = {};
      if (normalizedName !== undefined) userUpdate.name = normalizedName;
      if (normalizedEmail !== undefined) userUpdate.email = normalizedEmail;
      if (normalizedPic !== undefined) userUpdate.pic = normalizedPic;

      if (Object.keys(userUpdate).length) {
        await User.updateOne({ _id: user._id }, { $set: userUpdate });
      }
    }

    res.status(200).json({
      message: "Doctor profile updated successfully",
      doctor: {
        ...updatedDoctor.toObject(),
        pic: normalizedPic !== undefined ? normalizedPic : user?.pic || "",
      },
      user: user ? {
        _id: user._id,
        name: normalizedName !== undefined ? normalizedName : user.name,
        email: normalizedEmail !== undefined ? normalizedEmail : user.email,
        username: user.username,
        pic: normalizedPic !== undefined ? normalizedPic : user.pic,
      } : null,
    });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const
  appointmentPatients = async (req, res) => {
    try {
      const doctorId = req.params.doctorId; // Assuming the doctor's ID is in the request params

      // Use Mongoose to find all appointments for the specified doctor
      const appointments = await Appointment.find({ drID: doctorId })
        .populate('pID') // Populate the 'pID' field to get patient data
        .exec();

      res.json(appointments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
const doctorFilterAppointments = async (req, res) => {
  const { doctorId } = req.params; // Get doctorId from URL parameters
  const { startDate, endDate, status } = req.query;

  // Check if at least one filter parameter is provided
  if (!startDate && !endDate && !status) {
    return res
      .status(400)
      .json({ error: "At least one filter parameter is required" });
  }

  // Build the query object based on the provided parameters
  const query = {
    drID: doctorId,
  };

  if (startDate) {
    query.startDate = { $gte: new Date(startDate) };
  }

  if (endDate) {
    query.endDate = { $lte: new Date(endDate) };
  }

  if (status) {
    query.status = status;
  }

  try {
    // Find appointments that match the query
    const appointments = await Appointment.find(query);

    res
      .status(200)
      .json({ message: "Appointments filtered successfully", appointments });
  } catch (error) {
    console.error("Error filtering appointments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Import the Patient model

const getPatients = async (req, res) => {
  try {
    const doctorID = req.params.id; // Retrieve doctor ID from route parameter

    // Find patients associated with the specified doctor ID
    const patients = await Patient.find({ "doctors.doctorID": doctorID });

    if (!patients || patients.length === 0) {
      return res
        .status(404)
        .json({ error: "No patients found for this doctor" });
    }

    res.status(200).json(patients);
  } catch (error) {
    console.error("Error getting patients:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const Prescription = require('../Models/prescription'); // Import the Prescription model

const addPrescription = async (req, res) => {
  try {
    const { medName, dosage, patientID, doctorID, datePrescribed } = req.body;

    // Validate inputs
    if (!medName || !dosage || !patientID || !doctorID || !datePrescribed) {
      return res.status(400).json({ error: "Missing required input fields" });
    }

    // Find or create the medicine
    let medicine = await Medicine.findOne({ name: medName });

    if (!medicine) {
      // If the medicine doesn't exist, create a new one
      medicine = new Medicine({
        name: medName,
        // Add other fields as needed
      });

      // Save the new medicine to the database
      await medicine.save();
    }

    // Create a new prescription instance with the provided data
    const prescription = new Prescription({
      meds: [{ medID: medicine._id, dosage }],
      patientID,
      doctorID,
      datePrescribed,
    });

    // Save the prescription to the database
    const savedPrescription = await prescription.save();

    res.status(201).json({
      message: "Prescription added successfully",
      prescription: savedPrescription,
    });
  } catch (error) {
    console.error("Error adding prescription:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



const getDr = async (req, res) => {
  const doctorId = req.params.id;

  try {
    const dr = await Doctor.findById(doctorId);
    if (!dr) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const user = await User.findOne({ username: dr.username });

    res.status(200).json({
      message: "dr found successfully",
      dr: {
        ...dr.toObject(),
        pic: user?.pic || "",
        userUpdatedAt: user?.updatedAt || null,
      },
    });
  } catch (error) {
    console.error("Error getting doctor profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const addAppointmentTimeSlot = async (req, res) => {
  try {
    const doctorId = req.params.doctorId; // Assuming the doctor's ID is in the request params
    const { startDate,endDate} = req.body;

    // Validate inputs
    if (!startDate ||
      !endDate ) {
      return res.status(400).json({ error: "Missing required  input fields" });
    }

    // Create a new Appointment instance with the provided data
    const appointment = await Appointment.create({
      startDate:req.body.startDate,
      endDate:req.body.endDate,
      drID:doctorId,
      status:"Not_Reserved",
      Description: "",
    });

    res.status(201).json({
      message: "Appointment added successfully",
      Appointment: appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}// note that to initialize+ the PID it should have id which will be the fake patient id till it get reserved
const createFollowUpAppointment = async (req, res) => {
  try {
    const drID = req.params.drID; // Retrieve doctor ID
    const { patientID } = req.query; // Retrieve patientID
    const { startDate, endDate } = req.body;

    // Validate inputs
    if (!startDate || !endDate || !patientID) {
      return res.status(400).json({ error: "Missing required input fields" });
    }

    const patient = await Patient.findById(patientID);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Check if the doctor has any overlapping appointments
    const doctorHasOverlappingAppointments = await Appointment.exists({
      drID: drID,
      $and: [
        { startDate: { $lt: endDate } },
        { endDate: { $gt: startDate } },
      ],
    });

    if (doctorHasOverlappingAppointments) {
      return res
        .status(400)
        .json({ error: "Doctor already has appointments during this time" });
    }

    // Check if the patient has any overlapping appointments
    const patientHasOverlappingAppointments = await Appointment.exists({
      pID: patientID,
      $and: [
        { startDate: { $lt: endDate } },
        { endDate: { $gt: startDate } },
      ],
    });

    if (patientHasOverlappingAppointments) {
      return res
        .status(400)
        .json({ error: "Patient already has appointments during this time" });
    }

    // Create a new appointment instance with the provided data
    const appointment = new Appointment({
      startDate,
      endDate,
      drID,
      pID: patientID, // Set the pID field with patientID
      Description: "Follow Up Appointment",
    });

    // Save the appointment to the database
    const savedAppointment = await appointment.save();

    // Update the patient's doctors array with the new doctor only if not already present
    const isDoctorInArray = patient.doctors.some((doc) =>
      doc.doctorID.equals(drID)
    );
    if (!isDoctorInArray) {
      await Patient.findByIdAndUpdate(patientID, {
        $addToSet: { doctors: { doctorID: drID } },
      });
    }

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: savedAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};





const addHealthRecord = async (req, res) => {
  try {
    const patientID  = req.params.patientID;

    const {date,description,labResults,primaryDiagnosis,treatment,medicalInformation,doctorID}= req.body;
    console.log(req.body);
    console.log("entered post function addHealthRecord id of patient is :"+patientID)



    // Validate inputs
    if (!patientID) {
      return res.status(400).json({ error: "Missing required  input fields" });
    }

    //retrieve patient from the database
    const patient = await Patient.findById(patientID);

    
    // Save the healthRecord in patient to the database
     patient.healthRecords.push({
      date,
      description,
      labResults,
      medicalInformation,
      primaryDiagnosis,
      treatment,
    })
    await patient.save();


    const patients = await Patient.find({ "doctors.doctorID": doctorID });    
    console.log(doctorID)

    res.status(201).json({
      // message: "Health Record added successfully",
      // healthRecord: healthRecord,
      // patients:
      patients
    });
  } catch (error) {
    console.error("Error adding Health Record:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




const viewWallet = async(req , res)=>{
  const {doctorId} = req.params;
  try{
    const doctor = await Doctor.findById(doctorId);

    if(!doctor){
      return res.status(404).json({ error: "Doctor not found" });
    }

    if (!doctor.wallet) {
      // If the patient doesn't have a wallet attribute, add it with a value of zero
      doctor.wallet = 0;
      await doctor.save();
    }

    
    const walletAmount  = doctor.wallet;
    const transactions = [...(doctor.walletTransactions || [])].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.status(200).json({
      message:" wallet amount is fetched successfully",
      doctor: doctor,
      wallet:walletAmount,
      transactions
    })
  }
  catch(error){
    res.status(500).json({ error: "Internal Server Error" });
  }



}


const acceptContract = async (req, res) => {
  try {
    const { doctorId } = req.params; // Assuming doctorId and contractId are part of the URL parameters

    // Find the doctor by ID in the database
    const doctor = await Doctor.findById(doctorId);

    // Check if the doctor exists
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Find the specific contract for the doctor

    // Check if the contract exists


    // Perform the action to accept the contract, e.g., update the status field
    doctor.contract.accepted = true;

    await doctor.save();

    res.status(200).json({ message: 'Contract accepted successfully', doctor });
  } catch (error) {
    console.error('Error accepting contract', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const getDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params; // Assuming doctorId and contractId are part of the URL parameters

    // Find the doctor by ID in the database
    const doctor = await Doctor.findById(doctorId);

    // Check if the doctor exists
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Find the specific contract for the doctor

    // Check if the contract exists


    // Perform the action to accept the contract, e.g., update the status field

    res.status(200).json({ message: 'Doctor retrieved successfully', doctor });
  } catch (error) {
    console.error('Error Doctor ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


async function rescheduleAppointment(req, res) {
  const {appointmentId} = req.params;
  const { startDate, endDate } = req.body;
  console.log(appointmentId);
            console.log(startDate);
            console.log(endDate);
            const mongoose = require('mongoose');
           // const Appointment = require("C:\Users\Future\Documents\GitHub\Aplus-Cant-Lose-Clinic\Backend\Models\appointments.js");
            console.log(req.params);

  try {
    // Find the appointment by ID
    const appointment = await Appointment.findById(appointmentId)
    .populate('drID') 
    .populate('pID',);


    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ error: 'Invalid appointmentId' });
  }
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    const doctor = appointment.drID;
    const patient= appointment.pID;
    const dId = doctor._id;
    const pId= patient._id;

    // Update the appointment with the new dates
    appointment.startDate = startDate;
    appointment.endDate = endDate;

    patient.notifications.push({ //add notifiaction to patient
      message:`APPOINTEMNT RESCHEULED WITH DOCTOR ${doctor.name}`,
      type:"AppointmentRescheduled",
    });
    doctor.notifications.push({//add notifiaction to doctor
      message:`APPOINTEMNT RESCHEULED WITH PATIENT ${patient.name}`,
      type:"AppointmentRescheduled",
    });
      

    // Save the updated appointment
    await patient.save();
    await doctor.save();
    await appointment.save();

      // Send email to the doctor
      const emailSubject2 = "Appointment Reschedule";
      const emailMessage2 = `Your appointment with patient ${patient.name} has been Reschedule.`;
      await sendEmail( doctor.email , emailSubject2, emailMessage2 );
  
    // Send email to the patient
    const emailSubject = "Appointment Reschedule";
      const emailMessage = `Your appointment with Dr. ${doctor.name} has been Reschedule.`;
      await sendEmail(patient.email, emailSubject, emailMessage);

    

    // Return a success message or the updated appointment
    res.json({ message: 'Appointment rescheduled successfully', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}


// Function to get patients by doctor's ID







//pass appointment on check and doctor when opening doctor page and dates by date picker










// Function to get notifications of a doctor
const getDoctorNotifications = async (req, res) => {
  const doctorId = req.params.doctorId;

  try {
    const doctor = await Doctor.findById(doctorId); //get the doctor

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    const notifications = doctor.notifications; //get the doctor's notifiacions
    return res.status(200).json({ notifications }); //return the array of notictaions
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};



// Function to add a new notification for a doctor
const addDoctorNotification = async (req, res) => {
  const doctorId = req.params.doctorId;
  const { message, type } = req.body; //get the notifiaction shit from the body

  try {
    const doctor = await Doctor.findById(doctorId); //get the doctor

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    //add the notifation to the array of notifications array of this doctor
    doctor.notifications.push({
      message,
      type: type || 'info', // Default to 'info' if type is not provided
    });

    await doctor.save();

    return res.status(201).json({ message: 'Notification added successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};


// Function to update notifications for a specific doctor
const updateDoctorNotifications = async (req, res) => {
  try {
    
    const doctorId = req.params.doctorId;
    const updatedNotifications = req.body.notifications;

    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return { success: false, message: 'Doctor not found' };
    }

    // Update the notifications array
    doctor.notifications = updatedNotifications;

    // Save the updated doctor object to the database
    await doctor.save();

    return res.status(201).json({ message: 'Notifications array updated successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};



const sendDoctorEmail = async (req, res) => {
  const { doctorId } = req.params;
  const { subject, message } = req.body;

  try {
    // Retrieve doctor's email from the database
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.email) {
      return res.status(404).json({ message: 'Doctor not found or no email associated.' });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL,
      to: doctor.email,
      subject,
      text: message,
    };
    
    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const updateDosageForMedicine = async (req, res) => {
  try {
    const { medID, dosage } = req.body;
    const prescriptionID = req.params.prescriptionID;

    // Find the prescription by ID
    const prescription = await Prescription.findById(prescriptionID);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found.' });
    }

    // Find the medicine within the prescription by medID
    const medicineToUpdate = prescription.meds.find((med) => med.medID.toString() === medID);

    if (!medicineToUpdate) {
      return res.status(404).json({ message: 'Medicine not found in the prescription.' });
    }

    // Update the dosage for the found medicine
    medicineToUpdate.dosage = dosage;

    // Save the updated prescription
    await prescription.save();

    return res.status(200).json({ message: 'Dosage updated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
const addMedicineToPrescription = async (req, res) => {
  try {
    const { medName, dosage } = req.body;
    const prescriptionID = req.params.prescriptionID;
    console.log('====================================');
    console.log(medName);
    console.log(dosage);
    console.log('====================================');
    // Find the prescription by ID
    const prescription = await Prescription.findById(prescriptionID);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found.' });
    }

    // Find the medicine by its name
    const medicine = await Medicine.findOne({ name: medName });

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found.' });
    }

    // Check if the medicine already exists in the prescription
    const existingMedicine = prescription.meds.find((med) => med.medID.toString() === medicine._id.toString());

    if (existingMedicine) {
      return res.status(400).json({ message: 'Medicine already exists in the prescription.' });
    }

    // Add the new medicine with dosage to the prescription
    prescription.meds.push({ medID: medicine._id, dosage });

    // Save the updated prescription
    await prescription.save();

    return res.status(201).json({ message: 'Medicine added to prescription successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const deleteMedicineFromPrescription = async (req, res) => {
  try {
    const medID = req.params.medID;
    const prescriptionID = req.params.prescriptionID;
    console.log("backend:"+medID);
    // Find the prescription by ID
    const prescription = await Prescription.findById(prescriptionID);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found.' });
    }

    // Find the medicine to delete by ID
    const medicine = prescription.meds.find((med) => med.medID.toString() === medID);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found in the prescription.' });
    }

    // Remove the medicine from the meds array
    prescription.meds = prescription.meds.filter((med) => med.medID.toString() !== medID);

    // Save the updated prescription
    await prescription.save();

    return res.status(200).json({ message: 'Medicine deleted from prescription successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const getFollowUpRequests=async(req,res)=>
{
  const {doctorId}=req.params;
  try{
  const response =await FollowUp.find({drID:doctorId});
  res.status(200).json(response)
}catch(error)
{
  console.error(error)
  res.status(500).json({message:'Internal server error'})
}
  

}
const acceptFollowUpRequest=async (req,res)=>
{
  const {id}=req.params
  //why can't i name them the same??
  const {start,end}=req.body
  console.log(start);
  try{
    const response =await FollowUp.findByIdAndDelete(id)
    const appointment = await Appointment.create({
      startDate:start,
      endDate:end,
      drID:response.drID,
      pID:response.pID,
      status:"upcoming",
      Description: "follow up",
    });
    
    const followUps=await FollowUp.find({drID:response.drID})
    res.status(200).json(followUps)
  }catch(error)
  {
    console.error(error)
    res.status(500).json({message:'Error accepting FollowUp'})
  }

}
const rejectFollowUpRequest=async(req,res)=>
{
  const {id}=req.params
  try{
    
    const response =await FollowUp.findByIdAndDelete(id)
    const followUps=await FollowUp.find({drID:response.drID});
    res.status(200).json(followUps)
  }catch(error)
  {
    console.error(error)
    res.status(500).json({message:'Error rejecting FollowUp'})
  }
}
const cancelAppointment=async (req,res)=>
{
  try
  {
    const {aid,did,pid}=req.params
    console.log(aid,did,pid)
    if (!aid || !did || !pid) {
      return res.status(400).json({ message: "Invalid parameters" });
    }
    console.log("yyyyyyy",did)
    const appointment=await Appointment.findById(aid)
    const doctor=await Doctor.findById(did)
    const patient=await Patient.findById(pid)
    if(!appointment)
    {
      res.status(500).json({message:"Appointment not found!"})
    }
    if(!doctor)
    {
      res.status(500).json({message:"Doctor not found!"})
    }
    if(!patient)
    {
      res.status(500).json({message:"Patient not found!"})
    }
    appointment.status="cancelled";
  
    ///added start
    patient.notifications.push({ //add notifiaction to patient
      message:`APPOINTEMNT CANCELED WITH DOCTOR ${doctor.name}`,
      type:"AppointmentCanceled",
    });
    doctor.notifications.push({//add notifiaction to doctor
      message:`APPOINTEMNT CANCELED WITH PATIENT ${patient.name}`,
      type:"AppointmentCanceled",
    });

    await patient.save()     
    await doctor.save();

      // Send email to the doctor
      const emailSubject2 = "Appointment Canceled";
      const emailMessage2 = `Your appointment with patient ${patient.name} has been canceled.`;
     await sendEmail( doctor.email , emailSubject2,emailMessage2 );


     // Send email to the patient
    const emailSubject = "Appointment Canceled";
    const emailMessage = `Your appointment with Dr. ${doctor.name} has been canceled.`;
    await sendEmail( patient.email,  emailSubject, emailMessage);


    //added end
    await appointment.save();

    const today=new Date();
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    const timeDifference = Math.abs(today - appointment.startDate);
   //const timeDifference = appointment.startDate-today;
    if (timeDifference > oneDayInMilliseconds) {
      console.log(timeDifference)
      console.log(patient.wallet)
      patient.wallet+=doctor.rate;
      patient.walletTransactions.push({
        amount: Number(doctor.rate),
        balanceAfter: patient.wallet,
        direction: "credit",
        type: "appointment_refund",
        description: `Appointment cancellation refund from Dr. ${doctor.name}`,
      });
      await patient.save()
      await doctor.save();
  }
   const app = await Appointment.find();
   res.status(200).json(app)

     

  }
  catch(error)
  {
    console.error(error);
    res.status(500).json({message:"Error Cancelling Appointment"})

  }

}



const sendPatientEmail = async (req, res) => {
  const { patientId } = req.params;
  const { subject, message } = req.body;

  try {
    // Retrieve patient's email from the database
    const patient = await Patient.findById(patientId);
   
    if (!patient || !patient.email) {
      return res.status(404).json({ message: 'Patient not found or no email associated.' });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL,
      to: /*patient.email*/"ahmed.elgamel@student.guc.edu.eg" ,
      subject,
      text: message,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const sendEmail = async (email, subject, message) => {
  try {
    console.log("tetst mailllll")
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: /*email*/"ahmed.elgamel@student.guc.edu.eg",
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully'); // Add this log to check if the function is reached
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Propagate the error to the calling function
  }
};

const getPatientsByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Validate doctorId
    if (!doctorId) {
      return res.status(400).json({ error: "Doctor ID is required" });
    }

    // Find all prescriptions with the specified doctor ID
    const prescriptions = await Prescription.find({ doctorID: doctorId });

    // Extract unique patient IDs from prescriptions
    const patientIds = prescriptions.map((prescription) => prescription.patientID);

    // Find patients using the extracted patient IDs and populate prescriptions
    const patients = await Patient.find({ _id: { $in: patientIds } })

    if (!patients) {
      return res.status(404).json({ error: "Patients not found" });
    }

    res.status(200).json({ patients });
  } catch (error) {
    console.error("Error in getPatientsByDoctorId:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const viewPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Validate the 'patientId' parameter
    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required" });
    }

    // Find the patient by patientId
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Fetch details about each prescription, including medicine and doctor
    const prescriptions = await Prescription.find({ patientID: patient._id })
    .populate({
      path: "doctorID",
      model: "Doctor", // Reference to the Doctor model
    })
    .populate({
      path: "meds.medID", // Update the path to access the nested medID in meds array
      model: "Medicine", // Reference to the Medicine model
    })
    .catch((populateError) => {
      console.error("Error populating data:", populateError);
      throw populateError; // Rethrow the error to be caught in the outer catch block
    });
  

    if (!prescriptions || prescriptions.length === 0) {
      return res
        .status(404)
        .json({ error: "No prescriptions found for the patient" });
    }

    // Prepare the response with the prescriptions, medicine, and doctor details
    return res.status(200).json({
      message: "Prescriptions retrieved successfully",
      prescriptions,
    });
  } catch (error) {
    console.error("Error retrieving prescriptions:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};








module.exports = {
  addDoctor,
  getPatients,
  searchPatientByName,
  patientsInUpcomingApointments,
  addPrescription,
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
  sendDoctorEmail,
  updateDosageForMedicine,
  addMedicineToPrescription,
  deleteMedicineFromPrescription,
  sendDoctorEmail,
  getFollowUpRequests,
  acceptFollowUpRequest,
  rejectFollowUpRequest,
  cancelAppointment,
  getPatientsByDoctorId,
  viewPrescriptions
  
};

