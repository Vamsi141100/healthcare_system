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
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const iconPulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); } `;

const AnimatedBox = styled(Box)(({ theme }) => ({
  animation: `${fadeIn} 1s ease-out forwards`,
}));

const HeroSection = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(10),
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.light,
    0.1
  )} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
  overflow: "hidden",
  borderBottom: `1px solid ${theme.palette.divider}`,
  textAlign: "center",
}));

const PulsingIcon = styled(MedicalServicesIcon)(({ theme }) => ({
  fontSize: 80,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  animation: `${iconPulse} 2.5s infinite ease-in-out`,
  display: "inline-block",
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  boxShadow: theme.shadows[2],
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[8],
    "& .featureIcon": { color: theme.palette.secondary.main },
  },
  animation: `${fadeIn} 1s ease-out forwards`,
  opacity: 0,
}));

const StepItem = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(2),
  animation: `${fadeIn} 1s ease-out forwards`,
  opacity: 0,
}));

const LightBackgroundPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  borderRadius: theme.shape.borderRadius * 1.5,
  maxWidth: "650px",
  margin: "auto",
}));

const TrustBadge = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(2),
}));

const HomePage = () => {
  const theme = useTheme();
  const features = [
    {
      icon: (
        <EventAvailableIcon
          className="featureIcon"
          fontSize="large"
          sx={{ color: "primary.main" }}
        />
      ),
      title: "Book Appointments",
      description: "Easily schedule visits with verified doctors.",
    },
    {
      icon: (
        <VideocamIcon
          className="featureIcon"
          fontSize="large"
          sx={{ color: "secondary.main" }}
        />
      ),
      title: "Telehealth Consults",
      description: "Connect securely via video from anywhere.",
    },
    {
      icon: (
        <LocalPharmacyIcon
          className="featureIcon"
          fontSize="large"
          sx={{ color: "success.main" }}
        />
      ),
      title: "Medication Delivery",
      description: "Get prescriptions filled and delivered.",
    },
    {
      icon: (
        <ScienceIcon
          className="featureIcon"
          fontSize="large"
          sx={{ color: "info.main" }}
        />
      ),
      title: "Lab Tests",
      description: "Order and manage lab tests conveniently.",
    },
  ];

  const howItWorksSteps = [
    {
      icon: <HowToRegIcon sx={{ fontSize: 50, color: "primary.main" }} />,
      title: "1. Register",
      description: "Create your secure account in minutes.",
    },
    {
      icon: <EditCalendarIcon sx={{ fontSize: 50, color: "secondary.main" }} />,
      title: "2. Book",
      description: "Choose a service, doctor, and time that works for you.",
    },
    {
      icon: <DuoIcon sx={{ fontSize: 50, color: "success.main" }} />,
      title: "3. Consult",
      description:
        "Connect with your provider via telehealth or manage orders.",
    },
  ];

  const trustFeatures = [
    {
      icon: <VerifiedUserIcon color="success" sx={{ fontSize: 40 }} />,
      text: "Verified Providers",
    },
    {
      icon: <ShieldIcon color="info" sx={{ fontSize: 40 }} />,
      text: "Secure Data (HIPAA Focused)",
    },
    {
      icon: <HealthAndSafetyIcon color="primary" sx={{ fontSize: 40 }} />,
      text: "Quality Care Access",
    },
  ];

  return (
    <Box>
      {}
      <HeroSection>
        <Container maxWidth="lg">
          {}
          <Grid
            container
            spacing={4}
            alignItems="center"
            justifyContent="center"
          >
            {}
            <Grid
              sx={{ textAlign: { xs: "center", md: "left" } }}
            >
              {" "}
              {}
              <AnimatedBox>
                {" "}
                {}
                <PulsingIcon sx={{ fontSize: { xs: 60, md: 80 } }} /> {}
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "primary.dark", mb: 2 }}
                >
                  Your Health, Integrated{" "}
                  <EmojiPeopleIcon
                    fontSize="inherit"
                    sx={{ verticalAlign: "middle" }}
                  />
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                  Access appointments, medications, lab results, and
                  telehealth—all in one secure place.
                </Typography>
                {}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "center", md: "flex-start" },
                    gap: 2,
                    mt: 4,
                  }}
                >
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                  >
                    Get Started Now
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="large"
                  >
                    Login
                  </Button>
                </Box>
              </AnimatedBox>
            </Grid>
            {}
            <Grid
              sx={{ display: { xs: "none", md: "block" } }}
            >
              {" "}
              {}
              <AnimatedBox sx={{ animationDelay: "0.2s", opacity: 0 }}>
                {" "}
                {}
                <Box
                  sx={{
                    maxWidth: "550px",
                    margin: "auto",
                    boxShadow: 5,
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src="/images/dummy-hero.jpg"
                    alt="Person engaging with telehealth service on laptop"
                    style={{ display: "block", width: "100%", height: "auto" }}
                  />
                </Box>
              </AnimatedBox>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "background.default" }}>
        {" "}
        {}
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 6 }}
          >
            Everything You Need, All In One Place
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid
                key={feature.title}
                sx={{ display: "flex" }}
              >
                {" "}
                {}
                <FeatureCard
                  sx={{
                    animationDelay: `${0.5 + index * 0.15}s`,
                    width: "100%",
                  }}
                >
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ flexGrow: 1, mb: 2 }}
                  >
                    {" "}
                    {}
                    {feature.description}
                  </Typography>
                  {}
                  {}
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          bgcolor: alpha(theme.palette.secondary.main, 0.05),
        }}
      >
        {" "}
        {}
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 6 }}
          >
            Simple Steps to Better Health
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {howItWorksSteps.map((step, index) => (
              <Grid key={step.title}>
                <StepItem sx={{ animationDelay: `${0.7 + index * 0.2}s` }}>
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

      {}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "background.paper" }}>
        <Container maxWidth="sm">
          {" "}
          {}
          <Typography
            variant="h5"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: "medium", mb: 4 }}
          >
            Built on Trust & Security
          </Typography>
          <Grid container spacing={2} justifyContent="space-around">
            {trustFeatures.map((item, index) => (
              <Grid key={index}>
                <TrustBadge>
                  {item.icon}
                  <Typography variant="body2" fontWeight="medium">
                    {item.text}
                  </Typography>
                </TrustBadge>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          bgcolor: "background.default",
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <LightBackgroundPaper elevation={1}>
            {" "}
            {}
            <Typography
              variant="h6"
              component="p"
              sx={{ fontStyle: "italic", color: "primary.dark" }}
            >
              "Finally, managing healthcare online feels simple and intuitive.
              Health Hub is a lifesaver!" 😊
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1.5, color: "primary.dark", fontWeight: "medium" }}
            >
              - Happy User (Demo)
            </Typography>
          </LightBackgroundPaper>
        </Container>
      </Box>

      {}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          textAlign: "center",
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
            {" "}
            {}
            Ready to simplify your healthcare?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Join thousands of others managing their health effectively online.
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
          >
            Sign Up Today for Free
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;