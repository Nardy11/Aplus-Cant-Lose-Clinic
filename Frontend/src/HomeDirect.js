import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Admin from "./components/Adminstrator/Admin";
import Error from "./components/Error";

import PaHomePage from "./components/patient/Home";
import { Outlet } from "react-router-dom";
import DocHome from "./components/doctor/HomePage";
import Navbar from "./components/Navbar";
import io from 'socket.io-client';
import {socketset} from "./features/userSlice";
import AccountAvatar from "./components/Authentication/AccountAvatar"; // Import the AccountAvatar component
const containerStyles = {
  height: "fit-content",
  maragin: "0 auto",
  backgroundColor: "whitesmoke",
  borderRadius: "7px",
  paddingRight: "15px",
  paddingBottom: "2px",
  paddingTop: "2px", // Center items vertically
};
const ENDPOINT = 'http://localhost:10000'; // "https://talk-a-tive.herokuapp.com"; -> After deployment
const socket = io(ENDPOINT);


const HomeDirect = () => {
const dispatch = useDispatch();
  const { role, logId } = useSelector((state) => state.user);
  useEffect(() => {
    if (!logId) return;
    socket.emit("login", logId);
    dispatch(socketset(socket));
  }, [dispatch, logId]);

  console.log(role);

  // Check if role is not one of the specified cases
  if (role !== "admin" && role !== "doctor" && role !== "patient") {
    return <Error />; // Render the ErrorPage component for unknown roles
  }

  // Render components based on the role
  return (
    <div>
      {role === "admin" && (
        <>
          <AccountAvatar sx={containerStyles} /> <Admin />
        </>
      )}
      {role === "doctor" && (
        <>
          <AccountAvatar sx={containerStyles} />
          <DocHome />
        </>
      )}
      {role === "patient" && (
        <>
          <AccountAvatar sx={containerStyles} />
          <PaHomePage />
        </>
      )}
    </div>
  );
};

export default HomeDirect;
