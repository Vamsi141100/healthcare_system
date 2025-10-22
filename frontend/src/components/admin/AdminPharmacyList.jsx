import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Typography, CircularProgress, Alert, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, FormControlLabel, Checkbox, Grid, Tooltip
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { TextField as FormikTextField } from 'formik-mui';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import pharmacyService from '../../services/pharmacyService';
import { useSnackbar } from 'notistack';
import ConfirmationDialog from '../common/ConfirmationDialog';

const PharmacySchema = Yup.object().shape({
    name: Yup.string().required('Pharmacy name is required'),
    address: Yup.string().required('Address is required'),
    phone_number: Yup.string().required('Phone number is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
});

const PharmacyFormModal = ({ open, onClose, pharmacy, onSave }) => {

    const handleSubmit = async (values, { setSubmitting }) => {
        
        await onSave(pharmacy ? pharmacy.id : null, values);
        setSubmitting(false); 
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{pharmacy ? 'Edit Pharmacy' : 'Add New Pharmacy'}</DialogTitle>
            <Formik
                initialValues={{
                    name: pharmacy?.name || '',
                    address: pharmacy?.address || '',
                    phone_number: pharmacy?.phone_number || '',
                    email: pharmacy?.email || '',
                    delivery_available: pharmacy?.delivery_available || false,
                    delivery_zips: pharmacy?.delivery_zips || '',
                }}
                validationSchema={PharmacySchema}
                onSubmit={handleSubmit}
                enableReinitialize 
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <Form>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Field component={FormikTextField} name="name" label="Name *" fullWidth />
                                </Grid>
                                <Grid item xs={12}>
                                    <Field component={FormikTextField} name="address" label="Address *" fullWidth multiline rows={2} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Field component={FormikTextField} name="phone_number" label="Phone Number *" fullWidth />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Field component={FormikTextField} name="email" type="email" label="Email Address *" fullWidth />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={values.delivery_available}
                                                onChange={(e) => setFieldValue('delivery_available', e.target.checked)}
                                                name="delivery_available"
                                            />
                                        }
                                        label="Delivery Available"
                                    />
                                </Grid>
                                {values.delivery_available && (
                                     <Grid item xs={12}>
                                        <Field component={FormikTextField} name="delivery_zips" label="Delivery ZIP Codes (comma-separated)" fullWidth />
                                     </Grid>
                                )}
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={isSubmitting}>
                                {isSubmitting ? <CircularProgress size={24} /> : 'Save'}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
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
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, pharmacy: null });

    const fetchPharmacies = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await pharmacyService.getPharmacies();
            setPharmacies(data || []);
        } catch (err) {
            setError('Failed to fetch pharmacies.');
            enqueueSnackbar('Failed to fetch pharmacies.', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [enqueueSnackbar]);

    useEffect(() => { fetchPharmacies(); }, [fetchPharmacies]);
    
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
             const message = err.response?.data?.message || 'Failed to save pharmacy.';
             enqueueSnackbar(message, { variant: 'error' });
             
        }
    };
    
    const handleDeleteConfirm = async () => {
        if(!deleteConfirm.pharmacy) return;
        try {
            await pharmacyService.deletePharmacy(deleteConfirm.pharmacy.id);
            enqueueSnackbar('Pharmacy deleted!', { variant: 'success' });
            fetchPharmacies();
        } catch(err) {
             enqueueSnackbar('Failed to delete pharmacy.', { variant: 'error' });
        } finally {
            setDeleteConfirm({ open: false, pharmacy: null });
        }
    };
    
    const handleOpenModal = (pharmacy = null) => {
        setEditingPharmacy(pharmacy);
        setIsModalOpen(true);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Pharmacy Management</Typography>
                <Button variant="contained" onClick={() => handleOpenModal()}>Add Pharmacy</Button>
            </Box>

            {isLoading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            
            {!isLoading && !error && (
                <TableContainer component={Paper}>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Delivery</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pharmacies.map(p => (
                                    <TableRow key={p.id} hover>
                                        <TableCell>{p.name}</TableCell>
                                        <TableCell>{p.email}</TableCell>
                                        <TableCell>{p.phone_number}</TableCell>
                                        <TableCell>{p.address}</TableCell>
                                        <TableCell>{p.delivery_available ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Edit">
                                                <IconButton onClick={() => handleOpenModal(p)} size="small"><EditIcon /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton onClick={() => setDeleteConfirm({ open: true, pharmacy: p })} size="small"><DeleteIcon color="error" /></IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </TableContainer>
            )}

            <PharmacyFormModal 
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pharmacy={editingPharmacy}
                onSave={handleSave}
            />

            <ConfirmationDialog
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, pharmacy: null })}
                onConfirm={handleDeleteConfirm}
                title={`Delete Pharmacy: ${deleteConfirm.pharmacy?.name}?`}
                description="Are you sure you want to permanently delete this pharmacy? This action cannot be undone."
            />
        </Box>
    );
};

export default AdminPharmacyList;