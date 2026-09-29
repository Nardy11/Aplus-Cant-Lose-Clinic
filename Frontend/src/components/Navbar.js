import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import LoginIcon from "@mui/icons-material/Login";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import HealthAndSafetyRoundedIcon from "@mui/icons-material/HealthAndSafetyRounded";
import { NavLink } from "react-router-dom";
import RegisterOptions from "./Authentication/RegisterAs";

export default function Navbar() {
  const [openRegisterDialog, setOpenRegisterDialog] = React.useState(false);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "rgba(255,255,255,.88)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--aplus-border)",
          color: "var(--aplus-text)",
          zIndex: 1200,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ minHeight: "72px !important", px: { xs: 0, md: 1 } }}>
            <NavLink
              to="/"
              style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 10 }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #1769ff, #18b6a4)",
                  color: "#fff",
                  boxShadow: "0 10px 22px rgba(23,105,255,.22)",
                }}
              >
                <HealthAndSafetyRoundedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em" }}>
                  A+ Clinic
                </Typography>
                <Typography sx={{ fontSize: 11, color: "var(--aplus-muted)", mt: .4 }}>
                  Virtual healthcare
                </Typography>
              </Box>
            </NavLink>

            <Box sx={{ flexGrow: 1 }} />

            <NavLink to="/Login" style={{ textDecoration: "none" }}>
              <Button
                startIcon={<LoginIcon />}
                sx={{
                  color: "var(--aplus-text)",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "12px",
                  px: 2,
                  "&:hover": { background: "#f1f5f9" },
                }}
              >
                Sign in
              </Button>
            </NavLink>

            <Button
              onClick={() => setOpenRegisterDialog(true)}
              variant="contained"
              startIcon={<AppRegistrationIcon />}
              sx={{
                ml: 1,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "12px",
                px: 2.2,
                background: "#1769ff",
                boxShadow: "0 10px 22px rgba(23,105,255,.2)",
                "&:hover": { background: "#0f4ec4" },
              }}
            >
              Get started
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <RegisterOptions
        open={openRegisterDialog}
        onClose={() => setOpenRegisterDialog(false)}
      />
    </>
  );
}
