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
  Divider,
  Chip,
  Alert,
  Stack
} from "@mui/material"; 
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import EventNoteIcon from "@mui/icons-material/EventNote";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import appointmentService from "../services/appointmentService";
import doctorService from "../services/doctorService";

const DoctorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
       
       const results = await Promise.allSettled([
            doctorService.getDashboard(),
            appointmentService.getMyAppointments({ status: "pending", upcoming: true }),
            appointmentService.getMyAppointments({ status: "confirmed", upcoming: true })
       ]);

       let hasFetchError = false;
       let errorMessages = [];

       if (results[0].status === 'fulfilled') {
            setDashboardData(results[0].value);
       } else {
            console.error("Dashboard Data Fetch Error:", results[0].reason);
             errorMessages.push(results[0].reason?.response?.data?.message || results[0].reason?.message || "Failed to load dashboard summary.");
             hasFetchError = true;
       }

       if (results[1].status === 'fulfilled') {
            setPendingAppointments(results[1].value || []);
       } else {
           console.error("Pending Appointments Fetch Error:", results[1].reason);
           errorMessages.push(results[1].reason?.response?.data?.message || results[1].reason?.message || "Failed to load pending appointments.");
           hasFetchError = true;
       }

       if (results[2].status === 'fulfilled') {
            setConfirmedAppointments(results[2].value || []);
       } else {
            console.error("Confirmed Appointments Fetch Error:", results[2].reason);
            errorMessages.push(results[2].reason?.response?.data?.message || results[2].reason?.message || "Failed to load confirmed appointments.");
            hasFetchError = true;
       }

        if (hasFetchError) {
            setError(errorMessages.join(' '));
       }

    } catch (err) {
       console.error("Doctor Dashboard General Fetch Error:", err);
       setError("An unexpected error occurred loading dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Doctor Dashboard 🩺
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome back, Dr. {user?.name}! Manage your schedule and patients.
      </Typography>

      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}

      {!isLoading && !error && dashboardData && (
         <Grid container spacing={3} justifyContent="center" alignItems="center">
          <Stack spacing={2} sx={{ mb: 3 }}>
             <Grid>
                <Card sx={{ height: '100%' }}>
                     <CardContent>
                        <Typography variant="h6">Profile Summary</Typography>
                         <Typography variant="body1" gutterBottom>
                            <strong>Specialization:</strong>{" "}
                            {dashboardData.profile?.specialization || "N/A"}
                         </Typography>
                         <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>Quick Stats</Typography>
                        <Typography component="div" variant="body1" sx={{ mb: 0.5 }}>
                             Pending Actions:{" "}
                            <Chip
                                 label={dashboardData.stats?.pendingAppointments || 0}
                                 color="warning" size="small"
                            />
                        </Typography>
                        <Typography component="div" variant="body1">
                            Upcoming Confirmed:{" "}
                            <Chip
                                 label={dashboardData.stats?.upcomingAppointments || 0}
                                color="primary" size="small"
                            />
                         </Typography>
                     </CardContent>
                 </Card>
             </Grid>

             <Grid>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                             <PendingActionsIcon sx={{ mr: 1, color: "warning.main" }}/>
                             Appointments Needing Action ({pendingAppointments.length})
                        </Typography>
                        <Divider sx={{ mb: 1 }} />
                         {pendingAppointments.length > 0 ? (
                            <List dense>
                                {pendingAppointments.slice(0, 5).map((app) => (
                                    <ListItem
                                         key={app.id}
                                         disablePadding
                                         secondaryAction={ <Button size="small" component={RouterLink} to={`/appointments/${app.id}`}>Review</Button> }
                                    >
                                        <ListItemText
                                            primary={`${app.patient_name || "Patient"} - ${new Date(app.scheduled_time).toLocaleString()}`}
                                            secondary={`Needs Confirmation / Fee. Notes: ${app.patient_notes?.substring(0, 40) || 'N/A'}...`}
                                        />
                                     </ListItem>
                                 ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No appointments currently require your action. 👍</Typography>
                        )}
                     </CardContent>
                     {pendingAppointments.length > 5 && <CardActions><Button size="small">View All Pending</Button></CardActions>}
                </Card>
             </Grid>

             <Grid> 
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <EventNoteIcon sx={{ mr: 1, color: "primary.main" }} />
                            Upcoming Confirmed Appointments ({confirmedAppointments.length})
                        </Typography>
                         <Divider sx={{ mb: 1 }} />
                         {confirmedAppointments.length > 0 ? (
                            <List dense>
                                {confirmedAppointments.slice(0, 5).map((app) => (
                                     <ListItem
                                         key={app.id}
                                         disablePadding
                                         secondaryAction={ <Button size="small" component={RouterLink} to={`/appointments/${app.id}`}>View Details</Button> }
                                     >
                                        <ListItemText
                                             primary={`${app.patient_name || "Patient"} - ${app.service_name || "Consultation"}`}
                                            secondary={`${new Date(app.scheduled_time).toLocaleString()} - Ready`}
                                         />
                                     </ListItem>
                                 ))}
                            </List>
                         ) : (
                             <Typography variant="body2" color="text.secondary">No upcoming confirmed appointments found.</Typography>
                         )}
                     </CardContent>
                     {confirmedAppointments.length > 5 && <CardActions><Button size="small">View All Confirmed</Button></CardActions>}
                 </Card>
             </Grid>
             </Stack>
        </Grid>
      )}
    </Container>
  );
};

export default DoctorDashboard;