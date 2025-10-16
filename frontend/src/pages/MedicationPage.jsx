import React, { useState, useEffect, useCallback } from "react";
import appointmentService from "../services/appointmentService";
import medicationService from "../services/medicationService";
import {
    Container,
    Typography,
    Box,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Paper,
    FormControlLabel,
    FormControl,
    FormLabel,
    RadioGroup,
    Radio,
    Stack,
} from "@mui/material";
import MedicationIcon from "@mui/icons-material/Medication";
import SendIcon from "@mui/icons-material/Send";
import { useSnackbar } from "notistack";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField as FormikTextField } from "formik-mui";

const MedicationSchema = Yup.object().shape({
  medication_details: Yup.string()
    .required("Please specify the medication and dosage")
    .max(200, "Details too long"),
  notes: Yup.string().max(500, "Notes cannot exceed 500 characters"),
});

const MedicationPage = () => {
  const [medicationServices, setMedicationServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const fetchMedServices = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const services = await appointmentService.getServices("Medication");
      setMedicationServices(services || []);
    } catch (error) {
      console.error("Error fetching medication services:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Could not load medication service options.";
      setFetchError(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchMedServices();
  }, [fetchMedServices]);

  const handleSubmit = async (
    values,
    { setSubmitting, setFieldError, resetForm }
  ) => {
    setSubmitting(true);
    setFieldError("general", "");
    try {
      const requestData = {
        service_id: values.service_id ? parseInt(values.service_id, 10) : null,
        medication_details: values.medication_details,
        notes: values.notes,
      };
      const result = await medicationService.requestMed(requestData);
      enqueueSnackbar(
        result.message || "Medication request submitted successfully!",
        { variant: "success" }
      );
      resetForm();
    } catch (error) {
      console.error("Medication Request Error:", error);
      const message =
        error?.response?.data?.message ||
        "Failed to submit medication request.";
      enqueueSnackbar(message, { variant: "error" });
      setFieldError("general", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <MedicationIcon sx={{ mr: 1 }} /> Medication Request / Delivery
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Request a prescription refill or new medication (requires doctor
        review).
      </Typography>

      {isLoading && <CircularProgress />}
      {fetchError && !isLoading && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fetchError}
        </Alert>
      )}

      
      {!isLoading && (
        <Formik
          initialValues={{ service_id: "", medication_details: "", notes: "" }}
          validationSchema={MedicationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form noValidate>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Grid container spacing={3} justifyContent="center" alignItems="center">
                <Stack spacing={3}>
                  {medicationServices.length > 0 && (
                    <Grid>
                      <FormControl component="fieldset" fullWidth>
                        <FormLabel component="legend">
                          Request Type (Optional)
                        </FormLabel>
                        <Field as={RadioGroup} name="service_id" row>
                          {medicationServices.map((service) => (
                            <FormControlLabel
                              key={service.id}
                              value={service.id.toString()}
                              control={<Radio />}
                              label={
                                <Box>
                                  <Typography variant="body1">
                                    {service.name}{" "}
                                    {service.base_fee
                                      ? ` ($${parseFloat(
                                          service.base_fee
                                        ).toFixed(2)})`
                                      : ""}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {service.description}
                                  </Typography>
                                </Box>
                              }
                              sx={{ mr: 2 }}
                            />
                          ))}
                          
                          <FormControlLabel
                            value=""
                            control={<Radio />}
                            label="Other (Specify Below)"
                          />
                        </Field>
                      </FormControl>
                    </Grid>
                  )}

                  <Grid>
                    <Field
                      component={FormikTextField}
                      name="medication_details"
                      label="Medication Name & Dosage *"
                      required
                      fullWidth
                      variant="outlined"
                      helperText="e.g., Lisinopril 10mg, once daily"
                    />
                  </Grid>

                  <Grid>
                    <Field
                      component={FormikTextField}
                      name="notes"
                      label="Additional Notes (e.g., preferred pharmacy, reason for request)"
                      multiline
                      rows={3}
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
                      disabled={isSubmitting}
                      startIcon={
                        isSubmitting ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SendIcon />
                        )
                      }
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : "Submit Medication Request"}
                    </Button>
                  </Grid>
                  </Stack>
                </Grid>
              </Paper>
            </Form>
          )}
        </Formik>
      )}
    </Container>
  );
};

export default MedicationPage;