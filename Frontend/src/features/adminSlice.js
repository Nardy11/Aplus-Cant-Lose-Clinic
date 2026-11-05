import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../Consts";

const adminInitial = {
  loading: false,
  username: "",
  role: "admin",
  error: "",
  password: "",
  patients: [],
  response: "",
  admins: [],
  medicine: [],
  hpackages: [],
  jdoctors: [],
  pdoctors: []

};

export const viewPatients = createAsyncThunk("admin/viewPatients", async () => {
  const response = await axios.get(
    `${API_URL}/admin/viewPatients`
  );
  return response;
});
export const viewPendDr = createAsyncThunk("admin/viewPendDr", async () => {
  const response = await axios.get(
    `${API_URL}/admin/viewPendDr`
  );
  return response;
});

export const viewJoinedDr = createAsyncThunk("admin/viewJoinedDr", async () => {
  const response = await axios.get(
    `${API_URL}/admin/viewJoinedDr`
  );
  return response;
});

export const viewMedicine = createAsyncThunk("admin/viewMedicine", async () => {
  const response = await axios.get(
    `${API_URL}/admin/viewMedicine`
  );
  return response;
});

export const viewAdmin = createAsyncThunk("admin/viewAdmin", async () => {
  const response = await axios.get(
    `${API_URL}/admin/viewAdmin`
  );
  return response;
});

/////////Hany code
export const viewHealthP = createAsyncThunk("admin/viewHealthP", async () => {
  const response = await axios.get(
    `${API_URL}/admin/viewHealthP`
  );
  console.log("hbacp")
  return response;
})

export const deleteAdmin = createAsyncThunk("admin/deleteAdmin", async (id) => {
  const response = await axios.delete(
    `${API_URL}/admin/deleteAdmin/${id}`
  );
  return id;
})
export const deleteHpackages = createAsyncThunk("admin/deletePack", async (id) => {
  const response = await axios.delete(
    `${API_URL}/admin/deletePack/${id}`
  );
  return id;
})

export const updatePack = createAsyncThunk("admin/updatePack", async (data) => {
  console.log(data);
  const response = await axios.put(
    `${API_URL}/admin/updatePack/${data.id}`,data.newData
    
  );
  return response;
})
export const deletePatient = createAsyncThunk("admin/deletePatient", async (id) => {
  const response = await axios.delete(
    `${API_URL}/admin/deletePatient/${id}`
  );
  return id;
})
export const deleteJDoctor = createAsyncThunk("admin/deleteJDoctor", async (id) => {
  const response = await axios.delete(
    `${API_URL}/admin/deleteDoctor/${id}`
  );
  return id;
})

export const acceptDr = createAsyncThunk("admin/acceptDr", async (id) => {
  const response = await axios.post(
    `${API_URL}/admin/sendAcceptEmail`,{id:id}
  );
  return id;
})
export const rejectDr = createAsyncThunk("admin/rejectDr", async (id) => {
  const response = await axios.post(
    `${API_URL}/admin/sendRejectEmail`,{id:id}
  );
  return id;
})

// export const searchMedicineByName = createAsyncThunk(
//   "admin/searchMedicineByName",
//   async (name) => {
//     try {
//       // Send a request to the backend to search for medicine by name
//       const response = await axios.get(
//         `${API_URL}/user/searchMedicin`ByName?name=${name}`
//       );

//       return response.data; // Assuming the response contains the medicine data
//     } catch (error) {
//       throw error; // Let Redux Toolkit handle error state
//     }
//   }
// );

// export const filterMedicineByUse = createAsyncThunk(
//   "admin/filterMedicineByUse",
//   async (use) => {
//     try {
//       // Send a request to the backend API endpoint with the 'use' parameter
//       const response = await axios.get(
//         `${API_URL}/user/filterMedicin`ByUse?use=${use}`
//       );

//       return response.data; // Assuming the response contains the medicine data
//     } catch (error) {
//       throw error; // Let Redux Toolkit handle error state
//     }
//   }
// );

export const createAdmin = createAsyncThunk(
  "admin/createAdmin",
  async (data, { rejectWithValue }) => {
    try {
      return await axios.post(`${API_URL}/admin/createAdmin`, {
        username: data.username,
        password: data.password,
      });
    } catch (e) {
      // Surface the server's reason (taken username, weak password) instead of a generic network error.
      return rejectWithValue(e.response?.data?.error || e.message);
    }
  }
);

export const addHpackages = createAsyncThunk(
  "admin/addPack",
  async (data) => {
    const response = await axios.post(
      `${API_URL}/admin/addPack`,
      {
        type: data.type,
        rate: data.rate,
        doctorDisc: data.doctorDisc,
        medicineDisc: data.medicineDisc,
        familyDisc: data.familyDisc,
      }
    );
    return response;
  }
);

const admin = createSlice({
  name: "admin",
  initialState: adminInitial,
  reducers: {
    editPackFront:(state,action)=>{
let i= action.payload.idx;
state.hpackages[i]={...action.payload.newData};

    }

  },
  extraReducers: (builder) => {
    builder
      .addCase(viewAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload.data.AdminView;
      })
    builder
      .addCase(viewHealthP.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload.data.HealthPack);
        state.hpackages = action.payload.data.HealthPack;
      })
    builder

      .addCase(viewPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload.data.patients;
        state.response = "viewPatients";
      })
      .addCase(viewPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
    ///////////////////////////
    builder
      .addCase(viewPendDr.fulfilled, (state, action) => {
        state.pdoctors = action.payload.data.pendDoctors;
        state.response = "viewPendDr";
      })
      .addCase(viewPendDr.rejected, (state, action) => {
        state.error = action.error.message;

      });

    builder.addCase(viewJoinedDr.fulfilled, (state, action) => {
      state.jdoctors = action.payload.data.joinDoctors;
      state.response = "viewJoinedDr";
    });
    ///////////////
    builder.addCase(viewMedicine.fulfilled, (state, action) => {
      state.medicine = action.payload.data.medicines;
      state.response = "view medicine";
    });
    ///////////////////
    builder
      .addCase(createAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data?.user) state.admins.push(action.payload.data.user);
        state.response = "add admin";
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });

    ///////////////////
    builder
      .addCase(deletePatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = state.patients.filter(
          (item) => item._id !== action.payload
        );
        state.response = "delete patient";
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
    ///////////////////////
    builder
      .addCase(deleteHpackages.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteHpackages.fulfilled, (state, action) => {
        state.loading = false;
        state.hpackages = state.hpackages.filter(
          (item) => item._id !== action.payload
        );
        state.response = "delete HealthPackages";
      })
      .addCase(deleteHpackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
      builder
      .addCase(updatePack.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePack.fulfilled, (state, action) => {
        state.loading = false;
        // state.hpackages = state.hpackages.filter(
        //   (item) => item._id !== action.payload
        // );
        state.response = "delete HealthPackages";
      })
      .addCase(updatePack.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
    ///////////////////////
    builder
      .addCase(deleteJDoctor.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteJDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.jdoctors = state.jdoctors.filter(
          (item) => item._id !== action.payload
        );
        state.response = "delete";
      })
      .addCase(deleteJDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
    // //////////////
    builder
      .addCase(deleteAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = state.admins.filter(
          (item) => item._id !== action.payload
        );
        state.response = "delete";

      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
      builder
      .addCase(acceptDr.fulfilled, (state, action) => {
        state.loading = false;
        state.pdoctors = state.pdoctors.filter(
          (item) => item._id !== action.payload
        );
        state.response = "delete HealthPackages";
      });
      builder
      .addCase(rejectDr.fulfilled, (state, action) => {
        state.loading = false;
        state.pdoctors = state.pdoctors.filter(
          (item) => item._id !== action.payload
        );
        state.response = "delete HealthPackages";
      })

  },



});

export default admin.reducer;
export const { login,editPackFront } = admin.actions;
