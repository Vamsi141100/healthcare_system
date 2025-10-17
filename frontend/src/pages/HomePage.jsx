import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Button,
  Typography,
  Container,
  Box,
  Paper,
  Grid,
  alpha,
  useTheme,
  Icon,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";

import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ScienceIcon from "@mui/icons-material/Science";
import VideocamIcon from "@mui/icons-material/Videocam";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import DuoIcon from "@mui/icons-material/Duo";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ShieldIcon from "@mui/icons-material/Shield";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const iconPulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

const AnimatedBox = styled(Box)({
  animation: `${fadeIn} 1.2s ease-in-out forwards`,
});

const HeroSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(10, 0),
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  textAlign: "center",
}));

const PulsingIcon = styled(MedicalServicesIcon)(({ theme }) => ({
  fontSize: 72,
  marginBottom: theme.spacing(2),
  animation: `${iconPulse} 2s infinite ease-in-out`,
  color: theme.palette.common.white,
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: "center",
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0px 10px 30px -5px rgba(0,0,0,0.1)",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-10px)",
    boxShadow: "0px 20px 40px -10px rgba(0,0,0,0.2)",
  },
}));

const StepItem = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(3),
}));

const TrustBadge = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  padding: theme.spacing(2),
}));

const HomePage = () => {
  const theme = useTheme();
  const features = [
    {
      icon: <EventAvailableIcon fontSize="large" color="primary" />,
      title: "Seamless Booking",
      description: "Schedule appointments with top-tier doctors in just a few clicks.",
    },
    {
      icon: <VideocamIcon fontSize="large" color="secondary" />,
      title: "Virtual Consultations",
      description: "Connect with specialists from the comfort of your home.",
    },
    {
      icon: <LocalPharmacyIcon fontSize="large" color="success" />,
      title: "E-Prescriptions",
      description: "Receive and manage your prescriptions digitally and securely.",
    },
    {
      icon: <ScienceIcon fontSize="large" color="info" />,
      title: "Lab Services",
      description: "Book lab tests and access your results online with ease.",
    },
  ];

  const howItWorksSteps = [
    {
      icon: <HowToRegIcon sx={{ fontSize: 50, color: "primary.main" }} />,
      title: "1. Create Your Account",
      description: "A quick and secure registration to get you started.",
    },
    {
      icon: <EditCalendarIcon sx={{ fontSize: 50, color: "secondary.main" }} />,
      title: "2. Find Your Service",
      description: "Browse through a wide range of medical services and professionals.",
    },
    {
      icon: <DuoIcon sx={{ fontSize: 50, color: "success.main" }} />,
      title: "3. Connect & Manage",
      description: "Engage in telehealth sessions and manage all your health needs.",
    },
  ];

  const trustFeatures = [
    {
      icon: <VerifiedUserIcon color="success" sx={{ fontSize: 40 }} />,
      text: "Verified Healthcare Professionals",
    },
    {
      icon: <ShieldIcon color="info" sx={{ fontSize: 40 }} />,
      text: "Data Security (HIPAA Compliant)",
    },
    {
      icon: <HealthAndSafetyIcon color="primary" sx={{ fontSize: 40 }} />,
      text: "Commitment to Quality Care",
    },
  ];

  return (
    <Box>
      <HeroSection>
        <Container maxWidth="md">
          <AnimatedBox>
            <PulsingIcon />
            <Typography
              variant="h1"
              component="h1"
              sx={{ fontWeight: "bold", mb: 2, fontSize: { xs: '3rem', md: '4.5rem' } }}
            >
              Your Health, Reimagined{" "}
              <EmojiPeopleIcon
                fontSize="inherit"
                sx={{ verticalAlign: "middle" }}
              />
            </Typography>
            <Typography variant="h5" sx={{ mb: 4 }}>
              A unified platform for all your healthcare needs - from
              appointments to prescriptions.
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 4,
              }}
            >
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                color="secondary"
                endIcon={<ArrowForwardIcon />}
              >
                Get Started
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                size="large"
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Sign In
              </Button>
            </Box>
          </AnimatedBox>
        </Container>
      </HeroSection>

      <Box sx={{ py: 10, bgcolor: "background.default" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 8 }}
          >
            A Suite of Integrated Services
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={feature.title} sx={{ display: 'flex' }}>
                <FeatureCard sx={{ width: '100%' }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 10, bgcolor: "background.paper" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 8 }}
          >
            Getting Started is Easy
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {howItWorksSteps.map((step, index) => (
              <Grid item xs={12} md={4} key={step.title}>
                <StepItem>
                  <Box sx={{ mb: 2 }}>{step.icon}</Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepItem>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 8, bgcolor: "background.default" }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: "medium", mb: 4 }}
          >
            Our Commitment to You
          </Typography>
          <Grid container spacing={2} justifyContent="space-around">
            {trustFeatures.map((item, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <TrustBadge>
                  {item.icon}
                  <Typography variant="body1" fontWeight="medium">
                    {item.text}
                  </Typography>
                </TrustBadge>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 10, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Container maxWidth="sm" sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Ready to Take Control of Your Health?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Join our community and experience a seamless healthcare journey.
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
          >
            Sign Up for Free
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;