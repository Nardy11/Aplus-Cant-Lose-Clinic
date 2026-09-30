import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import AccountAvatar from "../Authentication/AccountAvatar";
import { getDr } from "../../features/doctorSlice";

const DoctorProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useSelector((state) => state.user);
  const info = useSelector((state) => state.doctor.info || {});

  useEffect(() => {
    if (id) dispatch(getDr(id));
  }, [dispatch, id]);

  const fields = [
    { label: "Specialty", value: info.speciality || info.specialty || "Not provided", icon: LocalHospitalRoundedIcon },
    { label: "Email", value: info.email || "Not provided", icon: MailOutlineRoundedIcon },
    { label: "Hourly rate", value: info.rate !== undefined && info.rate !== null && info.rate !== "" ? String(info.rate) : "Not provided", icon: PaymentsRoundedIcon },
    { label: "Hospital affiliation", value: info.affiliation || info.affilation || "Not provided", icon: BadgeRoundedIcon },
  ];

  return (
    <main className="doctor-profile-page">
      <AccountAvatar />
      <div className="doctor-profile-shell">
        <button type="button" className="doctor-profile-back" onClick={() => navigate("/Home")}>
          <ArrowBackRoundedIcon /> Back to home
        </button>

        <section className="doctor-profile-hero">
          <div className="doctor-profile-avatar"><BadgeRoundedIcon /></div>
          <div className="doctor-profile-hero-copy">
            <span>DOCTOR PROFILE</span>
            <h1>{info.name || "Doctor profile"}</h1>
            <p>View your professional information and clinic details.</p>
          </div>
          <button type="button" className="doctor-profile-edit" onClick={() => navigate("/Home")}>
            Close
          </button>
        </section>

        <section className="doctor-profile-grid">
          {fields.map(({ label, value, icon: Icon }) => (
            <article className="doctor-profile-card" key={label}>
              <div className="doctor-profile-card-icon"><Icon /></div>
              <div>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            </article>
          ))}
        </section>

        <section className="doctor-profile-note">
          <div className="doctor-profile-note-icon"><BadgeRoundedIcon /></div>
          <div>
            <strong>Need to update your professional details?</strong>
            <p>Use <b>Credentials</b> in the top navigation to edit your email, hourly rate, hospital affiliation, and review your contract.</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default DoctorProfilePage;
