/* package whatever; // don't place package name! */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import axios from "axios";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
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
import { useHistory, useNavigate } from "react-router-dom"; // Add this import
import CreditCardForm from './CreditCardForm';
import { API_URL } from "../../Consts.js";
import RescheduleAppointment from "./PatRescheduleAppointment";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import AccountAvatar from "../Authentication/AccountAvatar.js";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";






function BasicTable({ status, date, onPayButtonClick }) {
  const tableContainerStyle = {
    maxWidth: "80%",
    margin: "0 auto",
    marginTop: "20px",
    boxShadow: "5px 5px 5px 5px #8585854a",
  };
  

  const [followUpsRequests, setFollowUpsRequests] = useState([]);
  const dispatch = useDispatch();
  const pId = useSelector((state) => state.user.id);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);

  useEffect(() => {
    dispatch(viewAppoints(pId));
  }, [dispatch]);
  const rows = useSelector((state) => state.patient.appoints);
  console.log(rows);


  const handleCancelAppointment=async(appointment)=>
  {
    setCancelledAppointments([...cancelledAppointments,appointment._id])
    try {
      
      
      const aid=appointment._id
      const did=appointment.drID._id
      const pid=appointment.pID

      const response = await axios.patch(
         `${API_URL}/patient/CancelAppointment/${aid}/${did}/${pid}`
          );
          window.location.reload();

          
         
         // dispatch(viewAppoints(pId));
          

        } catch (error) {
      console.error("Error cancelling appointment", error);
    }
  }
  const handleFollowUpRequest = async (appointment) => {
    if (!followUpsRequests.includes(appointment._id)) {
      setFollowUpsRequests([...followUpsRequests, appointment._id]);
      const did=appointment.drID._id
      const pid=appointment.pID
      try{
      const response=await axios.post(`${API_URL}/patient/requestFollowUp/${pid}/${did}`)
      console.log("Done")}
      catch(error){
        console.log("not okkkkk!!",error)}
      
   
    } else {
      console.log(`Button already clicked for appointment ${appointment._id}`);
    }
  };

  return (
    <>
      <TableContainer component={Paper} className="modern-data-table appointments-table" style={tableContainerStyle}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
  <TableRow>
    <TableCell>Doctor Name</TableCell>
    <TableCell align="left">Doctor Speciality</TableCell>
    <TableCell align="left">Date</TableCell>
    <TableCell align="left">Status</TableCell>
    <TableCell align="left">Reschedule Appointment</TableCell> {/* Add this line */}
    <TableCell align="left">Cancel Appointment </TableCell>
    <TableCell align="left">Request FollowUp </TableCell>

  </TableRow>
</TableHead>

<TableBody>
  {rows
    .filter((row) => status === "Any" || status === row.status)
    .filter((row) => !date || new Date(row.startDate) >= new Date(date))
    .map((row, index) => (
      <TableRow key={index}>
        <TableCell component="th" scope="row">
          {row.drID?.name}
        </TableCell>
        <TableCell align="left">{row.drID?.speciality}</TableCell>
        <TableCell align="left">
          {row.startDate &&
            new Date(row.startDate).toLocaleDateString()}
        </TableCell>
        <TableCell align="left">{row.status}
        {row.Description.toLowerCase().includes('follow up') && (
    <span className="appointment-followup-mark">+</span>
  )}
      </TableCell>
        <TableCell align="left">
          {row.status === "upcoming" && (
            <RescheduleAppointment appointment={row} />
          )}
        </TableCell>
        <TableCell align="left">
  {row.status === "upcoming" && (
    <Button
      variant="contained"
      color="secondary"
      onClick={() => {handleCancelAppointment(row)}}
      disabled={cancelledAppointments.includes(row._id)}
    >
      {cancelledAppointments.includes(row._id) ? "Done" : "Cancel"}
    </Button>
  )}
</TableCell>
<TableCell  align="left">
                {row.status === "completed" && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleFollowUpRequest(row)}
                    disabled={followUpsRequests.includes(row._id)}
                  >
                    {followUpsRequests.includes(row._id) ? "Done" : "FollowUp"}
                  </Button>
                )}
              </TableCell>

      </TableRow>
    ))}
</TableBody>


        </Table>
      </TableContainer>
    </>
  );
}

export default function SearchAppBar() {
  const [status, setStatus] = useState("Any");
  const [date, setDate] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [pname, setPname] = useState("");
  const [Appointments, setAppointments] = useState([]);
  const [description, setDescription] = useState("");
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openCreditCardDialog, setOpenCreditCardDialog] = useState(false);
  const [openWalletDialog, setOpenWalletDialog] = useState(false);
  const [walletBalance, setWalletBalance] = useState(1000); // Set an initial wallet balance


  const { doctorId } = useParams();

  const dispatch = useDispatch();
  const pId = useSelector((state) => state.user.id);
  const role = useSelector((state) => state.user.role);

  const rows = useSelector((state) => state.patient.appoints);

  const getAppointments = async () => {
    try {
      const response = await axios.get(
         `${API_URL}/patient/freeAppiontmentSlot/${doctorId}`
      );
      const appointmentsData = response.data.Appointmentss;
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
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

  const handleClickOpen = () => {
    setOpen(true);
    getAppointments();
  };

  const handleClose = () => {
    reserveAnAppointment();
    setOpen(false);
  };

  const handleOpenPaymentDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setSelectedAppointment(null);
    setOpenPaymentDialog(false);
  };

  const handlePaymentCreditCard = () => {
    // Handle credit card payment logic here
    console.log("Credit Card Payment processed for appointment:", selectedAppointment);
    // You can add more logic here for credit card processing
    setOpenCreditCardDialog(false);
    handleOpenCreditCardDialog(); // Close the credit card dialog after processing
  };

  const handleOpenCreditCardDialog = () => {
    setOpenCreditCardDialog(true);
  };

  const handleCloseCreditCardDialog = () => {
    setOpenCreditCardDialog(false);
  };

  const handleOpenWalletDialog = () => {
    setOpenWalletDialog(true);
  };
  
  const handleCloseWalletDialog = () => {
    setOpenWalletDialog(false);
  };

  const handlePaymentWallet = () => {
    console.log("Wallet Payment processed for appointment:", selectedAppointment);
    // You can add more logic here for credit card processing
    setOpenWalletDialog(false);
    handleOpenWalletDialog(); // Close the credit card dialog after processing

  };
 

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
const navigate = useNavigate();
  return (
    role==="patient"?(
    <Box className="appointments-page">
        <div className="appointments-account"><AccountAvatar /></div>
      <AppBar position="static" className="appointments-toolbar" elevation={0}>
        <Toolbar className="appointments-toolbar-inner">
          <Link to="/Home" style={{ color: "white" }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
            >
            </IconButton>
          </Link>
          <div className="appointments-title"><span>CARE SCHEDULE</span><h1>Appointments</h1><p>Review, filter and manage your upcoming visits.</p></div>
          <Box className="appointments-filters">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DateTimePicker"]}>
                <DateTimePicker
                  className="appointments-date-picker"
                  label="Start date"
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                    seconds: renderTimeViewClock,
                  }}
                  value={date}
                  onChange={(date) => setDate(date)}
                />
              </DemoContainer>
            </LocalizationProvider>
            <span
              onClick={() => {
                setDate(null);
              }}
            >
              <Typography sx={{color:"black"}}>Cancel</Typography>
            </span>
          </Box>

          <Select
            className="appointments-status-filter"
            value={status}
            label="Status Filter"
            onChange={(event) => {
              setStatus(event.target.value);
            }}
          >
            <MenuItem sx={{color:"black"}} value={"Any"}>Any</MenuItem>
            <MenuItem value={"completed"}>completed</MenuItem>
            <MenuItem value="upcoming">upcoming</MenuItem>
            <MenuItem value="cancelled">cancelled</MenuItem>
            <MenuItem value="rescheduled">rescheduled</MenuItem>
          </Select>
        </Toolbar>
      </AppBar>
      <BasicTable
        status={status}
        date={date}
        onPayButtonClick={handleOpenPaymentDialog}
      />
          <Button
        className="appointments-add-button"
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleClickOpen}
      >
        Book appointment
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="clinic-modern-dialog appointment-book-dialog"
      >
        <DialogTitle className="clinic-dialog-title">
          <div>
            <span>CARE SCHEDULE</span>
            <h2>{Appointments.length === 0 ? "No appointments available" : "Book an appointment"}</h2>
          </div>
          <IconButton className="clinic-dialog-close" onClick={() => setOpen(false)} aria-label="Close">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        {Appointments.length === 0 ? (
          <div className="empty-appointments-dialog">
            <p>There are no available appointment slots for this doctor right now. Please try again later.</p>
          </div>
        ) : (
          <>
            <DialogContent className="clinic-dialog-content">
              <Typography className="appointment-dialog-label">Choose a date and time</Typography>
              <div className="appointment-slots">
                {Appointments.map((appointment) => (
                  <ListItem disableGutters key={appointment._id}>
                    <ListItemButton
                      className="appointment-slot"
                      selected={currentAppointment === appointment._id}
                      onClick={() => setCurrentAppointment(appointment._id)}
                    >
                      <ListItemText primary={formatDateTimeToEnglish(appointment.startDate)} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </div>
              <div className="appointment-form-field">
                <Typography>Patient username</Typography>
                <TextField fullWidth onChange={(event) => setPname(event.target.value)} />
              </div>
              <div className="appointment-form-field">
                <Typography>Description</Typography>
                <TextField fullWidth onChange={(event) => setDescription(event.target.value)} />
              </div>
            </DialogContent>
            <DialogActions className="clinic-dialog-actions">
              <Button onClick={() => setOpen(false)} className="clinic-dialog-cancel">Cancel</Button>
              <Button onClick={handleClose} className="clinic-dialog-primary">Book appointment</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

     
      <Snackbar open={false} anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
      <MuiAlert elevation={6} variant="filled" severity="info">
        appointement is resuchudeled!!
      </MuiAlert>
    </Snackbar>
     
     

    </Box>):(
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
  ));
  
}
