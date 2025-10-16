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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ role: "", search: "" });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await adminService.getAllUsers(filters);
      setUsers(data || []);
    } catch (err) {
      console.error("Fetch Users Error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch users"
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRefresh = () => {
    setFilters({ role: "", search: "" });
    fetchUsers();
  };

  const handleEdit = (userId) => {
    console.log("Edit user:", userId);
    alert("Edit functionality not yet implemented.");
  };

  const handleDelete = async (userId) => {
    console.log("Delete user:", userId);
    if (
      window.confirm(
        `Are you sure you want to delete user ${userId}? This action is irreversible and may affect related data!`
      )
    ) {
      try {
        setIsLoading(true);
        await adminService.deleteUser(userId);
        alert("User deleted successfully.");
        fetchUsers();
      } catch (err) {
        console.error("Delete user error:", err);
        setError(
          `Failed to delete user: ${err.response?.data?.message || err.message}`
        );
        setIsLoading(false);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        User Management
      </Typography>

      {}
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          label="Search Name/Email"
          variant="outlined"
          size="small"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="role-filter-label">Role</InputLabel>
          <Select
            labelId="role-filter-label"
            id="role-filter"
            name="role"
            value={filters.role}
            label="Role"
            onChange={handleFilterChange}
          >
            <MenuItem value="">
              <em>All Roles</em>
            </MenuItem>
            <MenuItem value="patient">Patient</MenuItem>
            <MenuItem value="doctor">Doctor</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <IconButton onClick={handleRefresh} aria-label="refresh list">
          <RefreshIcon />
        </IconButton>
      </Box>

      {isLoading && (
        <CircularProgress sx={{ display: "block", margin: "auto" }} />
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!isLoading && !error && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No users found matching criteria.
                  </TableCell>
                </TableRow>
              )}
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {user.id}
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      color={
                        user.role === "admin"
                          ? "secondary"
                          : user.role === "doctor"
                          ? "primary"
                          : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(user.id)}
                      aria-label="edit user"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(user.id)}
                      aria-label="delete user"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {}
    </Box>
  );
};

export default AdminUserList;