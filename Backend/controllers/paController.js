const Patient = require("../Models/patient");
const User = require("../Models/user");
const Doctor = require("../Models/doctor");
const Pharmacist = require("../Models/pharmacist");
const Medicine = require("../Models/medicine");
const Appointment = require("../Models/appointments");
const validator = require("validator");
const HPackages = require("../Models/hpackages");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Prescription = require("../Models/prescription");
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const nodemailer = require("nodemailer");
const FollowUp = require("../Models/followUps");

function generateToken(data) {
  return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
}

const createAppointment = async (req, res) => {
  try {
    const { startDate, endDate, drID, Description } = req.body;
    const pID = req.params.patientID; // Retrieve patient ID from route parameter

    // Validate inputs
    if (!startDate || !endDate || !drID || !Description) {
      return res.status(400).json({ error: "Missing required input fields" });
    }

    // Check if the doctor is already in the patient's doctors set
    const patient = await Patient.findById(pID);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Check if the doctor has any overlapping appointments
    const doctorHasOverlappingAppointments = await Appointment.exists({
      drID: drID,
      $and: [
        { startDate: { $lt: endDate } }, // Check if the new appointment starts before the end of an existing one
        { endDate: { $gt: startDate } }, // Check if the new appointment ends after the start of an existing one
      ],
    });

    if (doctorHasOverlappingAppointments) {
      return res
        .status(400)
        .json({ error: "Doctor already has appointments during this time" });
    }

    // Check if the patient has any overlapping appointments
    const patientHasOverlappingAppointments = await Appointment.exists({
      pID: pID,
      $and: [
        { startDate: { $lt: endDate } }, // Check if the new appointment starts before the end of an existing one
        { endDate: { $gt: startDate } }, // Check if the new appointment ends after the start of an existing one
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
      pID,
      Description,
    });

    // Save the appointment to the database
    const savedAppointment = await appointment.save();

    // Update the patient's doctors array with the new doctor only if not already present
    const isDoctorInArray = patient.doctors.some((doc) =>
      doc.doctorID.equals(drID)
    );
    if (!isDoctorInArray) {
      await Patient.findByIdAndUpdate(pID, {
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

const addPatient = async (req, res) => {
  console.log(req.body);
  try {
    const {
      name,
      email,
      username,
      dBirth,
      gender,
      mobile,
      emergencyContact,
      password,
    } = req.body;

    // Validate input fields
    if (
      !name ||
      !email ||
      !username ||
      !dBirth ||
      !gender ||
      !mobile ||
      !emergencyContact ||
      !password
    ) {
      return res.status(400).json({ error: "All fields are required" });
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

    // Check if the email is already in use
    const emailFound = await Patient.findOne({ email });
    const emailFound2 = await Doctor.findOne({ email });
    const emailFound3 = await Pharmacist.findOne({ email });
    if (emailFound || emailFound2 || emailFound3) {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ error: "Password not strong enough" });
    }

    // Calculate age based on date of birth
    const today = new Date();
    const birthDate = new Date(dBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Check if the patient is at least 18 years old and not over 150 years old
    if (age < 18 || age > 150) {
      return res.status(400).json({
        error: "Patient must be at least 18 and within reasonable age",
      });
    }

    // Create the patient and user records
    const patient = await Patient.create({
      name,
      email,
      username,
      dBirth,
      gender,
      mobile,
      emergencyContact,
    });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const data = {
      _id: patient._id,
    };
    const token = generateToken(data);
    const user = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      role: "patient",
    });

    res
      .status(201)
      .json({ message: "Patient created successfully", patient, token });
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const AddFromPrescToCart = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findById(prescriptionId);

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    const { patientID, meds } = prescription;

    const patient = await Patient.findById(patientID);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    for (const medication of meds) {
      const { medID } = medication;
      let existingCartItem = null;

      if (patient.cart.length > 0) {
        // Check if the medicineID already exists in the patient's cart
        existingCartItem = patient.cart.find((item) =>
          item.medicineID.equals(medID)
        );
      }

      if (existingCartItem) {
        // If the medicine already exists, increment the amount
        existingCartItem.amount += 1;
      } else {
        // If the medicine does not exist, add it to the cart with amount 1
        patient.cart.push({ medicineID: medID, amount: 1 });
      }
    }

    // Save the updated patient document
    await patient.save();

    // Respond with a JSON message after the update
    return res.status(200).json({
      message: "Prescription checked out successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



const addFamilyMember = async (req, res) => {
  const { fullName, NID, age, gender, relation } = req.body;
  const patientId = req.params.patientId; // Get patientId from URL parameters

  try {
    // Validate input fie.familyMembers
    if (!patientId || !fullName || !NID || !age || !gender || !relation) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the patient exists by ID
    const patient = await Patient.findById(req.params.patientId);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Check if the user already has a spouse

    if (relation !== "spouse" && relation !== "child") {
      return res.status(400).json({
        error: "Invalid relation. Allowed values are 'spouse' or 'child'",
      });
    }

    // Create the family member object
    const familyMember = { fullName, NID, age, gender, relation };

    // Add the family member to the "family" array
    patient.family.push(familyMember);

    // Save the updated patient document
    await patient.save();

    return res
      .status(201)
      .json({ message: "Family member added successfully", patient });
  } catch (error) {
    console.error("Error adding family member:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const viewFamilyMembers = async (req, res) => {
  const { patientId } = req.params;

  try {
    // Find the patient by ID
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Retrieve the family members of the patient
    const familyMembers = patient.family;

    return res.status(200).json({
      message: "Family members retrieved successfully",
      familyMembers,
    });
  } catch (error) {
    console.error("Error retrieving family members:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const viewDoctors = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    // Find the patient by patientId
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Find doctors with status "accepted"
    const doctors = await Doctor.find({ status: "accepted" });

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ error: "No accepted doctors found" });
    }

    // Prepare an array to store doctor information
    const doctorInfo = [];

    // Iterate through each accepted doctor and include all doctor information
    for (const doctor of doctors) {
      // Find the health package associated with the patient
      const healthPackage = await HPackages.findById(patient.hPackage);

      // Calculate session price based on doctor's rate, health package, and fee
      let sessionPrice = doctor.rate;

      if (healthPackage) {
        sessionPrice *= 1.1 * (1 - healthPackage.doctorDisc / 100);
      } else {
        sessionPrice *= 1.1;
      }

      // Include all doctor information and the session price
      const doctorInfoItem = {
        ...doctor.toObject(), // Include all doctor information
        sessionPrice, // Include the session price
      };

      doctorInfo.push(doctorInfoItem);
    }

    return res
      .status(200)
      .json({ message: "Accepted doctors information", doctors: doctorInfo });
  } catch (error) {
    console.error("Error retrieving accepted doctors information:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const freeAppiontmentSlot = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Validate the 'patientId' parameter
    if (!doctorId) {
      return res.status(400).json({ error: "doctorId ID is required" });
    }

    // Find the patient by patientId
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Fetch details about each free Appointment
    const Appointments = await Appointment.find({
      drID: doctorId,
      status: "Not_Reserved",
    }).populate("drID");
    return res.status(200).json({
      message: "Free Appointments retrieved successfully",
      Appointments,
    });
  } catch (error) {
    console.error("Error retrieving Appointments:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const reserveAppointmentSlot = async (req, res) => {
  try {
    const { AppointmentId } = req.params;
    const { username, Description } = req.body;

    // Validate AppointmentId, username, and Description
    if (!AppointmentId || !username || !Description) {
      return res.status(400).json({
        error: "AppointmentId, username, and Description are required",
      });
    }

    // Find the patient by username
    const patient = await Patient.findOne({ username });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Update the appointment with the patient information
    await Appointment.findByIdAndUpdate(AppointmentId, {
      Description,
      pID: patient._id,
      status: "upcoming",
    });

    res.status(200).json({ message: "Appointment updated successfully" });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const searchDoctorsByNameOrspeciality = async (req, res) => {
  try {
    const { name, speciality } = req.query;

    // Validate that at least one input is provided
    if (!name && (!speciality || speciality.trim() === "")) {
      return res
        .status(400)
        .json({ error: "At least one input (name or speciality) is required" });
    }

    const query = {};

    // Build the query based on provided parameters
    if (name && name.trim() !== "") {
      query.name = { $regex: name, $options: "i" };
    }

    if (speciality && speciality.trim() !== "") {
      query.speciality = { $regex: speciality, $options: "i" };
    }

    // Perform the doctor search with the constructed query
    const doctors = await Doctor.find(query);

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ error: "No matching doctors found" });
    }

    // Prepare the response with the found doctors and consider the patient-specific health package
    const doctorInfo = await Promise.all(
      doctors.map(async (doctor) => {
        const patientId = req.params.patientId;
        const patient = await Patient.findById(patientId);

        if (!patient) {
          return {
            name: doctor.name,
            speciality: doctor.speciality,
            sessionPrice: doctor.rate * 1.1, // Assuming no health package
          };
        }

        const healthPackage = await HPackages.findById(patient.hPackage);

        return {
          name: doctor.name,
          speciality: doctor.speciality,
          sessionPrice:
            doctor.rate * 1.1 * (1 - (healthPackage?.doctorDisc || 0) / 100),
        };
      })
    );

    return res
      .status(200)
      .json({ message: "Doctors retrieved successfully", doctors: doctorInfo });
  } catch (error) {
    console.error("Error searching for doctors:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const searchDoctorsByspecialityOrAvailability = async (req, res) => {
  try {
    const { searchTime, speciality } = req.query;

    // Check if neither 'searchTime' nor 'speciality' is provided
    if (!searchTime && (!speciality || speciality.trim() === "")) {
      return res.status(400).json({
        error: "At least one input (searchTime or speciality) is required",
      });
    }

    // Convert 'searchTime' to a Date object if provided
    const searchDateTime = searchTime ? new Date(searchTime) : null;

    // Find appointments that overlap with the specified time if 'searchTime' is provided
    const overlappingAppointments = searchDateTime
      ? await Appointment.find({
          startDate: { $lt: searchDateTime },
          endDate: { $gt: searchDateTime },
        })
      : [];

    // Get the list of doctor IDs from the overlapping appointments
    const doctorIds = overlappingAppointments.map(
      (appointment) => appointment.drID
    );

    // Build the query to find available doctors based on speciality and/or availability
    const query = {};
    if (searchDateTime) {
      query._id = { $nin: doctorIds };
    }
    if (speciality && speciality.trim() !== "") {
      query.speciality = { $regex: speciality, $options: "i" };
    }

    // Find available doctors who match the specified criteria
    const availableDoctors = await Doctor.find(query);

    if (!availableDoctors || availableDoctors.length === 0) {
      return res
        .status(404)
        .json({ error: "No available doctors found matching the criteria" });
    }

    // Prepare the response with the available doctors and consider the patient-specific health package
    const doctorInfo = await Promise.all(
      availableDoctors.map(async (doctor) => {
        const patientId = req.params.patientId;
        const patient = await Patient.findById(patientId);

        if (!patient) {
          return {
            name: doctor.name,
            speciality: doctor.speciality,
            sessionPrice: doctor.rate * 1.1, // Assuming no health package
          };
        }

        const healthPackage = await HPackages.findById(patient.hPackage);

        return {
          name: doctor.name,
          speciality: doctor.speciality,
          sessionPrice:
            doctor.rate * 1.1 * (1 - (healthPackage?.doctorDisc || 0) / 100),
        };
      })
    );

    return res.status(200).json({
      message: "Available doctors retrieved successfully",
      doctors: doctorInfo,
    });
  } catch (error) {
    console.error("Error searching for available doctors:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const viewAppoints = async (req, res) => {
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
    const Appointments = await Appointment.find({ pID: patient._id }).populate({
      path: "drID",
      model: "Doctor",
    });

    // if (!Appointments || Appointments.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ error: "No Appointments found for the patient" });
    // }

    // Prepare the response with the prescriptions, medicine, and doctor details
    return res.status(200).json({
      message: "Appointments retrieved successfully",
      Appointments,
    });
  } catch (error) {
    console.error("Error retrieving prescriptions:", error);
    return res.status(500).json({ error: "Internal Server Error" });
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

const patientFilterAppointments = async (req, res) => {
  const { patientId, startDate, endDate, status } = req.query;

  // Check if at least one filter parameter is provided
  if (!patientId && !startDate && !endDate && !status) {
    return res
      .status(400)
      .json({ error: "At least one filter parameter is required" });
  }

  // Build the query object based on the provided parameters
  const query = {
    pID: patientId,
  };

  if (startDate) {
    query.startDate = { $gte: new Date(startDate) };
  }

  if (endDate) {
    query.endDate = { $lte: new Date(endDate) };
  }

  if (status) {
    query.Description = status;
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

const appointmentPatients = async (req, res) => {
  try {
    const doctorId = req.params.doctorId; // Assuming the doctor's ID is in the request params
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: "Invalid doctorId" });
    }
    // Use Mongoose to find all appointments for the specified doctor
    const appointments = await Appointment.find({
      drID: doctorId,
      status: "Not_Reserved",
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const filterPrescriptions = async (req, res) => {
  try {
    const { date, doctorNameInput, doctorspecialityInput, status } = req.query;
    const patientId = req.params.patientId; // Retrieve patient ID from route parameter

    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required" });
    }

    // Check if no filters are provided
    if (!date && !doctorNameInput && !doctorspecialityInput && !status) {
      return res
        .status(400)
        .json({ error: "At least one filter input is required" });
    }

    // Build the query based on the provided filters
    const query = {
      patientID: patientId, // Use patientID instead of _id
    };

    if (date) {
      query.datePrescribed = date;
    }

    if (status) {
      query.status = status;
    }

    // Find prescriptions based on the query
    const prescriptions = await Prescription.find(query).populate(
      "medID doctorID"
    );

    if (!prescriptions || prescriptions.length === 0) {
      return res.status(404).json({ error: "No prescriptions found" });
    }

    // Filter prescriptions based on the provided criteria
    const filteredPrescriptions = prescriptions.filter((prescription) => {
      let match = true;

      // Check doctor name if doctorNameInput is provided
      if (doctorNameInput) {
        const doctorName = prescription.doctorID.name.toLowerCase();
        const input = doctorNameInput.toLowerCase();

        if (!doctorName.includes(input)) {
          match = false;
        }
      }

      // Check doctor speciality if doctorspecialityInput is provided
      if (doctorspecialityInput) {
        const doctorspeciality = prescription.doctorID.speciality.toLowerCase();
        const input = doctorspecialityInput.toLowerCase();

        if (!doctorspeciality.includes(input)) {
          match = false;
        }
      }

      return match;
    });

    res.status(200).json({
      message: "Prescriptions filtered successfully",
      prescriptions: filteredPrescriptions,
    });
  } catch (error) {
    console.error("Error filtering prescriptions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const viewSpecificPrescription = async (req, res) => {
  try {
    const prescriptionId = req.params.id; // Get the prescription ID from the query

    // Check if the prescription ID is provided in the query
    if (!prescriptionId) {
      return res
        .status(400)
        .json({ error: "Prescription ID is required in the query" });
    }

    // Find the prescription by its ID and populate related data
    const prescription = await Prescription.findById(prescriptionId)
      .populate({
        path: "meds.medID", // Update the path to access the nested medID in meds array
        model: "Medicine", // Reference to the Medicine model
      })
      .populate("patientID") // Populate the Patient
      .populate("doctorID"); // Populate the Doctor

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    return res.status(200).json({
      message: "Prescription and related data retrieved successfully",
      prescription,
    });
  } catch (error) {
    console.error("Error retrieving prescription:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Import your Doctor schema/model
const getAlldoctors = async (req, res) => {
  try {
    // Use the Mongoose 'find' method to retrieve all doctors
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    // Handle any errors that may occur during the database query
    console.error("Error fetching doctors:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching doctors." });
  }
};

const subscribeToHealthPackage = async (req, res) => {
  const { patientId, healthPackageId } = req.query;

  try {
    // Validate input fields
    if (!patientId || !healthPackageId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the patient exists by ID
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Check if the health package exists by ID
    const healthPackage = await HPackages.findById(healthPackageId);

    if (!healthPackage) {
      return res.status(404).json({ error: "Health Package not found" });
    }

    // Check if the patient is already subscribed to this health package
    if (patient.hPackage && patient.hPackage.equals(healthPackage._id)) {
      return res.status(400).json({
        error: "Patient is already subscribed to this Health Package",
      });
    }

    // Add the health package to the patient's array of health packages
    patient.hPackage = healthPackage;

    // Save the updated patient document
    await patient.save();

    return res.status(201).json({
      message: "Subscribed to Health Package added successfully",
      patient,
    });
  } catch (error) {
    console.error("Error Subscribing to Health Package:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//blabizozozozozo
const unSubscribeToHealthPackage = async (req, res) => {
  const { patientId, healthPackageId } = req.query;
  console.log("entered unsubscribe to health package");
  console.log(patientId);
  console.log(healthPackageId);

  try {
    // Validate input fields
    if (!patientId || !healthPackageId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the patient exists by ID
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Check if the health package exists by ID
    const healthPackage = patient.hPackage;

    if (!healthPackage) {
      return res
        .status(404)
        .json({ error: "Health Package is not subscribed to" });
    }

    // Unsubscribe by setting the health package to null
    // patient.hPackage = null;
    patient.hPStatus = "Cancelled";
    await patient.save();

    // Now, call the viewHealthPackagesPatient function to retrieve the updated list
    return await viewHealthPackagesPatient({ params: { patientId } }, res);
  } catch (error) {
    console.error("Error Unsubscribing from Health Package:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const payWithWallet = async (req, res) => {
  const { amount } = req.body;
  const { patientId, healthPackageId } = req.params;
  try {
    if (!patientId || !healthPackageId) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const patient = await Patient.findOne({ _id: patientId });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found!" });
    }

    if (patient.wallet < amount) {
      return res.status(400).json({ error: "Balance not Sufficient" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    patient.wallet -= amount;
    patient.hPackage = healthPackageId;
    patient.hPStatus = "Subscribed";
    patient.SubDate = today;
    await patient.save();

    res
      .status(200)
      .json({ message: "Successfully subscribed to health package" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const viewHealthPackagesPatient = async (req, res) => {
  try {
    // Simulate patient data retrieval (replace with your actual method)
    const patient = await Patient.findById(req.params.patientId);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const healthPackages = await HPackages.find();

    // Check if the patient has a health package ID
    const patientSubscribedPackage = patient.hPackage;

    // Map the health packages and add the subscription status
    const healthPackagesWithSubscriptions = healthPackages.map(
      (healthPackage) => {
        // const isSubscribed = patientSubscribedPackage ? patientSubscribedPackage.equals(healthPackage._id) : false;
        const isSubscribed =
          patientSubscribedPackage &&
          patientSubscribedPackage.equals(healthPackage._id) &&
          patient.hPStatus === "Subscribed";

        return {
          ...healthPackage.toObject(),
          isSubscribed,
        };
      }
    );

    res.status(200).json({
      message: "Health packages fetched successfully",
      healthPackages: healthPackagesWithSubscriptions,
    });
  } catch (error) {
    console.error("Error fetching health packages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const viewWallet = async (req, res) => {
  const { patientId } = req.params;
  try {
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    if (!patient.wallet) {
      // If the patient doesn't have a wallet attribute, add it with a value of zero
      patient.wallet = 0;
      await patient.save();
    }

    const walletAmount = patient.wallet;

    res.status(200).json({
      message: " wallet amount is fetched successfully",
      patient: patient,
      wallet: walletAmount,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const ccSubscriptionPayment = async (req, res) => {
  const { patientId, healthPackageId } = req.params;
  try {
    if (!patientId || !healthPackageId) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const patient = await Patient.findOne({ _id: patientId });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found!" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    patient.hPackage = healthPackageId;
    patient.hPStatus = "Subscribed";
    patient.SubDate = today;
    await patient.save();

    res
      .status(200)
      .json({ message: "Successfully subscribed to health package" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const healthPackageInfo = async (req, res) => {
  const { patientId, healthPackageId } = req.params;

  try {
    const patient = await Patient.findOne({
      _id: patientId,
      hPackage: healthPackageId,
    }).populate("hPackage");

    if (patient && patient.hPackage) {
      const { hPStatus, SubDate, hPackage } = patient;
      // const { RenewDate } = hPackage;

      let endDate;

      if (hPStatus === "Subscribed" || hPStatus === "Cancelled") {
        // If subscribed, calculate end date as one month more than subscribed date
        const endDateFormat = new Date(SubDate);
        endDateFormat.setMonth(endDateFormat.getMonth() + 1);
        endDate = endDateFormat.toISOString();
      } else {
        // If cancelled, use the EndDate directly
        endDate = hPackage.EndDate;
      }

      //subscribed and cancelled both have same dates but they are called differently one is renewal date and one is endate
      if (hPStatus === "Subscribed") {
        return res.status(200).json({
          // subscribed: true,
          status: hPStatus,
          subscribedDate: SubDate,
          // renewedDate: RenewDate,
          renewedDate: endDate,
        });
      } else if (hPStatus === "Cancelled") {
        return res.status(200).json({
          // subscribed: false,
          status: hPStatus,
          endDate: endDate,
        });
      } else {
        return res.status(200).json({
          // subscribed: false,
          status: hPStatus,
          message: "Health package not subscribed by the patient.",
        });
      }
    } else {
      return res.status(200).json({
        // subscribed: false,
        message: "Health package not subscribed by the patient.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createCheckoutSession = async (req, res) => {
  try {
    const { pid, id } = req.params;
    const trimmedId = id.trim();

    let healthPackage = null;

    if (trimmedId.match(/^[0-9a-fA-F]{24}$/)) {
      healthPackage = await HPackages.findById(trimmedId);
    }

    if (!healthPackage) {
      return res.status(404).json({ error: "Health package not found" });
    }

    const { rate } = healthPackage;
    if (isNaN(rate)) {
      return res.status(500).json({ error: "Invalid rate value" });
    }

    const newRate = rate * 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: healthPackage.type,
            },
            unit_amount: newRate,
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:3000/Success/${pid}/${trimmedId}`,
      cancel_url: "http://localhost:3000/ViewHealthPackage",
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

const viewPatientHealthRecords = async (req, res) => {
  try {
    const pId = req.params.patientid;

    // Check if the prescription ID is provided in the query
    if (!pId) {
      return res
        .status(400)
        .json({ error: "Patient ID is required in the query" });
    }
    const createCheckoutSession = async (req, res) => {
      try {
        const { pid, id } = req.params;
        const trimmedId = id.trim();

        let healthPackage = null;

        if (trimmedId.match(/^[0-9a-fA-F]{24}$/)) {
          healthPackage = await HPackages.findById(trimmedId);
        }

        if (!healthPackage) {
          return res.status(404).json({ error: "Health package not found" });
        }

        const { rate } = healthPackage;
        const newRate = rate * 100;

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: healthPackage.type,
                },
                unit_amount: newRate,
              },
              quantity: 1,
            },
          ],
          success_url: `http://localhost:3000/Success/${pid}/${trimmedId}`,
          cancel_url: "http://localhost:3000/ViewHealthPackage",
        });

        res.json({ url: session.url });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
      }
    };

    // Find the patient by its ID and populate related data
    const HealthRecords = await Patient.findById(pId, {
      name: 0,
      email: 0,
      username: 0,
      dBirth: 0,
      gender: 0,
      mobile: 0,
      emergencyContact: 0,
      family: 0,
      doctors: 0,
      __v: 0,
      cart: 0,
      addresses: 0,
      wallet: 0,
      records: 0,
    }).populate("healthRecords");

    if (!HealthRecords) {
      return res.status(404).json({ error: "HealthRecords not found" });
    }
    console.log("Reached HealthRecords");

    return res.status(200).json({
      message: "HealthRecords and related data retrieved successfully",
      HealthRecords,
    });
  } catch (error) {
    console.error("Error retrieving HealthRecords data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const createAppointmentCheckoutSession = async (req, res) => {
  try {
    const { amount, appointmentId, patientId } = req.params;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Appointment",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:3000/SuccessAppoint/${appointmentId}/${patientId}`,
      cancel_url: `http://localhost:3000/ViewAppointments`,
    });

    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { startDate, endDate } = req.body;

    // Assuming you have a model named 'Appointment' for your appointments
    const appointment = await Appointment.findById(appointmentId)
      .populate("drID")
      .populate("pID");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const doctor = appointment.drID;
    const patient = appointment.pID;
    const dId = doctor._id;
    const pId = patient._id;

    // console.log(appointment)

    // Update the start and end dates
    appointment.startDate = startDate;
    appointment.endDate = endDate;

    ///added start
    patient.notifications.push({
      //add notifiaction to patient
      message: `APPOINTEMNT RESCHEULED WITH DOCTOR ${doctor.name}`,
      type: "AppointmentRescheduled",
    });
    doctor.notifications.push({
      //add notifiaction to doctor
      message: `APPOINTEMNT RESCHEULED WITH PATIENT ${patient.name}`,
      type: "AppointmentRescheduled",
    });

    //still will send to doctor
    //added end

    // Save the updated appointment

    await patient.save();
    await doctor.save();
    await appointment.save();

    // Send email to the doctor
    const emailSubject2 = "Appointment Reschedule";
    const emailMessage2 = `Your appointment with patient ${patient.name} has been Reschedule.`;
    await sendEmail(doctor.email, emailSubject2, emailMessage2);

    // Send email to the patient
    const emailSubject = "Appointment Reschedule";
    const emailMessage = `Your appointment with Dr. ${doctor.name} has been Reschedule.`;
    await sendEmail(patient.email, emailSubject, emailMessage);

    res.json({
      success: true,
      message: "Appointment successfully rescheduled",
    });
  } catch (error) {
    console.error("Error rescheduling appointment", error);
    res
      .status(500)
      .json({ success: false, message: "Error rescheduling appointment" });
  }
};

const successCreditCardPayment = async (req, res) => {
  try {
    const { patientID, appointmentID } = req.params;

    // Check if the patient and appointment exist
    const patient = await Patient.findById(patientID);
    const appointment = await Appointment.findById(appointmentID);
    console.log(patientID);
    console.log(appointmentID);

    if (!patient || !appointment) {
      return res
        .status(404)
        .json({ message: "Patient or Appointment not found" });
    }

    // Update the appointment status to 'completed' (or any other desired status)
    appointment.status = "upcoming";
    appointment.pID = patientID;

    // Save changes to the appointment
    await appointment.save();

    res.json({
      message: "Credit card payment successful, appointment scheduled",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { aid, did, pid } = req.params;
    if (!aid || !did || !pid) {
      return res.status(400).json({ message: "Invalid parameters" });
    }
    console.log("yyyyyyy", did);
    const appointment = await Appointment.findById(aid);
    const doctor = await Doctor.findById(did);
    const patient = await Patient.findById(pid);
    if (!appointment) {
      res.status(500).json({ message: "Appointment not found!" });
    }
    if (!doctor) {
      res.status(500).json({ message: "Doctor not found!" });
    }
    if (!patient) {
      res.status(500).json({ message: "Patient not found!" });
    }
    appointment.status = "cancelled";

    ///added start
    patient.notifications.push({
      //add notifiaction to patient
      message: `APPOINTEMNT CANCELED WITH DOCTOR ${doctor.name}`,
      type: "AppointmentCanceled",
    });
    doctor.notifications.push({
      //add notifiaction to doctor
      message: `APPOINTEMNT CANCELED WITH PATIENT ${patient.name}`,
      type: "AppointmentCanceled",
    });

    await patient.save();
    await doctor.save();

    // Send email to the doctor
    const emailSubject2 = "Appointment Canceled";
    const emailMessage2 = `Your appointment with patient ${patient.name} has been canceled.`;
    await sendEmail(doctor.email, emailSubject2, emailMessage2);

    // Send email to the patient
    const emailSubject = "Appointment Canceled";
    const emailMessage = `Your appointment with Dr. ${doctor.name} has been canceled.`;
    await sendEmail(patient.email, emailSubject, emailMessage);

    //added end
    await appointment.save();

    const today = new Date();
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    const timeDifference = Math.abs(today - appointment.startDate);
    //const timeDifference = appointment.startDate-today;
    if (timeDifference > oneDayInMilliseconds) {
      console.log(timeDifference);
      console.log(patient.wallet);
      patient.wallet += doctor.rate;
      await patient.save();
      await doctor.save();
    }
    // const app = await Appointment.find();
    // res.status(200).json(app)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error Cancelling Appointment" });
  }
};

// Function to get notifications of a patient
const getPatientNotifications = async (req, res) => {
  const patientId = req.params.patientId;

  try {
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const notifications = patient.notifications;
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Function to add a new notification for a patient
const addPatientNotification = async (req, res) => {
  const patientId = req.params.patientId;
  const { message, type } = req.body;

  try {
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    patient.notifications.push({
      message,
      type: type || "info",
    });

    await patient.save();

    return res
      .status(201)
      .json({ message: "Notification added successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Function to update notifications for a specific patient
const updatePatientNotifications = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const updatedNotifications = req.body.notifications;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    patient.notifications = updatedNotifications;

    await patient.save();

    return res
      .status(201)
      .json({ message: "Notifications array updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const sendPatientEmail = async (req, res) => {
  const { patientId } = req.params;
  const { subject, message } = req.body;

  try {
    // Retrieve patient's email from the database
    const patient = await Patient.findById(patientId);

    if (!patient || !patient.email) {
      return res
        .status(404)
        .json({ message: "Patient not found or no email associated." });
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
      to: /*patient.email*/ "ahmed.elgamel@student.guc.edu.eg",
      subject,
      text: message,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendEmail = async (email, subject, message) => {
  try {
    console.log("tetst mailllll");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: /*email*/ "ahmed.elgamel@student.guc.edu.eg",
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully"); // Add this log to check if the function is reached
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Propagate the error to the calling function
  }
};

const requestFollowUp = async (req, res) => {
  const { pid, did } = req.params;

  if (!pid || !did) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
    const patient = await Patient.findById(pid);
    const response = await FollowUp.create({
      pID: pid,
      drID: did,
      patientName: patient.name,
      requestDate: formattedDate,
    });
    res
      .status(201)
      .json({ message: "Follow-up requested successfully", data: response });
  } catch (error) {
    console.error("Error Requesting FollowUp:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getID = async (req, res) => {
  const { username } = req.params;

  try {
    const patient = await Patient.findOne({ username: username });

    if (!patient) {
      // If no patient is found with the given username
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ _id: patient._id });
  } catch (error) {
    console.error("Error getting id:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const payWithWalletF = async (req, res) => {
  const { amount } = req.body;
  const { patientId, healthPackageId, id } = req.params;
  try {
    if (!patientId || !healthPackageId || !id) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const patient = await Patient.findOne({ _id: patientId });
    //this is the family member that will pay
    const familyMem = await Patient.findOne({ _id: id });

    if (!patient || !familyMem) {
      return res.status(404).json({ error: "Patient not found!" });
    }

    if (familyMem.wallet < amount) {
      return res.status(400).json({ error: "Balance not Sufficient" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    familyMem.wallet -= amount;
    patient.hPackage = healthPackageId;
    patient.hPStatus = "Subscribed";
    patient.SubDate = today;
    await patient.save();
    await familyMem.save();

    res
      .status(200)
      .json({ message: "Successfully subscribed to health package" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const addMedicineToCart2 = async (userId, medicineId) => {
  try {
    const patient = await Patient.findById(userId);
    console.log(medicineId);
    if (!patient) {
      return { error: "Patient not found" };
    }

    if (!patient.cart || patient.cart.length === 0) {
      return { error: "Patient's cart is empty" };
    }

    if (typeof medicineId === "undefined") {
      return { error: "Medicine ID is missing" };
    }
    let existingMedicine = null;
    if (patient.cart.length !== 0) {
      existingMedicine = patient.cart.find(
        (item) =>
          item.medicineID &&
          item.medicineID.toString() === medicineId.toString()
      );
    }
    if (existingMedicine) {
      if (existingMedicine.amount + 1 > medicine.amount) {
        return { error: "Exceeded available quantity" };
      }
      existingMedicine.amount += 1;
    } else {
      if (1 > medicine.amount) {
        return { error: "Exceeded available quantity" };
      }
      patient.cart.push({ medicineID: medicineId, amount: 1 });
    }

    await patient.save();

    return { message: "Medicine added to cart successfully", patient };
  } catch (error) {
    console.error("Error adding medicine to cart:", error);
    return { error: "Internal Server Error" };
  }
};

const AddFromPrescToCart2 = async (req, res) => {
  try {
    const { pId, prescID } = req.params;

    // Find prescriptions for the given patientId and status "unfilled"
    const prescription = await Prescription.findById(prescID);

    if (!prescription || prescription.length === 0) {
      return res
        .status(404)
        .json({ message: "No unfilled prescriptions found for the patient" });
    }

    // Extract medicine IDs from prescriptions
    const medicineIds = prescription.meds.map((med) => med.medID);

    // Find prescription medicines with type "Prescription", matching IDs, and status "unarchived"
    const prescriptionMedicines = await Medicine.find({
      _id: { $in: medicineIds },
      status: "unarchived",
    });

    if (!prescriptionMedicines || prescriptionMedicines.length === 0) {
      return res.status(404).json({
        message: "No unarchived prescription medicines found for the patient",
      });
    }
    console.log(medicineIds);
    await Promise.all(
      medicineIds.map(
        async (medicineId) => await addMedicineToCart2(pId, medicineId)
      )
    );
    res.status(200).json({
      message: "Unarchived Prescription medicines retrieved successfully",
      prescriptionMedicines,
    });
  } catch (error) {
    console.error("Error fetching prescription medicines:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId).lean();
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const user = await User.findById(req.params.patientId).select(
      "name email username pic role createdAt updatedAt"
    ).lean();

    if (!user) return res.status(404).json({ error: "User account not found" });

    return res.json({
      ...patient,
      name: patient.name ?? user.name ?? "",
      email: patient.email ?? user.email ?? "",
      username: patient.username ?? user.username ?? "",
      pic: user.pic || "",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Error getting patient profile:", error);
    return res.status(500).json({ error: "Unable to load profile" });
  }
};

const updatePatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    const user = await User.findById(req.params.patientId);

    if (!patient || !user) {
      return res.status(404).json({ error: "Patient profile not found" });
    }

    const {
      name,
      email,
      username,
      dBirth,
      mobile,
      emergencyContact,
      address,
      pic,
    } = req.body;

    if (!name?.trim() || !email?.trim() || !username?.trim() || !mobile) {
      return res.status(400).json({
        error: "Name, email, username and mobile number are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    const emailOwner = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });
    if (emailOwner) {
      return res.status(409).json({ error: "This email is already in use." });
    }

    const usernameOwner = await User.findOne({
      username: normalizedUsername,
      _id: { $ne: user._id },
    });
    if (usernameOwner) {
      return res.status(409).json({ error: "This username is already in use." });
    }

    const patientEmailOwner = await Patient.findOne({
      email: normalizedEmail,
      _id: { $ne: patient._id },
    });
    if (patientEmailOwner) {
      return res.status(409).json({ error: "This email is already in use." });
    }

    const patientUsernameOwner = await Patient.findOne({
      username: normalizedUsername,
      _id: { $ne: patient._id },
    });
    if (patientUsernameOwner) {
      return res.status(409).json({ error: "This username is already in use." });
    }

    patient.name = name.trim();
    patient.email = normalizedEmail;
    patient.username = normalizedUsername;
    patient.dBirth = dBirth ? new Date(dBirth) : undefined;
    patient.mobile = mobile;
    if (emergencyContact) {
      patient.emergencyContact = {
        fullName: emergencyContact.fullName || "",
        mobile: emergencyContact.mobile || "",
        relation: emergencyContact.relation || "",
      };
    }
    if (address !== undefined) {
      patient.addresses = address.trim() ? [{ location: address.trim() }] : [];
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    user.username = normalizedUsername;
    if (typeof pic === "string" && pic.trim()) {
      user.pic = pic;
    }

    await Promise.all([patient.save(), user.save()]);

    return res.json({
      message: "Profile updated successfully",
      profile: {
        ...patient.toObject(),
        pic: user.pic || "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating patient profile:", error);
    return res.status(500).json({ error: "Unable to update profile" });
  }
};

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  addPatient,
  addFamilyMember,
  viewFamilyMembers,
  viewDoctors,
  getAlldoctors,
  searchDoctorsByNameOrspeciality,
  viewAppoints,
  searchDoctorsByspecialityOrAvailability,
  viewPrescriptions,
  patientFilterAppointments,
  createAppointment,
  viewSpecificPrescription,
  freeAppiontmentSlot,
  reserveAppointmentSlot,
  appointmentPatients,
  subscribeToHealthPackage,
  unSubscribeToHealthPackage,
  payWithWallet,
  AddFromPrescToCart,
  viewHealthPackagesPatient,
  viewWallet,
  ccSubscriptionPayment,
  createCheckoutSession,
  healthPackageInfo,
  viewPatientHealthRecords,
  createAppointmentCheckoutSession,
  rescheduleAppointment,
  successCreditCardPayment,
  cancelAppointment,
  getPatientNotifications,
  addPatientNotification,
  updatePatientNotifications,
  sendPatientEmail,
  requestFollowUp,
  getID,
  payWithWalletF,
};
