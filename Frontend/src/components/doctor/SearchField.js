import React from "react";
import { ClinicSearchField } from "../common/ClinicFields";

export default function SearchField({ value = "", onChange = () => {}, placeholder = "Search patient..." }) {
  return <ClinicSearchField value={value} onChange={onChange} placeholder={placeholder} className="doctor-legacy-search" />;
}
