const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      "MONGO_URI is missing. Create Backend/.env from Backend/.env.example and set your MongoDB Atlas connection string."
    );
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully.");
  } catch (error) {
    if (error.code === "ETIMEOUT" || error.code === "ENOTFOUND") {
      console.error(
        [
          "MongoDB hostname lookup failed.",
          "Check your internet/DNS connection and confirm the Atlas cluster hostname in MONGO_URI.",
          "For mongodb+srv:// URIs, DNS must support SRV/TXT lookups.",
          "If SRV lookups are blocked on this network, use the standard connection string from Atlas (not a guessed hostname).",
        ].join("\n")
      );
    }

    throw error;
  }
};

module.exports = connectDB;
