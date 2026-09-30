import React, { useState } from "react";
import "../../styles.css";
import { useDispatch } from "react-redux";
import { useContext } from "react";
import { changePassword } from "../../features/userSlice";
import { SnackbarContext } from "../../App";
import { useNavigate, useParams } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import LockResetIcon from "@mui/icons-material/LockResetRounded";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const ChangePass = () => {
  const [email, setEmail] = useState("");
  const { id, token } = useParams();
  const snackbarMessage = useContext(SnackbarContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const password = event.target.elements.password.value;
    const password2 = event.target.elements.password2.value;
    if (password !== password2) {
      snackbarMessage(`error: not matched password`, "error");
    } else {
      const response = dispatch(changePassword({ password, id, token }));

      if (response) {
        snackbarMessage("Password has been changed", "success");
        navigate("/Login");
      } else {
        snackbarMessage(`error: ${response.message} has occurred`, "error");
      }
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowPassword2 = () => {
    setShowPassword2(!showPassword2);
  };

  return (
    <main className="auth-page auth-page-centered">
      <section className="auth-card reset-card change-pass-card">
        <div className="reset-icon"><LockResetIcon /></div>
        <span className="auth-eyebrow">SECURITY</span>
        <h1>Set a new password</h1>
        <p className="reset-copy">Choose a strong password for your A+ Clinic account.</p>
        <div className="formContainer">
          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="password" className="auth-field-label">
              Password:
            </label>
            <div className="auth-password-field">
              <OutlinedInput
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                required
                className="auth-password-input"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowPassword}>
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </div>
            <label htmlFor="password2" className="auth-field-label">
              Repeat Password:
            </label>
            <div style={styles.passwordInputContainer}>
              <OutlinedInput
                type={showPassword2 ? "text" : "password"}
                required
                id="password2"
                name="password2"
                style={styles.input}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowPassword2}>
                      {showPassword2 ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </div>
            <button type="submit" style={styles.button}>
              Change Password
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};
