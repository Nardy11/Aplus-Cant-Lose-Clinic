import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import { API_URL } from "../Consts";

export const viewFamilyMembers = createAsyncThunk(
  "patient/viewFamilyMembers",
  async (data) => {
    const response = await axios.get(
      `${API_URL}/patient/viewFamilyMembers/${data.patientId}`
    );
    console.log(data.patientId);

    console.log(response);
    return response;
  }
);
export const viewPrescriptions = createAsyncThunk(
  "patient/viewPrescriptions",
  async (patientId) => {
    const response = await axios.get(
      `${API_URL}/patient/viewPrescriptions/${patientId}`
    );
    console.log(patientId);

    console.log(response);
    return response;
  }
);
//<------------------------------------------------------------------------------------------------
export const viewPrescription = createAsyncThunk(
  "patient/viewSpecificPrescription/",
  async (prescriptionId) => {
    const response = await axios.get(
      `${API_URL}/patient/viewSpecificPrescription/${prescriptionId}`
    );
    console.log(prescriptionId);

    console.log(response);
    return response;
  }
);
//<------------------------------------------------------------------------------------------------

export const viewAppoints = createAsyncThunk(
  "patient/viewAppoints",
  async (data) => {
    const response = await axios.get(
      `${API_URL}/patient/viewAppoints/${data}`
    );

    console.log(response);
    return response;
  }
);

export const getAlldoctors = createAsyncThunk("patient/getAlldoctors", async () => {
  const response = await axios.get(
    `${API_URL}/patient/getAlldoctors`
  );
  return response;
});

export const addPatient = createAsyncThunk(
  "patient/addPatient",
  async (data, { rejectWithValue }) => {
    try {
      return await axios.post(`${API_URL}/patient/addPatient/`, {
        name: data.name,
        email: data.email,
        username: data.username,
        dBirth: data.dBirth,
        mobile: data.mobile,
        gender: data.gender,
        emergencyContact: data.emergencyContact,
        password: data.password,
      });
    } catch (error) {
      // Pass the server's reason ("Email already exists") through to the form.
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || null);
    }
  }
);
export const addFamilyMember = createAsyncThunk(
  "patient/addFamilyMember",
  async (data) => {
    console.log(data.id);
    console.log(data);
    const response = await axios.post(
      `${API_URL}/patient/addFamilyMember/${data.id}`,
      {
        fullName: data.guest.fullName,
        NID: data.guest.NID,
        age: data.guest.age,
        gender: data.guest.gender,
        relation: data.guest.relation,
      }
    );

    // Return the response data
    return response;
  }
);


//----------------------------------------------------
export const unsubscribeHealthPackage = createAsyncThunk(
  "patient/unsubscribeHealthPackage",
  async (data) => {
    console.log("entered unsubscribe in patient slice")
    console.log(data.Pid);
    console.log(data);
    const queryParams = {
      patientId: data.Pid,
      healthPackageId: data.healthPackageId,
    };

    
    // Convert the query parameters object to a URL-encoded string
    const queryString = new URLSearchParams(queryParams).toString();

    // Define the URL with query parameters
 
   
    const response1 = await axios.patch(
      `${API_URL}/patient/unSubscribeToHealthPackage?${queryString}`);

    // const response2 = await axios.get(
    //   `${API_URL}/patient/viewHealthPackagesPatient?${data.Pid}`);

    // Return the response data
    return response1;
  }
);




export const viewHealthP = createAsyncThunk(
  "patient/viewHealthP", 
  async (id) => {
    console.log("blabizo  "+id)
  const response = await axios.get(
    `${API_URL}/patient/viewHealthPackagesPatient/${id}`
  );
  return response;

})


export const viewWallet = createAsyncThunk(
  "patient/viewWallet", 
  async (id) => {
  const response = await axios.get(
    `${API_URL}/patient/viewWallet/${id}`
  );
  return response;

})


export const getNotifications = createAsyncThunk(
  "patient/:patientId/notifications", 
  async (id) => {
  const response = await axios.get(
    `${API_URL}/patient/${id}/notifications`
  );
  return response;

})



const patientInitial = {
  // status: "unfilled",
  loading: false,
  username: "none",
  password: "none",
  // role: "none",
  error: "",
  response: "",
  fMembers: [],
  presc: [],
  appoints:[],
  doctors:[],
  hpackages: [],
  notifications:[],
  wallet:0
};



const patient = createSlice({
  name: "patient",
  initialState: patientInitial,
  reducers: {
    login: (state, action) => {
      state.status = true;
      state.role = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAlldoctors.fulfilled,(state,action) => {
        state.loading = false;
        state.doctors = action.payload.data;
        console.log(state.doctors);
      });

    builder

      .addCase(addFamilyMember.fulfilled, (state, action) => {
        state.loading = false;
        state.fMembers.push(action.payload.data.patient.family);
        console.log(state.fMembers);
      })
      .addCase(addFamilyMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
      builder

      .addCase(viewFamilyMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.fMembers=(action.payload.data.familyMembers);        console.log(state.fMembers);

      })
      .addCase(viewFamilyMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    builder

      .addCase(viewPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.presc = action.payload.data.prescriptions;
      })
      .addCase(viewPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

      builder

      .addCase(viewPrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.presc = action.payload.data.prescription;
      })
      .addCase(viewPrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
      builder

      .addCase(viewAppoints.fulfilled, (state, action) => {
        state.loading = false;
        state.appoints = action.payload.data.Appointments;
        console.log(state.appoints);
      })
      .addCase(viewAppoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
      builder
      .addCase(viewHealthP.fulfilled, (state, action) => {
        state.loading = false;
        state.hpackages = action.payload.data.healthPackages;
      })

      builder
      .addCase(unsubscribeHealthPackage.fulfilled, (state, action) => {
        state.loading = false;
        state.hpackages = action.payload.data.healthPackages;
      })

      builder
      .addCase(viewWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallet = action.payload.data.wallet;
      })

      builder
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data.notifications;
        
      })
  },
});

export default patient.reducer;
export const { login } = patient.actions;
