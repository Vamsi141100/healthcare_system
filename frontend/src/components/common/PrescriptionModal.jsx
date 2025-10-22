import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import {
    Modal, Box, Typography, Button, Stack, IconButton, Grid, Select, FormControl, InputLabel, MenuItem, Paper
} from '@mui/material';
import { TextField as FormikTextField } from 'formik-mui';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const PrescriptionSchema = Yup.object().shape({
    medications: Yup.array()
        .of(
            Yup.object().shape({
                medication: Yup.string().required('Medication name is required'),
                dosage: Yup.string().required('Dosage is required'),
                frequency: Yup.string().required('Frequency is required'),
                duration: Yup.string().required('Duration is required'),
            })
        )
        .min(1, 'At least one medication is required.'),
    pharmacy_id: Yup.string(), 
});

const PrescriptionModal = ({ open, onClose, onSubmit, pharmacies }) => {
     return (
        <Modal open={open} onClose={onClose}>
             <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: {xs: '90%', sm: 600}, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
                 <Typography variant="h6" component="h2" sx={{ mb: 2 }}>Create Prescription</Typography>
                 <Formik
                    initialValues={{
                        medications: [{ medication: '', dosage: '', frequency: '', duration: '' }],
                        pharmacy_id: '',
                    }}
                    validationSchema={PrescriptionSchema}
                    onSubmit={onSubmit}
                 >
                     {({ values, isSubmitting }) => (
                         <Form>
                             <FieldArray name="medications">
                                 {({ push, remove }) => (
                                     <Stack spacing={2} sx={{ mb: 2 }}>
                                         {values.medications.map((med, index) => (
                                             <Paper key={index} variant="outlined" sx={{ p: 2, position: 'relative' }}>
                                                 <Grid container spacing={1}>
                                                     <Grid item xs={12} sm={6}>
                                                         <Field component={FormikTextField} name={`medications[${index}].medication`} label="Medication" size="small" fullWidth />
                                                     </Grid>
                                                      <Grid item xs={12} sm={6}>
                                                         <Field component={FormikTextField} name={`medications[${index}].dosage`} label="Dosage" size="small" fullWidth />
                                                     </Grid>
                                                      <Grid item xs={12} sm={6}>
                                                         <Field component={FormikTextField} name={`medications[${index}].frequency`} label="Frequency" size="small" fullWidth />
                                                     </Grid>
                                                     <Grid item xs={12} sm={6}>
                                                         <Field component={FormikTextField} name={`medications[${index}].duration`} label="Duration" size="small" fullWidth />
                                                     </Grid>
                                                 </Grid>
                                                 {index > 0 && (
                                                    <IconButton onClick={() => remove(index)} size="small" sx={{ position: 'absolute', top: 5, right: 5 }}>
                                                         <RemoveCircleOutlineIcon color="error"/>
                                                    </IconButton>
                                                 )}
                                             </Paper>
                                         ))}
                                         <Button
                                             type="button"
                                             onClick={() => push({ medication: '', dosage: '', frequency: '', duration: '' })}
                                             startIcon={<AddCircleOutlineIcon />}
                                         >
                                             Add Another Medication
                                         </Button>
                                     </Stack>
                                 )}
                             </FieldArray>

                             <FormControl fullWidth sx={{mt: 2, mb: 2}}>
                                <InputLabel id="pharmacy-select-label">Assign Pharmacy (Optional)</InputLabel>
                                <Field
                                    as={Select}
                                    name="pharmacy_id"
                                    labelId="pharmacy-select-label"
                                    label="Assign Pharmacy (Optional)"
                                >
                                    <MenuItem value=""><em>None (Patient will handle)</em></MenuItem>
                                    {pharmacies.map(p => (
                                        <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                    ))}
                                </Field>
                            </FormControl>

                            <Button type="submit" variant="contained" disabled={isSubmitting}>
                                Generate & Send Prescription
                            </Button>
                         </Form>
                     )}
                 </Formik>
            </Box>
        </Modal>
    );
};

export default PrescriptionModal;