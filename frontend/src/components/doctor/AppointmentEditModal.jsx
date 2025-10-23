import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid } from '@mui/material';
import { TextField as FormikTextField } from 'formik-mui';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import appointmentService from '../../services/appointmentService';
import { useSnackbar } from 'notistack';

const EditSchema = Yup.object().shape({
    scheduled_time: Yup.date()
        .min(new Date(), 'Cannot schedule an appointment in the past.')
        .required('Appointment time is required.'),
    doctor_notes: Yup.string().max(1000, 'Notes are too long.'),
});

const AppointmentEditModal = ({ open, onClose, appointment, onUpdate }) => {
    const { enqueueSnackbar } = useSnackbar();

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await appointmentService.updateAppointment(appointment.id, {
                scheduled_time: values.scheduled_time,
                doctor_notes: values.doctor_notes,
            });
            enqueueSnackbar('Appointment updated successfully! The patient has been notified of any time change.', { variant: 'success' });
            onUpdate(); 
            onClose();
        } catch (error) {
            enqueueSnackbar(error.response?.data?.message || 'Failed to update appointment.', { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!appointment) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Appointment #{appointment.id}</DialogTitle>
            <Formik
                initialValues={{
                    scheduled_time: new Date(appointment.scheduled_time),
                    doctor_notes: appointment.doctor_notes || '',
                }}
                validationSchema={EditSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting, setFieldValue, values, errors, touched }) => (
                    <Form>
                        <DialogContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                     <LocalizationProvider dateAdapter={AdapterDateFns}>
                                      <DateTimePicker
                                        label="Reschedule Time"
                                        value={values.scheduled_time}
                                        onChange={(newValue) => setFieldValue('scheduled_time', newValue)}
                                        minDateTime={new Date()}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: touched.scheduled_time && !!errors.scheduled_time,
                                                helperText: touched.scheduled_time && errors.scheduled_time,
                                            },
                                        }}
                                      />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        component={FormikTextField}
                                        name="doctor_notes"
                                        label="Doctor Notes"
                                        multiline
                                        rows={4}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={onClose}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

export default AppointmentEditModal;