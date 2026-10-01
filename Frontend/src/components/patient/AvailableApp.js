import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import axios from "axios";
import HomeIcon from "@mui/icons-material/Home";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { MenuItem, Select, TextField } from "@mui/material";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import { useDispatch, useSelector } from "react-redux";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { viewAppoints } from "../../features/patientSlice";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useNavigate } from "react-router-dom";
import CreditCardForm from "./CreditCardForm";
import { API_URL } from "../../Consts.js";
import { SnackbarContext } from "../../App";
import { useContext } from "react";
import AccountAvatar from "../Authentication/AccountAvatar.js";
export default function AvailableApp({ status, date, onPayButtonClick }) {
  const snackbarMessage = useContext(SnackbarContext);

  const tableContainerStyle = {
    maxWidth: "80%",
    margin: "0 auto",
    marginTop: "20px",
    boxShadow: "5px 5px 5px 5px #8585854a",
  };
  const dispatch = useDispatch();
  const pId = useSelector((state) => state.user.id);
  const role = useSelector((state) => state.user.role);
  var noappoints = false;
  const [open, setOpen] = React.useState(false);
  const [pname, setPname] = useState("");
  const [description, setDescription] = useState("");
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const { doctorId } = useParams();
  const [rows, setRows] = useState([]);
  const [aid, setAid] = useState(0);
  const handleClose = () => {
    reserveAnAppointment();
    setOpen(false);
  };
  async function reserveAnAppointment() {
    try {
      console.log("appointmentId:", currentAppointment);
      console.log("username:", pname);
      console.log("Description:", description);

      const response = await axios.patch(
        `${API_URL}/patient/reserveAppointmentSlot/${currentAppointment}`,
        {
          username: pname,
          Description: description,
        }
      );
      console.log(response);
    } catch (error) {
      console.error("Error adding the slot", error);
    }
  }
  function formatDateTimeToEnglish(dateTimeString) {
    const date = new Date(dateTimeString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    const dateFormatter = new Intl.DateTimeFormat("en-US", options);
    return dateFormatter.format(date);
  }
  const getAppointments = async (doctorId) => {
    try {
      const response = await axios.get(
        `${API_URL}/patient/freeAppiontmentSlot/${doctorId}`
      );
      setRows(response.data.Appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    getAppointments(doctorId);
  }, [doctorId]);
  const navigate = useNavigate();
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

  const handleOpenPaymentDialog = async (appointment) => {
    try {
      const response = await axios.get(
        `${API_URL}/patient/calculateAmount/${doctorId}/${pId}`
      );
      const calculatedAmount = response.data.amount;
      setCalculatedAmount(calculatedAmount);
      setSelectedAppointmentId(appointment._id); // Assuming _id is the appointment ID
      setOpenPaymentDialog(true);
      // Assuming _id is the appointment ID

      setAid(appointment._id);
    } catch (error) {
      console.error("Error calculating amount:", error);
    }
    setOpenPaymentDialog(true);
    handleClose();
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
  };

  const [openCreditCardDialog, setOpenCreditCardDialog] = useState(false);
  const [openWalletDialog, setOpenWalletDialog] = useState(false);

  const [walletBalance, setWalletBalance] = useState(1000);

  const handlePaymentCreditCard = () => {};

  const handleCloseCreditCardDialog = () => {
    setOpenCreditCardDialog(false);
  };

  const handleOpenWalletDialog = () => {
    setOpenWalletDialog(true);
  };

  const handleCloseWalletDialog = () => {
    setOpenWalletDialog(false);
  };
  const handleClickOpen = () => {
    setOpen(true);
    getAppointments();
  };
  const handlePaymentWallet = async () => {
    try {
      // Check if an appointment is selected
      if (!selectedAppointmentId) {
        console.error("No appointment selected for payment");
        return;
      }

      // Fetch the calculated amount for the selected appointment
      const response = await axios.get(
        `${API_URL}/patient/calculateAmount/${doctorId}/${pId}`
      );
      const calculatedAmount = response.data.amount;
      console.log(calculatedAmount);
      // Check if the calculated amount is valid
      if (!calculatedAmount || calculatedAmount <= 0) {
        console.error("Invalid calculated amount");
        return;
      }

      // Perform the wallet payment
      const body = {
        patientID: pId,
        amount: calculatedAmount,
        drID: doctorId,
        appointmentID: selectedAppointmentId,
      };

      const paymentResponse = await axios.post(
        `${API_URL}/patient/payAppWithWallet/`,
        body
      );
      if (response) {
        snackbarMessage("You have successfully edited", "success");
      } else {
        snackbarMessage(`error: ${response} has occurred`, "error");
      }
      // Handle the payment response as needed
      console.log(paymentResponse.data);
      navigate("/Home");

      // Close the payment dialog
      handleClosePaymentDialog();
    } catch (error) {
      console.error("Error making wallet payment:", error);
      // Handle error
    }
  };

  ///
  const handleOpenCreditCardDialog = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/patient/createAppointmentCheckoutSession/${calculatedAmount}/${aid}/${pId}`
      );
      //should add await here?
      const { url } = response.data;

      window.location = url;
    } catch (error) {
      console.error(error.response.data.error);
    }
  };
  ///
  return role === "patient" ? (
    <>
      <div>
        <AccountAvatar />
      </div>
      <TableContainer component={Paper} style={tableContainerStyle}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Doctor Name </TableCell>
              <TableCell align="left">Doctor Speciality</TableCell>
              <TableCell align="left">Date</TableCell>
              <TableCell align="left">Status </TableCell>
              <TableCell align="left">Payment </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row.drID.name}
                </TableCell>
                <TableCell align="left">{row.drID.speciality}</TableCell>
                <TableCell align="left">
                  {row.startDate &&
                    new Date(row.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell align="left">{row.status}</TableCell>
                <Dialog
                  open={open}
                  onClose={handleClose}
                  PaperProps={{
                    style: noappoints
                      ? { backgroundColor: "#004e98" }
                      : { backgroundColor: "white" },
                  }}
                >
                  {rows.length === 0 ? (
                    (noappoints = true && (
                      <div
                        style={{
                          padding: "10px",
                          color: "white",
                          background: "#004e98",
                        }}
                      >
                        <h1>There is no Available free </h1>
                      </div>
                    ))
                  ) : (
                    <>
                      <DialogTitle>Add An Appointment</DialogTitle>
                      <DialogContent>
                        <Typography>Date & Time</Typography>
                        {rows.map((appointment) => (
                          <ListItem disableGutters key={appointment._id}>
                            <ListItemButton>
                              <ListItemText
                                primary={formatDateTimeToEnglish(
                                  appointment.startDate
                                )}
                                onClick={() =>
                                  setCurrentAppointment(appointment._id)
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                        <div style={{ padding: "10px" }}>
                          <Typography>Patient User Name</Typography>
                          <TextField
                            onChange={(event) => setPname(event.target.value)}
                          />
                        </div>
                        <div style={{ padding: "10px" }}>
                          <Typography>Description</Typography>
                          <TextField
                            onChange={(event) =>
                              setDescription(event.target.value)
                            }
                          />
                        </div>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => handleOpenPaymentDialog(row)}>
                          Pay
                        </Button>
                        <Button onClick={(noappoints = true && handleClose)}>
                          Cancel
                        </Button>
                      </DialogActions>
                    </>
                  )}
                </Dialog>
                <TableCell align="left">
                  {row.payment}
                  <Button onClick={() => handleClickOpen()}>Reserve</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openPaymentDialog}
        onClose={handleClosePaymentDialog}
        PaperProps={{
          style: { backgroundColor: "white" },
        }}
      >
        <DialogTitle>Payment</DialogTitle>
        <DialogContent>
          <Typography>Payment for appointment: </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOpenCreditCardDialog}>Credit Card</Button>
          <Button onClick={handleOpenWalletDialog}>Wallet</Button>
          <Button onClick={handleClosePaymentDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCreditCardDialog}
        onClose={handleCloseCreditCardDialog}
        PaperProps={{
          style: { backgroundColor: "white" },
        }}
      >
        <DialogTitle>Credit Card Information</DialogTitle>
        <DialogContent>
          <CreditCardForm />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreditCardDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openWalletDialog}
        onClose={handleCloseWalletDialog}
        PaperProps={{
          style: { backgroundColor: "white" },
        }}
      >
        <DialogTitle>Wallet Payment</DialogTitle>
        <DialogContent>
          <Typography>Payment for appointment: </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentWallet}>Pay with Wallet</Button>
          <Button onClick={handleCloseWalletDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Link to="/Home" style={{ color: "white" }}>
        <IconButton
          size="large"
          color="blue"
          aria-label="open drawer"
          sx={{ mr: 2, pisition: "fixed", top: "0px" }}
        >
          <HomeIcon />
        </IconButton>
      </Link>
    </>
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
}
