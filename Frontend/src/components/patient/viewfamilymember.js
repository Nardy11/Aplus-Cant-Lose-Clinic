import React from "react";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { viewFamilyMembers } from "../../features/patientSlice";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import { useNavigate } from "react-router-dom";
import Popover from "@mui/material/Popover";
import NewFamilyMemberForm from "./newfamilymember";
import { SnackbarContext } from "../../App";
import { useContext } from "react";
import { addFamilyMember } from "../../features/patientSlice";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { Icon } from "@mui/material";
import List from "@mui/material/List";
import { API_URL } from "../../Consts";
import axios from "axios";
import AccountAvatar from "../Authentication/AccountAvatar";
export default function ButtonAppBar() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(viewFamilyMembers({ patientId }));
  }, [dispatch]);
  const patientId = useSelector((state) => state.user.id);
  const role = useSelector((state) => state.user.role);
  const user = useSelector((state) => state.user);

  const navigate = useNavigate();
  const iconStyle = {
    color: "white",
    fontSize: "30px",
    marginLeft: "-40px",
    paddingLeft: "0px",
  };

  const [addPopover, setAddPopover] = React.useState(null);
  const [linkPopover, setLinkPopover] = React.useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogOpen2, setIsDialogOpen2] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  const handleOpenDialog2 = () => {
    setIsDialogOpen2(true);
  };

  const handleCloseDialog2 = () => {
    setIsDialogOpen2(false);
  };

  const handleAddClick = (event) => {
    setAddPopover(event.currentTarget);
  };

  const handleLinkClick = (event) => {
    setLinkPopover(event.currentTarget);
  };

  const handleAddClose = () => {
    setAddPopover(null);
  };

  const handleLinkClose = () => {
    setLinkPopover(null);
  };
  const snackbarMessage = useContext(SnackbarContext);

  const formStyle = {
    width: "500px",
    margin: "0 auto",
    padding: "15px",
  };

  const labelStyle = {
    display: "block",
    fontWeight: "bold",
  };

  const inputStyle = {
    width: "100%",
    padding: "5px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    marginBottom: "10px",
  };

  const selectStyle = {
    width: "100%",
    padding: "5px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    marginBottom: "10px",
  };

  const buttonStyle = {
    width: "50%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    marginLeft: "25%",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };
  const [email, setEmail] = useState("");

  const [emailOrPhone, setEmailOrPhone] = useState("email");
  const [contactValue, setContactValue] = useState("");
  const [relation, setRelation] = useState("spouse");

  const handleSubmit2 = async (e) => {
    e.preventDefault();

    // Determine the field name based on the selected option
    const fieldName = emailOrPhone === "email" ? "email" : "phoneNumber";

    // Create the data object to send in the request
    const requestData = {
      [fieldName]: contactValue,
      relation: relation,
      type: fieldName,
    };
    console.log(requestData);
    try {
      if (user && user.id) {
        try {
          // Make an API request using Axios to add the family member
          const response = await axios.post(
            `${API_URL}/patient/addFamilyLink/${user.id}`,
            
              requestData
            
          );
          if (response) {
            snackbarMessage("You have successfully edited", "success");
            handleCloseDialog2();
          } else {
            snackbarMessage(`error: ${response} has occurred`, "error");
          }
          console.log("Family member added successfully:", response.data);
        } catch (error) {
          console.error("Error adding family member:", error.message);
        }
      } else {
        console.error("User ID not available.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle errors, e.g., show an error message to the user
    }
  };

  const id = useSelector((state) => state.user.id);
  const handleSubmit = (event) => {
    event.preventDefault();

    const guest = {
      fullName: event.target.elements.fullName.value,
      age: parseInt(event.target.elements.age.value, 10),
      relation: event.target.elements.relation.value,
      gender: event.target.elements.gender.value,
      NID: parseInt(event.target.elements.NID.value, 10),
    };
    console.log(guest);
    const response = dispatch(addFamilyMember({ id, guest }));

    response.then((responseData) => {
      console.log(responseData);
      if (responseData.payload === undefined) {
        snackbarMessage(`error: error`, "error");
      } else {
        snackbarMessage("You have successfully added family member", "success");
handleCloseDialog();      }
    });
  };
  return role === "patient" ? (
    <Box className="family-page">
        <div className="family-page-spacer" />
      <section className="page-heading family-heading"><span>YOUR HOUSEHOLD</span><h1>Family members</h1><p>Keep the people connected to your care in one place.</p></section>
      <Dialog
        open={isDialogOpen2}
        onClose={handleCloseDialog2}
        BackdropProps={{ onClick: handleCloseDialog2 }}
      >
        <div className="family-link-dialog" style={{
            width: "80%",
            margin: "0 auto",
            padding: "20px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h4 style={{ color: "#00008B", mb: "25px" }}>link Family Member</h4>
          <form
            onSubmit={handleSubmit2}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <label>
              Select Contact Type:
              <select
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="email">Email</option>
                <option value="phone">Phone Number</option>
              </select>
            </label>

            {/* Conditionally render the input field based on the selected option */}
            {emailOrPhone === "email" ? (
              <label>
                Email:
                <input
                  type="email"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              </label>
            ) : (
              <label>
                Phone Number:
                <input
                  type="number" // Change to "number" if you want to allow only numeric input
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              </label>
            )}

            <label>
              Relation:
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
              </select>
            </label>

            <button
              type="submit"
              style={{
                width: "40%",
                padding: "10px",

                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                postion: "relative",
                marginLeft: "30%",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
            >
              Link
            </button>
          </form>

          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="home"
            sx={{ mr: 2 }}
            onClick={() => {
              window.location.href = "/Home";
            }}
          ></IconButton>
        </div>
      </Dialog>
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        BackdropProps={{ onClick: handleCloseDialog }}
      >
        <DialogTitle>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseDialog}
            aria-label="close"
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form className="family-add-form" onSubmit={handleSubmit} method="post" style={formStyle}>
          <h3
            style={{
              textAlign: "center",
              fontSize: "20px",
              marginBottom: "10px",
            }}
          >
            Add a Family Member
          </h3>
          <div>
            <label htmlFor="fullName" style={labelStyle}>
              Full Name:
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              placeholder="Full Name"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="NID" style={labelStyle}>
              National ID:
            </label>
            <input
              type="number"
              id="NID"
              placeholder="National ID"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="age" style={labelStyle}>
              Age:
            </label>
            <input
              type="number"
              id="age"
              name="age"
              placeholder="Age"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="gender" style={labelStyle}>
              Gender:
            </label>
            <select id="gender" name="gender" style={selectStyle}>
              <option value="male">male</option>
              <option value="female">female</option>
              <option value="none">none</option>
            </select>
          </div>
          <div>
            <label htmlFor="relation" style={labelStyle}>
              Relation:
            </label>
            <select id="relation" name="relation" style={selectStyle}>
              <option>spouse</option>
              <option>child</option>
            </select>
          </div>
          <input type="submit" value="Add Family Member" style={buttonStyle} />
        </form>{" "}
      </Dialog>
        <Toolbar>
          {/* ... (your existing code) */}
          <Fab
            color="primary"
            aria-label="add"
            sx={{ position: "fixed", top: "50%", right: "20px" }}
            onClick={handleOpenDialog}
          >
            <GroupAddIcon sx={{ fontSize: "36px" }} size="large" />
          </Fab>
          <Popover
            open={Boolean(addPopover)}
            anchorEl={addPopover}
            onClose={handleAddClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <Typography sx={{ p: 2 }}>Add</Typography>
          </Popover>
          <Fab
            color="secondary"
            aria-label="link"
            sx={{ position: "fixed", top: "60%", right: "20px" }}
            onClick={handleOpenDialog2}
          >
            <PeopleOutlineIcon sx={{ fontSize: "36px" }} size="large" />
          </Fab>
          <Typography
            sx={{ position: "fixed", top: "66%", right: "34px", color: "grey" }}
          >
            link
          </Typography>
          <Popover
            open={Boolean(linkPopover)}
            anchorEl={linkPopover}
            onClose={handleLinkClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <List>
              <Typography sx={{ p: 2 }}>Link</Typography>
            </List>
          </Popover>
        </Toolbar>
      <BasicTable />
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
}

function BasicTable() {
  const rows = useSelector((state) => state.patient.fMembers);
  const tableStyle = {
    width: "80%",
    marginLeft: "10%",
    boxShadow: "5px 5px 5px 5px #8585854a",
    marginTop: "30px",
    marginBottom: "20px",
  };

  const cellStyle = {
    fontSize: "20px",
  };

  return (
    <TableContainer component={Paper} className="modern-data-table" style={tableStyle}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell style={cellStyle}>Name</TableCell>
            <TableCell align="left" style={cellStyle}>
              NationalID
            </TableCell>
            <TableCell align="left" style={cellStyle}>
              Age
            </TableCell>
            <TableCell align="left" style={cellStyle}>
              Gender
            </TableCell>
            <TableCell align="left" style={cellStyle}>
              Relation
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th"  style={cellStyle} scope="row">
                {row.fullName}
              </TableCell>
              <TableCell align="left" style={cellStyle}>
                {row.NID}
              </TableCell>
              <TableCell align="left" style={cellStyle}>
                {row.age}
              </TableCell>
              <TableCell align="left" style={cellStyle}>
                {row.gender}
              </TableCell>
              <TableCell align="left" style={cellStyle}>
                {row.relation}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
