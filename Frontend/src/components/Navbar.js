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
              minHeight: "68px !important",
              height: 68,
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
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #1769ff 0%, #16a6a0 100%)",
                  color: "#fff",
                }}
              >
                <HealthAndSafetyRoundedIcon sx={{ fontSize: 22 }} />
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
                  A+ Clinic
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