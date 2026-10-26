import * as React from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

// Public header: landing, sign in and sign up pages.
export default function Navbar() {
  const { logged, role } = useSelector((state) => state.user);
  const signedIn = logged && (role === "patient" || role === "doctor" || role === "admin");

  return (
    <header className="pub-header">
      <div className="pub-header-inner">
        <Link to="/" className="app-brand" aria-label="El7a2ny Clinic home">
          <img src="/brand-mark.png" alt="" />
          <span>
            <strong>El7a2ny</strong>
            <small>Virtual clinic</small>
          </span>
        </Link>

        <nav className="pub-header-actions" aria-label="Account">
          {signedIn ? (
            <Link to="/Home" className="ui-btn ui-btn--primary">Open my portal</Link>
          ) : (
            <>
              <NavLink to="/Login" className="ui-btn ui-btn--ghost">Sign in</NavLink>
              <NavLink to="/RegisterAs" className="ui-btn ui-btn--primary">Create account</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
