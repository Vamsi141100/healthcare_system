import React, { useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login, reset, fetchUserProfile } from "../features/auth/authSlice";
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
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoadingSpinner from "../components/common/LoadingSpinner";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess || user) {
      if (user && !user.profile) {
        dispatch(fetchUserProfile());
      }
      navigate("/dashboard");
    }
  }, [user, isError, isSuccess, navigate, dispatch]);

  const handleFocus = () => {
    if (isError || message) {
      dispatch(reset());
    }
  };

  const handleSubmit = (values) => {
    dispatch(login(values));
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
        <LockOutlinedIcon
          sx={{
            m: 1,
            bgcolor: "secondary.main",
            p: 1,
            borderRadius: "50%",
            color: "white",
          }}
        />
        <Typography component="h1" variant="h5">
          Sign in{" "}
          <span role="img" aria-label="wave">
            👋
          </span>
        </Typography>

        {isLoading && <LoadingSpinner />}
        {isError && message && (
          <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
            {message}
          </Alert>
        )}

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form noValidate>
              <Box sx={{ mt: 1 }}>
                <Field
                  component={FormikTextField}
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  onFocus={handleFocus}
                />
                <Field
                  component={FormikTextField}
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  onFocus={handleFocus}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
                <Grid container justifyContent="center" alignItems="center">
                  
                  <Grid>
                    <Link component={RouterLink} to="/register" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default LoginPage;