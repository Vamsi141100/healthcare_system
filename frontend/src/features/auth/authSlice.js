import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";
import userService from "../../services/userService";
const user = JSON.parse(localStorage.getItem("user"));
const profile = JSON.parse(localStorage.getItem("profile"));

const initialState = {
  user: user ? user : null,
  profile: profile ? profile : null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const registeredUser = await authService.register(userData);
      return registeredUser;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const loggedInUser = await authService.login(userData);
      if (loggedInUser && loggedInUser.token) {
        const userProfile = await userService.getMe();
        localStorage.setItem('profile', JSON.stringify(userProfile));
        return { user: loggedInUser, profile: userProfile };
      }
      return { user: loggedInUser, profile: null };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  authService.logout();
  localStorage.removeItem('profile');
});

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const profileData = await userService.getMe();
      localStorage.setItem('profile', JSON.stringify(profileData));
      return profileData;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      if (error.response?.status === 401) {
        thunkAPI.dispatch(logout());
      }
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.profile = null;
        state.message = "Registration successful! Please login.";
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.profile = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.profile = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if(state.user) {
            state.user.role = action.payload.role;
        }
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = `Profile fetch failed: ${action.payload}`;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;