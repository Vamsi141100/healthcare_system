import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Container, Typography, Button, Grid, CircularProgress, Alert, Paper, Input, Stack
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { TextField as FormikTextField, Select as FormikSelect } from "formik-mui";
import insuranceService from "../services/insuranceService";
import { useSnackbar } from "notistack";
import { MenuItem, InputLabel, FormControl } from "@mui/material";

const ClaimSchema = Yup.object().shape({
    provider_name: Yup.string().required("Insurance provider is required"),
    policy_number: Yup.string().required("Policy / Member ID is required"),
    insured_name: Yup.string().required("Full name of the insured is required"),
    insured_dob: Yup.date().required("Insured Date of Birth is required").max(new Date(), "Date of birth cannot be in the future."),
    insured_sex: Yup.string().required("Sex of the insured is required"),
    invoice: Yup.mixed().required("An invoice document is required."),
    insurance_card_front: Yup.mixed().required("A copy of the insurance card is required."),
    government_id: Yup.mixed().required("A copy of a government-issued ID is required."),
});

const InsuranceClaimPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [submitError, setSubmitError] = useState("");

     const handleSubmit = async (values, { setSubmitting }) => {
        setSubmitError("");
        setSubmitting(true);

        const formData = new FormData();
        Object.keys(values).forEach(key => {
            formData.append(key, values[key]);
        });

        try {
            await insuranceService.submitClaim(appointmentId, formData);
            enqueueSnackbar("Claim submitted successfully!", { variant: 'success' });
            navigate(`/appointments/${appointmentId}`);
        } catch (error) {
            const message = error.response?.data?.message || "Claim submission failed.";
            setSubmitError(message);
            enqueueSnackbar(message, { variant: 'error' });
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Submit Insurance Claim for Appointment #{appointmentId}
            </Typography>
            <Paper sx={{p:3}}>
                <Formik
                    initialValues={{
                        provider_name: "", policy_number: "", plan_type: "",
                        insured_name: "", insured_dob: "", insured_sex: "",
                        relationship_to_patient: "", invoice: null,
                        insurance_card_front: null, government_id: null,
                    }}
                    validationSchema={ClaimSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, setFieldValue, errors, touched, values }) => (
                        <Form>
                           <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Field component={FormikTextField} name="provider_name" label="Insurance Provider *" fullWidth />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                     <Field component={FormikTextField} name="policy_number" label="Policy / Member ID *" fullWidth />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                     <Field component={FormikTextField} name="plan_type" label="Plan Type (e.g., PPO, HMO)" fullWidth />
                                </Grid>
                                 <Grid item xs={12} sm={6}>
                                    <Field component={FormikTextField} name="insured_name" label="Insured's Full Name *" fullWidth />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Field component={FormikTextField} name="insured_dob" label="Insured's Date of Birth *" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                     <FormControl fullWidth>
                                        <InputLabel id="sex-label">Sex *</InputLabel>
                                        <Field component={FormikSelect} name="insured_sex" labelId="sex-label" label="Sex *">
                                            <MenuItem value="Male">Male</MenuItem>
                                            <MenuItem value="Female">Female</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </Field>
                                     </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                     <Field component={FormikTextField} name="relationship_to_patient" label="Relationship to Patient (if not self)" fullWidth />
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <Button variant="outlined" component="label" fullWidth startIcon={<UploadFileIcon />}>
                                        Upload Invoice *
                                        <input type="file" hidden onChange={(e) => setFieldValue("invoice", e.currentTarget.files[0])} />
                                    </Button>
                                    {values.invoice && <Typography variant="caption">{values.invoice.name}</Typography>}
                                     {touched.invoice && errors.invoice && <Typography color="error" variant="caption" display="block">{errors.invoice}</Typography>}
                                </Grid>
                                 <Grid item xs={12} sm={4}>
                                    <Button variant="outlined" component="label" fullWidth startIcon={<UploadFileIcon />}>
                                        Upload Insurance Card *
                                        <input type="file" hidden onChange={(e) => setFieldValue("insurance_card_front", e.currentTarget.files[0])} />
                                    </Button>
                                    {values.insurance_card_front && <Typography variant="caption">{values.insurance_card_front.name}</Typography>}
                                    {touched.insurance_card_front && errors.insurance_card_front && <Typography color="error" variant="caption" display="block">{errors.insurance_card_front}</Typography>}
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Button variant="outlined" component="label" fullWidth startIcon={<UploadFileIcon />}>
                                        Upload Government ID *
                                        <input type="file" hidden onChange={(e) => setFieldValue("government_id", e.currentTarget.files[0])} />
                                    </Button>
                                     {values.government_id && <Typography variant="caption">{values.government_id.name}</Typography>}
                                     {touched.government_id && errors.government_id && <Typography color="error" variant="caption" display="block">{errors.government_id}</Typography>}
                                </Grid>
                                <Grid item xs={12}>
                                {submitError && <Alert severity="error">{submitError}</Alert>}
                                </Grid>
                                 <Grid item xs={12}>
                                <Button type="submit" variant="contained" disabled={isSubmitting}>
                                    {isSubmitting ? <CircularProgress size={24} /> : "Submit Claim"}
                                </Button>
                                </Grid>
                            </Grid>
                        </Form>
                    )}
                </Formik>
            </Paper>
        </Container>
    );
};
export default InsuranceClaimPage;