import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Tabs, Tab, CircularProgress, Alert, List, ListItem, ListItemText,
    Button, Divider, Chip, Tooltip, IconButton
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import appointmentService from '../../services/appointmentService';
import AppointmentEditModal from './AppointmentEditModal';

const AppointmentRow = ({ app, onEditClick }) => {
     const getStatusColor = (status) => ({
        pending: "warning",
        confirmed: "info",
        completed: "success",
        cancelled: "error"
    }[status] || "default");
    
    return (
        <ListItem
            secondaryAction={
                <Box>
                     {app.status === 'confirmed' && (
                        <Tooltip title="Edit Time/Notes">
                            <IconButton size="small" onClick={() => onEditClick(app)}><EditIcon fontSize="inherit"/></IconButton>
                        </Tooltip>
                    )}
                    <Button size="small" component={RouterLink} to={`/appointments/${app.id}`}>
                        Details
                    </Button>
                </Box>
            }
        >
            <ListItemText
                primary={`${app.patient_name || "Patient"} - ${new Date(app.scheduled_time).toLocaleString()}`}
                secondary={
                    <>
                        {app.service_name || "Consultation"} - {" "}
                        <Chip label={app.status} size="small" color={getStatusColor(app.status)} component="span"/>
                    </>
                }
            />
        </ListItem>
    );
};

const DoctorAppointmentList = () => {
    const [tab, setTab] = useState(0);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingAppointment, setEditingAppointment] = useState(null);

    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        setError('');
        const filters = {
            0: { upcoming: true },        
            1: { upcoming: true, status: 'pending' }, 
            2: { past: true, status: 'completed' },   
        }[tab];
        
        try {
            const data = await appointmentService.getMyAppointments(filters);
            setAppointments(data || []);
        } catch (err) {
            setError('Failed to load appointments.');
        } finally {
            setIsLoading(false);
        }
    }, [tab]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleEditClick = (appointment) => setEditingAppointment(appointment);
    const handleCloseModal = () => setEditingAppointment(null);

    return (
        <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} aria-label="appointment filter tabs">
                    <Tab label="Upcoming" />
                    <Tab label="Pending Action" />
                    <Tab label="Completed" />
                </Tabs>
            </Box>
            <Box sx={{ py: 2 }}>
                {isLoading && <CircularProgress />}
                {error && <Alert severity="error">{error}</Alert>}
                {!isLoading && (
                    <List>
                        {appointments.length === 0 ? (
                            <ListItem><ListItemText primary="No appointments found for this category." /></ListItem>
                        ) : (
                           appointments.map((app) => (
                               <React.Fragment key={app.id}>
                                   <AppointmentRow app={app} onEditClick={handleEditClick} />
                                   <Divider component="li"/>
                               </React.Fragment>
                           ))
                        )}
                    </List>
                )}
            </Box>
            {editingAppointment && (
                 <AppointmentEditModal 
                    open={!!editingAppointment}
                    onClose={handleCloseModal}
                    appointment={editingAppointment}
                    onUpdate={fetchAppointments} 
                />
            )}
        </Box>
    );
};

export default DoctorAppointmentList;