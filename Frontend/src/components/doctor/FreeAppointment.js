import * as React from 'react';
import axios from 'axios';
import { useState } from "react";
import { useParams } from "react-router-dom";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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
import { useDispatch, useSelector } from "react-redux";
import { API_URL } from "../../Consts";
import ConfirmDialog from "../common/ConfirmDialog";

function FreeAppointment() {
    const [open, setOpen] = React.useState(false);
    const [endDate, setEndDate] = useState("");
    const { id, role } = useSelector((state) => state.user);
    const [startDate, setStartDate] = useState(null);
    const [confirmClose, setConfirmClose] = useState(false);
    async function addFreeTimeSlots() {
        try {
            const response = await axios.post(`${API_URL}/doctor/addAppointmentSlot/${id}`, {
                startDate,
                endDate
            });
            console.log(response);
        } catch (error) {
            console.error("Error posting free slots", error);
        }
    }
    
    const reset = () => { setStartDate(null); setEndDate(null); };
    const hasDraft = Boolean(startDate || endDate);
    const requestClose = () => { if (hasDraft) setConfirmClose(true); else { setOpen(false); reset(); } };
    const save = async () => {
        if (!startDate || !endDate) { alert("Choose start and end dates."); return; }
        await addFreeTimeSlots();
        setOpen(false);
        reset();
    };
    

    const handleClickOpen = () => {
        setOpen(true);
    };
    return (
        <>
            <Button className="doctor-secondary-button" variant="outlined" onClick={handleClickOpen}>
                Add free Appointment SLots
            </Button>
            <Dialog open={open} onClose={requestClose} className="doctor-dialog">
                <DialogTitle>Add Free Time Slot</DialogTitle>
                <DialogContent>
                    <Typography>Start Date</Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer
                            components={["DateTimePicker", "DateTimePicker"]}
                        >
                            <DateTimePicker
                                viewRenderers={{
                                    hours: renderTimeViewClock,
                                    minutes: renderTimeViewClock,
                                    seconds: renderTimeViewClock,
                                }}
                                value={startDate}
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
                </DialogContent>
                <DialogActions>
                    <Button className="doctor-secondary-button" onClick={requestClose}>Cancel</Button>
                    <Button className="doctor-primary-button" onClick={save}>Add slot</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default FreeAppointment;
