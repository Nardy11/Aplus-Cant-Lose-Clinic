import React, { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Button,
  IconButton,
  InputBase,
  styled,
  Typography,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  DialogTitle,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { ClinicSearchField, ClinicTextField, ClinicDateField } from "../common/ClinicFields";
import InputAdornment from "@mui/material/InputAdornment";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import { Link } from "react-router-dom";
import { TextField } from "@mui/material";
import axios from "axios";
import {API_URL} from "../../Consts";
import { useNavigate, useLocation } from "react-router-dom";
import DownloadPage from "./DownloadP";
import AccountAvatar from "../Authentication/AccountAvatar";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { SnackbarContext } from "../../App";
// ...
import {
  viewPrescriptions,
  viewPrescription,
} from "../../features/patientSlice";
import { useDispatch, useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";

const handlePay = (prescription) => {
  if (!prescription || prescription.status === "filled") return;
  return prescription;
};
const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const snackbarMessage = React.useContext(SnackbarContext);
  const [specialityFilter, setSpecialityFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isFilled, setIsFilled] = useState(false);
  const [open, setOpen] = useState(false);
  const patientId = useSelector((state) => state.user.id);
  const role = useSelector((state) => state.user.role);

  const rows = useSelector((state) => state.patient.presc);

  const iconStyle = {
    color: "white",
  };
  const filterStyle = {
    marginLeft: "40%",
  };

  const dateTimePickerContainer = {
    display: "flex",
    alignItems: "center",
    borderRadius: "4px",
    padding: "8px",
  };

  const Info = {
    margin: "20px 20px",
    alignItems: "baseline",
  };

  const [prescriptionid, setPrescriptionid] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const focusedPrescriptionId = new URLSearchParams(location.search).get("prescriptionId");

  useEffect(() => {
    dispatch(viewPrescriptions(patientId));
  }, [dispatch, patientId]);

  const handleView = (id) => {
    setPrescriptionid(rows.find((row) => row._id === id));
    setOpen(true);
  };

  useEffect(() => {
    if (!focusedPrescriptionId || !rows?.length) return;
    const target = rows.find((row) => row._id === focusedPrescriptionId);
    if (target) {
      setPrescriptionid(target);
      setOpen(true);
    }
  }, [focusedPrescriptionId, rows]);

  const prescriptionTotal = prescriptionid?.meds?.reduce(
    (total, medicine) => total + Number(medicine.medID?.price || 0),
    0
  ) || 0;

  const confirmPrescriptionPayment = async () => {
    if (!prescriptionid?._id || !patientId) return;
    setPaying(true);
    try {
      const response = await axios.post(
        `${API_URL}/patient/payPrescriptionWithWallet/${prescriptionid._id}/${patientId}`
      );
      setPrescriptionid(response.data.prescription);
      setCheckoutOpen(false);
      dispatch(viewPrescriptions(patientId));
      snackbarMessage(
        `Prescription paid successfully. Total: ${response.data.total}`,
        "success"
      );
    } catch (error) {
      console.error("Error during prescription payment:", error);
      snackbarMessage(
        error.response?.data?.error || "Unable to complete prescription payment.",
        "error"
      );
    } finally {
      setPaying(false);
    }
  };

  return role === "patient" ? (
    <Box className="prescriptions-page">
      <AccountAvatar />
      <Dialog open={open} onClose={() => setOpen(false)} className="clinic-modern-dialog prescription-view-dialog" maxWidth="md" fullWidth>
        <DialogTitle className="clinic-dialog-title">
          <div><span>MEDICATION</span><h2>Prescription details</h2></div>
          <IconButton className="clinic-dialog-close" onClick={() => setOpen(false)} aria-label="Close"><CloseRoundedIcon /></IconButton>
        </DialogTitle>
        {prescriptionid && prescriptionid.patientID ? (
          <div id="pagetodownload" className="prescription-receipt">
            <div className="prescription-receipt-header">
              <div className="prescription-brand">
                <div className="prescription-brand-image">
                  <img src="/virtualclinic.png" alt="El7a2ny Virtual Clinic" />
                </div>
                <div>
                  <strong>EL7A2NY</strong>
                  <span>VIRTUAL CLINIC</span>
                </div>
              </div>
              <div className="prescription-receipt-meta">
                <span>Date prescribed</span>
                <strong>{new Date(prescriptionid.datePrescribed).toLocaleString()}</strong>
              </div>
              <div className="prescription-receipt-meta prescription-receipt-doctor">
                <span>Doctor</span>
                <strong>{prescriptionid.doctorID?.name || "Not provided"}</strong>
                <small>{prescriptionid.doctorID?.speciality || "General care"}</small>
              </div>
            </div>

            <div className="prescription-receipt-body">
              {prescriptionid.meds.map((medicine, index) => (
                <div className="prescription-medicine" key={medicine.medID?._id || index}>
                  <div className="prescription-medicine-title">
                    <strong>{medicine.medID?.name || "Medicine"}</strong>
                    <span>{medicine.medID?.price ? `${medicine.medID.price}` : "Price not set"}</span>
                  </div>
                  <div className="prescription-medicine-grid">
                    <div><span>Active element</span><strong>{medicine.medID?.activeElement || "Not provided"}</strong></div>
                    <div><span>Medical use</span><strong>{medicine.medID?.use || "Not provided"}</strong></div>
                    <div><span>Frequency</span><strong>{medicine.medID?.amount || "Not provided"}</strong></div>
                    <div><span>Dosage</span><strong>{medicine.dosage || "Not provided"}</strong></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="prescription-receipt-footer">
              <DownloadPage
                rootElementId="pagetodownload"
                downloadFileName="prescription"
              />

              {prescriptionid.status === "filled" ? (
                <div className="prescription-paid-stamp">
                  <img src="/Pharmacy Stamp.png" alt="Pharmacy stamp" />
                  <span>PAID</span>
                </div>
              ) : (
                <div className="prescription-total">
                  <span>Total</span>
                  <strong>{prescriptionTotal > 0 ? prescriptionTotal : "—"}</strong>
                </div>
              )}

              {prescriptionid.status === "filled" ? (
                <div className="prescription-status-badge">Paid</div>
              ) : (
                <Button
                  className="prescription-action-button"
                  onClick={() => setCheckoutOpen(true)}
                  variant="contained"
                >
                  Pay & checkout
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </Dialog>
      <Dialog
        open={checkoutOpen}
        onClose={() => !paying && setCheckoutOpen(false)}
        className="clinic-modern-dialog prescription-checkout-dialog"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="clinic-dialog-title">
          <div><span>CHECKOUT</span><h2>Pay prescription</h2></div>
          <IconButton className="clinic-dialog-close" onClick={() => !paying && setCheckoutOpen(false)} aria-label="Close">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <div className="prescription-checkout-body">
          <p>Pay for the medicines in this prescription using your clinic wallet.</p>
          <div className="prescription-checkout-total">
            <span>Total due</span>
            <strong>{prescriptionTotal}</strong>
          </div>
        </div>
        <div className="clinic-dialog-actions">
          <Button className="clinic-dialog-cancel" onClick={() => setCheckoutOpen(false)} disabled={paying}>Cancel</Button>
          <Button className="clinic-dialog-primary" onClick={confirmPrescriptionPayment} disabled={paying || prescriptionTotal <= 0}>
            {paying ? "Processing..." : "Confirm & pay"}
          </Button>
        </div>
      </Dialog>

      <AppBar position="static" className="prescriptions-toolbar" elevation={0}>
        <Toolbar>
          <Grid container className="prescriptions-filter-grid" alignItems="center" spacing={1.5}>
            <Grid item xs={12} md="auto">
              <div className="prescriptions-page-heading">
                <span>MEDICATION</span>
                <Typography variant="h5">My prescriptions</Typography>
                <small>Review your prescriptions and medication details.</small>
              </div>
            </Grid>

            <Grid item className="prescriptions-filter-controls">
              <button
                type="button"
                className={`prescriptions-filled-toggle ${isFilled ? "active" : ""}`}
                onClick={() => setIsFilled((current) => !current)}
              >
                <span className="prescriptions-filled-check">{isFilled ? "✓" : ""}</span>
                <span>Filled only</span>
              </button>

              <ClinicDateField
                className="prescription-filter-field prescription-date-filter"
                placeholder="Prescription date"
                value={selectedDate || ""}
                onChange={(value) => setSelectedDate(value || null)}
              />

              <ClinicSearchField
                className="prescription-filter-field prescription-search-field"
                placeholder="Search doctor"
                value={nameFilter}
                onChange={setNameFilter}
              />

              <ClinicTextField
                className="prescription-filter-field"
                placeholder="Speciality"
                value={specialityFilter}
                onChange={setSpecialityFilter}
              />

              <Button
                className="prescription-filter-reset"
                onClick={() => {
                  setSelectedDate(null);
                  setNameFilter("");
                  setSpecialityFilter("");
                  setIsFilled(false);
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>        </Toolbar>
      </AppBar>
            <Paper className="prescriptions-table-card" elevation={0}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table aria-label="prescriptions table">
            <TableHead>
              <TableRow>
                <TableCell align="left" className="prescription-table-heading">
                  Filled
                </TableCell>
                <TableCell align="left" className="prescription-table-cell">
                  Date
                </TableCell>
                <TableCell align="left" sx={{ fontSize: "20px" }}>
                  Doctor Name
                </TableCell>
                <TableCell align="left" sx={{ fontSize: "20px" }}>
                  Speciality
                </TableCell>
                <TableCell align="left" sx={{ fontSize: "20px" }}>
                  View
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .filter((row) => {
                  return (
                    nameFilter === "" ||
                    row.doctorID?.name
                      .toLowerCase()
                      .includes(nameFilter.toLowerCase())

                    // Add this line
                  );
                })
                .filter((row) => {
                  return (
                    specialityFilter === "" ||
                    row.doctorID.speciality
                      .toLowerCase()
                      .includes(specialityFilter.toLowerCase())
                  );
                })
                .filter((row) => {
                  return (
                    !selectedDate ||
                    new Date(row.datePrescribed) >= new Date(selectedDate)
                  );
                })
                .filter((row) => {
                  return isFilled === false || row.status === "filled";
                })
                .map((row, index) => (
                  <TableRow key={index} hover role="checkbox" tabIndex={-1}>
                    <TableCell align="left">
                      <FormControlLabel
                        disabled
                        control={<Checkbox checked={row.status === "filled"} />}
                        label={
                          row.status === "filled" ? "Filled" : "Not Filled"
                        }
                        sx={{ fontSize: "20px" }}
                      />
                    </TableCell>
                    <TableCell align="left" sx={{ fontSize: "20px" }}>
                      {new Date(row.datePrescribed).toLocaleString()}
                    </TableCell>
                    <TableCell align="left" sx={{ fontSize: "20px" }}>
                      {row.doctorID?.name}
                    </TableCell>
                    <TableCell align="left" sx={{ fontSize: "20px" }}>
                      {row.doctorID?.speciality}
                    </TableCell>
                    <TableCell align="left" sx={{ fontSize: "20px" }}>
                      <IconButton onClick={() => handleView(row._id)}>
                        <VaccinesIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  ) : (
    <>
      <Link to="/Login" sx={{ left: "100%" }}>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            display: { xs: "none", sm: "flex" },
            fontSize: "20px",
            maragin: "auto",
          }}
        >
          Login
        </Typography>
      </Link>
    </>
  );
};

export default App;
