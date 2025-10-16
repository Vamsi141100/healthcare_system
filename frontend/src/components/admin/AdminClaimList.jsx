import React, { useState, useEffect, useCallback } from "react";
import insuranceService from "../../services/insuranceService";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Alert, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import PageviewIcon from '@mui/icons-material/Pageview';

const AdminClaimList = () => {
    const [claims, setClaims] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');

    const fetchClaims = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await insuranceService.getAllClaims();
            setClaims(data || []);
        } catch(err) {
            setError("Failed to fetch insurance claims.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClaims();
    }, [fetchClaims]);
    
    const handleOpenModal = (claim) => {
        setSelectedClaim(claim);
        setAdminNotes(claim.admin_notes || '');
        setIsModalOpen(true);
    }
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedClaim(null);
    }

    const handleUpdateStatus = async (status) => {
        if (!selectedClaim) return;
        try {
            await insuranceService.updateClaimStatus(selectedClaim.id, { status, admin_notes: adminNotes });
            handleCloseModal();
            fetchClaims(); 
        } catch(err) {
            alert("Failed to update status.");
        }
    }

    const getStatusColor = (status) => ({
        pending: "warning",
        approved: "success",
        rejected: "error"
    }[status] || "default");
    
    const API_BASE_URL_NO_API = process.env.REACT_APP_API_BASE_URL.replace("/api", "");

    return (
        <div>
            <Typography variant="h6">Insurance Claims</Typography>
            {isLoading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            {!isLoading && (
                 <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Appointment ID</TableCell>
                                <TableCell>Patient</TableCell>
                                <TableCell>Provider</TableCell>
                                <TableCell>Policy ID</TableCell>
                                <TableCell>Submitted On</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {claims.map(claim => (
                                <TableRow key={claim.id}>
                                    <TableCell>{claim.appointment_id}</TableCell>
                                    <TableCell>{claim.patient_name}</TableCell>
                                    <TableCell>{claim.provider_name}</TableCell>
                                    <TableCell>{claim.policy_number}</TableCell>
                                    <TableCell>{new Date(claim.submitted_at).toLocaleDateString()}</TableCell>
                                    <TableCell><Chip label={claim.status} color={getStatusColor(claim.status)} size="small"/></TableCell>
                                    <TableCell><IconButton onClick={() => handleOpenModal(claim)}><PageviewIcon /></IconButton></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {selectedClaim && (
                 <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
                    <DialogTitle>Review Claim for Appt #{selectedClaim.appointment_id}</DialogTitle>
                    <DialogContent>
                         <Typography><strong>Patient:</strong> {selectedClaim.patient_name} ({selectedClaim.patient_email})</Typography>
                         <Typography><strong>Provider:</strong> {selectedClaim.provider_name} | <strong>Policy:</strong> {selectedClaim.policy_number}</Typography>
                        
                         <Button startIcon={<DownloadIcon />} href={`${API_BASE_URL_NO_API}${selectedClaim.invoice_path}`} target="_blank">Download Invoice</Button>
                         <Button startIcon={<DownloadIcon />} href={`${API_BASE_URL_NO_API}${selectedClaim.insurance_card_front_path}`} target="_blank">Download Insurance Card</Button>
                         <Button startIcon={<DownloadIcon />} href={`${API_BASE_URL_NO_API}${selectedClaim.government_id_path}`} target="_blank">Download Gov ID</Button>
                        <TextField label="Admin Notes" fullWidth multiline rows={3} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} sx={{mt:2}} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModal}>Cancel</Button>
                         <Button onClick={() => handleUpdateStatus('rejected')} color="error">Reject</Button>
                         <Button onClick={() => handleUpdateStatus('approved')} color="success">Approve</Button>
                    </DialogActions>
                </Dialog>
            )}
        </div>
    )
}

export default AdminClaimList;