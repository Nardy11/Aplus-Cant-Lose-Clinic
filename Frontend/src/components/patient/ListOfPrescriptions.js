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
import { useNavigate } from "react-router-dom";
import DownloadPage from "./DownloadP";
import AccountAvatar from "../Authentication/AccountAvatar";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
// ...
import {
  viewPrescriptions,
  viewPrescription,
} from "../../features/patientSlice";
import { useDispatch, useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";

const handlePay = async (prescriptionId) => {
  try {
    const response = await axios.get(`${API_URL}/patient/AddFromPrescToCart/${prescriptionId}`);
    console.log(response.data);
    if (response.status === 200) {
      // Navigate to the Checkout page
      window.location.href = 'http://localhost:3001/Checkout';
    } 
     // Handle the response as needed
  } catch (error) {
    console.error('Error during payment:', error);
    // Handle the error as needed
  }
};
const App = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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

  useEffect(() => {
    dispatch(viewPrescriptions(patientId));
  }, [dispatch, patientId]);

  const handleView = (id) => {
    setPrescriptionid(rows.find((row) => row._id === id));
    setOpen(true);
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
          <div id="pagetodownload">
            <Paper
              sx={{
                width: "100%",
                marginTop: "40px",
                marginLeft: "2%",
                boxShadow: "5px 5px 5px 5px #8585854a",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box style={Info}>
                    <Typography sx={{ fontSize: "16px" }}>
                      <strong>Date : </strong>
                      {new Date(
                        prescriptionid?.datePrescribed
                      ).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <img
                    src="/virtualclinic.png"
                    alt="virtualclinic"
                    width={"100%"}
                    sx={{ marginBottom: "50px" }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ margin: "20px 20px 0px 80px" }}>
                    <Typography sx={{ fontSize: "16px" }}>
                      {prescriptionid.doctorID?.name}
                    </Typography>
                    <Typography sx={{ fontSize: "16px" }}>
                      {prescriptionid.doctorID?.speciality}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4} sx={{ pr: "10%" }}>
                {prescriptionid.meds.map((medicine, index) => (
                  <Box sx={{ margin: "20px 20px 0px 80px" }}>
                    <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>
                      Medicine Name :
                      <span style={{ fontSize: "16px", fontWeight: "normal" }}>
                        {medicine.medID?.name}
                      </span>
                    </Typography>
                    <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>
                      Medicine Active elements:
                      <span style={{ fontSize: "16px", fontWeight: "normal" }}>
                        {medicine.medID?.activeElement}
                      </span>
                    </Typography>

                    <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>
                      Medical Use :
                      <span style={{ fontSize: "16px", fontWeight: "normal" }}>
                        {medicine.medID?.use}
                      </span>
                    </Typography>
                    <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>
                      Medicine Frequency :
                      <span style={{ fontSize: "16px", fontWeight: "normal" }}>
                        {medicine.medID?.amount}
                      </span>
                    </Typography>
                    <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>
                      Medicine Dosage :
                      <span style={{ fontSize: "16px", fontWeight: "normal" }}>
                        {medicine?.dosage}
                      </span>
                    </Typography>
                    <hr />
                  </Box>
                ))}
              </Grid>
              <Paper
                sx={{
                  width: "100px",
                  marginTop: "40px",
                  marginLeft: "40%",
                  boxShadow: "none",
                  display: "flex",
                }}
              >
                {prescriptionid.status == "filled" ? (
                  <img
                    src="/Pharmacy Stamp.png"
                    alt="hospital stamp"
                    width={"100%"}
                  />
                ) : (
                  ""
                )}
                <DownloadPage
                  rootElementId="pagetodownload"
                  downloadFileName="prescription"
                />
                <Button
                  className="prescription-action-button"
                  onClick={() => handlePay(prescriptionid._id)}
                  variant="contained"
                >
                  Pay & checkout
                </Button>
                <Button
                  className="prescription-action-secondary"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
              </Paper>
            </Paper>
          </div>
        ) : null}
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
