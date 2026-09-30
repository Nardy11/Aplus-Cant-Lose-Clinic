import React from "react";
import { Popover, IconButton, MenuItem, Select } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

export function ClinicSearchField({ value, onChange, placeholder = "Search...", className = "" }) {
  return (
    <div className={`clinic-field clinic-search-field ${className}`}>
      <SearchRoundedIcon className="clinic-field-leading-icon" />
      <input
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
      className={`clinic-select-field ${className}`}
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

export function ClinicDateField({ value, onChange, placeholder = "Select date", className = "", minDate }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const parsedValue = value ? dayjs(value) : null;

  const handleChange = (newValue) => {
    if (newValue && newValue.isValid()) {
      onChange(newValue.format("YYYY-MM-DD"));
      setAnchorEl(null);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`clinic-field clinic-date-field ${className}`}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label={placeholder}
      >
        <CalendarMonthRoundedIcon className="clinic-field-leading-icon" />
        <span className={parsedValue ? "clinic-date-value" : "clinic-date-placeholder"}>
          {parsedValue ? parsedValue.format("MMM D, YYYY") : placeholder}
        </span>
        {value ? (
          <IconButton
            type="button"
            size="small"
            className="clinic-field-clear"
            onClick={(event) => {
              event.stopPropagation();
              onChange("");
            }}
            aria-label="Clear date"
          >
            <CloseRoundedIcon />
          </IconButton>
        ) : null}
      </button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ className: "clinic-calendar-popover" }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={parsedValue}
            onChange={handleChange}
            minDate={minDate ? dayjs(minDate) : undefined}
            className="clinic-calendar"
          />
        </LocalizationProvider>
      </Popover>
    </>
  );
}
