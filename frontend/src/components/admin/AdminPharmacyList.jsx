import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import pharmacyService from '../../services/pharmacyService';
import { useSnackbar } from 'notistack';

const PharmacyFormModal = ({ open, onClose, pharmacy, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone_number: '',
        delivery_available: false,
        delivery_zips: '',
    });

    useEffect(() => {
        if (pharmacy) {
            setFormData({
                name: pharmacy.name || '',
                address: pharmacy.address || '',
                phone_number: pharmacy.phone_number || '',
                delivery_available: pharmacy.delivery_available || false,
                delivery_zips: pharmacy.delivery_zips || '',
            });
        } else {
             setFormData({ name: '', address: '', phone_number: '', delivery_available: false, delivery_zips: '' });
        }
    }, [pharmacy]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = () => {
        onSave(pharmacy ? pharmacy.id : null, formData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{pharmacy ? 'Edit Pharmacy' : 'Add New Pharmacy'}</DialogTitle>
            <DialogContent>
                <TextField name="name" label="Name" value={formData.name} onChange={handleChange} fullWidth margin="normal" />
                <TextField name="address" label="Address" value={formData.address} onChange={handleChange} fullWidth margin="normal" multiline rows={2} />
                <TextField name="phone_number" label="Phone Number" value={formData.phone_number} onChange={handleChange} fullWidth margin="normal" />
                <FormControlLabel
                    control={<Checkbox name="delivery_available" checked={formData.delivery_available} onChange={handleChange} />}
                    label="Delivery Available"
                />
                 <TextField name="delivery_zips" label="Delivery ZIP Codes (comma-separated)" value={formData.delivery_zips} onChange={handleChange} fullWidth margin="normal" />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    )
};

const AdminPharmacyList = () => {
    const [pharmacies, setPharmacies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPharmacy, setEditingPharmacy] = useState(null);

    const fetchPharmacies = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await pharmacyService.getPharmacies();
            console.log(data);
            
            setPharmacies(data);
        } catch (err) {
            setError('Failed to fetch pharmacies.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPharmacies();
    }, [fetchPharmacies]);
    
    const handleSave = async (id, data) => {
        try {
            if (id) {
                await pharmacyService.updatePharmacy(id, data);
                enqueueSnackbar('Pharmacy updated successfully!', { variant: 'success' });
            } else {
                await pharmacyService.createPharmacy(data);
                enqueueSnackbar('Pharmacy created successfully!', { variant: 'success' });
            }
            setIsModalOpen(false);
            fetchPharmacies();
        } catch(err) {
             enqueueSnackbar('Failed to save pharmacy.', { variant: 'error' });
        }
    };
    
    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this pharmacy?')) {
            try {
                await pharmacyService.deletePharmacy(id);
                enqueueSnackbar('Pharmacy deleted!', { variant: 'success' });
                fetchPharmacies();
            } catch(err) {
                 enqueueSnackbar('Failed to delete pharmacy.', { variant: 'error' });
            }
        }
    }
    
    const handleOpenModal = (pharmacy = null) => {
        setEditingPharmacy(pharmacy);
        setIsModalOpen(true);
    }

    if (isLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Pharmacy Management</Typography>
                <Button variant="contained" onClick={() => handleOpenModal()}>Add Pharmacy</Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Delivery</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pharmacies.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.address}</TableCell>
                                <TableCell>{p.phone_number}</TableCell>
                                <TableCell>{p.delivery_available ? 'Yes' : 'No'}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenModal(p)}><EditIcon /></IconButton>
                                    <IconButton onClick={() => handleDelete(p.id)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <PharmacyFormModal 
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pharmacy={editingPharmacy}
                onSave={handleSave}
            />
        </Box>
    );
};

export default AdminPharmacyList;