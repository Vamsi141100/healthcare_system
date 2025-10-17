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
  Skeleton,
  alpha,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import GroupIcon from "@mui/icons-material/Group";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import AssessmentIcon from "@mui/icons-material/Assessment";
import RefreshIcon from "@mui/icons-material/Refresh";

const HeaderBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  marginBottom: theme.spacing(4),
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.light,
    0.1
  )} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const StyledStatCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  height: "100%",
  borderRadius: theme.shape.borderRadius * 2,
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[8],
  },
}));

const StatIconWrapper = styled(Box)(({ theme, color }) => ({
  width: 60,
  height: 60,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1),
  color: theme.palette[color]?.main || theme.palette.primary.main,
  flexShrink: 0,
}));

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const theme = useTheme();

  
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
    <StyledStatCard variant="outlined">
      <StatIconWrapper color={color}>
        {React.cloneElement(icon, { sx: { fontSize: 30 } })}
      </StatIconWrapper>
      <Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
          {value !== null && value !== undefined ? (
            value.toLocaleString()
          ) : (
            <CircularProgress size={24} />
          )}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </StyledStatCard>
  );

  const StatCardSkeleton = () => (
    <StyledStatCard variant="outlined">
       <Skeleton variant="circular" width={60} height={60} />
       <Box sx={{ width: '100%' }}>
            <Skeleton variant="text" width="50%" height={40} />
            <Skeleton variant="text" width="80%" height={20} />
       </Box>
    </StyledStatCard>
  )

  const statItems = stats ? [
    { title: "Registered Patients", value: stats.livePatients, icon: <GroupIcon />, color: "info" },
    { title: "Active Doctors", value: stats.activeDoctors, icon: <LocalHospitalIcon />, color: "success" },
    { title: "Appointments Today", value: stats.appointmentsToday, icon: <EventAvailableIcon />, color: "warning" },
    { title: "Treatments Completed", value: stats.treatmentsCompleted, icon: <PlaylistAddCheckIcon />, color: "secondary" },
    { title: "Total Appointments", value: stats.totalAppointments, icon: <AssessmentIcon />, color: "primary" },
  ] : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <HeaderBox>
        <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Platform Statistics
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Live insights into the Health Hub platform activity. ✨
            </Typography>
        </Box>
        <Tooltip title="Refresh Stats">
          <span>
            <IconButton onClick={fetchStats} disabled={isLoading} color="primary">
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </HeaderBox>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {isLoading ? (
            Array.from(new Array(5)).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                    <StatCardSkeleton />
                </Grid>
            ))
        ) : (
            statItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.title}>
                    <StatCard {...item} />
                </Grid>
            ))
        )}
      </Grid>

      {!isLoading && (
        <Typography
            variant="caption"
            display="block"
            sx={{ mt: 4, textAlign: "center" }}
            color="text.secondary"
        >
            Stats are updated periodically. Last refresh at:{" "}
            {new Date().toLocaleTimeString()}
        </Typography>
      )}
    </Container>
  );
};

export default StatsPage;