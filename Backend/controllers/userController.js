const User = require("../Models/user.js");
const Doctor = require("../Models/doctor.js");
const Patient = require("../Models/patient.js");
const Admin = require("../Models/admin.js");
const asyncHandler = require("express-async-handler");

const nodemailer = require("nodemailer");

const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function generateToken(data) {
  return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
}
const createUser = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const userfound = await User.findOne({ username: username });
    if (userfound) {
      res.status(400).json({ error: "User already exists" });
      return;
    }
    const newUser = await User.create({ username, password, role });
    const data = {
      _id: newUser._id, // Use the newly created user's _id
    };
    const token = generateToken(data);

    res.cookie("jwt", token, {
      httpOnly: true, // This prevents JavaScript from accessing the cookie
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in milliseconds
    });

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  
    const data = {
      _id: user._id,
    };

    // If the password is valid, generate a JWT token
    const token = generateToken(data);

    // Fetch additional user data based on the user's role
    let userData = { fUser: user,logId:user._id }; // Initialize with the user data

    switch (user.role) {
      case "admin":
        // Handle admin-specific data here if needed
        break;

      case "patient":
        try {
          const pa = await Patient.findOne({ username });
          userData.fUser = pa;
        } catch (err) {
          console.error("Error handling patient:", err);
          return res.status(500).json({ error: "user not found" });
        }
        break;

      case "doctor":
        try {
          const dr = await Doctor.findOne({ username });
          if (dr.status === "pending") throw error;
          userData.fUser = dr;
        } catch (error) {
          console.error("Error handling doctor:", error);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        break;

      default:
        return res.status(500).json({ error: "Unknown role" });
    }

    // Keep the account photo available to the frontend for both patient and doctor profiles.
    if (userData.fUser && typeof userData.fUser.toObject === "function") {
      userData.fUser = { ...userData.fUser.toObject(), pic: user.pic };
    } else if (userData.fUser) {
      userData.fUser.pic = user.pic;
    }

    // Set the JWT as a cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in milliseconds
    });

    res.status(201).json({
      message: "User logged in successfully",
      role: user.role,
      userData,
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const sendResetEmail = async (req, res) => {

  const { username } = req.body;
  console.log(username);

  let user; // Declare the user variable

  const u1 = await Patient.findOne({ username });
  const u2 = await Doctor.findOne({ username });
  const u3 = await Admin.findOne({ username });

  if (u1) user = u1;
  else if (u2) user = u2;
  else if (u3) user = u3;

  if (!user) {
    return res.send({ Status: "User not found" });
  }
  console.log(user.email);

  const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: "1d",
  });
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "apluscantlose@gmail.com",
      pass: "xphjykxmoqljnpen",
    },
  });
console.log(user.email);
  var mailOptions = {
    from: "apluscantlose@gmail.com",
    to: user.email,
    subject: "Reset Password Link",
    text: `http://localhost:3000/reset_password/${user._id}/${token}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return res.send({ Status: "Error sending email" }); // Handle the error and send a response
    } else {
      return res.send({ Status: "Success" });
    }
  });
};

const getUser = async (req, res) => {
  const username = req.body.username;
  console.log(username);
  try {
    const fUser = await User.findOne({ username: username });
    console.log(fUser);
    // Your switch statement should be within the try block, not outside it.
    switch (fUser.role) {
      case "patient":
        try {
          const pa = await Patient.findByUsername(fUser.username);
          return { user: { fUser, pa } };
        } catch (err) {
          console.error("Error handling patient:", err);
          res.status(500).json({ error: "Internal Server Error" });
        }
        break;
      case "doctor":
        try {
          const dr = await Doctor.findByUsername(fUser.username);
          return { user: { fUser, pa } };
        } catch (error) {
          console.error("Error handling doctor:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
        break;
      case "admin":
        try {
          return { fUser };
        } catch (error) {
          console.error("Error handling admin:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
        break;
      default:
        res.status(400).json({ error: "Unknown role" });
    }
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const checkUser = async (req, res) => {
  const user = await getUser(req.username, res);
  return user.password === req.password
    ? res.status(201).json({ message: "User created successfully", user })
    : res.status(400).json({ error: "Incorrect password" });
};

const updateUser = async (req, res) => {
  // Assuming you have a "userModel" defined somewhere, but it's not clear in your code
  // Also, the parameters for findOneAndUpdate need to be corrected
  userModel.findOneAndUpdate(
    { _id: req.params.donationID },
    req.body, // Update data
    { new: true }, // Return updated document
    (err, user) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(user);
    }
  );
};

const deleteUser = async (req, res) => {
  // Assuming you have a "userModel" defined somewhere, but it's not clear in your code
  userModel.deleteOne({ _id: req.params.donationID }, (err, donation) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ message: "successfully deleted donation" });
  });
};

const changePass = async (req, res) => {
  const { username } = req.params;
  const { oldPassword, newPassword } = req.body;
  console.log(username)
  console.log(oldPassword)
  console.log(newPassword)

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the old password matches the user's current password
    console.log(user.password);
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    // Update the password with the new one

    return res.status(200).json({
      message: "Password updated successfully",
      password: newPassword,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const allUsers = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
            { username: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword);
    res.send(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
const logout = (req, res) => {
  // Clear the token cookie
  res.clearCookie("jwt");

  res.status(200).json({ message: "User logged out successfully" });
};
const changePassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    // First, validate the token
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.json({ Status: "Error with token" });
      } else {
        // Find the user by ID
        const user = await Patient.findById(id) || await User.findById(id) || await Doctor.findById(id) || await Admin.findById(id);

        if (!user) {
          return res.json({ Status: "User not found" });
        }

        // Find the user by username
        const fuser = await User.findOne({ username: user.username });

        if (!fuser) {
          return res.json({ Status: "User not found" });
        }

        // Hash the new password
        bcrypt.hash(password, 10, async (hashErr, hash) => {
          if (hashErr) {
            return res.json({ Status: hashErr });
          }

          // Update the user's password
          fuser.password = hash;

          // Save the user with the new password
          try {
            await fuser.save();
            return res.json({ Status: "Password changed successfully" });
          } catch (saveErr) {
            return res.json({ Status: saveErr });
          }
        });
      }
    });
  } catch (error) {
    return res.json({ Status: error });
  }
};




const sendEmail = async (req, res) => {
  const { userId } = req.params;
  const { subject, message } = req.body;

  try {
    // Retrieve user's email from the database
  
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return res.status(404).json({ message: 'User not found or no email associated.' });
    }


//the mail sender
//why does this not work
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: "apluscantlose@gmail.com", // Replace with your Gmail email
//     pass: "Daragat100", // Replace with your Gmail app password
//   },
// });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

    // Email content
    const mailOptions = {
      from: process.env.EMAIL, // Replace with your Gmail email
      to: user.email,
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

module.exports = {
  createUser,
  getUser,
  checkUser,
  updateUser,
  deleteUser,
  login,
  logout,
  sendResetEmail,
  changePassword,changePass,allUsers,
  sendEmail
};
