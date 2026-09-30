import React, { useState, useContext } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import SubsciptionPayment from "./SubscriptionPayment";
import { IconButton } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import {
  viewHealthP,
  unsubscribeHealthPackage,
} from "../../features/patientSlice";
import { Button, Typography } from "@mui/material";
import { SnackbarContext } from "../../App";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogD,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { API_URL } from "../../Consts";
import AccountAvatar from "../Authentication/AccountAvatar";
import { useNavigate } from "react-router-dom";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ConfirmDialog from "../common/ConfirmDialog";
export default function Hpackages() {
  const snackbarMessage = useContext(SnackbarContext);
  const id = useSelector((state) => state.user.id);
  const role = useSelector((state) => state.user.role);

  console.log("patient id is " + id);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(viewHealthP(id));
  }, [dispatch]);

  const dummyData = useSelector((state) => state.patient.hpackages);

  const handleUnSubscribe = (healthPackageIdd) => {
    // Dispatch your unsubscribe logic here

    dispatch(
      unsubscribeHealthPackage({
        Pid: id,
        healthPackageId: healthPackageIdd,
      })
    );
  };

  //dialogiue component state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState("");
  const[firstDialogue,setfirstDialogue]=useState(false);
  const[secondDialogue,setSecondDialogue]=useState(false);
  const[thirdDialogue,setThirdDialogue]=useState(false);
  const[fourthDialogue,setFourthDialogue]=useState(false);
  const [familyMemberUsername, setFamilyMemberUsername] = useState("");
  const[subscribeID,setSubscribeID]=useState("");
  const[packageID,setPackageID]=useState("");
  const[amount,setAmount]=useState("");
  const [confirmFamilyClose, setConfirmFamilyClose] = useState(false);

  const navigate = useNavigate();

  const handleOpenDialog = async (healthPackageId) => {
    try {
      const response = await axios.get(
        `${API_URL}/patient/healthPackageInfo/${id}/${healthPackageId}`
      );
      const responseData = response.data;

      setDialogData(responseData); // Assuming you have a state variable to store the data
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching health package info:", error);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  const handleSubscribe=(id,rate)=>
  {
    setPackageID(id);
    setAmount(rate);
    console.log("RATEEEE",rate)
    setfirstDialogue(true);
    
  }
  const handleSubscribeForMyself=()=>
  {
    setfirstDialogue(false);
    setSecondDialogue(true);
    setSubscribeID(id);
  }
  const handleSubscribeForFamilyMember=()=>
  {
    setThirdDialogue(true)

  }
  const requestFamilyDialogClose = () => {
    if (familyMemberUsername.trim()) {
      setConfirmFamilyClose(true);
    } else {
      setThirdDialogue(false);
    }
  };

  const discardFamilyDialog = () => {
    setConfirmFamilyClose(false);
    setFamilyMemberUsername("");
    setThirdDialogue(false);
  };

  const handleSubmitFamilyMember=async()=>
  {

    try {
      
      const response = await axios.get(
        `${API_URL}/patient/patientID/${familyMemberUsername}`
      );
      console.log("this is the response",response)
      setSubscribeID(response.data._id)
      setThirdDialogue(false);
      setFourthDialogue(true);
    } catch (error) {
      console.error("Error getting ID", error);
    }
  }
  const handleWalletButtonClick = async() => {
    try{
      const body={amount:amount};
      console.log("Here",amount);
      const response=await axios.patch(`${API_URL}/patient/SubscriptionPayment/${subscribeID}/${packageID}`,body)
      snackbarMessage("You have successfully Subscribed to HealthPackage", "success");
      navigate('/Home');

    }catch(error)
    {
      console.error('Error:', error);
      snackbarMessage("No Sufficient Balance!", "error");
      
    }
   
   
  
    };
    const handleWalletButtonClickFamily = async() => {
      try{
        const body={amount:amount};
        console.log("my parameter",subscribeID,packageID,id);
        const response=await axios.patch(`${API_URL}/patient/SubscriptionPaymentF/${subscribeID}/${packageID}/${id}`,body)
        snackbarMessage("You have successfully Subscribed to HealthPackage", "success");
        navigate('/Home');
  
      }catch(error)
      {
        console.error('Error:', error);
        snackbarMessage("No Sufficient Balance!", "error");
        
      }
     
     
    
      };
    
    const handleCreditCardButtonClick = async() => {
      try{
      const response = await axios.post(`${API_URL}/patient/createCheckoutSession/${subscribeID}/${packageID}`)
     //should add await here?
      const { url } = response.data;
   
         window.location = url;
      
    }
      catch (error) {
        console.error(error.response.data.error);
      }
            
    };
    

  const tableStyle = {
    width: "80%",
    marginLeft: "50px",
    boxShadow: "5px 5px 5px 5px #8585854a",
    marginTop: "30px",
    marginBottom: "20px",
  };

  const cellStyle = {
    fontSize: "20px",
  };

  const subscribeButtonStyle = {
    backgroundColor: "#004E98",
    color: "white",
    marginRight: "20%",
    width: "70%", // Set the width to the desired value for both buttons
  };

  const unsubscribeButtonStyle = {
    backgroundColor: "#a80b0b", // Red background color for Unsubscribe
    color: "white",
    marginRight: "20%",
    width: "70%", // Set the width to the desired value for both buttons
  };

  const infoButtonStyle = {
    backgroundColor: "#7b1fa2", // Red background color for Unsubscribe
    color: "white",
  };

  return role === "patient" ? (
    <>
      <div>
        <AccountAvatar />
      </div>
      <main className="health-packages-page"><section className="health-packages-heading"><span>CARE PLANS</span><h1>Health packages</h1><p>Choose a plan that fits your care and coverage needs.</p></section>
      <TableContainer component={Paper} className="health-packages-table">
        <Table className="health-packages-grid" sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left" style={cellStyle}>
                Type
              </TableCell>
              <TableCell align="left" style={cellStyle}>
                Rate
              </TableCell>
              <TableCell style={cellStyle}>Doctor Discount</TableCell>
              <TableCell align="left" style={cellStyle}>
                Medicine Discount
              </TableCell>
              <TableCell align="left" style={cellStyle}>
                Family Discount
              </TableCell>
              <TableCell align="left" style={cellStyle}></TableCell>
              <TableCell align="left" style={cellStyle}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dummyData.map((row, index) => (
              <TableRow
                key={row._id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" style={cellStyle} scope="row">
                  {row.type}
                </TableCell>
                <TableCell align="left" style={cellStyle}>
                  {row.rate}
                </TableCell>
                <TableCell align="left" style={cellStyle}>
                  {row.doctorDisc}
                </TableCell>
                <TableCell align="left" style={cellStyle}>
                  {row.medicineDisc}
                </TableCell>
                <TableCell align="left" style={cellStyle}>
                  {row.familyDisc}
                </TableCell>

                <TableCell align="left" style={cellStyle}>
                  {!row.isSubscribed ? (
                    
                      <Button
                        sx={subscribeButtonStyle}
                        onClick={() => {
                          handleSubscribe(row._id, row.rate);
                        }}
                      >
                        <Typography>Subscribe</Typography>
                      </Button>
                   
                  ) : (
                    <Button
                      sx={unsubscribeButtonStyle}
                      onClick={() => {
                        console.log(row.isSubscribed);
                        handleUnSubscribe(row._id);
                      }}
                    >
                      <Typography>Unsubscribe</Typography>
                    </Button>
                  )}
                </TableCell>

                <TableCell>
                  <IconButton
                    sx={infoButtonStyle}
                    onClick={() => {
                      handleOpenDialog(row._id);
                    }}
                  >
                    <InfoIcon fontSize="medium" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            <HealthPackageInfo
              data={dialogData}
              openDialog={dialogOpen}
              closeDialog={handleCloseDialog}
            ></HealthPackageInfo>
            <Dialog open={firstDialogue} onClose={()=>setfirstDialogue(false)} className="clinic-modern-dialog package-choice-dialog">
      <DialogTitle className="clinic-dialog-title">
        <div><span>CARE PLAN</span><h2>Who is this plan for?</h2></div>
        <IconButton className="clinic-dialog-close" onClick={()=>setfirstDialogue(false)} aria-label="Close"><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <div className="package-dialog-body">
        <p>Select who should receive this health package.</p>
        <div className="package-choice-grid">
          <Button className="package-choice-option" onClick={handleSubscribeForMyself}>
            <strong>Myself</strong><span>Apply the package to your account</span>
          </Button>
          <Button className="package-choice-option" onClick={handleSubscribeForFamilyMember}>
            <strong>Family member</strong><span>Apply it to a connected family member</span>
          </Button>
        </div>
      </div>
      <DialogActions className="clinic-dialog-actions">
        <Button onClick={()=>setfirstDialogue(false)} className="clinic-dialog-cancel">Cancel</Button>
      </DialogActions>
    </Dialog>
    <Dialog open={secondDialogue} onClose={()=>setSecondDialogue(false)} className="clinic-modern-dialog package-choice-dialog">
      <DialogTitle className="clinic-dialog-title">
        <div><span>PAYMENT</span><h2>Choose payment method</h2></div>
        <IconButton className="clinic-dialog-close" onClick={()=>setSecondDialogue(false)} aria-label="Close"><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <div className="package-dialog-body">
        <p>Choose how you want to pay for this health package.</p>
        <div className="package-choice-grid">
          <Button className="package-choice-option" onClick={handleWalletButtonClick}>
            <strong>Wallet</strong><span>Use your clinic account balance</span>
          </Button>
          <Button className="package-choice-option" onClick={handleCreditCardButtonClick}>
            <strong>Credit card</strong><span>Continue securely to card payment</span>
          </Button>
        </div>
      </div>
      <DialogActions className="clinic-dialog-actions">
        <Button onClick={()=>setSecondDialogue(false)} className="clinic-dialog-cancel">Cancel</Button>
      </DialogActions>
    </Dialog>
    <Dialog open={thirdDialogue} onClose={requestFamilyDialogClose} className="clinic-modern-dialog package-choice-dialog">
      <DialogTitle className="clinic-dialog-title">
        <div><span>HOUSEHOLD</span><h2>Select family member</h2></div>
        <IconButton className="clinic-dialog-close" onClick={requestFamilyDialogClose} aria-label="Close"><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <div className="package-dialog-body">
        <p>Enter the username of the family member who should receive the package.</p>
        <TextField
          label="Family member username"
          variant="outlined"
          fullWidth
          value={familyMemberUsername}
          onChange={(e) => setFamilyMemberUsername(e.target.value)}
        />
      </div>
      <DialogActions className="clinic-dialog-actions">
        <Button onClick={requestFamilyDialogClose} className="clinic-dialog-cancel">Cancel</Button>
        <Button onClick={handleSubmitFamilyMember} className="clinic-dialog-primary">Continue</Button>
      </DialogActions>
    </Dialog>
    <ConfirmDialog
      open={confirmFamilyClose}
      title="Discard family member selection?"
      message="The family member username you entered has not been submitted. Leaving now will remove it."
      confirmLabel="Discard"
      cancelLabel="Keep editing"
      destructive
      onConfirm={discardFamilyDialog}
      onCancel={() => setConfirmFamilyClose(false)}
    />

    <Dialog open={fourthDialogue} onClose={()=>setFourthDialogue(false)} className="clinic-modern-dialog package-choice-dialog">
      <DialogTitle className="clinic-dialog-title">
        <div><span>PAYMENT</span><h2>Choose payment method</h2></div>
        <IconButton className="clinic-dialog-close" onClick={()=>setFourthDialogue(false)} aria-label="Close"><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <div className="package-dialog-body">
        <p>Choose how you want to pay for your family member's package.</p>
        <div className="package-choice-grid">
          <Button className="package-choice-option" onClick={handleWalletButtonClickFamily}>
            <strong>Wallet</strong><span>Use your clinic account balance</span>
          </Button>
          <Button className="package-choice-option" onClick={handleCreditCardButtonClick}>
            <strong>Credit card</strong><span>Continue securely to card payment</span>
          </Button>
        </div>
      </div>
      <DialogActions className="clinic-dialog-actions">
        <Button onClick={()=>setFourthDialogue(false)} className="clinic-dialog-cancel">Cancel</Button>
      </DialogActions>
    </Dialog>
          </TableBody>
        </Table>
      </TableContainer>
      </main>
    </>
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

const HealthPackageInfo = ({ data, openDialog, closeDialog }) => {
  // Use dialogData instead of the static data passed as a prop
  return (
    <Dialog open={openDialog} onClose={closeDialog} className="clinic-modern-dialog package-info-dialog">
      <DialogTitle className="clinic-dialog-title">
        <div><span>CARE PLAN</span><h2>Package details</h2></div>
        <IconButton className="clinic-dialog-close" onClick={closeDialog} aria-label="Close"><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <DialogContent className="package-info-content">
        {Object.entries(data).map(([key, value]) => (
          <div className="package-info-row" key={key}>
            <strong>{key}</strong><span>{String(value)}</span>
          </div>
        ))}
      </DialogContent>
      <DialogActions className="clinic-dialog-actions">
        <Button onClick={closeDialog} className="clinic-dialog-primary">Done</Button>
      </DialogActions>
    </Dialog>
  );
};


