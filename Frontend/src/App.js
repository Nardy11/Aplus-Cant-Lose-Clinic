import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux"; // Import Provider from 'react-redux'
import store from "./store";
import HomeDirect from "./HomeDirect";
import PatientDirect from "./PatientDirect";
import AdminDirect from "./PatientDirect";

import DoctorDirect from "./DoctorDirect";
import { createContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import { makeTheme } from "./design/theme";
import dayjs from "dayjs";
import "dayjs/plugin/weekOfYear";
import "dayjs/plugin/customParseFormat";
import "dayjs/plugin/localizedFormat";
import "dayjs/plugin/isBetween";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import Error from "./components/Error";
import Login from "./components/Authentication/Login";
import RegisterAs from "./components/Authentication/RegisterAs";

import RegisterAsPatient from "./components/Authentication/RegisterAsPatient";

// import upload_docs from "./components/Authentication/upload_docs";
import Prescriptions from "./components/patient/Prescription";
import ListOfPrescriptions from "./components/patient/ListOfPrescriptions";
import ViewFamilyMember from "./components/patient/viewfamilymember";
import Appointments from "./components/patient/appointments";
import DoctorsList from "./components/patient/DoctorsList";
import Doctordetails from "./components/patient/Doctordetails";
import Admin from "./components/Adminstrator/Admin";
import PaHome from "./components/patient/Home";
import ViewHealthPackage from "./components/patient/ViewHealthPackage";
import Chatpage from "./Pages/Chatpage";
import FollowUpRequests from "./components/doctor/FollowUpRequests.js";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
  Routes,
} from "react-router-dom";

import MyProfile from "./components/doctor/MyProfile"; // Update the path to match your file structure
import DocHome from "./components/doctor/HomePage"; // Update the path to match your file structure
import MyAppointments from "./components/doctor/MyAppointments"; // Update the path to match your file structure
import PatientDetails from "./components/doctor/PatientView"; // Update the path to match your file structure
import PatientList from "./components/doctor/PatientsList";
import Start from "./components/Start.js";
import Landing from "./components/Landing";
import PaymentReturn from "./components/patient/PaymentReturn";
import { Snackbar, Alert } from "@mui/material";
import RegisterAsDoctor from "./components/Authentication/RegisterAsDoctor";
import ProfileDirect from "./ProfileDirect";
import DocPatients from "./components/doctor/DocPatients";
import AddPack from "./components/Adminstrator/AddPack"
import PatientView from "./components/doctor/PatientView";
import Upload from "./components/doctor/Upload";
import MedHist from "./components/patient/MedHist";
import ResetPassword from "./components/Authentication/ResetPassword";
import VideoChat from "./components/VideoChat.js";
import ChangePass from "./components/Authentication/ChangePass";
import Contract from "./components/doctor/Contract.js";
import HealthRecords from "./components/patient/HealthRecords.js";
import AvailableApp from "./components/patient/AvailableApp";
import Vid from "./components/Vid.js";
import DocPrescriptions from "./components/doctor/Prescription";
import NotificationsPage from "./components/NotificationsPage";
import WalletPage from "./components/WalletPage";
const router = createBrowserRouter(
  createRoutesFromElements(
    
    //authentications
    //patient
    //doctor
    //admin

    <Route>

      {/* Public pages share the public header. */}
      <Route element={<Start />}>
        <Route path="/" element={<Landing />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/RegisterAs" element={<RegisterAs />} />
        <Route path="/RegisterAsPatient" element={<RegisterAsPatient />} />
        <Route path="/RegisterAsDoctor" element={<RegisterAsDoctor />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/reset_password/:id/:token" element={<ChangePass />} />
      </Route>
      <Route path="/Home" element={<HomeDirect />} />
      <Route path="/Notifications" element={<NotificationsPage />} />
      <Route path="/Wallet" element={<WalletPage />} />
      <Route path='/Prescription' element={<DocPrescriptions/>} />
      <Route path="/MedHist" element={<MedHist />} />
      {/* The document list lives inside Health records; this standalone route had no header. */}
      <Route path="/MedHistList" element={<Navigate to="/HealthRecords" replace />} />
      <Route path="/Appointments" element={<Appointments />} />
      <Route path="/appointmentPatientss/:doctorId" element={<AvailableApp />} />
      <Route path="viewfamilymembers" element={<ViewFamilyMember />} />
      <Route path="ViewHealthPackage" element={<ViewHealthPackage />} />
      <Route path="HealthRecords" element={<HealthRecords />} />
      <Route path="viewfamilymembers/newfamilymembers" element={<Navigate to="/viewfamilymembers" replace />} />
      <Route path="ListOfPrescriptions" element={<ListOfPrescriptions />} />
      <Route
        path="viewSpecificPrescription/:id"
        element={<Prescriptions />}
      />
      <Route path="DoctorsList" element={<DoctorsList />} />
      <Route path="DoctorsList/Doctordetails" element={<Doctordetails />} />
      <Route path="/payment/return" element={<PaymentReturn />} />
      <Route path="/FamilyMemberForm" element={<Navigate to="/viewfamilymembers" replace />} />


      <Route path="/Profile" element={<ProfileDirect />} />
      <Route path="/DocPatients" element={<DocPatients />} />
      <Route path="/Contract" element={<Contract />} />
      <Route path="/PatientsList" element={<PatientView />} />

      <Route path="/vidcall" element={<Vid />} />

      
      <Route path="AddHealthPackages" element={<AddPack />} />

      <Route path="/chats" element={<Chatpage/>} />
      <Route path="/FollowUpRequests" element={<FollowUpRequests/>}/>
    </Route>
  )
  );
  
  // Severitys:
// success
// error
// info
// warning
export const SnackbarContext = createContext();

const App = () => {
  const role = useSelector((state) => state.user.role);
  const theme = useMemo(() => makeTheme(role), [role]);

  useEffect(() => {
    // Accent tokens switch on this attribute: blue for patients, green for doctors.
    document.documentElement.dataset.role = role === "doctor" ? "doctor" : "patient";
  }, [role]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  function displaySnackbar(message, severity) {
    setSnackbarOpen(true);
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
  }

  return (
    <ThemeProvider theme={theme}>
      <SnackbarContext.Provider value={displaySnackbar}>
        <RouterProvider router={router} />
      </SnackbarContext.Provider>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => {
          setSnackbarOpen(false);
        }}
      >
        <Alert className="clinic-snackbar-alert" severity={snackbarSeverity}>{snackbarMessage}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default App;