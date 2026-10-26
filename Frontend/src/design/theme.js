import { createTheme } from "@mui/material/styles";

// Mirrors tokens.css so MUI dialogs, tables and pickers match the rest of the clinic.
const ACCENT = {
  patient: { main: "#1351c4", dark: "#0d3f9c", light: "#e9f0fc" },
  doctor: { main: "#0d7a5f", dark: "#095e49", light: "#e4f3ee" },
};

const BODY = '"Figtree Variable", system-ui, -apple-system, "Segoe UI", sans-serif';
const DISPLAY = '"Bricolage Grotesque Variable", "Figtree Variable", system-ui, sans-serif';

export function makeTheme(role) {
  const accent = ACCENT[role] || ACCENT.patient;
  return createTheme({
    palette: {
      primary: { main: accent.main, dark: accent.dark, light: accent.light, contrastText: "#fff" },
      error: { main: "#b8322b" },
      success: { main: "#157548" },
      warning: { main: "#9a5a06" },
      text: { primary: "#101b2d", secondary: "#5d6b82" },
      divider: "#e2e7ee",
      background: { default: "#f3f5f8", paper: "#ffffff" },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: BODY,
      h1: { fontFamily: DISPLAY, fontWeight: 650 },
      h2: { fontFamily: DISPLAY, fontWeight: 650 },
      h3: { fontFamily: DISPLAY, fontWeight: 620 },
      h4: { fontFamily: DISPLAY, fontWeight: 620 },
      h5: { fontFamily: DISPLAY, fontWeight: 620 },
      h6: { fontFamily: DISPLAY, fontWeight: 620 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 10, minHeight: 40 } },
      },
      MuiPaper: { styleOverrides: { rounded: { borderRadius: 14 } } },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 14 } } },
      MuiTableCell: {
        styleOverrides: {
          head: { color: "#5d6b82", fontWeight: 650, fontSize: 13 },
          root: { borderColor: "#e2e7ee" },
        },
      },
      MuiAlert: { styleOverrides: { root: { borderRadius: 10 } } },
    },
  });
}
