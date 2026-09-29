import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SickIcon from "@mui/icons-material/Sick";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import { useNavigate } from "react-router-dom";

const RegisterOptions = ({ open, onClose }) => {
  const navigate = useNavigate();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "min(520px, calc(100vw - 32px))",
          borderRadius: "24px",
          p: 1,
          border: "1px solid var(--aplus-border)",
          boxShadow: "0 28px 70px rgba(15,35,65,.18)",
        },
      }}
    >
      <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1 }}>
        Choose your account
        <Typography sx={{ mt: 0.5, color: "var(--aplus-muted)", fontSize: 14 }}>
          Select how you will use A+ Clinic.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            fullWidth
            onClick={() => { navigate("/RegisterAsPatient"); onClose(); }}
            sx={{
              minHeight: 120,
              borderRadius: "18px",
              border: "1px solid var(--aplus-border)",
              color: "var(--aplus-text)",
              textTransform: "none",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              p: 2,
              "&:hover": { borderColor: "#9abaff", background: "#f7faff" },
            }}
          >
            <Box sx={{ textAlign: "left" }}>
              <Box sx={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: "13px", background: "#eaf2ff", color: "#1769ff", mb: 1.2 }}>
                <SickIcon />
              </Box>
              <Typography sx={{ fontWeight: 800 }}>Patient</Typography>
              <Typography sx={{ color: "var(--aplus-muted)", fontSize: 13, mt: .3 }}>
                Book visits and manage your care.
              </Typography>
            </Box>
          </Button>

          <Button
            fullWidth
            onClick={() => { navigate("/RegisterAsDoctor"); onClose(); }}
            sx={{
              minHeight: 120,
              borderRadius: "18px",
              border: "1px solid var(--aplus-border)",
              color: "var(--aplus-text)",
              textTransform: "none",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              p: 2,
              "&:hover": { borderColor: "#8ed8cf", background: "#f4fcfa" },
            }}
          >
            <Box sx={{ textAlign: "left" }}>
              <Box sx={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: "13px", background: "#e7faf7", color: "#159b8c", mb: 1.2 }}>
                <VaccinesIcon />
              </Box>
              <Typography sx={{ fontWeight: 800 }}>Doctor</Typography>
              <Typography sx={{ color: "var(--aplus-muted)", fontSize: 13, mt: .3 }}>
                Join the clinic and manage patients.
              </Typography>
            </Box>
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: "var(--aplus-muted)" }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterOptions;
