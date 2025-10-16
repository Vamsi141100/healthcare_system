import React, { useState, useEffect, useCallback } from "react";
import appointmentService from "../services/appointmentService";
import labService from "../services/labService";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Stack,
} from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import SendIcon from "@mui/icons-material/Send";
import { useSnackbar } from "notistack";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField as FormikTextField } from "formik-mui";

const LabOrderSchema = Yup.object().shape({
  service_id: Yup.string().required("Please select a lab test"),
  order_details: Yup.string().max(500, "Notes cannot exceed 500 characters"),
});

const LabTestPage = () => {
  const [labServices, setLabServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const fetchLabServices = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const services = await appointmentService.getServices("Lab Test");
      setLabServices(services || []);
      if (!services || services.length === 0) {
        setFetchError("No lab tests are currently available.");
      }
    } catch (error) {
      console.error("Error fetching lab services:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Could not load available lab tests.";
      setFetchError(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchLabServices();
  }, [fetchLabServices]);

  const handleSubmit = async (
    values,
    { setSubmitting, setFieldError, resetForm }
  ) => {
    setSubmitting(true);
    setFieldError("general", "");
    try {
      const orderData = {
        service_id: parseInt(values.service_id, 10),
        order_details: values.order_details,
      };
      const result = await labService.orderTest(orderData);
      enqueueSnackbar(result.message || "Lab test ordered successfully!", {
        variant: "success",
      });
      resetForm();
    } catch (error) {
      console.error("Lab Order Error:", error);
      const message =
        error?.response?.data?.message || "Failed to submit lab test order.";
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
        <ScienceIcon sx={{ mr: 1 }} /> Request Lab Tests
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Select a lab test and provide any specific notes. Our team will contact
        you for scheduling.
      </Typography>

      {isLoading && <CircularProgress />}
      {fetchError && !isLoading && <Alert severity="error">{fetchError}</Alert>}

      {!isLoading && labServices.length > 0 && (
        <Formik
          initialValues={{ service_id: "", order_details: "" }}
          validationSchema={LabOrderSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values, errors, touched }) => (
            <Form noValidate>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Grid container spacing={3} justifyContent="center" alignItems="center">
                    <Stack spacing={3}>
                  <Grid>
                    <FormControl
                      component="fieldset"
                      fullWidth
                      error={touched.service_id && !!errors.service_id}
                    >
                      <FormLabel component="legend" required>
                        Select Lab Test
                      </FormLabel>
                      <Field
                        as={RadioGroup}
                        aria-label="lab-test-service"
                        name="service_id"
                        row
                      >
                        {labServices.map((service) => (
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
                            sx={{ width: "100%", mb: 1 }}
                          />
                        ))}
                      </Field>
                      {touched.service_id && errors.service_id && (
                        <Typography
                          color="error"
                          variant="caption"
                          sx={{ mt: 1 }}
                        >
                          {errors.service_id}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid>
                    <Field
                      component={FormikTextField}
                      name="order_details"
                      label="Additional Notes / Instructions (Optional)"
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
                      disabled={isSubmitting || !values.service_id}
                      startIcon={
                        isSubmitting ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SendIcon />
                        )
                      }
                    >
                      {isSubmitting ? "Submitting..." : "Submit Lab Request"}
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

export default LabTestPage;