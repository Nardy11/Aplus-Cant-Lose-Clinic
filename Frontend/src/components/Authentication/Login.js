import React, { useState, useContext, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { loginGuest } from "../../features/userSlice";
import { SnackbarContext } from "../../App";
import { DEMO } from "../../Consts";

const DEMO_ACCOUNTS = [
  { label: "Patient", detail: "Nour Ibrahim", username: "nour.patient" },
  { label: "Doctor", detail: "Dr. Hany El-Sayed", username: "dr.hany" },
  { label: "Admin", detail: "Clinic admin", username: "admin.demo" },
];

function Login() {
  const navigate = useNavigate();
  const snackbarMessage = useContext(SnackbarContext);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const submitted = useRef(false);

  useEffect(() => {
    if (user.logged) {
      snackbarMessage("Signed in", "success");
      navigate("/Home");
    } else if (user.error && submitted.current) {
      setError("That username and password don't match. Check both and try again.");
    }
  }, [user.logged, user.error]); // eslint-disable-line react-hooks/exhaustive-deps

  const signInAs = (username) => {
    submitted.current = true;
    setError("");
    dispatch(loginGuest({ username, password: "Demo@1234" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitted.current = true;
    setError("");
    dispatch(
      loginGuest({
        username: event.target.elements.username.value.trim(),
        password: event.target.elements.password.value,
      })
    );
  };

  return (
    <main className="ui-auth-shell">
      <form className="ui-auth-card" onSubmit={handleSubmit} noValidate={false}>
        <h1 className="ui-title">Sign in</h1>
        <p className="ui-lead">Welcome back. Patients and doctors sign in here.</p>

        {DEMO && (
          <div className="ui-card ui-card-pad" style={{ marginBottom: 16 }}>
            <strong>Portfolio demo</strong>
            <p className="ui-lead" style={{ margin: "4px 0 10px" }}>No server is running, so all data is sample data. Pick a role to explore:</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DEMO_ACCOUNTS.map((a) => (
                <button key={a.username} type="button" className="ui-btn" onClick={() => signInAs(a.username)} disabled={user.loading} title={a.detail}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div className="ui-alert" role="alert">{error}</div>}

        <div className="ui-field">
          <label htmlFor="username">Username</label>
          <input className="ui-input" id="username" name="username" autoComplete="username" required />
        </div>

        <div className="ui-field">
          <div className="ui-auth-label-row">
            <label htmlFor="password">Password</label>
            <Link to="/ResetPassword">Forgot password?</Link>
          </div>
          <div className="ui-auth-password">
            <input
              className="ui-input"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="ui-icon-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
            </button>
          </div>
        </div>

        <button type="submit" className="ui-btn ui-btn--primary ui-btn--lg ui-btn--block" disabled={user.loading}>
          {user.loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="ui-auth-foot">
          New to El7a2ny? <Link to="/RegisterAs">Create an account</Link>
        </p>
      </form>
    </main>
  );
}

export default Login;
