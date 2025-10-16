import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../../features/auth/authSlice';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InfoIcon from '@mui/icons-material/Info';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ScienceIcon from '@mui/icons-material/Science';
import MedicationLiquidIcon from '@mui/icons-material/MedicationLiquid';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ContactSupportIcon from '@mui/icons-material/ContactSupport'; 

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
        const { user } = useSelector((state) => state.auth);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(reset());                         setDrawerOpen(false);
        navigate('/');
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

        const drawerContent = (
        <Box
            sx={{ width: 250 }} role="presentation"
                        onKeyDown={toggleDrawer(false)}         >
            <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5 }}>
                <IconButton component={RouterLink} to="/" onClick={toggleDrawer(false)} color="primary" sx={{mr: 1}}>
                     <HealthAndSafetyIcon />
                 </IconButton>
                <Typography variant="h6">Menu</Typography>
             </Box>
            <Divider />
            <List>
                {}
                <ListItem disablePadding>
                     <ListItemButton component={RouterLink} to="/about" onClick={toggleDrawer(false)}>
                        <ListItemIcon><InfoIcon /></ListItemIcon>
                        <ListItemText primary="About" />
                    </ListItemButton>
                 </ListItem>
                 <ListItem disablePadding>
                     <ListItemButton component={RouterLink} to="/stats" onClick={toggleDrawer(false)}>
                        <ListItemIcon><QueryStatsIcon /></ListItemIcon>
                        <ListItemText primary="Stats" />
                     </ListItemButton>
                </ListItem>

                <Divider sx={{ my: 1 }} />

                {}
                {user ? (
                    <>
                        {}
                         <ListItem disablePadding>
                             <ListItemButton component={RouterLink} to="/dashboard" onClick={toggleDrawer(false)}>
                                 <ListItemIcon><DashboardIcon /></ListItemIcon>
                                 <ListItemText primary="Dashboard" />
                            </ListItemButton>
                        </ListItem>

                         {}
                         {user.role === 'patient' && (
                             <>
                                 <ListItem disablePadding>
                                     <ListItemButton component={RouterLink} to="/book-appointment" onClick={toggleDrawer(false)}>
                                        <ListItemIcon><EventAvailableIcon /></ListItemIcon>
                                        <ListItemText primary="Book Appointment" />
                                    </ListItemButton>
                                 </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton component={RouterLink} to="/lab-tests" onClick={toggleDrawer(false)}>
                                         <ListItemIcon><ScienceIcon /></ListItemIcon>
                                        <ListItemText primary="Lab Tests" />
                                     </ListItemButton>
                                </ListItem>
                                 <ListItem disablePadding>
                                    <ListItemButton component={RouterLink} to="/medications" onClick={toggleDrawer(false)}>
                                        <ListItemIcon><MedicationLiquidIcon /></ListItemIcon>
                                         <ListItemText primary="Medications" />
                                    </ListItemButton>
                                 </ListItem>
                             </>
                         )}

                        {}
                        <ListItem disablePadding>
                            <ListItemButton component={RouterLink} to="/support" onClick={toggleDrawer(false)}>
                                <ListItemIcon><ContactSupportIcon /></ListItemIcon>
                                 <ListItemText primary="Support" />
                            </ListItemButton>
                         </ListItem>

                        <Divider sx={{ my: 1 }} />

                         {}
                         <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout}> {}
                                <ListItemIcon><LogoutIcon /></ListItemIcon>
                                <ListItemText primary="Logout" />
                             </ListItemButton>
                        </ListItem>
                     </>
                 ) : (
                     <>
                         {}
                         <ListItem disablePadding>
                             <ListItemButton component={RouterLink} to="/login" onClick={toggleDrawer(false)}>
                                <ListItemIcon><LoginIcon /></ListItemIcon>
                                <ListItemText primary="Login" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={RouterLink} to="/register" onClick={toggleDrawer(false)}>
                                <ListItemIcon><AppRegistrationIcon /></ListItemIcon>
                                <ListItemText primary="Register" />
                            </ListItemButton>
                        </ListItem>
                     </>
                 )}
            </List>
         </Box>
    );

        return (
        <>
             <AppBar position="static" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}> {}
                 <Toolbar>
                    {}
                     <IconButton
                        color="inherit" aria-label="open drawer" edge="start"
                        onClick={toggleDrawer(true)}
                        sx={{ mr: 2, display: { xs: 'block', md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                     {}
                    <IconButton edge="start" color="inherit" aria-label="logo" component={RouterLink} to="/" sx={{ mr: 1, display: { xs: 'none', sm: 'inline-flex' } }}>
                        <HealthAndSafetyIcon />
                     </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Health Hub
                    </Typography>

                     {}
                     <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                        {}
                        <Button color="inherit" component={RouterLink} to="/about" startIcon={<InfoIcon />}>About</Button>
                        <Button color="inherit" component={RouterLink} to="/stats" startIcon={<QueryStatsIcon />}>Stats</Button>

                         {}
                         {}

                         {}
                        {user ? (
                            <>
                                {}
                                {user.role === 'patient' && (
                                    <>
                                         <Button color="inherit" component={RouterLink} to="/book-appointment" startIcon={<EventAvailableIcon />}>Book</Button>
                                        <Button color="inherit" component={RouterLink} to="/lab-tests" startIcon={<ScienceIcon />}>Labs</Button>
                                         <Button color="inherit" component={RouterLink} to="/medications" startIcon={<MedicationLiquidIcon />}>Meds</Button>
                                    </>
                                )}

                                 {}
                                <Button color="inherit" component={RouterLink} to="/support" startIcon={<ContactSupportIcon />}>Support</Button>
                                 <Button color="inherit" component={RouterLink} to="/dashboard" startIcon={<DashboardIcon />}>Dashboard</Button>
                                <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>Logout</Button>
                             </>
                        ) : (
                             <>
                                {}
                                 <Button color="inherit" component={RouterLink} to="/login" startIcon={<LoginIcon />}>Login</Button>
                                <Button color="inherit" component={RouterLink} to="/register" startIcon={<AppRegistrationIcon />}>Register</Button>
                            </>
                        )}
                    </Box> {}

                 </Toolbar>
            </AppBar>

             {}
             <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                 {drawerContent}
            </Drawer>
         </>
    );
};

export default Header;