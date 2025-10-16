import React, { useState, useEffect, useCallback } from "react";
import adminService from "../../services/adminService";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Box,
  TextField,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { useSnackbar } from "notistack";

const AdminAppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", search: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const { enqueueSnackbar } = useSnackbar();

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const apiFilters = {};
      if (filters.status) apiFilters.status = filters.status;
      if (filters.search) apiFilters.search = filters.search;
      const data = await adminService.getAllAppointments(apiFilters);
      setAppointments(data || []);
    } catch (err) {
      console.error("Fetch Appointments Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch appointments"
      );
      enqueueSnackbar("Failed to fetch appointments", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [filters, enqueueSnackbar]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRefresh = () => {
    setFilters({ status: "", search: "" });
  };

  const openDeleteDialog = (id) => {
    setDeleteConfirm({ open: true, id });
  };

  const closeDeleteDialog = () => {
    setDeleteConfirm({ open: false, id: null });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    setIsLoading(true);
    try {
      await adminService.deleteAppointment(deleteConfirm.id);
      enqueueSnackbar("Appointment deleted successfully", {
        variant: "success",
      });
      closeDeleteDialog();
      fetchAppointments();
    } catch (err) {
      console.error("Delete appointment error:", err);
      setError(
        `Failed to delete appointment: ${
          err.response?.data?.message || err.message
        }`
      );
      enqueueSnackbar("Failed to delete appointment", { variant: "error" });
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
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
    <Box>
      <Typography variant="h6" gutterBottom>
        Appointment Management
      </Typography>

      {}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <TextField
          label="Search Patient/Doctor"
          variant="outlined"
          size="small"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          sx={{ minWidth: "200px" }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            name="status"
            value={filters.status}
            label="Status"
            onChange={handleFilterChange}
          >
            <MenuItem value="">
              <em>All Statuses</em>
            </MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        {}
        <Tooltip title="Refresh List">
          <IconButton
            onClick={handleRefresh}
            aria-label="refresh list"
            disabled={isLoading}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {isLoading && (
        <CircularProgress sx={{ display: "block", margin: "auto", mb: 2 }} />
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!isLoading && !error && (
        <TableContainer component={Paper}>
          <Table
            sx={{ minWidth: 750 }}
            aria-label="appointments table"
            size="small"
          >
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                <TableCell>ID</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Scheduled</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Fee</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No appointments found matching criteria.
                  </TableCell>
                </TableRow>
              )}
              {appointments.map((app) => (
                <TableRow key={app.id} hover>
                  <TableCell>{app.id}</TableCell>
                  <TableCell>
                    {app.patient_name} ({app.patient_user_id})
                  </TableCell>
                  <TableCell>
                    {app.doctor_name || "N/A"}{" "}
                    {app.doctor_profile_id
                      ? `(Doc #${app.doctor_profile_id})`
                      : ""}
                  </TableCell>
                  <TableCell>{app.service_name || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(app.scheduled_time).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={app.status}
                      size="small"
                      color={getStatusColor(app.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {app.fee ? `$${parseFloat(app.fee).toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={app.payment_status}
                      size="small"
                      color={
                        app.payment_status === "paid" ? "success" : "default"
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        color="info"
                        component={RouterLink}
                        to={`/appointments/${app.id}`}
                      >
                        {" "}
                        {}
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Appointment">
                      <span>
                        {" "}
                        {}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openDeleteDialog(app.id)}
                          disabled={isLoading}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {}
      <ConfirmationDialog
        open={deleteConfirm.open}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Appointment?"
        description={`Are you sure you want to permanently delete appointment #${deleteConfirm.id}? This action cannot be undone.`}
      />
    </Box>
  );
};

export default AdminAppointmentList;