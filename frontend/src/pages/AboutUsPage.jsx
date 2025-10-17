import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Avatar,
  alpha,
  useTheme,
  Icon,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import FavoriteIcon from "@mui/icons-material/Favorite";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GroupsIcon from "@mui/icons-material/Groups";
import CodeIcon from "@mui/icons-material/Code";
import TerminalIcon from "@mui/icons-material/Terminal";
import StorageIcon from "@mui/icons-material/Storage";
import PaletteIcon from "@mui/icons-material/Palette";
import PaymentsIcon from "@mui/icons-material/Payments";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

const HeaderBox = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(8, 2),
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.9
  )} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(6),
}));

const Section = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  marginBottom: theme.spacing(5),
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1.5),
}));

const TeamMemberCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  height: "100%",
  borderRadius: theme.shape.borderRadius * 2,
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[8],
  },
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(2.5),
  marginBottom: theme.spacing(3),
}));

const teamMembers = [
  {
    name: "Dr. Evelyn Reed",
    role: "CEO & Co-Founder",
    imageUrl: "/images/team-member-1.jpg", 
  },
  {
    name: "Ben Carter",
    role: "CTO & Co-Founder",
    imageUrl: "/images/team-member-2.jpg",
  },
  {
    name: "Maria Garcia",
    role: "Lead Product Designer",
    imageUrl: "/images/team-member-3.jpg",
  },
  {
    name: "David Chen",
    role: "Head of Operations",
    imageUrl: "/images/team-member-4.jpg",
  },
];

const AboutUsPage = () => {
  const theme = useTheme();
  return (
    <Box>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <HeaderBox>
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontWeight: "bold", mb: 2 }}
          >
            A Partner in Your Health Journey
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{ maxWidth: "800px", margin: "auto", opacity: 0.9 }}
          >
            Health Hub is a comprehensive digital health platform designed to
            bridge the gap between patients and providers. We believe managing
            your healthcare should be simple, secure, and accessible from
            anywhere.
          </Typography>
        </HeaderBox>

        {}
        <Section>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 3,
                }}
              >
                <RocketLaunchIcon color="primary" /> Our Mission
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, fontSize: "1.1rem" }}>
                To revolutionize digital healthcare by simplifying its
                complexities. We provide a unified, secure, and user-friendly
                platform that connects patients with the care they need,
                whenever they need it.
              </Typography>
              <Box>
                <FeatureItem>
                  <EventAvailableIcon color="primary" />
                  <Box>
                    <Typography variant="h6">
                      Seamless Appointments & Telehealth
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Find, book, and connect with verified doctors through
                      secure video consultations.
                    </Typography>
                  </Box>
                </FeatureItem>
                <FeatureItem>
                  <LocalPharmacyIcon color="secondary" />
                  <Box>
                    <Typography variant="h6">
                      Integrated Pharmacy Services
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage prescriptions digitally, from issuance to
                      fulfillment at your chosen pharmacy.
                    </Typography>
                  </Box>
                </FeatureItem>
                <FeatureItem>
                  <PaymentsIcon sx={{ color: "success.main" }} />
                  <Box>
                    <Typography variant="h6">Simplified Financials</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Handle payments and submit insurance claims securely
                      through our integrated system.
                    </Typography>
                  </Box>
                </FeatureItem>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: "center" }}>
              <Box
                component="img"
                src="/images/dummy-team.jpg" 
                alt="Connected Healthcare Illustration"
                sx={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 3,
                  boxShadow: 5,
                }}
              />
            </Grid>
          </Grid>
        </Section>

        {}
        <Section sx={{ bgcolor: "background.default", borderRadius: 3, p: { xs: 4, md: 8 } }}>
          <Box sx={{ textAlign: "center", maxWidth: "800px", mx: "auto" }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                mb: 3,
              }}
            >
              <VisibilityIcon color="secondary" /> Our Vision
            </Typography>
            <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
              We envision a future where healthcare is no longer fragmented or
              frustrating. Health Hub is our commitment to that future—a
              digital front door to a network of care built around you. By
              removing administrative burdens, we allow patients to focus on
              what truly matters—their health.
            </Typography>
          </Box>
        </Section>

        {}
        <Section>
          <SectionTitle variant="h3" component="h2">
            <GroupsIcon /> Meet Our Team
          </SectionTitle>
          <Typography
            variant="h6"
            color="text.secondary"
            align="center"
            sx={{ mb: 6, maxWidth: "750px", margin: "auto" }}
          >
            We are a dedicated group of developers, designers, and healthcare
            enthusiasts passionate about improving access to care.
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member) => (
              <Grid item xs={12} sm={6} md={3} key={member.name}>
                <TeamMemberCard>
                  <Avatar
                    src={member.imageUrl}
                    alt={member.name}
                    sx={{
                      width: 120,
                      height: 120,
                      margin: "auto",
                      mb: 2,
                      border: `4px solid ${theme.palette.primary.main}`,
                    }}
                  />
                  <Typography variant="h6" component="h3">
                    {member.name}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    {member.role}
                  </Typography>
                </TeamMemberCard>
              </Grid>
            ))}
          </Grid>
        </Section>

        {}
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            borderTop: `1px solid ${theme.palette.divider}`,
            mt: 4,
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Our Technology Stack
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            <Grid
              item
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <CodeIcon color="primary" /> <Typography>React</Typography>
            </Grid>
            <Grid
              item
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <TerminalIcon color="success" /> <Typography>Node.js</Typography>
            </Grid>
            <Grid
              item
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <StorageIcon sx={{ color: "#00758F" }} />{" "}
              <Typography>MySQL</Typography>
            </Grid>
            <Grid
              item
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <PaletteIcon color="secondary" />{" "}
              <Typography>Material-UI</Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutUsPage;