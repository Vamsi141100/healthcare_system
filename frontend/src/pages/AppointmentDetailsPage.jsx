import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import appointmentService from "../services/appointmentService";
import paymentService from "../services/paymentService";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  TextField,
  Stack,
} from "@mui/material";
import Modal from "@mui/material/Modal";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import NotesIcon from "@mui/icons-material/Notes";
import PaymentIcon from "@mui/icons-material/Payment";
import VideocamIcon from "@mui/icons-material/Videocam";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useSnackbar } from "notistack";
import pharmacyService from "../services/pharmacyService";
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import VideoCallSelfHosted from "../components/video/VideoCallSelfHosted";
import { Link as RouterLink } from "react-router-dom";

const AppointmentDetailsPage = () => {
  const { id: appointmentId } = useParams();
  const { user, profile } = useSelector((state) => state.auth);
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const [doctorNotes, setDoctorNotes] = useState("");
  const [feeInput, setFeeInput] = useState("");
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [, setIsPaying] = useState(false);
  const fileInputRef = useRef(null);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const fetchAppointmentDetails = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await appointmentService.getAppointmentById(appointmentId);
      setAppointment(data);
      if (user?.role === "doctor" && data) {
        setDoctorNotes(data.doctor_notes || "");
        setFeeInput(data.fee || "");
      }
    } catch (err) {
      console.error("Fetch Appointment Detail Error:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to load appointment details.";
      setError(message);
      enqueueSnackbar(message, { variant: "error" });
      if (err.response?.status === 404 || err.response?.status === 403) {
      }
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId, user?.role, enqueueSnackbar]);

  const fetchPharmacies = useCallback(async () => {
      try {
          const data = await pharmacyService.getPharmacies();
          setPharmacies(data || []);
      } catch(err) {
          enqueueSnackbar('Could not load pharmacies', { variant: 'error' });
      }
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails();
      if(profile?.role === 'doctor'){
        fetchPharmacies();
      }
    }
  }, [appointmentId, fetchAppointmentDetails, fetchPharmacies, profile?.role]);

  const isDoctorView =
    user?.role === "doctor" &&
    appointment?.doctor_profile_id === user?.profile?.id;
  const isPatientView =
    user?.role === "patient" && appointment?.patient_id === user?.id;

  const canJoinVideo =
    appointment &&
    appointment.status === "confirmed" && 
    (isDoctorView || (isPatientView && appointment.payment_status === "paid"));
  const handleLeaveCall = () => {
    setShowVideoCall(false);
    enqueueSnackbar("Left the video call", { variant: "info" });
    fetchAppointmentDetails(); 
  };

  const handleDoctorUpdate = async (fieldData) => {
    if (!isDoctorView) return;
    setIsUpdating(true);
    try {
      const updatedApp = await appointmentService.updateAppointment(
        appointmentId,
        fieldData
      );
      setAppointment(updatedApp);
      if (fieldData.doctor_notes !== undefined)
        setDoctorNotes(updatedApp.doctor_notes || "");
      if (fieldData.fee !== undefined) setFeeInput(updatedApp.fee || "");
      enqueueSnackbar("Appointment updated successfully", {
        variant: "success",
      });
      fetchAppointmentDetails();
    } catch (err) {
      console.error("Update Appointment Error:", err);
      enqueueSnackbar(err.response?.data?.message || "Update failed", {
        variant: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrescriptionChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setPrescriptionFile(event.target.files[0]);
    }
  };

  const handlePrescriptionUpload = async () => {
    if (!isDoctorView || !prescriptionFile) return;
    setIsUpdating(true);
    const formData = new FormData();
    formData.append("prescription", prescriptionFile);
    if (selectedPharmacy) {
      formData.append("pharmacy_id", selectedPharmacy);
    }

    try {
      await appointmentService.uploadPrescription(appointmentId, formData);
      enqueueSnackbar("Prescription uploaded successfully", {
        variant: "success",
      });
      setPrescriptionFile(null);
      setSelectedPharmacy('');
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchAppointmentDetails();
    } catch (err) {
      console.error("Upload Prescription Error:", err);
      enqueueSnackbar(err.response?.data?.message || "Upload failed", {
        variant: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePayment = async () => {
    if (!isPatientView) return;
    setIsPaying(true);
    try {
      const session = await paymentService.createCheckoutSession(appointmentId);
      
      window.location.href = session.url;
    } catch (error) {
      console.error("Payment Error:", error);
      const message =
        error?.response?.data?.message || "Payment failed. Please try again.";
      enqueueSnackbar(message, { variant: "error" });
      setIsPaying(false);
    }
  };

  if (isLoading)
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  if (error)
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  if (!appointment)
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="warning">Appointment data not found.</Alert>
      </Container>
    );

  const canPatientPay =
    profile &&
    isPatientView &&
    appointment.status !== "cancelled" &&
    appointment.status !== "completed" &&
    appointment.payment_status === "unpaid" &&
    appointment.fee > 0;
  const showMeetingLink =
    appointment.meeting_link &&
    ((profile && isDoctorView) ||
      (profile && isPatientView && appointment.payment_status === "paid"));
  const canDoctorUploadPrescription =
    profile &&
    isDoctorView &&
    ["confirmed", "completed"].includes(appointment.status) &&
    !appointment.prescription_path;
  const canDoctorComplete =
    profile && isDoctorView && appointment.status === "confirmed";
  const canDoctorSetFee =
    profile &&
    isDoctorView &&
    (!appointment.fee || appointment.fee <= 0) &&
    ["pending", "confirmed"].includes(appointment.status);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Appointment Details #{appointment.id}
      </Typography>

      <Grid container  justifyContent="center" alignItems="center">
        <Stack>
          <Grid>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <EventIcon sx={{ mr: 1 }} /> Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography>
                  <strong>Service:</strong>{" "}
                  {appointment.service_name || "Consultation"}
                </Typography>
                <Typography component="span">
                  <strong>Status:</strong>{" "}
                  <Chip
                    label={appointment.status}
                    size="small"
                    color={
                      appointment.status === "completed"
                        ? "success"
                        : appointment.status === "confirmed"
                        ? "info"
                        : appointment.status === "pending"
                        ? "warning"
                        : "error"
                    }
                  />
                </Typography>
                <Typography>
                  <strong>Scheduled Time:</strong>{" "}
                  {new Date(appointment.scheduled_time).toLocaleString()}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <PersonIcon sx={{ mr: 1 }} /> Participants
                </Typography>
                <Typography component="span">
                  <strong>Patient:</strong> {appointment.patient_name} (
                  {appointment.patient_email})
                </Typography>
                <Typography component="span">
                  <strong>Doctor:</strong> {appointment.doctor_name} (
                  {appointment.doctor_email}) -{" "}
                  {appointment.doctor_specialization || "General Practice"}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <NotesIcon sx={{ mr: 1 }} /> Notes
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Patient Notes:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    whiteSpace: "pre-wrap",
                    background: "#f9f9f9",
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  {appointment.patient_notes || "None provided."}
                </Typography>

                {isDoctorView || appointment.doctor_notes ? (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Doctor Notes:
                    </Typography>
                    {isDoctorView ? (
                      <Box
                        sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}
                      >
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          variant="outlined"
                          size="small"
                          value={doctorNotes}
                          onChange={(e) => setDoctorNotes(e.target.value)}
                          placeholder="Add your consultation notes here..."
                          sx={{ flexGrow: 1 }}
                          disabled={isUpdating}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() =>
                            handleDoctorUpdate({ doctor_notes: doctorNotes })
                          }
                          disabled={
                            isUpdating ||
                            doctorNotes === (appointment.doctor_notes || "")
                          }
                        >
                          {isUpdating ? "Saving..." : "Save Notes"}
                        </Button>
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "pre-wrap",
                          background: "#f0f0f0",
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        {appointment.doctor_notes || "No notes added yet."}
                      </Typography>
                    )}
                  </>
                ) : null}
              </CardContent>
            </Card>
          </Grid>

          <Grid>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <PaymentIcon sx={{ mr: 1 }} /> Payment & Meeting
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {canDoctorSetFee ? (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mb: 2,
                      alignItems: "center",
                    }}
                  >
                    <AttachMoneyIcon color="action" />
                    <TextField
                      type="number"
                      label="Set Appointment Fee"
                      variant="outlined"
                      size="small"
                      value={feeInput}
                      onChange={(e) => setFeeInput(e.target.value)}
                      sx={{ flexGrow: 1 }}
                      disabled={isUpdating}
                      slotProps={{ input: { step: "0.01", min: "0" } }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleDoctorUpdate({ fee: feeInput })}
                      disabled={
                        isUpdating || !feeInput || feeInput === appointment.fee
                      }
                    >
                      {isUpdating ? "Saving..." : "Set Fee"}
                    </Button>
                  </Box>
                ) : (
                  <Typography component="span">
                    <strong>Fee:</strong>{" "}
                    {appointment.fee
                      ? `$${parseFloat(appointment.fee).toFixed(2)}`
                      : "Not set"}
                  </Typography>
                )}
                <Typography sx={{ mb: 2 }} component="span">
                  <strong>Payment Status:</strong>{" "}
                  <Chip
                    label={appointment.payment_status}
                    size="small"
                    color={
                      appointment.payment_status === "paid"
                        ? "success"
                        : "warning"
                    }
                  />
                </Typography>

                {canPatientPay && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PaymentIcon />}
                    onClick={handlePayment}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Pay ${parseFloat(appointment.fee).toFixed(2)} Now
                  </Button>
                )}

                {canJoinVideo && !showVideoCall && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<VideocamIcon />}
                    onClick={() => setShowVideoCall(true)}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Join Secure Video Call
                  </Button>
                )}
                {

}

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <MedicalInformationIcon sx={{ mr: 1 }} /> Prescription
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {appointment.prescription_path ? (
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    href={
                      process.env.REACT_APP_API_BASE_URL
                        ? `${process.env.REACT_APP_API_BASE_URL.replace(
                            "/api",
                            ""
                          )}${appointment.prescription_path}`
                        : appointment.prescription_path
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Download Prescription
                  </Button>
                ) : isPatientView ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    No prescription uploaded yet.
                  </Typography>
                ) : null}

                {canDoctorUploadPrescription && (
                  <Box sx={{ mb: 2 }}>
                    
                      <FormControl fullWidth sx={{ mb: 2 }}>
                         <InputLabel id="pharmacy-select-label">Assign to Pharmacy (Optional)</InputLabel>
                         <Select
                           labelId="pharmacy-select-label"
                           value={selectedPharmacy}
                           label="Assign to Pharmacy (Optional)"
                           onChange={(e) => setSelectedPharmacy(e.target.value)}
                        >
                           <MenuItem value=""><em>None</em></MenuItem>
                           {pharmacies.map(p => (
                               <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                          ))}
                         </Select>
                       </FormControl>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<UploadFileIcon />}
                      fullWidth
                      disabled={isUpdating}
                    >
                      Upload Prescription File
                      <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        onChange={handlePrescriptionChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </Button>
                    {prescriptionFile && (
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body2">
                          Selected: {prescriptionFile.name}
                        </Typography>
                        <Button
                          size="small"
                          onClick={handlePrescriptionUpload}
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Uploading..." : "Confirm Upload"}
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}

                { isPatientView && appointment.pharmacy_id && (
                  <Alert severity="info">
                    Prescription sent to pharmacy: <strong>{pharmacies.find(p => p.id === appointment.pharmacy_id)?.name || 'N/A'}</strong>
                  </Alert>
                )}

                {canDoctorComplete && !appointment.prescription_path && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Upload prescription before marking as complete, or mark
                    complete if no prescription needed.
                  </Alert>
                )}

                {isDoctorView && appointment.status === "confirmed" && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleOutlineIcon />}
                    onClick={() => handleDoctorUpdate({ status: "completed" })}
                    fullWidth
                    disabled={isUpdating}
                    sx={{ mt: 1 }}
                  >
                    Mark as Completed
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Stack>
      </Grid>

      {isPatientView && appointment.status === "completed" && (
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            variant="contained"
            color="secondary"
            component={RouterLink}
            to={`/submit-claim/${appointmentId}`}
          >
            File Insurance Claim for this Appointment
          </Button>
        </Box>
      )}

      <Modal open={showVideoCall} >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)", 
            width: { xs: "95vw", sm: "90vw", md: "80vw" }, 
            height: { xs: "80vh", sm: "85vh", md: "90vh" }, 
            maxWidth: "1400px",
            maxHeight: "950px",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: { xs: 0.5, md: 1 },
            outline: "none",
            borderRadius: 1,
            display: "flex", 
          }}
        >
          {}
          {showVideoCall && (
            <VideoCallSelfHosted
              roomName={`appt-${appointmentId}`} 
              onLeaveCall={handleLeaveCall}
            />
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default AppointmentDetailsPage;