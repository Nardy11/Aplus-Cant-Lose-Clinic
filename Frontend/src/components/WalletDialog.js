import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { viewWallet as viewWalletPatient } from "../features/patientSlice";
import { viewWallet as viewWalletDoctor } from "../features/doctorSlice";
import {
  Dialog,
  IconButton,
  Typography,
  DialogContent,
} from "@mui/material";
import WalletIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import CloseIcon from "@mui/icons-material/CloseRounded";

export const WalletDialog = ({ open, onClose }) => {
  const id = useSelector((state) => state.user.id);
  const role = useSelector((state) => state.user.role);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!open || !id) return;
    if (role === "patient") dispatch(viewWalletPatient(id));
    if (role === "doctor") dispatch(viewWalletDoctor(id));
  }, [dispatch, id, role, open]);

  const amount = useSelector((state) =>
    role === "patient" ? state.patient.wallet : state.doctor.wallet
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      className="clinic-wallet-dialog"
    >
      <DialogContent className="clinic-wallet-content">
        <div className="clinic-wallet-top">
          <div className="clinic-wallet-icon">
            <WalletIcon />
          </div>
          <IconButton className="clinic-dialog-close" onClick={onClose} aria-label="Close wallet">
            <CloseIcon />
          </IconButton>
        </div>

        <span className="clinic-dialog-eyebrow">ACCOUNT BALANCE</span>
        <Typography component="h2" className="clinic-wallet-title">
          Wallet
        </Typography>

        <div className="clinic-wallet-balance">
          <span>Available balance</span>
          <strong>{amount ?? 0}</strong>
          <small>Clinic account credit</small>
        </div>
      </DialogContent>
    </Dialog>
  );
};
