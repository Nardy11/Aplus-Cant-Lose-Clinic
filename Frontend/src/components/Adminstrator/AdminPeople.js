import React, { useContext, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import { SnackbarContext } from "../../App";
import { deleteJDoctor, deletePatient } from "../../features/adminSlice";
import { EmptyState, PageHead } from "../../design/ui";
import { ageFrom, formatMoney } from "../../design/format";
import { Person, SearchBox, plural, useConfirm } from "./adminParts";

const matches = (query, ...fields) => {
  const q = query.trim().toLowerCase();
  return !q || fields.some((f) => String(f || "").toLowerCase().includes(q));
};

function RemoveButton({ label, onClick }) {
  return (
    <button type="button" className="ui-icon-btn adm-remove" aria-label={label} title={label} onClick={onClick}>
      <DeleteOutlineRoundedIcon />
    </button>
  );
}

export function AdminDoctors() {
  const dispatch = useDispatch();
  const toast = useContext(SnackbarContext);
  const doctors = useSelector((s) => s.admin.jdoctors);
  const [query, setQuery] = useState("");
  const [dialog, ask] = useConfirm();

  const shown = useMemo(
    () => doctors.filter((d) => matches(query, d.name, d.username, d.email, d.speciality, d.affilation)),
    [doctors, query]
  );

  const remove = (d) =>
    ask({
      title: `Remove Dr. ${d.name}?`,
      message: "Their account is deleted and they can no longer sign in. Their past appointments stay on record.",
      confirmLabel: "Remove doctor",
      onConfirm: async () => {
        try {
          await dispatch(deleteJDoctor(d._id)).unwrap();
          toast(`Dr. ${d.name} was removed.`, "success");
        } catch (e) {
          toast("The doctor could not be removed. Try again.", "error");
        }
      },
    });

  return (
    <>
      <PageHead title="Doctors" lead="Everyone currently practicing on the platform." />
      <section className="ui-card">
        <div className="adm-toolbar">
          <SearchBox value={query} onChange={setQuery} placeholder="Search by name, speciality or email" label="Search doctors" />
          <span className="ui-toolbar-count">{plural(shown.length, "doctor")}</span>
        </div>
        {doctors.length === 0 ? (
          <EmptyState icon={<MedicalServicesRoundedIcon />} title="No doctors yet" text="Accepted join requests appear here." />
        ) : shown.length === 0 ? (
          <EmptyState icon={<SearchOffRoundedIcon />} title="No doctors match your search" text="Check the spelling or clear the search box." />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th scope="col">Doctor</th>
                  <th scope="col">Speciality</th>
                  <th scope="col" className="adm-hide-md">Affiliation</th>
                  <th scope="col" className="adm-num">Hourly rate</th>
                  <th scope="col" className="adm-hide-sm">Phone</th>
                  <th scope="col"><span className="ui-sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((d) => (
                  <tr key={d._id}>
                    <td><Person name={d.name} sub={d.email} /></td>
                    <td>{d.speciality || "Not given"}</td>
                    <td className="adm-hide-md" data-label="Affiliation">{d.affilation || "Not given"}</td>
                    <td className="adm-num" data-label="Hourly rate">{formatMoney(d.rate)}</td>
                    <td className="adm-hide-sm" data-label="Phone">{d.mobile || "Not given"}</td>
                    <td className="adm-end"><RemoveButton label={`Remove Dr. ${d.name}`} onClick={() => remove(d)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {dialog}
    </>
  );
}

export function AdminPatients() {
  const dispatch = useDispatch();
  const toast = useContext(SnackbarContext);
  const patients = useSelector((s) => s.admin.patients);
  const [query, setQuery] = useState("");
  const [dialog, ask] = useConfirm();

  const shown = useMemo(
    () => patients.filter((p) => matches(query, p.name, p.username, p.email, p.mobile)),
    [patients, query]
  );

  const remove = (p) =>
    ask({
      title: `Remove ${p.name}?`,
      message: "Their account, health records and family members are deleted. This cannot be undone.",
      confirmLabel: "Remove patient",
      onConfirm: async () => {
        try {
          await dispatch(deletePatient(p._id)).unwrap();
          toast(`${p.name} was removed.`, "success");
        } catch (e) {
          toast("The patient could not be removed. Try again.", "error");
        }
      },
    });

  return (
    <>
      <PageHead title="Patients" lead="Registered patients and the health package each one is on." />
      <section className="ui-card">
        <div className="adm-toolbar">
          <SearchBox value={query} onChange={setQuery} placeholder="Search by name, email or phone" label="Search patients" />
          <span className="ui-toolbar-count">{plural(shown.length, "patient")}</span>
        </div>
        {patients.length === 0 ? (
          <EmptyState icon={<PeopleAltRoundedIcon />} title="No patients yet" text="Patients appear here after they sign up." />
        ) : shown.length === 0 ? (
          <EmptyState icon={<SearchOffRoundedIcon />} title="No patients match your search" text="Check the spelling or clear the search box." />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th scope="col">Patient</th>
                  <th scope="col" className="adm-hide-sm">Age</th>
                  <th scope="col" className="adm-hide-md">Phone</th>
                  <th scope="col" className="adm-hide-md">Emergency contact</th>
                  <th scope="col">Package</th>
                  <th scope="col"><span className="ui-sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => {
                  const age = ageFrom(p.dBirth);
                  const ec = p.emergencyContact;
                  const active = p.hPackage?.type && String(p.hPStatus || "").toLowerCase() === "subscribed";
                  return (
                    <tr key={p._id}>
                      <td><Person name={p.name} sub={p.email} /></td>
                      <td className="adm-hide-sm" data-label="Age">{age ? `${age}, ${p.gender || "not given"}` : p.gender || "Not given"}</td>
                      <td className="adm-hide-md" data-label="Phone">{p.mobile || "Not given"}</td>
                      <td className="adm-hide-md" data-label="Emergency contact">
                        {ec?.fullName ? (
                          <>
                            {ec.fullName}
                            <span className="adm-sub">{[ec.relation, ec.mobile].filter(Boolean).join(", ")}</span>
                          </>
                        ) : (
                          <span className="adm-muted">Not provided</span>
                        )}
                      </td>
                      <td>
                        {active ? <span className="ui-chip ui-chip--accent">{p.hPackage.type}</span> : <span className="ui-chip">No package</span>}
                      </td>
                      <td className="adm-end"><RemoveButton label={`Remove ${p.name}`} onClick={() => remove(p)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {dialog}
    </>
  );
}
