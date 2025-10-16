import React, { useState, useEffect, useCallback } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField as FormikTextField } from "formik-mui";
import {
  Container,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import supportService from "../services/supportService";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import SendIcon from "@mui/icons-material/Send";
import HistoryIcon from "@mui/icons-material/History";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import { useSnackbar } from "notistack";

const SupportSchema = Yup.object().shape({
  subject: Yup.string()
    .required("Subject is required")
    .max(100, "Subject too long"),
  question: Yup.string()
    .required("Please describe your issue or question")
    .max(2000, "Question too long"),
});

const SupportPage = () => {
  const [myTickets, setMyTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const fetchMyTickets = useCallback(async () => {
    setIsLoadingTickets(true);
    setFetchError("");
    try {
      const data = await supportService.getMyTickets();
      setMyTickets(data || []);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      const message =
        error.response?.data?.message || "Failed to load your support tickets.";
      setFetchError(message);
    } finally {
      setIsLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      await supportService.submitTicket(values);
      enqueueSnackbar("Support ticket submitted successfully!", {
        variant: "success",
      });
      resetForm();
      fetchMyTickets();
    } catch (error) {
      console.error("Ticket Submission Error:", error);
      const message =
        error.response?.data?.message || "Failed to submit ticket.";
      setSubmitError(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <ErrorOutlineIcon color="error" />;
      case "answered":
        return <QuestionAnswerIcon color="info" />;
      case "closed":
        return <CheckCircleOutlineIcon color="success" />;
      default:
        return <ContactSupportIcon />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Help & Support Center ❓
      </Typography>

      <Grid
        container
        spacing={4}
        justifyContent="center" alignItems="center"
      >
        <Stack spacing={3}>
          <Grid>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Submit a New Ticket
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Describe your issue, and our support team will get back to you.
              </Typography>
              <Formik
                initialValues={{ subject: "", question: "" }}
                validationSchema={SupportSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form noValidate>
                    <Grid container spacing={2} justifyContent="center" alignItems="center">
                      <Stack spacing={3}>
                        <Grid>
                          <Field
                            component={FormikTextField}
                            name="subject"
                            label="Subject *"
                            fullWidth
                            required
                          />
                        </Grid>
                        <Grid>
                          <Field
                            component={FormikTextField}
                            name="question"
                            label="Describe your issue/question *"
                            multiline
                            rows={6}
                            fullWidth
                            required
                          />
                        </Grid>

                        {submitError && (
                          <Grid>
                            <Alert severity="error">{submitError}</Alert>
                          </Grid>
                        )}

                        <Grid>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting}
                            startIcon={
                              isSubmitting ? (
                                <CircularProgress size={20} color="inherit" />
                              ) : (
                                <SendIcon />
                              )
                            }
                          >
                            {isSubmitting ? "Submitting..." : "Submit Ticket"}
                          </Button>
                        </Grid>
                      </Stack>
                    </Grid>
                  </Form>
                )}
              </Formik>
            </Paper>
          </Grid>

          <Grid>
            <Paper
              elevation={2}
              sx={{ p: 3, maxHeight: "600px", overflowY: "auto" }}
            >
              {" "}
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <HistoryIcon sx={{ mr: 1 }} /> Your Ticket History
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {isLoadingTickets && <CircularProgress />}
              {fetchError && !isLoadingTickets && (
                <Alert severity="error">{fetchError}</Alert>
              )}
              {!isLoadingTickets &&
                !fetchError &&
                (myTickets.length === 0 ? (
                  <Typography color="text.secondary">
                    You haven't submitted any support tickets yet.
                  </Typography>
                ) : (
                  <List dense>
                    {myTickets.map((ticket) => (
                      <React.Fragment key={ticket.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemIcon sx={{ mt: 0.5, minWidth: 40 }}>
                            {getStatusIcon(ticket.status)}
                          </ListItemIcon>
                          <ListItemText
                            primary={ticket.subject}
                            secondary={
                              <React.Fragment>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  Status:{" "}
                                  <Chip label={ticket.status} size="small" /> -
                                  Submitted:{" "}
                                  {new Date(
                                    ticket.created_at
                                  ).toLocaleDateString()}
                                </Typography>
                                <br />
                                <strong>Q:</strong>{" "}
                                {ticket.question.substring(0, 100)}
                                {ticket.question.length > 100 ? "..." : ""}
                                {ticket.answer && (
                                  <>
                                    <br />
                                    <strong>A:</strong>{" "}
                                    {ticket.answer.substring(0, 100)}
                                    {ticket.answer.length > 100 ? "..." : ""}
                                  </>
                                )}
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ))}
            </Paper>
          </Grid>
        </Stack>
      </Grid>
    </Container>
  );
};

export default SupportPage;