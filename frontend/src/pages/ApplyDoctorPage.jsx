import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField as FormikTextField } from "formik-mui";
import {
  Container,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import applicationService from "../services/applicationService";
import { useSnackbar } from "notistack";

const ApplicationSchema = Yup.object().shape({
  specialization: Yup.string().required("Specialization is required"),
  bio: Yup.string()
    .required("Please provide a brief bio")
    .max(1000, "Bio is too long"),
  document: Yup.mixed()
    .required("Verification document (e.g., license, degree) is required")
    .test(
      "fileSize",
      "File too large (Max 10MB)",
      (value) => !value || (value && value.size <= 10 * 1024 * 1024)
    )
    .test(
      "fileType",
      "Unsupported File Format (PDF, JPG, PNG, DOCX)",
      (value) =>
        !value ||
        (value &&
          [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/zip",
          ].includes(value.type))
    ),
});

const ApplyDoctorPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitError("");
    setSubmitting(true);

    const formData = new FormData();
    formData.append("specialization", values.specialization);
    formData.append("bio", values.bio);
    formData.append("document", values.document);
    formData.append("applying_for_role", "doctor");

    try {
      await applicationService.submitApplication(formData);
      enqueueSnackbar(
        "Application submitted successfully! You will be notified once it's reviewed.",
        { variant: "success" }
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Application Submission Error:", error);
      const message =
        error.response?.data?.message ||
        "Application submission failed. Please check your input and try again.";
      setSubmitError(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Apply for Doctor/Provider Role
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Please fill out the form below and upload necessary verification
        documents (e.g., medical license, certifications). Your application will
        be reviewed by an administrator. 🧑‍⚕️
      </Typography>

      <Formik
        initialValues={{
          specialization: "",
          bio: "",
          document: null,
        }}
        validationSchema={ApplicationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, errors, touched, values }) => (
          <Form noValidate encType="multipart/form-data">
            {" "}
            <Grid container spacing={3} justifyContent="center" alignItems="center">
              <Stack spacing={3}>
                <Grid>
                  <Field
                    component={FormikTextField}
                    name="specialization"
                    label="Your Specialization *"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid>
                  <Field
                    component={FormikTextField}
                    name="bio"
                    label="Brief Bio / Professional Summary *"
                    multiline
                    rows={5}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid>
                  <Typography variant="subtitle1" gutterBottom>
                    Verification Document *
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<UploadFileIcon />}
                    sx={{ mb: 1 }}
                  >
                    Upload File (PDF, JPG, PNG, DOCX, ZIP - Max 10MB)
                    <input
                      type="file"
                      hidden
                      name="document"
                      onChange={(event) => {
                        setFieldValue("document", event.currentTarget.files[0]);
                      }}
                    />
                  </Button>

                  {values.document && (
                    <Typography variant="body2">
                      Selected: {values.document.name}
                    </Typography>
                  )}

                  {touched.document && errors.document && (
                    <Typography color="error" variant="caption" display="block">
                      {errors.document}
                    </Typography>
                  )}
                </Grid>

                {submitError && (
                  <Grid>
                    <Alert severity="error">{submitError}</Alert>
                  </Grid>
                )}

                <Grid>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    size="large"
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </Grid>
              </Stack>
            </Grid>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default ApplyDoctorPage;