import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { TextField as FormikTextField, Select as FormikSelect } from 'formik-mui';

const UserEditSchema = Yup.object().shape({
    name: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    role: Yup.string().oneOf(['patient', 'doctor', 'admin']).required('Role is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        
});

const UserEditModal = ({ open, onClose, user, onSave }) => {

    const handleSubmit = (values) => {
        
        const dataToSave = { ...values };
        if (!dataToSave.password) {
            delete dataToSave.password;
        }
        onSave(user.id, dataToSave);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit User: {user?.name || ''}</DialogTitle>
            <Formik
                initialValues={{
                    name: user?.name || '',
                    email: user?.email || '',
                    role: user?.role || 'patient',
                    password: '', 
                }}
                validationSchema={UserEditSchema}
                onSubmit={handleSubmit}
                enableReinitialize 
            >
                {({ isSubmitting }) => (
                    <Form>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Field
                                        component={FormikTextField}
                                        name="name"
                                        label="Full Name"
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                     <Field
                                        component={FormikTextField}
                                        name="email"
                                        label="Email Address"
                                        type="email"
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sx={{ display: 'none' }}>
                                    <FormControl fullWidth>
                                        <InputLabel id="role-select-label">Role</InputLabel>
                                        <Field
                                            component={FormikSelect}
                                            name="role"
                                            labelId="role-select-label"
                                            label="Role"
                                            required
                                        >
                                            <MenuItem value="patient">Patient</MenuItem>
                                            <MenuItem value="doctor">Doctor</MenuItem>
                                            <MenuItem value="admin">Admin</MenuItem>
                                        </Field>
                                     </FormControl>
                                </Grid>
                                 <Grid item xs={12}>
                                     <Field
                                        component={FormikTextField}
                                        name="password"
                                        label="New Password"
                                        type="password"
                                        fullWidth
                                        helperText="Leave blank to keep the current password"
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
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

export default UserEditModal;