// FamilyMemberForm.js

import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../Consts";
import { SnackbarContext } from "../../App";
import {useContext} from 'react';
import HomeIcon from "@mui/icons-material/Home";
import IconButton from '@mui/material/IconButton';
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import {useNavigate} from 'react-router-dom';
const FamilyMemberForm = () => {
  const snackbarMessage = useContext(SnackbarContext);
const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState("spouse"); // Default to "spouse"
  const user = useSelector((state) => state.user);
  const role = useSelector((state) => state.user.role);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the user ID is available
    if (user && user.id) {
      try {
        // Make an API request using Axios to add the family member
        const response = await axios.post(
          `${API_URL}/patient/addFamilyLink/${email}/${user.id}`,
          {
            relation,
          }
        );
        if (response) {
          snackbarMessage("You have successfully edited", "success");
          navigate("/Home");
        } else {
          snackbarMessage(`error: ${response} has occurred`, "error");
        }
        console.log("Family member added successfully:", response.data);
      } catch (error) {
        console.error("Error adding family member:", error.message);
      }
    } else {
      console.error("User ID not available.");
    }
  };

  return (
    role==="patient"?(
    <div
      style={{
        width: "80%",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2>link Family Member</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </label>
        <label>
          Relation:
          <TextField
            select
            fullWidth
            size="small"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className="family-link-select"
          >
            <MenuItem value="spouse">Spouse</MenuItem>
            <MenuItem value="child">Child</MenuItem>
          </TextField>
        </label>
        <button
          type="submit"
          style={{
            width: "30%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            postion:"relative",
            maraginLeft:"auto",
        
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
        >
          link Family Member
        </button>
      </form>
      <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="home"
            sx={{ mr: 2 }}
            onClick={() => {
              window.location.href = '/Home';
            }}
          >
            <HomeIcon />
          </IconButton>
    </div>): (
    <>
      <Link to="/Login" sx={{ left: "100%" }}>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            display: { xs: "none", sm: "flex" },
            fontSize: "20px",
            maragin: "auto",
          }}
        >
          Login
        </Typography>
      </Link>
    </>
  ));

};

export default FamilyMemberForm;
