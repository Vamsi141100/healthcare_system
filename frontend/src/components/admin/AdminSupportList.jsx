import React, { useState, useEffect, useCallback } from "react";
import supportService from "../../services/supportService";
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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReplyIcon from "@mui/icons-material/Reply";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSnackbar } from "notistack";

const ViewAnswerTicketModal = ({
  open,
  onClose,
  ticket,
  onAnswer,
  onUpdateStatus,
}) => {
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (ticket) {
      setAnswer(ticket.answer || "");
    }
  }, [ticket]);

  if (!ticket) return null;

  const handleAnswerSubmit = () => {
    onAnswer(ticket.id, answer);
    onClose();
  };

  const handleCloseTicket = () => {
    onUpdateStatus(ticket.id, "closed");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Support Ticket #{ticket.id} - {ticket.subject}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          <strong>From:</strong> {ticket.user_name} ({ticket.user_email})
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Created:</strong>{" "}
          {new Date(ticket.created_at).toLocaleString()}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Status:</strong> {ticket.status}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
          Question:
        </Typography>
        <Typography
          variant="body2"
          sx={{
            whiteSpace: "pre-wrap",
            background: "#f5f5f5",
            p: 1,
            borderRadius: 1,
            mb: 2,
          }}
        >
          {ticket.question}
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          Answer:
        </Typography>
        <TextareaAutosize
          minRows={4}
          style={{
            width: "100%",
            padding: "8px",
            fontFamily: "inherit",
            fontSize: "inherit",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={
            ticket.status === "closed"
              ? "Ticket is closed."
              : "Enter your answer here..."
          }
          disabled={ticket.status === "closed"}
        />
        {ticket.answered_at && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Last Answered: {new Date(ticket.answered_at).toLocaleString()}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {ticket.status !== "closed" && (
          <>
            <Button
              onClick={handleAnswerSubmit}
              variant="contained"
              startIcon={<ReplyIcon />}
              disabled={!answer.trim()}
            >
              {ticket.status === "answered" ? "Update Answer" : "Submit Answer"}
            </Button>
            <Button
              onClick={handleCloseTicket}
              color="secondary"
              startIcon={<CheckCircleIcon />}
            >
              Mark as Closed
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

const AdminSupportList = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "open" });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const apiFilters = {};
      if (filters.status) apiFilters.status = filters.status;
      const data = await supportService.getAllTickets(apiFilters);
      setTickets(data || []);
    } catch (err) {
      console.error("Fetch Tickets Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch support tickets"
      );
      enqueueSnackbar("Failed to fetch tickets", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [filters, enqueueSnackbar]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRefresh = () => {
    setFilters({ status: "open" });
  };

  const openViewModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const closeViewModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  const handleAnswer = async (id, answer) => {
    setIsLoading(true);
    try {
      await supportService.answerTicket(id, { answer });
      enqueueSnackbar("Ticket answered successfully", { variant: "success" });
      fetchTickets();
    } catch (err) {
      console.error("Answer ticket error:", err);
      setError(
        `Failed to answer ticket: ${err.response?.data?.message || err.message}`
      );
      enqueueSnackbar("Failed to answer ticket", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setIsLoading(true);
    try {
      await supportService.updateTicketStatus(id, { status });
      enqueueSnackbar(`Ticket status updated to ${status}`, {
        variant: "success",
      });
      fetchTickets();
    } catch (err) {
      console.error("Update status error:", err);
      setError(
        `Failed to update status: ${err.response?.data?.message || err.message}`
      );
      enqueueSnackbar("Failed to update status", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "error";
      case "answered":
        return "info";
      case "closed":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Support Tickets
      </Typography>

      {}
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="ticket-status-filter-label">Status</InputLabel>
          <Select
            labelId="ticket-status-filter-label"
            id="ticket-status-filter"
            name="status"
            value={filters.status}
            label="Status"
            onChange={handleFilterChange}
          >
            <MenuItem value="">
              <em>All Statuses</em>
            </MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="answered">Answered</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
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
            sx={{ minWidth: 700 }}
            aria-label="support tickets table"
            size="small"
          >
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                <TableCell>ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Answered</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No tickets found matching criteria.
                  </TableCell>
                </TableRow>
              )}
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} hover>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.user_name}</TableCell>
                  <TableCell>{ticket.user_email}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Tooltip title={ticket.subject}>
                      <span>{ticket.subject}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.status}
                      size="small"
                      color={getStatusColor(ticket.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {ticket.answered_at
                      ? new Date(ticket.answered_at).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View / Answer">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => openViewModal(ticket)}
                        disabled={isLoading}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {}
      <ViewAnswerTicketModal
        open={isModalOpen}
        onClose={closeViewModal}
        ticket={selectedTicket}
        onAnswer={handleAnswer}
        onUpdateStatus={handleUpdateStatus}
      />
    </Box>
  );
};

export default AdminSupportList;