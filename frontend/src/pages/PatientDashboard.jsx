import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Stack,
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
  Chip,
  alpha,
  useTheme,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HistoryIcon from "@mui/icons-material/History";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import MedicationIcon from "@mui/icons-material/Medication";
import ScienceIcon from "@mui/icons-material/Science";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SpeakerNotesOffIcon from '@mui/icons-material/SpeakerNotesOff';

import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import appointmentService from "../services/appointmentService";
import applicationService from "../services/applicationService";

const WelcomeHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  marginBottom: theme.spacing(4),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius * 2,
}));

const DashboardCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
  display: 'flex',
  flexDirection: 'column',
}));

const CardHeaderStyled = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(2, 2, 0, 2),
  color: theme.palette.text.primary,
}));

const EmptyStateBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: theme.spacing(4),
    minHeight: '150px',
    color: theme.palette.text.secondary,
}));

const PatientDashboard = () => {
  const theme = useTheme();
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
      case "pending": return "warning";
      case "confirmed": return "info";
      case "completed": return "success";
      case "cancelled": return "error";
      default: return "default";
    }
  };
  

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <WelcomeHeader elevation={0}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Here's your personalized health dashboard.
        </Typography>
      </WelcomeHeader>

      {error && <ErrorMessage message={error} severity="error" sx={{ mb: 3 }} />}

      <Grid container spacing={3}>
        {}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {}
            <Grid item xs={12}>
              <DashboardCard>
                <CardHeaderStyled>
                  <EventAvailableIcon color="primary" />
                  <Typography variant="h6" component="h2">Upcoming Appointments</Typography>
                </CardHeaderStyled>
                <Divider sx={{ mx: 2 }} />
                <CardContent sx={{ flexGrow: 1, p: 0 }}>
                  {upcomingAppointments.length > 0 ? (
                    <List dense>
                      {upcomingAppointments.slice(0, 4).map((app) => (
                        <ListItem
                          key={app.id}
                          secondaryAction={
                            <Button size="small" component={RouterLink} to={`/appointments/${app.id}`}>View</Button>
                          }
                          sx={{ px: 2, py: 1.5 }}
                        >
                          <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                            <Box sx={{
                                p: 1,
                                borderRadius: '50%',
                                display: 'flex',
                                bgcolor: alpha(theme.palette.primary.main, 0.1)
                            }}>
                                <EventAvailableIcon color="primary" fontSize="small" />
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={`${app.service_name || "Consultation"} with ${app.doctor_name || "Doctor"}`}
                            secondary={<>
                                {new Date(app.scheduled_time).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - <Chip label={app.status} size="small" color={getStatusChipColor(app.status)} />
                            </>}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <EmptyStateBox>
                      <SpeakerNotesOffIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="body1">No upcoming appointments.</Typography>
                      <Typography variant="body2">Time to book your next check-up?</Typography>
                    </EmptyStateBox>
                  )}
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', p: 1.5 }}>
                  <Button component={RouterLink} to="/book-appointment" size="small" startIcon={<AddCircleOutlineIcon />}>
                    Book New Appointment
                  </Button>
                  {upcomingAppointments.length > 0 && (
                    <Button component={RouterLink} to="/my-appointments/upcoming" size="small" endIcon={<ArrowForwardIcon />}>
                      View All
                    </Button>
                  )}
                </CardActions>
              </DashboardCard>
            </Grid>

            {}
            <Grid item xs={12}>
              <DashboardCard>
                <CardHeaderStyled>
                  <HistoryIcon color="action" />
                  <Typography variant="h6" component="h2">
                    Appointment History
                  </Typography>
                </CardHeaderStyled>
                <Divider sx={{ mx: 2 }} />
                <CardContent sx={{ flexGrow: 1, p: 0 }}>
                  {pastAppointments.length > 0 ? (
                    <List dense>
                      {pastAppointments.slice(0, 5).map((app) => (
                        <ListItem
                          key={app.id}
                          secondaryAction={
                            
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Chip
                                label={app.status}
                                size="small"
                                color={getStatusChipColor(app.status)}
                              />
                              <Button
                                size="small"
                                component={RouterLink}
                                to={`/appointments/${app.id}`}
                              >
                                Details
                              </Button>
                            </Stack>
                          }
                          sx={{ px: 2, py: 1.5, '& .MuiListItemSecondaryAction-root': { right: 16 } }} 
                        >
                          <ListItemIcon sx={{ minWidth: "auto", mr: 2 }}>
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: "50%",
                                display: "flex",
                                bgcolor:
                                  app.status === "completed"
                                    ? alpha(theme.palette.success.main, 0.1)
                                    : alpha(theme.palette.action.disabled, 0.1),
                              }}
                            >
                              {app.status === "completed" ? (
                                <CheckCircleOutlineIcon color="success" fontSize="small" />
                              ) : (
                                <HistoryIcon color="disabled" fontSize="small" />
                              )}
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={`${app.service_name || "Consultation"} with ${
                              app.doctor_name || "Doctor"
                            }`}
                            secondary={`${new Date(
                              app.scheduled_time
                            ).toLocaleDateString()}`}
                          />
                          {}
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <EmptyStateBox>
                      <SpeakerNotesOffIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="body1">No past appointments found.</Typography>
                    </EmptyStateBox>
                  )}
                </CardContent>
                {pastAppointments.length > 5 && (
                  <>
                    <Divider />
                    <CardActions sx={{ justifyContent: "flex-end", p: 1.5 }}>
                      <Button
                        size="small"
                        component={RouterLink}
                        to="/my-appointments/history"
                        endIcon={<ArrowForwardIcon />}
                      >
                        View Full History
                      </Button>
                    </CardActions>
                  </>
                )}
              </DashboardCard>
            </Grid>
          </Grid>
        </Grid>

        {}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {}
            <Grid item xs={12}>
              <DashboardCard>
                <CardHeaderStyled>
                  <Typography variant="h6" component="h2">🚀 Quick Actions</Typography>
                </CardHeaderStyled>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}><Button fullWidth variant="contained" component={RouterLink} to="/book-appointment" startIcon={<EventAvailableIcon />}>Book Appointment</Button></Grid>
                    <Grid item xs={12}><Button fullWidth variant="outlined" component={RouterLink} to="/medications" startIcon={<MedicationIcon />}>Medication Delivery</Button></Grid>
                    <Grid item xs={12}><Button fullWidth variant="outlined" component={RouterLink} to="/lab-tests" startIcon={<ScienceIcon />}>Lab Tests</Button></Grid>
                    <Grid item xs={12}><Button fullWidth variant="outlined" component={RouterLink} to="/support" startIcon={<SupportAgentIcon />}>Help & Support</Button></Grid>
                  </Grid>
                </CardContent>
              </DashboardCard>
            </Grid>

            {}
            <Grid item xs={12}>
              <DashboardCard>
                <CardHeaderStyled>
                  <AssignmentIndIcon color="secondary" />
                  <Typography variant="h6" component="h2">Provider Portal</Typography>
                </CardHeaderStyled>
                <CardContent sx={{ textAlign: 'center' }}>
                  {!applicationStatus || applicationStatus.status === 'rejected' ? (
                    <>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Interested in joining our network of healthcare providers?
                      </Typography>
                      <Button
                        variant="contained"
                        color="secondary"
                        component={RouterLink}
                        to="/apply"
                      >
                        Apply to be a Doctor
                      </Button>
                    </>
                  ) : (
                    <Alert
                      severity={applicationStatus.status === "pending" ? "info" : "success"}
                      iconMapping={{
                          info: <PendingActionsIcon fontSize="inherit" />,
                          success: <CheckCircleOutlineIcon fontSize="inherit" />,
                      }}
                      sx={{ textAlign: 'left' }}
                    >
                      <Typography fontWeight="bold">Application Status: {applicationStatus.status}</Typography>
                      {applicationStatus.status === "pending" && "Your application is under review."}
                      {applicationStatus.status === "approved" && "Congratulations! You are approved."}
                    </Alert>
                  )}
                </CardContent>
              </DashboardCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientDashboard;