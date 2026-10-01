import React from "react";
import { IconButton, MenuItem, Select } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import { Input, Textarea } from "@heroui/react";
import { DatePicker } from "@heroui/date-picker";
import { parseDate, parseDateTime } from "@internationalized/date";
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

const toDateValue = (value) => {
  if (!value) return null;
  try {
    return parseDate(String(value).slice(0, 10));
  } catch {
    return null;
  }
};

const toDateTimeValue = (value) => {
  if (!value) return null;
  try {
    return parseDateTime(String(value).slice(0, 16));
  } catch {
    return null;
  }
};

const formatDateValue = (value) => {
  if (!value) return "";
  return value.toString();
};

export function ClinicDateField({ value, onChange, placeholder = "Select date", className = "", minDate }) {
  const parsedValue = toDateValue(value);
  const parsedMin = toDateValue(minDate);

  return (
    <div className={`clinic-heroui-date-field ${className}`}>
      <DatePicker
        label={placeholder}
        labelPlacement="outside-top"
        value={parsedValue}
        onChange={(nextValue) => onChange(formatDateValue(nextValue))}
        minValue={parsedMin || undefined}
        variant="bordered"
        color="primary"
        size="sm"
        radius="lg"
        selectorIcon={<CalendarMonthRoundedIcon />}
        classNames={{
          base: "clinic-heroui-picker",
          selectorIcon: "clinic-heroui-picker-icon",
          popoverContent: "clinic-heroui-calendar-popover",
          calendar: "clinic-heroui-calendar",
        }}
      />
    </div>
  );
}

export function ClinicDateTimeField({ value, onChange, label, minDateTime }) {
  const parsedValue = toDateTimeValue(value);
  const parsedMin = toDateTimeValue(minDateTime);

  return (
    <div className="clinic-heroui-date-field clinic-heroui-datetime-field">
      <DatePicker
        label={label}
        labelPlacement="outside-top"
        value={parsedValue}
        onChange={(nextValue) => onChange(formatDateValue(nextValue))}
        minValue={parsedMin || undefined}
        granularity="minute"
        hourCycle={12}
        variant="bordered"
        color="primary"
        size="sm"
        radius="lg"
        selectorIcon={<CalendarMonthRoundedIcon />}
        classNames={{
          base: "clinic-heroui-picker",
          selectorIcon: "clinic-heroui-picker-icon",
          popoverContent: "clinic-heroui-calendar-popover",
          calendar: "clinic-heroui-calendar",
          timeInput: "clinic-heroui-time-input",
        }}
      />
    </div>
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
  return (
    <div className={`clinic-heroui-text-field ${className}`}>
      {multiline ? (
        <Textarea
          label={label}
          labelPlacement="outside-top"
          value={value ?? ""}
          onValueChange={onChange}
          placeholder={placeholder}
          minRows={3}
          maxRows={7}
          isRequired={isRequired}
          isDisabled={isDisabled}
          variant="bordered"
          color="primary"
          size="sm"
          radius="lg"
          classNames={{
            base: "clinic-heroui-input-base",
            label: "clinic-heroui-input-label",
            inputWrapper: "clinic-heroui-input-wrapper",
            input: "clinic-heroui-input",
          }}
        />
      ) : (
        <Input
          label={label}
          labelPlacement="outside-top"
          value={value ?? ""}
          onValueChange={onChange}
          placeholder={placeholder}
          type={type}
          isRequired={isRequired}
          isDisabled={isDisabled}
          variant="bordered"
          color="primary"
          size="sm"
          radius="lg"
          startContent={startContent}
          endContent={endContent}
          classNames={{
            base: "clinic-heroui-input-base",
            label: "clinic-heroui-input-label",
            inputWrapper: "clinic-heroui-input-wrapper",
            input: "clinic-heroui-input",
          }}
        />
      )}
    </div>
  );
}

