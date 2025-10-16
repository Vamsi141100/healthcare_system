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
} from "@mui/material";
import { styled } from "@mui/material/styles";

import FavoriteIcon from "@mui/icons-material/Favorite";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import CodeIcon from "@mui/icons-material/Code";
import TerminalIcon from "@mui/icons-material/Terminal";
import StorageIcon from "@mui/icons-material/Storage";
import PaletteIcon from "@mui/icons-material/Palette";

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  marginBottom: theme.spacing(4),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1.5),
  color:
    theme.palette.mode === "dark"
      ? theme.palette.primary.light
      : theme.palette.primary.dark,
}));

const TeamMemberCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  height: "100%",
  backgroundColor: theme.palette.background.default,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  boxShadow: theme.shadows[1],
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[5],
  },
}));

const teamMembers = [
  {
    name: "Jane Doe",
    role: "Lead Developer / Architect",
    imageUrl: "/images/teamMember1.jpg",
  },
  {
    name: "John Smith",
    role: "UX/UI Designer",
    imageUrl: "/images/teamMember2.jpg",
  },
  {
    name: "Alex Adams",
    role: "Senior Backend Engineer",
    imageUrl: "/images/teamMember3.jpg",
  },
  {
    name: "Sarah Brown",
    role: "Project Manager / Scrum Master",
    imageUrl: "/images/teamMember4.jpg",
  },
  {
    name: "Mike Chen",
    role: "DevOps & Cloud Specialist",
    imageUrl: "/images/teamMember5.jpg",
  },
];

const AboutUsPage = () => {
  const theme = useTheme();
  return (
    <Box sx={{ bgcolor: "background.paper" }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: 6 }}>
        {}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color:
                theme.palette.mode === "dark"
                  ? theme.palette.primary.light
                  : theme.palette.primary.dark,
            }}
          >
            About Health Hub{" "}
            <FavoriteIcon
              color="error"
              sx={{ fontSize: "inherit", verticalAlign: "middle", ml: 0.5 }}
            />
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: "750px", margin: "auto" }}
          >
            Integrating healthcare services for a seamless patient experience,
            right from your home.
          </Typography>
        </Box>

        {}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 6,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          {" "}
          {}
          <Grid container spacing={5} alignItems="center" justifyContent="center">
            {}
            <Grid>
              <Box>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  sx={{
                    fontWeight: "medium",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <LightbulbIcon color="primary" /> Our Mission
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  {" "}
                  {}
                  To revolutionize healthcare access in the United States by
                  leveraging technology. We aim to provide a comprehensive,
                  user-friendly platform that integrates essential services –
                  from telehealth and medication delivery to lab tests and
                  personal health record management.
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  We believe managing your health should be convenient,
                  efficient, and empowering. Health Hub connects patients with
                  providers seamlessly, putting control back into your hands.
                  🏡💻💊
                </Typography>
              </Box>
              {}
              <Box sx={{ mt: 4 }}>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  sx={{
                    fontWeight: "medium",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <VisibilityIcon color="secondary" /> Our Vision
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  To be the most trusted and accessible digital health platform,
                  empowering individuals nationwide to proactively manage their
                  well-being through integrated, personalized care.
                </Typography>
              </Box>
            </Grid>
            {}
            <Grid sx={{ textAlign: "center" }} spacing={4} justifyContent="center">
              <Box sx={{ borderRadius: 2, overflow: "hidden", boxShadow: 3 }}>
                <img
                  src="/images/dummy-team.jpg"
                  alt="Illustrative concept of connected healthcare"
                  style={{ display: "block", width: "100%", height: "auto" }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {}
        <Box sx={{ mb: 6 }}>
          <SectionTitle variant="h4" component="h2">
            <Diversity3Icon /> Meet Our Team
          </SectionTitle>
          {}
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 5, maxWidth: "700px", margin: "auto" }}
          >
            We are a dedicated group of developers, designers, and healthcare
            enthusiasts passionate about improving access to care through
            technology.
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member) => (
              <Grid key={member.name} sx={{ display: "flex" }} spacing={4} justifyContent="center">
                {" "}
                {}
                <TeamMemberCard variant="outlined">
                  {}
                  <Avatar
                    src={member.imageUrl}
                    alt={`Photo of ${member.name}`}
                    sx={{
                      width: { xs: 90, md: 120 },
                      height: { xs: 90, md: 120 },
                      margin: "auto",
                      mb: 2,
                      border: `3px solid ${theme.palette.primary.main}`,
                      boxShadow: theme.shadows[3],
                    }}
                  />
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontWeight: "medium" }}
                  >
                    {member.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.role}
                  </Typography>
                </TeamMemberCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {}
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            bgcolor: alpha(theme.palette.secondary.main, 0.05),
            borderRadius: 2,
          }}
        >
          <SectionTitle variant="h5" component="h2">
            Our Technology Stack
          </SectionTitle>
          <Grid container spacing={2} justifyContent="center">
            <Grid
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              <CodeIcon color="primary" /> <Typography>React</Typography>
            </Grid>
            <Grid
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              <TerminalIcon color="success" /> <Typography>Node.js</Typography>
            </Grid>
            <Grid
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              <StorageIcon sx={{ color: "#00758F" }} />{" "}
              <Typography>MySQL</Typography> {}
            </Grid>
            <Grid
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
              }}
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