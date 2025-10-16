import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import appointmentService from "../services/appointmentService";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Collapse,
  Paper,
  Stack,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Select as FormikSelect,
  TextField as FormikTextField,
} from "formik-mui";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; 
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; 
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'; 
import { useSnackbar } from "notistack";

const BookingSchema = Yup.object().shape({
  specialization: Yup.string().required("Please select a specialization first"),
  doctor_id: Yup.string().when("specialization", {
    is: (val) => val && val.length > 0,
    then: (schema) => schema.required("Please select a doctor"),
    otherwise: (schema) => schema.notRequired(),
  }),
  service_id: Yup.string().notRequired(),
  scheduled_time: Yup.date()
    .min(new Date(), "Cannot book appointment in the past")
    .required("Please select date and time")
    .nullable(),
  patient_notes: Yup.string().max(500, "Notes cannot exceed 500 characters"),
});

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
    setLoadingSpecializations(true);
    setLoadingServices(true);
    setFetchError("");
    try {
      const doctorsResponse = await appointmentService.getAvailableDoctors();
      setSpecializations(doctorsResponse.specializations || []);

      const servicesResponse = await appointmentService.getServices(
        "Consultation"
      );
      setAvailableServices(servicesResponse || []);
    } catch (error) {
      console.error("Error fetching initial booking data:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Could not load booking options.";
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

  const handleSpecializationChange = useCallback(
    async (spec, setFieldValue) => {
      setFieldValue("doctor_id", "");
      setAvailableDoctors([]);
      setFieldValue("specialization", spec);
      if (!spec) return;

      setLoadingDoctors(true);
      setFetchError("");
      try {
        const response = await appointmentService.getAvailableDoctors(spec);
        setAvailableDoctors(response.doctors || []);
      } catch (error) {
        console.error("Error fetching doctors by specialization:", error);
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Could not load doctors for this specialization.";
        setFetchError(message);
        enqueueSnackbar(message, { variant: "error" });
      } finally {
        setLoadingDoctors(false);
      }
    },
    [enqueueSnackbar]
  );

  const handleServiceChange = (serviceId, setFieldValue) => {
    setFieldValue("service_id", serviceId);
    const selected = availableServices.find(
      (s) => s.id === parseInt(serviceId, 10)
    );
    setSelectedServiceDesc(selected?.description || "");
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setFieldError("general", "");
    setSubmitting(true);
    try {
      const submissionData = {
        doctor_id: parseInt(values.doctor_id, 10),
        service_id: values.service_id ? parseInt(values.service_id, 10) : null,
        scheduled_time: values.scheduled_time
          ? `${values.scheduled_time.getFullYear()}-${String(values.scheduled_time.getMonth() + 1).padStart(2, '0')}-${String(values.scheduled_time.getDate()).padStart(2, '0')} ${String(values.scheduled_time.getHours()).padStart(2, '0')}:${String(values.scheduled_time.getMinutes()).padStart(2, '0')}:00`
          : null,
        patient_notes: values.patient_notes || null,
      };
      await appointmentService.createAppointment(submissionData);
      enqueueSnackbar("Appointment requested successfully!", {
        variant: "success",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Booking Error:", error);
      const message =
        error?.response?.data?.message || "Failed to book appointment.";
      enqueueSnackbar(message, { variant: "error" });
      setFieldError("general", message);
    } finally {
      setSubmitting(false);
    }
  };

  const initialDataLoaded = !loadingSpecializations && !loadingServices;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Book an Appointment 📅
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Select specialization, doctor, service, and preferred time.
      </Typography>

      {!initialDataLoaded && <CircularProgress />}
      {fetchError && !initialDataLoaded && (
        <Alert severity="error">{fetchError}</Alert>
      )}

      {initialDataLoaded && specializations.length > 0 && (
        <Formik
          initialValues={{
            specialization: "",
            doctor_id: "",
            service_id: "",
            scheduled_time: null,
            patient_notes: "",
          }}
          validationSchema={BookingSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, setFieldValue, values, errors, touched }) => (
            <Form noValidate>
              <Grid container spacing={3} justifyContent="center" alignItems="center">
                <Stack spacing={3}>
                  <Grid>
                    <FormControl
                      fullWidth
                      error={touched.specialization && !!errors.specialization}
                    >
                      <InputLabel id="spec-select-label">
                        Specialization *
                      </InputLabel>
                      <Select
                        labelId="spec-select-label"
                        id="specialization"
                        value={values.specialization}
                        label="Specialization *"
                        onChange={(e) =>
                          handleSpecializationChange(
                            e.target.value,
                            setFieldValue
                          )
                        }
                      >
                        <MenuItem value="" disabled>
                          <em>Select Specialization</em>
                        </MenuItem>
                        {specializations.map((spec) => (
                          <MenuItem key={spec} value={spec}>
                            {spec}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.specialization && errors.specialization && (
                        <Typography color="error" variant="caption">
                          {errors.specialization}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid>
                    <FormControl
                      fullWidth
                      disabled={!values.specialization || loadingDoctors}
                      error={touched.doctor_id && !!errors.doctor_id}
                    >
                      <InputLabel id="doctor-select-label">Doctor *</InputLabel>
                      <Field
                        component={FormikSelect}
                        name="doctor_id"
                        labelId="doctor-select-label"
                        label="Doctor *"
                        disabled={!values.specialization || loadingDoctors}
                      >
                        <MenuItem value="" disabled>
                          {loadingDoctors ? (
                            <em>Loading...</em>
                          ) : !values.specialization ? (
                            <em>Select specialization first</em>
                          ) : (
                            <em>Select a Doctor</em>
                          )}
                        </MenuItem>
                        {availableDoctors.map((doc) => (
                          <MenuItem key={doc.id} value={doc.id}>
                            {doc.name} ({doc.specialization || "General"})
                          </MenuItem>
                        ))}
                      </Field>
                      {loadingDoctors && (
                        <CircularProgress
                          size={20}
                          sx={{ position: "absolute", right: 40, top: 18 }}
                        />
                      )}
                      {touched.doctor_id && errors.doctor_id && (
                        <Typography color="error" variant="caption">
                          {errors.doctor_id}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid>
                    <FormControl
                      fullWidth
                      error={touched.service_id && !!errors.service_id}
                    >
                      <InputLabel id="service-select-label">
                        Service Type (Optional)
                      </InputLabel>
                      <Select
                        labelId="service-select-label"
                        id="service_id_select"
                        value={values.service_id}
                        label="Service Type (Optional)"
                        onChange={(e) =>
                          handleServiceChange(e.target.value, setFieldValue)
                        }
                      >
                        <MenuItem value="">
                          <em>No Specific Service Type</em>
                        </MenuItem>
                        {availableServices.map((service) => (
                          <MenuItem key={service.id} value={service.id}>
                            {service.name}{" "}
                            {service.base_fee
                              ? `($${parseFloat(service.base_fee).toFixed(2)})`
                              : ""}
                          </MenuItem>
                        ))}
                      </Select>

                      {touched.service_id && errors.service_id && (
                        <Typography color="error" variant="caption">
                          {errors.service_id}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid>
                    <Collapse in={!!selectedServiceDesc}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          bgcolor: "grey.100",
                          border: "1px solid",
                          borderColor: "grey.300",
                        }}
                      >
                        <Typography variant="subtitle2">
                          Service Description:
                        </Typography>
                        <Typography variant="body2">
                          {selectedServiceDesc}
                        </Typography>
                      </Paper>
                    </Collapse>
                  </Grid>

                  <Grid>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        label="Appointment Date & Time *"
                        value={values.scheduled_time}
                        onChange={(newValue) =>
                          setFieldValue("scheduled_time", newValue)
                        }
                        minDateTime={new Date()}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            required
                            error={
                              touched.scheduled_time && !!errors.scheduled_time
                            }
                            helperText={
                              touched.scheduled_time && errors.scheduled_time
                            }
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid>
                    <Field
                      component={FormikTextField}
                      name="patient_notes"
                      label="Reason for Visit / Notes (Optional)"
                      multiline
                      rows={4}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>

                  {errors.general && (
                    <Grid>
                      <Alert severity="error">{errors.general}</Alert>
                    </Grid>
                  )}

                  <Grid>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={
                        isSubmitting ||
                        loadingDoctors ||
                        loadingSpecializations ||
                        loadingServices
                      }
                      size="large"
                    >
                      {isSubmitting ? "Requesting..." : "Request Appointment"}
                    </Button>
                  </Grid>
                </Stack>
              </Grid>
            </Form>
          )}
        </Formik>
      )}

      {initialDataLoaded && specializations.length === 0 && fetchError && (
        <Alert severity="warning">
          Could not load specializations needed for booking.
        </Alert>
      )}
    </Container>
  );
};

export default AppointmentBookingPage;