import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SnackbarContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { addFamilyMember } from "../../features/patientSlice";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { Icon } from "@mui/material";
import ConfirmDialog from "../common/ConfirmDialog";
const NewFamilyMemberForm = ({ open, onClose }) => {
  const snackbarMessage = useContext(SnackbarContext);
  const role = useSelector((state) => state.user.role);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formStyle = {
    maxWidth: "300px",
    margin: "0 auto",
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
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };
  const id = useSelector((state) => state.user.id);
  const formRef = useRef(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [gender, setGender] = useState("male");
  const [relation, setRelation] = useState("spouse");
  const handleSubmit = (event) => {
    event.preventDefault();

    const guest = {
      fullName: event.target.elements.fullName.value,
      age: parseInt(event.target.elements.age.value, 10),
      relation,
      gender,
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
        navigate(-1);
      }
    });
  };
  useEffect(() => {
    if (!open) {
      setConfirmClose(false);
      setGender("male");
      setRelation("spouse");
    }
  }, [open]);

  const hasDraft = () => {
    const form = formRef.current;
    if (!form) return false;
    return ["fullName", "NID", "age"].some((name) => form.elements[name]?.value) ||
      gender !== "male" ||
      relation !== "spouse";
  };

  const requestClose = () => {
    if (hasDraft()) {
      setConfirmClose(true);
    } else {
      onClose();
    }
  };

  const discardChanges = () => {
    setConfirmClose(false);
    onClose();
  }
  return role === "patient" ? (
    <Dialog open={open} onClose={requestClose} className="clinic-modern-dialog family-member-dialog">
      <DialogTitle className="clinic-dialog-title">
        <div>
          <span>HOUSEHOLD</span>
          <h2>Add family member</h2>
        </div>
        <IconButton
          edge="end"
          color="inherit"
          onClick={requestClose}
          aria-label="close"
          sx={{
            position: "static",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form ref={formRef} onSubmit={handleSubmit} method="post" className="family-member-dialog-form" style={formStyle}>
        <p className="clinic-dialog-copy">Add the family member details below. You can cancel safely without losing them by accident.</p>
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
            name="NID"
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
          <TextField
            select
            fullWidth
            size="small"
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            className="family-link-select"
            SelectProps={{ native: false }}
          >
            <MenuItem value="male">male</MenuItem>
            <MenuItem value="female">female</MenuItem>
            <MenuItem value="none">none</MenuItem>
          </TextField>
        </div>
        <div>
          <label htmlFor="relation" style={labelStyle}>
            Relation:
          </label>
          <TextField
            select
            fullWidth
            size="small"
            value={relation}
            onChange={(event) => setRelation(event.target.value)}
            className="family-link-select"
            SelectProps={{ native: false }}
          >
            <MenuItem value="spouse">spouse</MenuItem>
            <MenuItem value="child">child</MenuItem>
          </TextField>
        </div>
        <input type="submit" value="Add Family Member" style={buttonStyle} />
      </form>

      <ConfirmDialog
        open={confirmClose}
        title="Discard family member details?"
        message="You have entered family member information. If you leave now, the unsaved details will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={discardChanges}
        onCancel={() => setConfirmClose(false)}
      />
    </Dialog>
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

export default NewFamilyMemberForm;
