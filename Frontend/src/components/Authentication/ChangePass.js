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
import { isStrongPassword, PASSWORD_HINT } from "../../design/password";

const ChangePass = () => {
  const { id, token } = useParams();
  const snackbarMessage = useContext(SnackbarContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const password = event.target.elements.password.value;
    const password2 = event.target.elements.password2.value;

    if (password !== password2) return setError("The two passwords don't match.");
    if (!isStrongPassword(password)) return setError(`Choose a stronger password: ${PASSWORD_HINT}`);

    setSaving(true);
    const result = await dispatch(changePassword({ password, id, token }));
    setSaving(false);
    // The server answers 200 with a Status text, including for failures such as an expired link.
    const status = result.payload?.data?.Status;
    if (result.meta.requestStatus === "fulfilled" && status === "Password changed successfully") {
      snackbarMessage("Password changed. Sign in with the new one.", "success");
      navigate("/Login");
    } else if (status === "Error with token") {
      setError("This reset link has expired. Request a new one from the sign-in page.");
    } else {
      setError(typeof status === "string" ? status : "The password couldn't be changed. Try again.");
    }
  };

  return (
    <main className="auth-page auth-page-centered">
      <section className="auth-card reset-card change-pass-card">
        <div className="reset-icon"><LockResetRoundedIcon /></div>
        <span className="auth-eyebrow">SECURITY</span>
        <h1>Set a new password</h1>
        <p className="reset-copy">
          Choose a strong password for your El7a2ny Clinic account.
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

          <small className="auth-hint">{PASSWORD_HINT}</small>
          {error && <div className="ui-alert" role="alert">{error}</div>}

          <button type="submit" className="auth-submit" disabled={saving}>
            {saving ? "Saving..." : "Change password"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default ChangePass;
