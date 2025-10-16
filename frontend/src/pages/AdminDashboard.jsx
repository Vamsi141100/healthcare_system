import React, { useState } from "react";
import { Container, Typography, Box, Tabs, Tab, Paper } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AdminUserList from "../components/admin/AdminUserList";
import AdminAppointmentList from "../components/admin/AdminAppointmentList";
import AdminApplicationList from "../components/admin/AdminApplicationList";
import AdminSupportList from "../components/admin/AdminSupportList";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Control Panel 🛡️
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Manage users, appointments, applications, and support.
      </Typography>

      <Paper elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="Admin Tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Users"
              icon={<PeopleIcon />}
              iconPosition="start"
              id="admin-tab-0"
              aria-controls="admin-tabpanel-0"
            />
            <Tab
              label="Appointments"
              icon={<EventIcon />}
              iconPosition="start"
              id="admin-tab-1"
              aria-controls="admin-tabpanel-1"
            />
            <Tab
              label="Applications"
              icon={<AssignmentIndIcon />}
              iconPosition="start"
              id="admin-tab-2"
              aria-controls="admin-tabpanel-2"
            />
            <Tab
              label="Support Tickets"
              icon={<SupportAgentIcon />}
              iconPosition="start"
              id="admin-tab-3"
              aria-controls="admin-tabpanel-3"
            />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <AdminUserList /> 
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <AdminAppointmentList /> 
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          <AdminApplicationList /> 
        </TabPanel>
        <TabPanel value={currentTab} index={3}>
          <AdminSupportList /> 
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;