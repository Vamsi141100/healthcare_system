import React, { useState, useEffect, useCallback } from "react";
import applicationService from "../../services/applicationService";
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
  Button,
  Box,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
  Divider,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import { useSnackbar } from "notistack";

const ReviewApplicationModal = ({ open, onClose, application, onReview }) => {
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (application) {
      setAdminNotes(application.admin_notes || "");
    }
  }, [application]);

  if (!application) return null;

  const handleReviewAction = (status) => {
    onReview(application.id, status, adminNotes);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Review Application #{application.id} - {application.applicant_name}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          <strong>Applicant:</strong> {application.applicant_name} (
          {application.applicant_email})
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Role Applied:</strong> {application.applying_for_role}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Specialization:</strong> {application.specialization}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Bio:</strong> {application.bio}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Submitted:</strong>{" "}
          {new Date(application.submitted_at).toLocaleString()}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Status:</strong> {application.status}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Documents:</strong>{" "}
          {application.documents_path ? (
            <Button
              component="a"
              href={
                process.env.REACT_APP_API_BASE_URL
                  ? `${process.env.REACT_APP_API_BASE_URL.replace("/api", "")}${
                      application.documents_path
                    }`
                  : application.documents_path
              }
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              startIcon={<DownloadIcon />}
            >
              Download/View Document
            </Button>
          ) : (
            "No document uploaded"
          )}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" gutterBottom>
          <strong>Admin Notes:</strong>
        </Typography>
        <TextareaAutosize
          minRows={3}
          style={{
            width: "100%",
            padding: "8px",
            fontFamily: "inherit",
            fontSize: "inherit",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Add notes for approval or rejection..."
          disabled={application.status !== "pending"}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {application.status === "pending" && (
          <>
            <Button
              onClick={() => handleReviewAction("rejected")}
              color="error"
              startIcon={<CancelIcon />}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleReviewAction("approved")}
              color="success"
              variant="contained"
              startIcon={<CheckCircleIcon />}
            >
              Approve
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

const AdminApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "pending" });
  const [selectedApp, setSelectedApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const apiFilters = {};
      if (filters.status) apiFilters.status = filters.status;
      const data = await applicationService.getAllApplications(apiFilters);
      setApplications(data || []);
    } catch (err) {
      console.error("Fetch Applications Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch applications"
      );
      enqueueSnackbar("Failed to fetch applications", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [filters, enqueueSnackbar]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRefresh = () => {
    setFilters({ status: "pending" });
  };

  const openReviewModal = (app) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
    setSelectedApp(null);
  };

  const handleReview = async (id, status, adminNotes) => {
    setIsLoading(true);
    try {
      await applicationService.reviewApplication(id, {
        status,
        admin_notes: adminNotes,
      });
      enqueueSnackbar(`Application ${status} successfully`, {
        variant: "success",
      });
      fetchApplications();
    } catch (err) {
      console.error("Review application error:", err);
      setError(
        `Failed to review application: ${
          err.response?.data?.message || err.message
        }`
      );
      enqueueSnackbar("Failed to review application", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Doctor/Provider Applications
      </Typography>

      {}
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="app-status-filter-label">Status</InputLabel>
          <Select
            labelId="app-status-filter-label"
            id="app-status-filter"
            name="status"
            value={filters.status}
            label="Status"
            onChange={handleFilterChange}
          >
            <MenuItem value="">
              <em>All Statuses</em>
            </MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
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
            sx={{ minWidth: 650 }}
            aria-label="applications table"
            size="small"
          >
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                <TableCell>ID</TableCell>
                <TableCell>Applicant</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Applying For</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No applications found matching criteria.
                  </TableCell>
                </TableRow>
              )}
              {applications.map((app) => (
                <TableRow key={app.id} hover>
                  <TableCell>{app.id}</TableCell>
                  <TableCell>{app.applicant_name}</TableCell>
                  <TableCell>{app.applicant_email}</TableCell>
                  <TableCell>{app.applying_for_role}</TableCell>
                  <TableCell>{app.specialization}</TableCell>
                  <TableCell>
                    <Chip
                      label={app.status}
                      size="small"
                      color={getStatusColor(app.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(app.submitted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View / Review">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => openReviewModal(app)}
                        disabled={isLoading}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {}
      <ReviewApplicationModal
        open={isModalOpen}
        onClose={closeReviewModal}
        application={selectedApp}
        onReview={handleReview}
      />
    </Box>
  );
};

export default AdminApplicationList;