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
import { ClinicDateTimeField } from "../common/ClinicFields";
import { API_URL } from "../../Consts.js";
import ConfirmDialog from "../common/ConfirmDialog";

function RescheduleAppointment({  appointmentID }) {
    const [open, setOpen] = React.useState(false);
    const [endDate, setEndDate] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [confirmClose, setConfirmClose] = useState(false);
    const { id, role } = useSelector((state) => state.user);
    const [patients, setPatients] = useState([]);
    const [currentpatient, setCurrentPatient] = useState("");
    var closes = false;

    const getPatientList = async () => {
        try {
            const response = await axios.get(`${API_URL}/doctor/patientsInUpcomingApointments/${id}`);
            const patientsdata = response.data.patients;
            setPatients(patientsdata);
        } catch (error) {
            console.error("Error fetching patient list:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
            }
        }
    };

    // Example code in DocRescheduleAppointment.js
    async function rescheduleAppointment() {
        try {
            const appointmentId = appointmentID;
            
           
            console.log("Attempting to reschedule appointment:", appointmentId,  startDate, endDate);
            if (appointmentId ) {
                const response = await axios.put(
                    `${API_URL}/doctor/rescheduleAppointment/${appointmentId}`, // Use appointmentID directly
                    {
                        startDate,
                        endDate
                    }
                );
                console.log("Response:", response.data);
                // You can handle the response here, e.g., show a success message
            } else {
                console.error("Invalid appointmentId ");
            }
        } catch (error) {
            console.error("Error rescheduling appointment", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
            }
        }
    }
    

    

    const handleClickOpen = async () => {
        setOpen(true);
       // await getPatientList();
      
        // Retrieve appointmentId from the prop or any other source
        // For example, if appointmentId is part of the appointment object passed as prop
        // const appointmentId = appointment._id; // Make sure to pass the correct prop
        // console.log(appointmentId);

        // You can set the appointmentId in the state or use it directly in the rescheduleAppointment function
    };
    const reset = () => { setStartDate(null); setEndDate(null); };
    const requestClose = () => {
        if (startDate || endDate) setConfirmClose(true);
        else { setOpen(false); reset(); }
    };
    const save = async () => {
        if (!startDate || !endDate) { alert("Choose start and end dates."); return; }
        await rescheduleAppointment();
        setOpen(false);
        reset();
        window.location.reload();
    };
    return (
        <>
            <Button className="doctor-secondary-button" variant="outlined" onClick={handleClickOpen}>
            Reschedule Appointment
            </Button>
            <Dialog open={open} onClose={requestClose} className="doctor-dialog">
                <DialogTitle>Reschedule Appointment</DialogTitle>
                <DialogContent>
                    <ClinicDateTimeField value={startDate} onChange={setStartDate} label="Start date & time" />
                    <ClinicDateTimeField value={endDate} onChange={setEndDate} label="End date & time" />
                    {patients.map((patient) => (
                        <ListItem disableGutters key={patient}>
                            <ListItemButton onClick={() => setCurrentPatient(patient._id)}>
                                {console.log(patients)}
                                <ListItemText primary={patient?.name} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button className="doctor-secondary-button" onClick={requestClose}>Cancel</Button><Button disableRipple className="doctor-primary-button" onClick={save}>Reschedule</Button>
                </DialogActions>
            </Dialog>
            <ConfirmDialog open={confirmClose} title="Discard reschedule?" message="You have selected a new appointment time. Closing now will discard the unsaved changes." confirmLabel="Discard" cancelLabel="Keep editing" destructive onConfirm={() => { setConfirmClose(false); setOpen(false); reset(); }} onCancel={() => setConfirmClose(false)} />
        </>
    );
}

export default RescheduleAppointment;
