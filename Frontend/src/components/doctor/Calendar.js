import React from "react";
import { ClinicDateField } from "../common/ClinicFields";

export default function Calendar({ value = "", onChange = () => {}, placeholder = "Select date" }) {
  return <ClinicDateField value={value} onChange={onChange} placeholder={placeholder} />;
}
