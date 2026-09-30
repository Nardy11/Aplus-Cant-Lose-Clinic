import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import LoginIcon from "@mui/icons-material/Login";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
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
          background: "#ffffff",
          borderBottom: "1px solid #e8edf2",
          color: "#172033",
          zIndex: 1200,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              minHeight: "76px !important",
              height: 76,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <NavLink
              to="/"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 11,
                flexShrink: 0,
              }}
            >
              <Box className="clinic-brand-mark"
                sx={{
                  width: 52,
                  height: 52,
                  display: "grid",
                  placeItems: "center",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "15px",
                  background: "linear-gradient(145deg, #1769ff 0%, #0f4ec4 62%, #18b6a4 100%)",
                  color: "#fff",
                  boxShadow: "0 9px 22px rgba(23,105,255,.22)",
                  flexShrink: 0,
                }}
              >
                <LocalHospitalRoundedIcon sx={{ fontSize: 31 }} />
                <Box className="clinic-brand-plus">+</Box>
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 17,
                    fontWeight: 800,
                    lineHeight: 1.05,
                    letterSpacing: "-0.035em",
                  }}
                >
                  El7a2ny Clinic
                </Typography>
                <Typography
                  sx={{
                    fontSize: 10.5,
                    color: "#718096",
                    lineHeight: 1.2,
                    mt: 0.35,
                  }}
                >
                  Virtual healthcare
                </Typography>
              </Box>
            </NavLink>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
                ml: 3,
              }}
            >
              <NavLink to="/Login" style={{ textDecoration: "none" }}>
                <Button
                  startIcon={<LoginIcon sx={{ fontSize: 19 }} />}
                  sx={{
                    minWidth: "auto",
                    width: "auto",
                    color: "#253247",
                    fontWeight: 650,
                    fontSize: 14,
                    textTransform: "none",
                    borderRadius: "10px",
                    px: 1.6,
                    py: 1,
                    whiteSpace: "nowrap",
                    "&:hover": { background: "#f3f6fa" },
                  }}
                >
                  Sign in
                </Button>
              </NavLink>

              <Button
                onClick={() => setOpenRegisterDialog(true)}
                variant="contained"
                startIcon={<AppRegistrationIcon sx={{ fontSize: 18 }} />}
                sx={{
                  minWidth: "auto",
                  width: "auto",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  borderRadius: "10px",
                  px: 2,
                  py: 1.05,
                  whiteSpace: "nowrap",
                  background: "#1769ff",
                  boxShadow: "none",
                  "&:hover": {
                    background: "#1257d6",
                    boxShadow: "none",
                  },
                }}
              >
                Get started
              </Button>
            </Box>
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