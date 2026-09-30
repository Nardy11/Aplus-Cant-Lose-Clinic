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
function FollowUp() {
    const [open, setOpen] = React.useState(false);
    const [endDate, setEndDate] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const { id, role } = useSelector((state) => state.user);
    const [patients, setPatients] = useState([]);
    const [currentpatient, setCurrentPatient] = useState("");
    const [confirmClose, setConfirmClose] = useState(false);
       //to get list of doctors patients so he can choose the name of the patient he want to schedule follow up with
    const getPatientList = async () => {
        try {
            const response = await axios.get(`${API_URL}/doctor/patientsInUpcomingApointments/${id}`);
            const patientsdata = response.data.patients;
            setPatients(patientsdata);
        } catch (error) {
            console.error("Error fetching patientlist", error);
        }
    }
    //that is the function that addes the follow up slot for selected patient
    async function addFollowUp() {
        try {
            console.log(currentpatient);

            const response = await axios.post( `${API_URL}/doctor/createFollowUpAppointment/${id}?patientID=${currentpatient}`, {
                startDate,
                endDate
            });
            console.log(response);
        } catch (error) {
            console.error("Error posting free slots", error);
        }
    }
    const handleClickOpen = async () => {
        setOpen(true);
        await getPatientList();
    };

    const reset = () => { setStartDate(null); setEndDate(null); setCurrentPatient(""); };
    const hasDraft = Boolean(startDate || endDate || currentpatient);
    const requestClose = () => {
        if (hasDraft) setConfirmClose(true);
        else { setOpen(false); reset(); }
    };
    const save = async () => {
        if (!startDate || !endDate || !currentpatient) { alert("Choose a patient, start time and end time."); return; }
        await addFollowUp();
        setOpen(false);
        reset();
    };
    return (
        <>
            <Button className="doctor-secondary-button" variant="outlined" onClick={handleClickOpen}>
                Create a Follow up appointment
            </Button>
            <Dialog open={open} onClose={requestClose} className="doctor-dialog">
                <DialogTitle>Create Follow up Appointment</DialogTitle>
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
                    <Button className="doctor-secondary-button" onClick={requestClose}>Cancel</Button><Button disableRipple className="doctor-primary-button" onClick={save}>Create follow-up</Button>
                </DialogActions>
            </Dialog>
            <ConfirmDialog open={confirmClose} title="Discard follow-up?" message="You have selected follow-up details. Closing now will discard the unsaved appointment." confirmLabel="Discard" cancelLabel="Keep editing" destructive onConfirm={() => { setConfirmClose(false); setOpen(false); reset(); }} onCancel={() => setConfirmClose(false)} />
        </>
    );
}

export default FollowUp;
