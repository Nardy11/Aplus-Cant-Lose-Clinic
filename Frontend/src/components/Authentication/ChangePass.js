import React, { useState, useContext } from "react";
import "../../styles.css";
import { useDispatch } from "react-redux";
import { changePassword } from "../../features/userSlice";
import { SnackbarContext } from "../../App";
import { useNavigate, useParams } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";

const ChangePass = () => {
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
      snackbarMessage("The passwords do not match.", "error");
      return;
    }

    const response = dispatch(changePassword({ password, id, token }));
    if (response) {
      snackbarMessage("Password has been changed successfully.", "success");
      navigate("/Login");
    } else {
      snackbarMessage(`error: ${response.message} has occurred`, "error");
    }
  };

  return (
    <main className="auth-page auth-page-centered">
      <section className="auth-card reset-card change-pass-card">
        <div className="reset-icon"><LockResetRoundedIcon /></div>
        <span className="auth-eyebrow">SECURITY</span>
        <h1>Set a new password</h1>
        <p className="reset-copy">
          Choose a strong password for your A+ Clinic account.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="password">New password</label>
            <div className="auth-password-field">
              <OutlinedInput
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                required
                className="auth-password-input"
                fullWidth
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="password2">Confirm new password</label>
            <div className="auth-password-field">
              <OutlinedInput
                type={showPassword2 ? "text" : "password"}
                required
                id="password2"
                name="password2"
                className="auth-password-input"
                fullWidth
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      onClick={() => setShowPassword2((value) => !value)}
                    >
                      {showPassword2 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </div>
          </div>

          <button type="submit" className="auth-submit">
            Change password
          </button>
        </form>
      </section>
    </main>
  );
};

export default ChangePass;
