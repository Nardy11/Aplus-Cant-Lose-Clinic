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
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import ConfirmDialog from "../common/ConfirmDialog";
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
  const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);
  const [selectedFamilyIndex, setSelectedFamilyIndex] = useState(null);
  const [familyEditOpen, setFamilyEditOpen] = useState(false);
  const [familyEditForm, setFamilyEditForm] = useState({ fullName: "", NID: "", age: "", gender: "none", relation: "spouse" });
  const [familyDeleteTarget, setFamilyDeleteTarget] = useState(null);
  const [familySaving, setFamilySaving] = useState(false);

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

  const requestLinkClose = () => {
    if (contactValue.trim()) {
      setConfirmLinkClose(true);
    } else {
      handleCloseDialog2();
    }
  };

  const discardLinkChanges = () => {
    setConfirmLinkClose(false);
    setContactValue("");
    setEmailOrPhone("email");
    setRelation("spouse");
    handleCloseDialog2();
  };

  const openFamilyView = (member, index) => {
    setSelectedFamilyMember(member);
    setSelectedFamilyIndex(index);
  };

  const openFamilyEdit = (member, index) => {
    setSelectedFamilyIndex(index);
    setFamilyEditForm({
      fullName: member.fullName || "",
      NID: member.NID || "",
      age: member.age ?? "",
      gender: member.gender || "none",
      relation: member.relation || "spouse",
    });
    setFamilyEditOpen(true);
  };

  const saveFamilyEdit = async () => {
    if (!familyEditForm.fullName.trim() || !familyEditForm.NID || familyEditForm.age === "") {
      snackbarMessage("Complete all family member fields.", "error");
      return;
    }

    setFamilySaving(true);
    try {
      await axios.patch(
        `${API_URL}/patient/familyMember/${patientId}/${selectedFamilyIndex}`,
        {
          fullName: familyEditForm.fullName.trim(),
          NID: Number(familyEditForm.NID),
          age: Number(familyEditForm.age),
          gender: familyEditForm.gender,
          relation: familyEditForm.relation,
        }
      );
      snackbarMessage("Family member updated successfully.", "success");
      setFamilyEditOpen(false);
      dispatch(viewFamilyMembers({ patientId }));
    } catch (error) {
      console.error("Error updating family member:", error);
      snackbarMessage(error.response?.data?.error || "Unable to update family member.", "error");
    } finally {
      setFamilySaving(false);
    }
  };

  const deleteFamilyMember = async () => {
    if (familyDeleteTarget?.index === undefined) return;
    try {
      await axios.delete(
        `${API_URL}/patient/familyMember/${patientId}/${familyDeleteTarget.index}`
      );
      snackbarMessage("Family member removed successfully.", "success");
      setFamilyDeleteTarget(null);
      if (selectedFamilyIndex === familyDeleteTarget.index) {
        setSelectedFamilyIndex(null);
        setSelectedFamilyMember(null);
      }
      dispatch(viewFamilyMembers({ patientId }));
    } catch (error) {
      console.error("Error deleting family member:", error);
      snackbarMessage(error.response?.data?.error || "Unable to remove family member.", "error");
    }
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
  const [confirmLinkClose, setConfirmLinkClose] = useState(false);

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
            snackbarMessage("You have successfully linked the family member", "success");
            setContactValue("");
            setEmailOrPhone("email");
            setRelation("spouse");
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
        <div className="family-page-account"><AccountAvatar /></div>
      <section className="page-heading family-heading"><span>YOUR HOUSEHOLD</span><h1>Family members</h1><p>Keep the people connected to your care in one place.</p></section>
      <Dialog
        open={isDialogOpen2}
        onClose={requestLinkClose}
        className="clinic-modern-dialog family-link-member-dialog"
        BackdropProps={{ onClick: requestLinkClose }}
      >
        <DialogTitle className="clinic-dialog-title">
          <div><span>HOUSEHOLD</span><h2>Link family member</h2></div>
          <IconButton className="clinic-dialog-close" onClick={requestLinkClose} aria-label="Close"><CloseIcon /></IconButton>
        </DialogTitle>
        <div className="family-link-dialog">
          <h4>Connect an existing member</h4>
          <form
            onSubmit={handleSubmit2}
            className="family-link-form"
          >
            <label>
              Select Contact Type:
              <TextField
                select
                fullWidth
                size="small"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="family-link-select"
                SelectProps={{ native: false }}
              inputProps={{ name: "relation" }}
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="phone">Phone Number</MenuItem>
              </TextField>
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
              <TextField
                select
                fullWidth
                size="small"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="family-link-select"
                SelectProps={{ native: false }}
              inputProps={{ name: "relation" }}
              >
                <MenuItem value="spouse">Spouse</MenuItem>
                <MenuItem value="child">Child</MenuItem>
              </TextField>
            </label>

            <button
              type="submit"
              className="family-link-submit"
            >
              Link
            </button>
          </form>

        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmLinkClose}
        title="Discard family link?"
        message="You have entered contact information. If you close this form now, the unsaved details will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={discardLinkChanges}
        onCancel={() => setConfirmLinkClose(false)}
      />
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        className="clinic-modern-dialog family-add-member-dialog"
        BackdropProps={{ onClick: handleCloseDialog }}
      >
        <DialogTitle className="clinic-dialog-title">
          <div><span>HOUSEHOLD</span><h2>Add family member</h2></div>
          <IconButton className="clinic-dialog-close" onClick={handleCloseDialog} aria-label="Close"><CloseIcon /></IconButton>
        </DialogTitle>
        <form className="family-add-form family-dialog-form" onSubmit={handleSubmit} method="post">
          <h3>Enter their details to add them to your household.</h3>
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
            <TextField
              select
              fullWidth
              size="small"
              defaultValue="male"
              className="family-link-select"
              SelectProps={{ native: false }}
              inputProps={{ name: "gender" }}
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
              defaultValue="spouse"
              className="family-link-select"
              SelectProps={{ native: false }}
              inputProps={{ name: "relation" }}
              inputProps={{ name: "relation" }}
            >
              <MenuItem value="spouse">spouse</MenuItem>
              <MenuItem value="child">child</MenuItem>
            </TextField>
          </div>
          <input type="submit" value="Add Family Member" style={buttonStyle} />
        </form>{" "}
      </Dialog>
      <section className="family-actions">
        <div>
          <span>HOUSEHOLD MANAGEMENT</span>
          <strong>Add or connect someone to your family</strong>
        </div>
        <div className="family-action-buttons">
          <Button className="family-action-primary" onClick={handleOpenDialog} startIcon={<GroupAddIcon />}>
            Add family member
          </Button>
          <Button className="family-action-secondary" onClick={handleOpenDialog2} startIcon={<PeopleOutlineIcon />}>
            Link existing member
          </Button>
        </div>
      </section>
      <Dialog
        open={Boolean(selectedFamilyMember)}
        onClose={() => setSelectedFamilyMember(null)}
        className="clinic-modern-dialog family-member-view-dialog"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="clinic-dialog-title">
          <div><span>HOUSEHOLD</span><h2>Family member details</h2></div>
          <IconButton className="clinic-dialog-close" onClick={() => setSelectedFamilyMember(null)} aria-label="Close"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent className="family-member-detail-content">
          {selectedFamilyMember ? (
            <div className="family-member-detail-grid">
              <div><span>Full name</span><strong>{selectedFamilyMember.fullName}</strong></div>
              <div><span>Relation</span><strong>{selectedFamilyMember.relation}</strong></div>
              <div><span>National ID</span><strong>{selectedFamilyMember.NID}</strong></div>
              <div><span>Age</span><strong>{selectedFamilyMember.age}</strong></div>
              <div><span>Gender</span><strong>{selectedFamilyMember.gender}</strong></div>
              <div><span>Linked patient</span><strong>{selectedFamilyMember.pid || "Added as household-only member"}</strong></div>
            </div>
          ) : null}
        </DialogContent>
        <DialogActions className="clinic-dialog-actions">
          <Button className="clinic-dialog-cancel" onClick={() => setSelectedFamilyMember(null)}>Close</Button>
          <Button
            className="clinic-dialog-primary"
            onClick={() => {
              openFamilyEdit(selectedFamilyMember, selectedFamilyIndex);
              setSelectedFamilyMember(null);
            }}
          >
            Edit member
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={familyEditOpen}
        onClose={() => !familySaving && setFamilyEditOpen(false)}
        className="clinic-modern-dialog family-member-edit-dialog"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="clinic-dialog-title">
          <div><span>HOUSEHOLD</span><h2>Edit family member</h2></div>
          <IconButton className="clinic-dialog-close" onClick={() => !familySaving && setFamilyEditOpen(false)} aria-label="Close"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent className="family-member-edit-content">
          <TextField
            label="Full name"
            fullWidth
            value={familyEditForm.fullName}
            onChange={(e) => setFamilyEditForm((current) => ({ ...current, fullName: e.target.value }))}
          />
          <TextField
            label="National ID"
            type="number"
            fullWidth
            value={familyEditForm.NID}
            onChange={(e) => setFamilyEditForm((current) => ({ ...current, NID: e.target.value }))}
          />
          <TextField
            label="Age"
            type="number"
            fullWidth
            value={familyEditForm.age}
            onChange={(e) => setFamilyEditForm((current) => ({ ...current, age: e.target.value }))}
          />
          <TextField
            select
            label="Gender"
            fullWidth
            value={familyEditForm.gender}
            onChange={(e) => setFamilyEditForm((current) => ({ ...current, gender: e.target.value }))}
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="none">Not specified</MenuItem>
          </TextField>
          <TextField
            select
            label="Relation"
            fullWidth
            value={familyEditForm.relation}
            onChange={(e) => setFamilyEditForm((current) => ({ ...current, relation: e.target.value }))}
          >
            <MenuItem value="spouse">Spouse</MenuItem>
            <MenuItem value="child">Child</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions className="clinic-dialog-actions">
          <Button className="clinic-dialog-cancel" onClick={() => setFamilyEditOpen(false)} disabled={familySaving}>Cancel</Button>
          <Button className="clinic-dialog-primary" onClick={saveFamilyEdit} disabled={familySaving}>
            {familySaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(familyDeleteTarget)}
        title="Remove this family member?"
        message={familyDeleteTarget ? `${familyDeleteTarget.member.fullName} will be removed from your household list. The linked patient account itself will not be deleted.` : ""}
        confirmLabel="Remove"
        cancelLabel="Keep member"
        destructive
        onConfirm={deleteFamilyMember}
        onCancel={() => setFamilyDeleteTarget(null)}
      />

      <BasicTable
        onView={openFamilyView}
        onEdit={openFamilyEdit}
        onDelete={(member, index) => setFamilyDeleteTarget({ member, index })}
      />
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

function BasicTable({ onView, onEdit, onDelete }) {
  const rows = useSelector((state) => state.patient.fMembers);

  return (
    <TableContainer component={Paper} className="modern-data-table family-members-table">
      <Table sx={{ minWidth: 760 }} aria-label="family members">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="left">National ID</TableCell>
            <TableCell align="left">Age</TableCell>
            <TableCell align="left">Gender</TableCell>
            <TableCell align="left">Relation</TableCell>
            <TableCell align="left" className="family-member-actions-heading">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length ? rows.map((row, index) => (
            <TableRow
              key={row.pid || `${row.fullName}-${index}`}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">{row.fullName}</TableCell>
              <TableCell align="left">{row.NID}</TableCell>
              <TableCell align="left">{row.age}</TableCell>
              <TableCell align="left">{row.gender}</TableCell>
              <TableCell align="left">{row.relation}</TableCell>
              <TableCell align="left">
                <div className="family-member-actions">
                  <Button className="family-member-view-button" onClick={() => onView(row, index)}>
                    View
                  </Button>
                  <Button className="family-member-edit-button" onClick={() => onEdit(row, index)}>
                    Edit
                  </Button>
                  <Button className="family-member-delete-button" onClick={() => onDelete(row, index)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <div className="family-members-empty">
                  <strong>No family members yet</strong>
                  <span>Add or link someone to your household above.</span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
