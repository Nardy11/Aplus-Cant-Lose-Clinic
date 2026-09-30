import React, { useState, useContext } from "react";
import { useDispatch } from "react-redux";
import { sendResetEmail } from "../../features/userSlice";
import { SnackbarContext } from "../../App";
import { useNavigate, NavLink } from "react-router-dom";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import "../../styles.css";

const ResetPassword = () => {
  const [username, setUsername] = useState("");
  const snackbarMessage = useContext(SnackbarContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const response = dispatch(sendResetEmail(username));

    if (response) {
      snackbarMessage("If the account exists, check your email for the reset link.", "success");
      navigate("/Login");
    }
  };

  return (
    <main className="auth-page auth-page-centered">
      <section className="auth-card reset-card">
        <div className="reset-icon"><LockResetRoundedIcon /></div>
        <span className="auth-eyebrow">ACCOUNT RECOVERY</span>
        <h1>Reset your password</h1>
        <p className="reset-copy">
          Enter your username and we’ll send a password reset link to the email
          associated with your account.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <button type="submit" className="auth-submit">
            Send reset link
            <ArrowForwardRoundedIcon />
          </button>
        </form>

        <NavLink className="auth-back-link" to="/Login">
          <ArrowBackRoundedIcon />
          Back to sign in
        </NavLink>
      </section>
    </main>
  );
};

export default ResetPassword;