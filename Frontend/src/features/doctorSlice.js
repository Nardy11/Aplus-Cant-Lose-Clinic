import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../Consts";


const doctorState = {
  status: true,
  loading: false,
  username: "none",
  password: "none",
  role: "none",
  patientsList: [],
  error: "",
  response: "",
  appointments:[],
  info:{},
  wallet:0,
  ndrID:0,
  notifications:[],

};

// router.post("/addPrescription", addPrescription);
// router.post("/getUser", getUser);
// router.post("/addDoctor", addDoctor);
// router.get("/getPatients/:id", getPatients);
// router.get("/searchPatientByName", searchPatientByName);
// router.get("/patientsInUpcomingApointments/:doctorId", patientsInUpcomingApointments);
// router.put("/editDoctor/:id", editDoctor);
// router.get("/doctorFilterAppointments/:doctorId", doctorFilterAppointments);



export const registerDoctor = createAsyncThunk(
  "doctor/registerDoctor",
  async (data, { rejectWithValue }) => {
    try {
      return await axios.post(`${API_URL}/doctor/addDoctor`, data);
    } catch (error) {
      // Pass the server's reason ("Username already exists") through to the form.
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || null);
    }
  }
);

export const editDoctorCredentials = createAsyncThunk(
  "doctor/editDoctorCredentials",
  async (data) => {
    try {
      const response = await axios.put(`${API_URL}/doctor/editDoctor/${data.id}`, data);
      return response; // Return the response data
    } catch (error) {
      throw error; // Rethrow any errors for handling in your component
    }
  }
);

//
//  const { id } = req.params; // Get the ID from the request parameters



export const getPatients = createAsyncThunk(
  "doctor/getPatients",
  async (id) => {

  

    const response = await axios.get(`${API_URL}/doctor/getPatients/${id}`);

    return response;
  }
);
export const getDr = createAsyncThunk(
  "doctor/getDr",
  async (id) => {

    const response = await axios.get(`${API_URL}/doctor/getDr/${id}`);

    return response;
  }
);

export const appointmentPatients = createAsyncThunk(
  "doctor/appointmentPatients",
  async (id) => {

    const response = await axios.get(`${API_URL}/doctor/appointmentPatients/${id}`);
    console.log(response);
    return response;

    
  }
);

export const addHealthRecord = createAsyncThunk(
  'doctor/addHealthRecord',
  async ({ patientID , healthRecordData }) => {
    console.log("id og patient: "+patientID);
   
 
    const response = await axios.post(`${API_URL}/doctor/addHealthRecord/${patientID}`, healthRecordData);
    
     console.log(response);
   
   
    return response; // Assuming the server returns data about the created health record
  },
  console.log("entered addHealthRecordFunction in doctor Slice")
);



export const viewWallet = createAsyncThunk(
  "doctor/viewWallet", 
  async (id) => {
  const response = await axios.get(
    `${API_URL}/doctor/viewWallet/${id}`
  );
  return response;

})

export const getNotificationsd = createAsyncThunk(
  "doctor/:doctorId/notifications", 
  async (id) => {
  const response = await axios.get(
    `${API_URL}/doctor/${id}/notifications`
  );
  return response;

})


export const doctor = createSlice({
  name: "doctor",
  initialState: doctorState,
  reducers: {
    changeStateTrue: (state) => {
      state.updateState = true;
    },
    changeStateFalse: (state) => {
      state.updateState = false;
    },
    clearResponse: (state) => {
      state.response = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerDoctor.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.ndrID=action.payload.data.id;
      })
      .addCase(registerDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
      
    builder
      .addCase(getPatients.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPatients.fulfilled, (state, action) => {
        state.patientsList = action.payload.data;
        console.log(state.patientsList);
        state.loading = false;
      })
      .addCase(getPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

      builder
      .addCase(appointmentPatients.pending, (state) => {
        state.loading = true;
      })
      .addCase(appointmentPatients.fulfilled, (state, action) => {
        state.appointments = action.payload.data;
        state.loading = false;
      })
      .addCase(appointmentPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
      builder
      
      .addCase(getDr.fulfilled, (state, action) => {
        state.info = action.payload.data.dr;
        console.log(state.info);
        state.loading = false;
      })

      builder
      .addCase(addHealthRecord.pending, (state) => {
        state.loading = true;
      })
      .addCase(addHealthRecord.fulfilled, (state, action) => {
        state.patientsList = action.payload.data.patients;
        console.log(state.info);
        state.loading = false;
      })

      builder
      .addCase(viewWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallet = action.payload.data.wallet;
      })

      builder
      .addCase(getNotificationsd.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data.notifications;
      })
    
      

  },
});

export default doctor.reducer;
export const { changeStateTrue, changeStateFalse, clearResponse } =
  doctor.actions;