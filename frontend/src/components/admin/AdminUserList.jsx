import React, { useState, useEffect, useCallback } from "react";
import adminService from "../../services/adminService";
import { useSnackbar } from "notistack";
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import UserEditModal from "./UserEditModal"; 
import ConfirmationDialog from "../common/ConfirmationDialog";

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ role: "", search: "" });
  const { enqueueSnackbar } = useSnackbar();

  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, user: null });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await adminService.getAllUsers(filters);
      setUsers(data || []);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to fetch users";
      setError(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [filters, enqueueSnackbar]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRefresh = () => {
    setFilters({ role: "", search: "" });
    
  };
  
  
  const handleEditClick = async (userId) => {
    setIsEditLoading(true);
    try {
      
      const userData = await adminService.getUserById(userId);
      setEditingUser(userData);
      setIsModalOpen(true);
    } catch(err) {
      enqueueSnackbar('Failed to fetch user details.', { variant: 'error' });
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (userId, userData) => {
    try {
      await adminService.updateUser(userId, userData);
      enqueueSnackbar('User updated successfully!', { variant: 'success' });
      handleCloseModal();
      fetchUsers(); 
    } catch (err) {
       const message = err.response?.data?.message || 'Failed to update user.';
       enqueueSnackbar(message, { variant: 'error' });
       
    }
  };

  
  const handleDeleteClick = (user) => {
    setDeleteConfirm({ open: true, user: user });
  }

  const handleCloseDeleteDialog = () => {
      setDeleteConfirm({ open: false, user: null });
  }
  
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.user) return;
    try {
        setIsLoading(true); 
        await adminService.deleteUser(deleteConfirm.user.id);
        enqueueSnackbar(`User ${deleteConfirm.user.name} deleted successfully.`, { variant: 'success'});
        fetchUsers();
    } catch (err) {
        const message = err.response?.data?.message || 'Failed to delete user.';
        setError(message);
        enqueueSnackbar(message, { variant: 'error'});
    } finally {
        handleCloseDeleteDialog();
        setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        User Management
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          label="Search Name/Email"
          variant="outlined"
          size="small"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          sx={{minWidth: 240}}
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
            <MenuItem value=""><em>All Roles</em></MenuItem>
            <MenuItem value="patient">Patient</MenuItem>
            <MenuItem value="doctor">Doctor</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <Tooltip title="Refresh List">
            <IconButton onClick={handleRefresh} aria-label="refresh list">
                <RefreshIcon />
            </IconButton>
        </Tooltip>
      </Box>

      {(isLoading || isEditLoading) && <CircularProgress sx={{ display: "block", margin: "20px auto" }} />}
      {error && !isLoading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!isLoading && !error && (
        <TableContainer component={Paper}>
          <Table size="small">
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
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No users found matching criteria.</TableCell>
                </TableRow>
              ) : (
                 users.map((user) => (
                    <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                        <Chip label={user.role} size="small"
                            color={ user.role === "admin" ? "secondary" : user.role === "doctor" ? "primary" : "default" }
                        />
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                        <Tooltip title="Edit User">
                            <IconButton
                                size="small" color="primary"
                                onClick={() => handleEditClick(user.id)}
                                disabled={isEditLoading}
                                aria-label="edit user"
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                             <IconButton
                                size="small" color="error"
                                onClick={() => handleDeleteClick(user)}
                                disabled={isLoading}
                                aria-label="delete user"
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {}
      {editingUser && (
        <UserEditModal
            open={isModalOpen}
            onClose={handleCloseModal}
            user={editingUser}
            onSave={handleSaveUser}
        />
      )}

       {}
      <ConfirmationDialog
        open={deleteConfirm.open}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title={`Delete User: ${deleteConfirm.user?.name}?`}
        description={`Are you sure you want to permanently delete this user? This action is irreversible.`}
      />
    </Box>
  );
};

export default AdminUserList;