import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Container, Typography, Box, Button } from "@mui/material";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";

const NotFoundPage = () => {
  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{ textAlign: "center", mt: 8 }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <SentimentVeryDissatisfiedIcon
          sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
        />
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          404 - Page Not Found
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Oops! The page you are looking for does not exist or may have been
          moved. 🛸
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" size="large">
          Go Back Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;