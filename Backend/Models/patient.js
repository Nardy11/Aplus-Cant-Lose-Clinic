const mongoose = require("mongoose");

const paSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true, // Email is required
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    dBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "none"], // Define allowed values for the 'role' field
      default: "none",
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    emergencyContact: {
      fullName: String,
      mobile: Number,
      relation: String,
    },
  
    family: [
      {
        fullName: String,
        NID: {
          type: Number,
        },
        age: Number,
        gender:{
          type: String,
          enum: ["male", "female", "none"], // Define allowed values for the 'role' field
          default: "none",
        },
        relation: {
          type: String,
          enum: ["spouse", "child"] // Define allowed values for the 'role' field
        },
        pid: {
          type: mongoose.Schema.Types.ObjectId, // Reference to the related patient
          ref: "Patient",
        },
      }
    ],
    doctors: [
      {
        doctorID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Doctor", // Reference to the Doctor model
        },
      },
    ],
    hPackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HPackages", // Reference to the HPackages model
    },
    hPStatus:{
      type:String,
      enum:["Subscribed","Unsubscribed","Cancelled"],
      default:"Unsubscribed"
    },SubDate:
    {
      type:Date
    }
    ,
    records: [
      {
        url: String, // Store the URL to the uploaded image
        desc: String, // Optional description for the image
      },
    ],
    healthRecords: [
      {
        date:Date,
        description:String,
        labResults:String,
        medicalInformation:String,
        primaryDiagnosis:String,
        treatment:String,

      },
    ],
    cart: [
      {
        medicineID:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
        },
        amount: Number,
      }
    ],
    addresses: [
      {
        location: String, 
      },
    ],
    medHist: [
      {
        title: {
          type: String,
          required: true,
          trim: true
        },
        description: {
          type: String,
          required: true,
          trim: true
        },
        file_path: {
          type: String,
          required: true
        },
        file_mimetype: {
          type: String,
          required: true
        }
      }
    ],
    wallet: {
      type: Number,
      default: 0,
    },
    walletTransactions: [
      {
        amount: { type: Number, required: true },
        balanceAfter: { type: Number, required: true },
        direction: { type: String, enum: ["credit", "debit"], required: true },
        type: { type: String, default: "other" },
        description: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    notifications: [
      {
        message: String,
        type: {
          type: String,
          enum: ['AppointmentScheduled', 'AppointmentRescheduled', 'AppointmentCanceled',"info"],
          default: 'info',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        entityType: {
          type: String,
          enum: ["Appointment", "Prescription", "FollowUp", "Doctor", "HealthPackage", "HealthRecord", "FamilyMember", "None"],
          default: "None",
        },
        entityId: {
          type: String,
          default: null,
        },
      },
    ],
  }
);

paSchema.statics.findByUsername = async function (username) {
  return this.find({ username });
};

module.exports = mongoose.model("Patient", paSchema);
