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
            <Dialog open={firstDialogue} onClose={()=>{setfirstDialogue(false)}} className="clinic-modern-dialog package-choice-dialog">
      {/* Your dialog content here */}
      <div>
        <Button onClick={handleSubscribeForMyself} color="primary">
          Myself
        </Button>
        <Button onClick={handleSubscribeForFamilyMember} color="primary">
          Family Member
        </Button>
      </div>
    </Dialog>
    <Dialog open={secondDialogue} onClose={()=>{setSecondDialogue(false)}} className="clinic-modern-dialog package-choice-dialog">
      {/* Your dialog content here */}
      <div>
        <Button onClick={handleWalletButtonClick} color="primary">
          Wallet
        </Button>
        <Button onClick={handleCreditCardButtonClick} color="primary">
          Credit Card
        </Button>
      </div>
    </Dialog>
    <Dialog open={thirdDialogue} onClose={()=>{setThirdDialogue(false)}} className="clinic-modern-dialog package-choice-dialog">
      <div>
        <TextField
          label="Family Member Username"
          variant="outlined"
          value={familyMemberUsername}
          onChange={(e) => setFamilyMemberUsername(e.target.value)}
          style={{ marginBottom: "16px" }}
        />
        <Button onClick={handleSubmitFamilyMember} color="primary">
          Submit
        </Button>
      </div>
    </Dialog>
    <Dialog open={fourthDialogue} onClose={()=>{setFourthDialogue(false)}} className="clinic-modern-dialog package-choice-dialog">
      {/* Your dialog content here */}
      <div>
        <Button onClick={handleWalletButtonClickFamily} color="primary">
          Wallet
        </Button>
        <Button onClick={handleCreditCardButtonClick} color="primary">
          Credit Card
        </Button>
      </div>
    </Dialog>
          </TableBody>
        </Table>
      </TableContainer>
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
      <DialogTitle>HealthPackage Info</DialogTitle>
      <DialogContent>
        {Object.entries(data).map(([key, value]) => (
          <Typography key={key}>
            <strong>{key}:</strong> {value}
          </Typography>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};


