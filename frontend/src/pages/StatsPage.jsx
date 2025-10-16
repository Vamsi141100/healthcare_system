import React, { useState, useEffect, useCallback } from "react";
import statsService from "../services/statsService";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import AssessmentIcon from "@mui/icons-material/Assessment";
import RefreshIcon from "@mui/icons-material/Refresh";

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await statsService.getPublicStats();
      setStats(data);
    } catch (err) {
      console.error("Fetch Stats Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load platform statistics."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const StatCard = ({ title, value, icon, color = "primary" }) => (
    <Card
      elevation={3}
      sx={{
        display: "flex",
        alignItems: "center",
        p: 2,
        backgroundColor: `${color}.lighter`,
        color: `${color}.darker`,
      }}
    >
      <Box sx={{ mr: 2 }}>
        {React.cloneElement(icon, { sx: { fontSize: 40 } })}
      </Box>
      <Box>
        <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
          {value !== null && value !== undefined ? (
            value.toLocaleString()
          ) : (
            <CircularProgress size={20} />
          )}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Platform Statistics <AssessmentIcon />
        </Typography>
        <Tooltip title="Refresh Stats">
          <span>
            <IconButton onClick={fetchStats} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Live insights into the Health Hub platform activity. ✨
      </Typography>

      {isLoading && !stats && (
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={50} />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      {stats && !error && (
        <Grid container spacing={3} justifyContent="center" alignItems="center">
          <Grid>
            <StatCard
              title="Registered Patients"
              value={stats.livePatients}
              icon={<GroupIcon />}
              color="info"
            />
          </Grid>
          <Grid>
            <StatCard
              title="Active Doctors"
              value={stats.activeDoctors}
              icon={<LocalHospitalIcon />}
              color="success"
            />
          </Grid>
          <Grid>
            <StatCard
              title="Appointments Today"
              value={stats.appointmentsToday}
              icon={<EventAvailableIcon />}
              color="warning"
            />
          </Grid>
          <Grid>
            <StatCard
              title="Treatments Completed (All Time)"
              value={stats.treatmentsCompleted}
              icon={<PlaylistAddCheckIcon />}
              color="secondary"
            />
          </Grid>
          <Grid>
            <StatCard
              title="Total Appointments Scheduled"
              value={stats.totalAppointments}
              icon={<AssessmentIcon />}
              color="primary"
            />
          </Grid>
          
        </Grid>
      )}
      <Typography
        variant="caption"
        display="block"
        sx={{ mt: 3, textAlign: "center" }}
        color="text.secondary"
      >
        Stats are updated periodically. Last refresh trigger:{" "}
        {new Date().toLocaleTimeString()}
      </Typography>
    </Container>
  );
};

export default StatsPage;