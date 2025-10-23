import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
    Container, Typography, Grid, Card, CardContent, Button, Stack, Chip, Divider, Box, Skeleton
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';

import doctorService from '../services/doctorService';
import ErrorMessage from '../components/common/ErrorMessage';
import DoctorAppointmentList from '../components/doctor/DoctorAppointmentList';

const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Box sx={{ color: `${color}.main`, mr: 2 }}>{icon}</Box>
        <Box>
            <Typography variant="h5" component="p" sx={{ fontWeight: 'bold' }}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
    </Card>
);

const DoctorDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await doctorService.getDashboard();
            setDashboardData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Doctor Dashboard 🩺
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Welcome back, Dr. {user?.name}!
                </Typography>
            </Box>
            
            {error && <ErrorMessage message={error} />}

            <Grid container spacing={3}>

                {}
                <Grid item xs={12} md={8}>
                     <Card>
                         <CardContent>
                             <Typography variant="h6" sx={{ mb: 1 }}>Manage Appointments</Typography>
                             <DoctorAppointmentList />
                         </CardContent>
                     </Card>
                </Grid>

                {}
                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        <Card>
                            <CardContent>
                                 <Typography variant="h6" sx={{ mb: 2 }}>At a Glance</Typography>
                                {isLoading ? (
                                    <>
                                        <Skeleton variant="rectangular" height={60} sx={{mb: 2}}/>
                                        <Skeleton variant="rectangular" height={60}/>
                                    </>
                                ) : dashboardData && (
                                    <Stack spacing={2}>
                                        <StatCard title="Upcoming Appointments" value={dashboardData.stats?.upcomingAppointments || 0} icon={<EventIcon fontSize="large"/>} color="primary" />
                                        <StatCard title="Pending Confirmation" value={dashboardData.stats?.pendingAppointments || 0} icon={<PersonIcon fontSize="large"/>} color="warning" />
                                    </Stack>
                                )}
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DoctorDashboard;