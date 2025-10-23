import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField as FormikTextField, Select as FormikSelect } from "formik-mui";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

import appointmentService from "../services/appointmentService";

import {
  Container, Typography, Button, Grid, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Alert, Collapse, Paper, Stack, Box, alpha, styled, Divider, Skeleton, TextField
} from "@mui/material";

import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import Filter1Icon from '@mui/icons-material/Filter1';
import Filter2Icon from '@mui/icons-material/Filter2';
import Filter3Icon from '@mui/icons-material/Filter3';
import Filter4Icon from '@mui/icons-material/Filter4';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import NotesIcon from '@mui/icons-material/Notes';

const HeaderBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  marginBottom: theme.spacing(4),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius * 2,
}));

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0 8px 40px ${alpha(theme.palette.common.black, 0.08)}`,
}));

const StepHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.main,
}));

const BookingSchema = Yup.object().shape({
  specialization: Yup.string().required("Please select a specialization"),
  doctor_id: Yup.string().when("specialization", {
    is: (val) => !!val,
    then: (schema) => schema.required("Please select a doctor"),
    otherwise: (schema) => schema.notRequired(),
  }),
  service_id: Yup.string().notRequired(),
  scheduled_time: Yup.date().min(new Date(), "Cannot book in the past").required("Please select a date and time").nullable(),
  patient_notes: Yup.string().max(500, "Notes cannot exceed 500 characters"),
});

const FormSkeleton = () => (
    <FormPaper>
        <Stack spacing={4}>
            <Box><Skeleton variant="text" width="40%" height={40} /><Skeleton variant="rectangular" height={56} /></Box>
            <Box><Skeleton variant="text" width="40%" height={40} /><Skeleton variant="rectangular" height={56} /></Box>
            <Box><Skeleton variant="text" width="40%" height={40} /><Skeleton variant="rectangular" height={112} /></Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}><Skeleton variant="rectangular" width={150} height={40} /></Box>
        </Stack>
    </FormPaper>
);

const AppointmentBookingPage = () => {
  const [specializations, setSpecializations] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServiceDesc, setSelectedServiceDesc] = useState("");

  const [loadingSpecializations, setLoadingSpecializations] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  

  const fetchInitialData = useCallback(async () => {
    setLoadingSpecializations(true); setLoadingServices(true); setFetchError("");
    try {
      const doctorsResponse = await appointmentService.getAvailableDoctors();
      setSpecializations(doctorsResponse.specializations || []);
      const servicesResponse = await appointmentService.getServices("Consultation");
      setAvailableServices(servicesResponse || []);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Could not load booking options.";
      setFetchError(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoadingSpecializations(false);
      setLoadingServices(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSpecializationChange = useCallback(async (spec, setFieldValue) => {
    setFieldValue("doctor_id", "");
    setAvailableDoctors([]);
    setFieldValue("specialization", spec);
    if (!spec) return;

    setLoadingDoctors(true); setFetchError("");
    try {
      const response = await appointmentService.getAvailableDoctors(spec);
      setAvailableDoctors(response.doctors || []);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Could not load doctors.";
      setFetchError(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoadingDoctors(false);
    }
  }, [enqueueSnackbar]);

  const handleServiceChange = (serviceId, setFieldValue) => {
    setFieldValue("service_id", serviceId);
    const selected = availableServices.find((s) => s.id === parseInt(serviceId, 10));
    setSelectedServiceDesc(selected?.description || "");
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setFieldError("general", "");
    try {
      const submissionData = {
        doctor_id: parseInt(values.doctor_id, 10),
        service_id: values.service_id ? parseInt(values.service_id, 10) : null,
        scheduled_time: values.scheduled_time ? new Date(values.scheduled_time.getTime() - values.scheduled_time.getTimezoneOffset() * 60000).toISOString().slice(0, 19).replace('T', ' ') : null,
        patient_notes: values.patient_notes || null,
      };
      await appointmentService.createAppointment(submissionData);
      enqueueSnackbar("Appointment requested successfully!", { variant: "success" });
      navigate("/dashboard");
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to book appointment.";
      enqueueSnackbar(message, { variant: "error" });
      setFieldError("general", message);
    } finally {
      setSubmitting(false);
    }
  };
  

  const initialDataLoaded = !loadingSpecializations && !loadingServices;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <HeaderBox>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EditCalendarIcon /> Book an Appointment
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
          Follow the steps below to schedule your consultation.
        </Typography>
      </HeaderBox>
      
      {!initialDataLoaded && !fetchError && <FormSkeleton />}
      {fetchError && <Alert severity="error">{fetchError}</Alert>}

      {initialDataLoaded && specializations.length > 0 && (
        <Formik
          initialValues={{ specialization: "", doctor_id: "", service_id: "", scheduled_time: null, patient_notes: "" }}
          validationSchema={BookingSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, values, errors, touched }) => (
            <Form noValidate>
                <FormPaper>
                    <Stack spacing={5}>
                        {}
                        <Box>
                            <StepHeader><Filter1Icon /><Typography variant="h6">Step 1: Choose Your Provider</Typography></StepHeader>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth error={touched.specialization && !!errors.specialization}>
                                        <InputLabel id="spec-select-label">Specialization *</InputLabel>
                                        <Select labelId="spec-select-label" value={values.specialization} label="Specialization *"
                                            onChange={(e) => handleSpecializationChange(e.target.value, setFieldValue)}>
                                            {specializations.map((spec) => <MenuItem key={spec} value={spec}>{spec}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth disabled={!values.specialization || loadingDoctors} error={touched.doctor_id && !!errors.doctor_id}>
                                        <InputLabel id="doctor-select-label"></InputLabel>
                                        <Field component={FormikSelect} name="doctor_id" labelId="doctor-select-label" label="Doctor *">
                                            <MenuItem value="" disabled>{loadingDoctors ? 'Loading...' : 'Select a Doctor'}</MenuItem>
                                            {availableDoctors.map((doc) => <MenuItem key={doc.id} value={doc.id}>{doc.name}</MenuItem>)}
                                        </Field>
                                        {loadingDoctors && <CircularProgress size={20} sx={{ position: 'absolute', right: 40, top: 18 }}/>}
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                        
                        {}
                        <Box>
                            <StepHeader><MedicalServicesIcon /><Typography variant="h6">Step 2: Select a Service (Optional)</Typography></StepHeader>
                             <FormControl fullWidth>
                                <InputLabel id="service-select-label">Service Type</InputLabel>
                                <Select labelId="service-select-label" value={values.service_id} label="Service Type"
                                    onChange={(e) => handleServiceChange(e.target.value, setFieldValue)}>
                                    <MenuItem value=""><em>General Consultation</em></MenuItem>
                                    {availableServices.map((service) => (
                                        <MenuItem key={service.id} value={service.id}>
                                            {service.name} {service.base_fee ? `($${parseFloat(service.base_fee).toFixed(2)})` : ""}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Collapse in={!!selectedServiceDesc} sx={{ mt: 2 }}>
                                <Alert severity="info" variant="outlined">{selectedServiceDesc}</Alert>
                            </Collapse>
                        </Box>

                        {}
                        <Box>
                             <StepHeader><EventAvailableIcon /><Typography variant="h6">Step 3: Schedule Your Visit</Typography></StepHeader>
                             <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateTimePicker label="Appointment Date & Time *" value={values.scheduled_time}
                                    onChange={(newValue) => setFieldValue("scheduled_time", newValue)}
                                    minDateTime={new Date()}
                                    renderInput={(params) => (
                                        <TextField {...params} fullWidth required
                                            error={touched.scheduled_time && !!errors.scheduled_time}
                                            helperText={touched.scheduled_time && errors.scheduled_time}
                                        />
                                    )}
                                />
                            </LocalizationProvider>
                        </Box>

                        {}
                        <Box>
                             <StepHeader><NotesIcon /><Typography variant="h6">Step 4: Add Notes & Confirm</Typography></StepHeader>
                            <Field component={FormikTextField} name="patient_notes" label="Reason for Visit / Notes" multiline rows={4} fullWidth variant="outlined"/>
                        </Box>
                        
                        <Divider />

                        {errors.general && <Alert severity="error">{errors.general}</Alert>}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" variant="contained" size="large" disabled={isSubmitting || loadingDoctors}>
                                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Request Appointment"}
                            </Button>
                        </Box>
                    </Stack>
                </FormPaper>
            </Form>
          )}
        </Formik>
      )}
    </Container>
  );
};

export default AppointmentBookingPage;