import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "./components/layout/Header";
import { useAuthStatus } from "./hooks/useAuthStatus";
import { fetchUserProfile, logout } from "./features/auth/authSlice";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AppointmentBookingPage from "./pages/AppointmentBookingPage";
import AppointmentDetailsPage from "./pages/AppointmentDetailsPage";
import ApplyDoctorPage from "./pages/ApplyDoctorPage";
import SupportPage from "./pages/SupportPage";
import AboutUsPage from "./pages/AboutUsPage";
import StatsPage from "./pages/StatsPage";
import NotFoundPage from "./pages/NotFoundPage";
import LabTestPage from "./pages/LabTestPage";
import MedicationPage from "./pages/MedicationPage";

import { Box, CircularProgress, Container } from "@mui/material";

function RoleBasedDashboard() {
  const { user, profile, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  React.useEffect(() => {
    if (user && !profile && !isLoading) {
      dispatch(fetchUserProfile())
        .unwrap()
        .catch((error) => {
          console.error("Profile fetch failed on dashboard load:", error);
          if (
            typeof error === "string" &&
            (error.includes("401") ||
              error.toLowerCase().includes("token failed"))
          ) {
            dispatch(logout());
          }
        });
    }
  }, [user, profile, isLoading, dispatch]);

  if (isLoading || (user && !profile)) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 200px)",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!user || !profile) {
    console.log(
      "User or profile missing, redirecting to login from dashboard.",
      { user, profile }
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  switch (profile.role) {
    case "patient":
      return <PatientDashboard />;
    case "doctor":
      return <DoctorDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      console.warn("Unknown user role:", profile.role);
      return <Navigate to="/" />;
  }
}

function RequireAuth({ children, roles }) {
  const { user, profile, isLoading } = useSelector((state) => state.auth);
  const { checkingStatus } = useAuthStatus();
  const location = useLocation();

  if (checkingStatus || isLoading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(profile.role)) {
    console.warn(
      `AuthGuard: User role '${
        profile.role
      }' doesn't match required roles [${roles.join(", ")}]. Redirecting.`
    );
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />
        <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
          <Routes>
            {}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/stats" element={<StatsPage />} />

            {}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <RoleBasedDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/book-appointment"
              element={
                <RequireAuth roles={["patient", "doctor", "admin"]}>
                  <AppointmentBookingPage />
                </RequireAuth>
              }
            />
            <Route
              path="/appointments/:id"
              element={
                <RequireAuth roles={["patient", "doctor", "admin"]}>
                  <AppointmentDetailsPage />
                </RequireAuth>
              }
            />
            {}
            <Route
              path="/appointments/:id"
              element={
                <RequireAuth roles={["patient", "doctor", "admin"]}>
                  <AppointmentDetailsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/apply"
              element={
                <RequireAuth roles={["patient"]}>
                  <ApplyDoctorPage />
                </RequireAuth>
              }
            />
            <Route
              path="/support"
              element={
                <RequireAuth roles={["patient", "doctor", "admin"]}>
                  <SupportPage />
                </RequireAuth>
              }
            />
            <Route
              path="/lab-tests"
              element={
                <RequireAuth roles={["patient"]}>
                  <LabTestPage />
                </RequireAuth>
              }
            />
            <Route
              path="/medications"
              element={
                <RequireAuth roles={["patient"]}>
                  <MedicationPage />
                </RequireAuth>
              }
            />

            <Route path="/payment/success" element={<PaymentSuccessPage />} />

            {}

            {}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Box>
        {}
        {}
      </Box>
    </Router>
  );
}

export default App;