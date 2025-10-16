import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Stack,
  Chip,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HistoryIcon from "@mui/icons-material/History";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import MedicationIcon from "@mui/icons-material/Medication";
import ScienceIcon from "@mui/icons-material/Science";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import appointmentService from "../services/appointmentService";
import applicationService from "../services/applicationService";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const PatientDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [upcomingRes, pastRes, appStatusRes] = await Promise.allSettled([
        appointmentService.getMyAppointments({ upcoming: true }),
        appointmentService.getMyAppointments({ past: true }),
        applicationService.getMyApplicationStatus().catch((err) => {
          if (err.response && err.response.status === 404) {
            return null;
          }
          console.error("Error fetching application status:", err);
          throw new Error("Failed to load application status.");
        }),
      ]);

      let hasFetchError = false;
      let errorMessages = [];

      if (upcomingRes.status === "fulfilled") {
        setUpcomingAppointments(upcomingRes.value || []);
      } else {
        console.error("Upcoming Appointments Fetch Error:", upcomingRes.reason);
        errorMessages.push(
          upcomingRes.reason?.response?.data?.message ||
            upcomingRes.reason?.message ||
            "Failed to load upcoming appointments."
        );
        hasFetchError = true;
      }

      if (pastRes.status === "fulfilled") {
        setPastAppointments(pastRes.value || []);
      } else {
        console.error("Past Appointments Fetch Error:", pastRes.reason);
        errorMessages.push(
          pastRes.reason?.response?.data?.message ||
            pastRes.reason?.message ||
            "Failed to load past appointments."
        );
        hasFetchError = true;
      }

      if (appStatusRes.status === "fulfilled") {
        setApplicationStatus(appStatusRes.value);
      } else {
        errorMessages.push(
          appStatusRes.reason?.message || "Failed to check application status."
        );
        hasFetchError = true;
      }

      if (hasFetchError) {
        setError(errorMessages.join(" "));
      }
    } catch (err) {
      console.error("Dashboard General Fetch Error:", err);
      setError("An unexpected error occurred loading dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusChipColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name}! 👋
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Your personalized health dashboard.
      </Typography>
      {isLoading && <LoadingSpinner />}
      {}
      {error && (
        <ErrorMessage
          message={error}
          severity={error.includes("Failed") ? "error" : "warning"}
        />
      )}
      {}
      <Grid container spacing={3} justifyContent="center" alignItems="center">
        <Stack spacing={2} sx={{ mb: 3 }}>
          {}
          <Grid>
            {" "}
            {}
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <EventAvailableIcon sx={{ mr: 1, color: "primary.main" }} />{" "}
                  Upcoming Appointments
                </Typography>
                <Divider sx={{ mb: 1 }} />
                {upcomingAppointments.length > 0 ? (
                  <List dense>
                    {upcomingAppointments.slice(0, 4).map((app) => (
                      <ListItem
                        key={app.id}
                        secondaryAction={
                          <Button
                            size="small"
                            component={RouterLink}
                            to={`/appointments/${app.id}`}
                          >
                            View
                          </Button>
                        }
                      >
                        {}
                        <ListItemIcon sx={{ minWidth: "auto", mr: 1.5 }}>
                          {app.status === "pending" ? (
                            <PendingActionsIcon
                              color="warning"
                              fontSize="small"
                            />
                          ) : (
                            <EventAvailableIcon color="info" fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${
                            app.service_name || "Consultation"
                          } with ${app.doctor_name || "Doctor"}`}
                          secondary={
                            <span style={{ display: "block" }}>
                              {new Date(
                                app.scheduled_time
                              ).toLocaleDateString()}{" "}
                              - Status:{" "}
                              <Chip
                                label={app.status}
                                size="small"
                                color={getStatusChipColor(app.status)}
                                component="span"
                              />
                            </span>
                          }
                          secondaryTypographyProps={{ component: "span" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No upcoming appointments found.
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button
                  component={RouterLink}
                  to="/book-appointment"
                  size="small"
                >
                  Book New Appointment
                </Button>
                {upcomingAppointments.length > 4 && (
                  <Button size="small">View All Upcoming</Button>
                )}
              </CardActions>
            </Card>
          </Grid>

          {}
          <Grid>
            {" "}
            {}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions 🚀
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {}
                <Grid
                  container
                  spacing={2}
                  justifyContent="center"
                  alignItems="center"
                >
                  {}
                  <Grid>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={RouterLink}
                      to="/book-appointment"
                      startIcon={<EventAvailableIcon />}
                    >
                      Book Appointment
                    </Button>
                  </Grid>
                  <Grid>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={RouterLink}
                      to="/medications"
                      startIcon={<MedicationIcon />}
                    >
                      Medication Delivery
                    </Button>
                  </Grid>
                  <Grid>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={RouterLink}
                      to="/lab-tests"
                      startIcon={<ScienceIcon />}
                    >
                      Lab Tests
                    </Button>
                  </Grid>
                  <Grid>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={RouterLink}
                      to="/support"
                      startIcon={<SupportAgentIcon />}
                    >
                      Help & Support
                    </Button>
                  </Grid>
                  <Grid sx={{ mt: 1 }}>
                    {" "}
                    {}
                    {!applicationStatus ||
                    applicationStatus.status === "rejected" ? (
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        component={RouterLink}
                        to="/apply"
                        startIcon={<AssignmentIndIcon />}
                      >
                        Apply to be a Doctor/Provider
                      </Button>
                    ) : (
                      <Alert
                        severity={
                          applicationStatus.status === "pending"
                            ? "info"
                            : "success"
                        }
                      >
                        Doctor Application Status:{" "}
                        <strong>{applicationStatus.status}</strong>
                        {applicationStatus.status === "pending"
                          ? ". Your application is under review."
                          : applicationStatus.status === "approved"
                          ? ". You are approved!"
                          : ""}
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {}
          <Grid>
            {" "}
            {}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <HistoryIcon
                    sx={{
                      verticalAlign: "middle",
                      mr: 1,
                      color: "action.active",
                    }}
                  />{" "}
                  Appointment History
                </Typography>
                <Divider sx={{ mb: 1 }} />
                {pastAppointments.length > 0 ? (
                  <List dense>
                    {pastAppointments.slice(0, 5).map((app) => (
                      <ListItem
                        key={app.id}
                        secondaryAction={
                          <Button
                            size="small"
                            component={RouterLink}
                            to={`/appointments/${app.id}`}
                          >
                            Details
                          </Button>
                        }
                      >
                        <ListItemIcon sx={{ minWidth: "auto", mr: 1.5 }}>
                          {app.status === "completed" ? (
                            <CheckCircleOutlineIcon color="success" />
                          ) : (
                            <HistoryIcon color="disabled" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${
                            app.service_name || "Consultation"
                          } with ${app.doctor_name || "Doctor"}`}
                          secondary={
                            <span style={{ display: "block" }}>
                              {new Date(
                                app.scheduled_time
                              ).toLocaleDateString()}{" "}
                              - Status:{" "}
                              <Chip
                                label={app.status}
                                size="small"
                                color={getStatusChipColor(app.status)}
                                component="span"
                              />
                            </span>
                          }
                          secondaryTypographyProps={{ component: "span" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No past appointment records found.
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                {pastAppointments.length > 5 && (
                  <Button size="small">View Full History</Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        </Stack>
      </Grid>{" "}
      {}
    </Container>
  );
};

export default PatientDashboard;