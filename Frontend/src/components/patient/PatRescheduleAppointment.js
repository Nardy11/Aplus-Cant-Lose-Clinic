import * as React from 'react';
import { useState } from "react";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';
import {
    Typography
} from "@mui/material";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { API_URL } from "../../Consts.js";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import IconButton from "@mui/material/IconButton";
import ConfirmDialog from "../common/ConfirmDialog";
//import Appointment from '../../../Backend/Models/appointments';



function RescheduleAppointment({ appointment }) {
    const [open, setOpen] = React.useState(false);
    const [endDate, setEndDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const { id, role } = useSelector((state) => state.user);
    const [patients, setPatients] = useState([]);
    const [currentpatient, setCurrentPatient] = useState("");
    const [selectedUsername, setSelectedUsername] = useState("");
    const [confirmClose, setConfirmClose] = useState(false);
  
    // Function to fetch appointment data from the server
    const fetchAppointmentData = async (appointmentId) => {
      try {
        const response = await axios.get(`${API_URL}/patient/getAppointment/${appointmentId}`);
        const appointmentData = response.data; // Adjust this based on your API response
        return appointmentData;
      } catch (error) {
        console.error("Error fetching appointment data", error);
        return null;
      }
    };
  
    // Function to handle rescheduling
    const rescheduleAppointment = async () => {
        try {
          console.log("Rescheduling appointment...");
          console.log("Appointment ID:", appointment._id); // Use appointment._id
      
          // Change the API endpoint to handle rescheduling
          const response = await axios.put(
            `${API_URL}/patient/rescheduleAppointment/${appointment._id}`,
            {
              startDate,
              endDate
            }
          );
          console.log("Response:", response.data);
      
          // Check if the response indicates success
          if (response.data.success) {
            console.log("Appointment successfully rescheduled!");
          } else {
            console.error("Error rescheduling appointment:", response.data.message);
          }
        } catch (error) {
          console.error("Error rescheduling appointment", error);
        }
      };
  
    // Function to get the list of doctors' patients
    const getPatientList = async () => {
      try {
        const response = await axios.get(`${API_URL}/patient/getFamilyMembers/${id}`);
        const familyMembers = response.data.familyMembers;
        setPatients(familyMembers);
      } catch (error) {
        console.error("Error fetching family members", error);
      }
    };
  
    const handleClickOpen = async () => {
      setOpen(true);
      await getPatientList();
      
    };
    const resetForm = () => {
      setStartDate("");
      setEndDate("");
      setCurrentPatient("");
      setSelectedUsername("");
    };

    const hasDraft = Boolean(startDate || endDate || currentpatient || selectedUsername);

    const requestClose = () => {
      if (hasDraft) {
        setConfirmClose(true);
      } else {
        resetForm();
        setOpen(false);
      }
    };

    const confirmDiscard = () => {
      setConfirmClose(false);
      resetForm();
      setOpen(false);
    };

    const handleReschedule = async () => {
      await rescheduleAppointment();
      resetForm();
      setOpen(false);
      window.location.reload();
    };
    
    return (
        <>
            <Button variant="outlined" onClick={handleClickOpen}>
            Reschedule Appointment
            </Button>
            <Dialog open={open} onClose={requestClose} className="clinic-modern-dialog reschedule-appointment-dialog">
                <DialogTitle className="clinic-dialog-title">
                  <div>
                    <span>CARE SCHEDULE</span>
                    <h2>Reschedule appointment</h2>
                  </div>
                  <IconButton className="clinic-dialog-close" onClick={requestClose} aria-label="Close">
                    <CloseRoundedIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent>                  
                    <Typography>Start Date</Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer
                            components={["DateTimePicker", "DateTimePicker"]}
                        >
                            <DateTimePicker
                                label="Start time"
                                viewRenderers={{
                                    hours: renderTimeViewClock,
                                    minutes: renderTimeViewClock,
                                    seconds: renderTimeViewClock,
                                }}
                                value={startDate} // Add this line
                                onChange={(date) => setStartDate(date)}
                            />
                        </DemoContainer>
                    </LocalizationProvider>
                    <span
                        onClick={() => {
                            setStartDate("");
                        }}
                    ></span>
                    <Typography>End Date </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer
                            components={["DateTimePicker", "DateTimePicker"]}
                        >
                            <DateTimePicker
                                label="End time"
                                viewRenderers={{
                                    hours: renderTimeViewClock,
                                    minutes: renderTimeViewClock,
                                    seconds: renderTimeViewClock,
                                }}
                                value={endDate}
                                onChange={(date) => setEndDate(date)}
                            />
                        </DemoContainer>
                    </LocalizationProvider>
                    <span
                        onClick={() => {
                            setEndDate("");
                        }}
                    ></span>
                    {patients.map((patient) => (
                        <ListItem disableGutters key={patient}>
                            <ListItemButton onClick={() => setCurrentPatient(patient._id)}>
                                {console.log(patients)}
                                <ListItemText primary={patient?.name} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </DialogContent>
                <DialogActions className="clinic-dialog-actions">
                    <Button onClick={requestClose} className="clinic-dialog-cancel">Cancel</Button>
                    <Button onClick={handleReschedule} className="clinic-dialog-primary">Reschedule</Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
              open={confirmClose}
              title="Discard reschedule changes?"
              message="Your selected dates and times have not been saved. Leaving now will remove them."
              confirmLabel="Discard"
              cancelLabel="Keep editing"
              destructive
              onConfirm={confirmDiscard}
              onCancel={() => setConfirmClose(false)}
            />
        </>
    );
}

export default RescheduleAppointment;
