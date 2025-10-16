import React, { useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { register, reset } from "../features/auth/authSlice";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField as FormikTextField } from "formik-mui";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Link,
  Alert,
  Stack,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LoadingSpinner from "../components/common/LoadingSpinner";

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess) {
      navigate("/login", {
        state: { message: "Registration successful! Please login." },
      });
    }

    if (user) {
      navigate("/dashboard");
    }

    return () => {
      if (isError) dispatch(reset());
    };
  }, [user, isError, isSuccess, navigate, dispatch]);

  const handleSubmit = (values) => {
    const { confirmPassword, ...userData } = values;
    dispatch(register(userData));
  };

  const handleFocus = () => {
    if (isError || message) {
      dispatch(reset());
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <PersonAddIcon
          sx={{
            m: 1,
            bgcolor: "primary.main",
            p: 1,
            borderRadius: "50%",
            color: "white",
          }}
        />
        <Typography component="h1" variant="h5">
          Sign Up ✨
        </Typography>

        {isLoading && <LoadingSpinner />}
        {isError && message && (
          <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
            {message}
          </Alert>
        )}
        
        

        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form noValidate>
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Stack spacing={3}>
                  <Grid>
                    <Field
                      component={FormikTextField}
                      name="name"
                      required
                      fullWidth
                      id="name"
                      label="Full Name"
                      autoFocus
                      onFocus={handleFocus}
                    />
                  </Grid>
                  <Grid>
                    <Field
                      component={FormikTextField}
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      onFocus={handleFocus}
                    />
                  </Grid>
                  <Grid>
                    <Field
                      component={FormikTextField}
                      required
                      fullWidth
                      name="password"
                      label="Password (min 6 chars)"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                      onFocus={handleFocus}
                    />
                  </Grid>
                  <Grid>
                    <Field
                      component={FormikTextField}
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      id="confirmPassword"
                    />
                  </Grid>
                  </Stack>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Sign Up"}
                </Button>
                <Grid container justifyContent="center" alignItems="center">
                <Stack spacing={3}>
                  <Grid>
                    <Link component={RouterLink} to="/login" variant="body2">
                      Already have an account? Sign in
                    </Link>
                  </Grid>
                  </Stack>
                </Grid>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default RegisterPage;