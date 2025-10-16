import React, { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Container, Typography, Box, Button, CircularProgress } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useSnackbar } from 'notistack';

const PaymentSuccessPage = () => {
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        enqueueSnackbar('Payment successful! Your appointment is confirmed.', { variant: 'success' });
    }, [enqueueSnackbar]);

  return (
    <Container component="main" maxWidth="sm" sx={{ textAlign: "center", mt: 8 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }} >
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
          Payment Successful!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Your payment has been processed and your appointment is confirmed.
        </Typography>

        <Button component={RouterLink} to="/dashboard" variant="contained" size="large">
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default PaymentSuccessPage;