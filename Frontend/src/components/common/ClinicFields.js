import React from "react";
import { IconButton, MenuItem, Select } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
export function ClinicSearchField({ value, onChange, placeholder = "Search...", className = "" }) {
  return (
    <div className={`clinic-field clinic-search-field search-field search-field--secondary ${className}`}>
      <div className="search-field__group">
        <SearchRoundedIcon className="clinic-field-leading-icon search-field__search-icon" />
        <input
          className="search-field__input"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
      {value ? (
        <IconButton
          type="button"
          size="small"
          className="clinic-field-clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <CloseRoundedIcon />
        </IconButton>
      ) : null}
      </div>
    </div>
  );
}

export function ClinicTextField({ value, onChange, placeholder = "", className = "", type = "text" }) {
  return (
    <div className={`clinic-field clinic-text-field ${className}`}>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}

export function ClinicSelectField({ value, onChange, options, placeholder, className = "", ariaLabel }) {
  return (
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      displayEmpty
      className={`clinic-select-field select ${className}`}
      aria-label={ariaLabel || placeholder || "Select"}
      MenuProps={{ PaperProps: { className: "clinic-select-menu" } }}
      renderValue={(selected) => {
        if (!selected && placeholder) {
          return <span className="clinic-select-placeholder">{placeholder}</span>;
        }
        const match = options.find((option) => option.value === selected);
        return match ? match.label : selected;
      }}
    >
      {placeholder ? <MenuItem value="" disabled>{placeholder}</MenuItem> : null}
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
      ))}
    </Select>
  );
}

// Date, date-time and text fields use the browser's own inputs, styled like the rest of the app.
// (They used to be HeroUI components, which style themselves with Tailwind classes this app does
// not build, so their layout fell apart: the calendar button dropped under the field.)
function Labelled({ id, label, required, className, children }) {
  return (
    <div className={`ui-field ${className}`}>
      {label ? (
        <label htmlFor={id}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      {children}
    </div>
  );
}

export function ClinicDateField({ value, onChange, placeholder = "Select date", className = "", minDate }) {
  const id = React.useId();
  return (
    <Labelled id={id} label={placeholder} className={className}>
      <input
        id={id}
        type="date"
        aria-label={placeholder || "Date"}
        className="ui-input"
        value={value ? String(value).slice(0, 10) : ""}
        min={minDate ? String(minDate).slice(0, 10) : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </Labelled>
  );
}

export function ClinicDateTimeField({ value, onChange, label, minDateTime }) {
  const id = React.useId();
  return (
    <Labelled id={id} label={label} className="">
      <input
        id={id}
        type="datetime-local"
        className="ui-input"
        value={value ? String(value).slice(0, 16) : ""}
        min={minDateTime ? String(minDateTime).slice(0, 16) : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </Labelled>
  );
}

export function ClinicHeroTextField({
  value,
  onChange,
  label,
  placeholder = "",
  className = "",
  type = "text",
  isRequired = false,
  isDisabled = false,
  multiline = false,
  startContent,
  endContent,
}) {
  const id = React.useId();
  const common = {
    id,
    className: "ui-input",
    value: value ?? "",
    placeholder,
    required: isRequired,
    disabled: isDisabled,
    onChange: (event) => onChange(event.target.value),
  };
  const control = multiline ? <textarea rows={3} {...common} /> : <input type={type} {...common} />;
  return (
    <Labelled id={id} label={label} required={isRequired} className={className}>
      {startContent || endContent ? (
        <div className="ui-affix-wrap">
          {startContent ? <span className="ui-affix">{startContent}</span> : null}
          {control}
          {endContent ? <span className="ui-affix">{endContent}</span> : null}
        </div>
      ) : (
        control
      )}
    </Labelled>
  );
}
