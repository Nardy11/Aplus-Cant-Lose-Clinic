import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../Consts";


const userInitial = {
  logged: false,
  loading: false,
  username: "",
  password: "",
  role: "",
  response: "",
  id: "",
  error: false,
  token: "",
  logId: 0,
  socket:[],
  pic: ""

};
export const loginGuest = createAsyncThunk(
  "user/loginGuest",
  async (data, { rejectWithValue }) => {
  
      const response = await axios.post(`${API_URL}/login`, {
        username: data.username,
        password: data.password,
      });

      console.log(response.token);

      return response;
  
  }
);
export const sendResetEmail = createAsyncThunk(
  "user/sendResetEmail",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/sendResetEmail`, {
        username: data,
      });

      return response;
    } catch (error) {
      // return custom error message from API if any
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (data, { rejectWithValue }) => {
    try {
      const id = data.id;
      const token = data.token;
      const response = await axios.post(
        `${API_URL}/changePassword/${id}/${token}`,
        {
          password: data.password,
        }
      );

      console.log(response.token);

      return response;
    } catch (error) {
      // return custom error message from API if any
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async ({ id, ...profile }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/patient/profile/${id}`, profile);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Unable to update profile.");
    }
  }
);

export const changePass = createAsyncThunk("user/changePass", async (data) => {
  try {
    console.log(data);
    const response = await axios.post(`${API_URL}/changePass/${data.username}`, data);
    console.log("Response:", response);
    return response;
  } catch (error) {
    console.error("Error:", error.response.data);
  }
});
export const socketset = createAsyncThunk("user/socket", async (data) => {
  try {
    console.log(data);
  
    return data;
  } catch (error) {
    console.error("Error:", error.response.data);
  }
});
export const logout = createAsyncThunk(
  "user/logout",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/logout`);

      console.log(response.token);

      return response;
    } catch (error) {
      // return custom error message from API if any
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

const user = createSlice({
  name: "user",
  initialState: {
    ...userInitial,
    ...JSON.parse(localStorage.getItem("user") || "{}"),
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginGuest.pending, (state) => {
        state.loading = true;
        state.error = false;

      })
      .addCase(loginGuest.fulfilled, (state, action) => {
        state.loading = false;
        state.logged = true;
        state.error = false;

        state.role = action.payload.data.role;
        state.username = action.payload.data.userData.fUser.username;
        state.id = action.payload.data.userData.fUser._id;
        console.log(action.payload.data.userData.fUser._id);
        state.token = action.payload.data.token;
        state.logId = action.payload.data.userData.logId;
        state.pic = action.payload.data.userData.fUser.pic || "";

        localStorage.setItem("user", JSON.stringify({
          username: state.username,
          role: state.role,
          id: state.id,
          logId: state.logId,
          token:state.token,
          pic: state.pic
        }));
        console.log(state.token);
      })
      .addCase(loginGuest.rejected, (state, action) => {
        state.logged = false;
        state.username = "";
        state.id = 0;
        state.role = "none";
        state.error = true;
        console.log(state.error);
      });
    builder.addCase(logout.fulfilled, (state, action) => {
      state.token = "";
      state.logged = false;
      state.username = "";
      state.password = "";
      state.role = "";
      state.id = "";
      state.pic = "";
      localStorage.removeItem("user"); 
      console.log(action.payload);
      console.log(state);
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      const profile = action.payload.profile;
      state.username = profile.username || state.username;
      state.pic = profile.pic || state.pic;
      localStorage.setItem("user", JSON.stringify({
        username: state.username,
        role: state.role,
        id: state.id,
        logId: state.logId,
        token: state.token,
        pic: state.pic
      }));
    });
    builder.addCase(changePass.fulfilled, (state, action) => {
      state.loading = false;
      state.response = "delete HealthPackages";
    });
    builder.addCase(sendResetEmail.fulfilled, (state, action) => {});
    builder.addCase(changePassword.fulfilled, (state, action) => {});
    builder.addCase(socketset.fulfilled, (state, action) => {state.socket=action.payload});

  },
});

export default user.reducer;
