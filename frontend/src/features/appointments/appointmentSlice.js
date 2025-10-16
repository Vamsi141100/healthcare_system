import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import appointmentService from "../../services/appointmentService";

const initialState = {
  myAppointments: [],
  currentAppointment: null,
  isLoading: false,
  isError: false,
  message: "",
};

export const fetchMyAppointments = createAsyncThunk(
  "appointments/fetchMy",
  async (filters = {}, thunkAPI) => {
    try {
      return await appointmentService.getMyAppointments(filters);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  "appointments/fetchById",
  async (id, thunkAPI) => {
    try {
      return await appointmentService.getAppointmentById(id);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const appointmentSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    resetAppointments: (state) => initialState,
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAppointments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myAppointments = action.payload;
        state.isError = false;
        state.message = "";
      })
      .addCase(fetchMyAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.myAppointments = [];
      })
      .addCase(fetchAppointmentById.pending, (state) => {
        state.isLoading = true;
        state.currentAppointment = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAppointment = action.payload;
        state.isError = false;
        state.message = "";
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.currentAppointment = null;
      });
  },
});

export const {
  resetAppointments,
  clearCurrentAppointment,
} = appointmentSlice.actions;
export default appointmentSlice.reducer;