import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";

import appointmentService from "../services/appointmentService";
import paymentService from "../services/paymentService";
import pharmacyService from "../services/pharmacyService";
import doctorService from "../services/doctorService"; 

import VideoCallSelfHosted from "../components/video/VideoCallSelfHosted";
import PrescriptionModal from '../components/common/PrescriptionModal';

import {
  Container, Typography, Box, Grid, Card, CardContent, Button, CircularProgress, Alert, useTheme,
  TextField, Stack, Modal, alpha, styled, List, ListItem, ListItemText
} from "@mui/material";

import EventIcon from "@mui/icons-material/Event";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import NotesIcon from "@mui/icons-material/Notes";
import PaymentIcon from "@mui/icons-material/Payment";
import VideocamIcon from "@mui/icons-material/Videocam";
import DownloadIcon from "@mui/icons-material/Download";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import PostAddIcon from '@mui/icons-material/PostAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import HistoryIcon from '@mui/icons-material/History';
import { is } from "date-fns/locale";

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
  height: '100%',
}));

const InfoGrid = styled(Grid)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  alignItems: 'center',
  gap: theme.spacing(1, 2),
  '& > .label': {
    fontWeight: 'bold',
  },
}));

const AppointmentDetailsPage = () => {
  
  const { id: appointmentId } = useParams();
  const theme = useTheme();
  const { user, profile } = useSelector((state) => state.auth);
  const { enqueueSnackbar } = useSnackbar();

  const [appointment, setAppointment] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false); 
  const [error, setError] = useState("");
  
  
  const [doctorNotes, setDoctorNotes] = useState("");
  const [feeInput, setFeeInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  
  const [pharmacies, setPharmacies] = useState([]);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false)

  const isDoctorView = user?.role === "doctor" || user?.role === "admin";
  const isPatientView = user?.role === "patient" || user?.role === "admin";

  

  

  const fetchAppointmentDetails = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await appointmentService.getAppointmentById(appointmentId);
      setAppointment(data);
      if (profile?.role === "doctor" && data) {
        setDoctorNotes(data.doctor_notes || "");
        setFeeInput(data.fee || "");
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to load appointment details.";
      setError(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId, profile?.role, enqueueSnackbar]);

  const fetchPharmacies = useCallback(async () => {
    try {
        const data = await pharmacyService.getPharmacies();
        setPharmacies(data || []);
    } catch(err) {
        console.error("Failed to fetch pharmacies:", err);
        enqueueSnackbar('Could not load pharmacies list', { variant: 'warning' });
    }
  }, [enqueueSnackbar]);

  const fetchPatientHistory = useCallback(async (patientId) => {
      if (user?.role !== "doctor") return;
      setIsHistoryLoading(true);
      try {
        const historyData = await doctorService.getPatientHistory(patientId);
        setPatientHistory(historyData.filter(app => app.id !== parseInt(appointmentId, 10)) || []);
      } catch (err) {
          console.error("Failed to fetch patient history:", err);
      } finally {
          setIsHistoryLoading(false);
      }
  }, [user?.role, appointmentId]);
  
  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId, fetchAppointmentDetails]);

  useEffect(() => {
    if (appointment && user?.role === 'doctor') {
        fetchPharmacies();
        fetchPatientHistory(appointment.patient_id);
    }
  }, [appointment, user?.role, fetchPatientHistory, fetchPharmacies]);

  
  const handleDoctorUpdate = async (fieldData) => {
    if (!isDoctorView) return;
    setIsUpdating(true);
    try {
      const updatedApp = await appointmentService.updateAppointment(appointmentId, fieldData);
      setAppointment(updatedApp);
      if (fieldData.doctor_notes !== undefined) setDoctorNotes(updatedApp.doctor_notes || "");
      if (fieldData.fee !== undefined) setFeeInput(updatedApp.fee || "");
      enqueueSnackbar("Appointment updated successfully", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || "Update failed", { variant: "error" });
    } finally { setIsUpdating(false); }
  };

  const handlePayment = async () => {
    try {
      const session = await paymentService.createCheckoutSession(appointmentId);
      window.location.href = session.url;
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Payment failed. Please try again.", { variant: "error" });
    }
  };

  const handleGeneratePrescription = async (values, { setSubmitting }) => {
    if (!isDoctorView) return;
    try {
      await appointmentService.generatePrescription(appointmentId, values);
      enqueueSnackbar('Prescription generated successfully!', { variant: 'success' });
      setIsPrescriptionModalOpen(false);
      fetchAppointmentDetails();
    } catch(err) {
       enqueueSnackbar(err.response?.data?.message || 'Failed to generate prescription', { variant: 'error' });
    } finally { setSubmitting(false); }
  };
  
  const handleDownloadInvoice = async () => {
      setIsDownloading(true);
      try {
        const fileBlob = await appointmentService.downloadInvoice(appointmentId);
        const url = window.URL.createObjectURL(fileBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${appointmentId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch(err) {
        console.error("Invoice download error:", err);
        enqueueSnackbar(err.response?.data?.message || 'Failed to download invoice.', { variant: 'error' });
      } finally { setIsDownloading(false); }
  };

  const handleLeaveCall = () => {
    setShowVideoCall(false);
    enqueueSnackbar("You have left the video call.", { variant: "info" });
    fetchAppointmentDetails();
  };

  
  const canJoinVideo = appointment?.status === "confirmed" && (isDoctorView || (isPatientView && appointment.payment_status === "paid"));
  const canPatientPay = isPatientView && appointment?.status !== "cancelled" && appointment?.payment_status === "unpaid" && appointment?.fee > 0;
  const canDoctorCreatePrescription = isDoctorView && ["confirmed", "completed"].includes(appointment?.status) && !appointment?.prescription_path;
  const canDoctorComplete = isDoctorView && appointment?.status === "confirmed";
  const canDoctorSetFee = isDoctorView && (!appointment?.fee || appointment?.fee <= 0) && ["pending", "confirmed"].includes(appointment?.status);

  
  if (isLoading) return <Container sx={{ textAlign: "center", mt: 5 }}><CircularProgress size={50} /></Container>;
  if (error) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
  if (!appointment) return <Container sx={{ mt: 5 }}><Alert severity="warning">Appointment data not found.</Alert></Container>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Appointment #{appointment.id}
      </Typography>

      <Grid container spacing={4}>
        {}
        <Grid item xs={12} md={7}>
          <Stack spacing={3}>
            <InfoCard>
              <CardContent>
                <SectionHeader><EventIcon /> <Typography variant="h6">Information</Typography></SectionHeader>
                <InfoGrid>
                    <Typography className="label">Service:</Typography>
                    <Typography>{appointment.service_name || "Consultation"}</Typography>
                    <Typography className="label">Status:</Typography>
                    <Typography>{appointment.status}</Typography>
                    <Typography className="label">Scheduled:</Typography>
                    <Typography>{new Date(appointment.scheduled_time).toLocaleString()}</Typography>
                </InfoGrid>
              </CardContent>
            </InfoCard>

            <InfoCard>
              <CardContent>
                <SectionHeader><GroupsIcon /> <Typography variant="h6">Participants</Typography></SectionHeader>
                <InfoGrid>
                    <Typography className="label">Patient:</Typography>
                    <Typography>{appointment.patient_name} ({appointment.patient_email})</Typography>
                    <Typography className="label">Doctor:</Typography>
                    <Typography>{appointment.doctor_name} ({appointment.doctor_specialization || 'General Practice'})</Typography>
                </InfoGrid>
              </CardContent>
            </InfoCard>

            <InfoCard>
              <CardContent>
                 <SectionHeader><NotesIcon /> <Typography variant="h6">Consultation Notes</Typography></SectionHeader>
                 <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Patient-Provided Notes:</Typography>
                 <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap', p: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 1 }}>
                     {appointment.patient_notes || "None provided."}
                 </Typography>
                {isDoctorView || appointment.doctor_notes ? (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>Doctor's Private Notes:</Typography>
                    {isDoctorView ? (
                      <Stack spacing={1.5} direction="row" alignItems="flex-end">
                        <TextField fullWidth multiline rows={4} variant="outlined" value={doctorNotes}
                          onChange={(e) => setDoctorNotes(e.target.value)}
                          placeholder="Add your consultation notes here..."
                          disabled={isUpdating} />
                        <Button variant="contained" onClick={() => handleDoctorUpdate({ doctor_notes: doctorNotes })}
                          disabled={isUpdating || doctorNotes === (appointment.doctor_notes || "")}>
                          {isUpdating ? <CircularProgress size={24}/> : "Save"}
                        </Button>
                      </Stack>
                    ) : (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', p: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 1 }}>
                        {appointment.doctor_notes || "No notes added yet."}
                      </Typography>
                    )}
                  </>
                ) : null}
              </CardContent>
            </InfoCard>
          </Stack>
        </Grid>

        {}
        <Grid item xs={12} md={5}>
            <Stack spacing={3}>
                <InfoCard>
                    <CardContent>
                        <SectionHeader><PaymentIcon /><Typography variant="h6">Actions & Status</Typography></SectionHeader>
                        <Stack spacing={2}>
                            <InfoGrid>
                                <Typography className="label">Fee:</Typography>
                                <Typography>{appointment.fee ? `$${parseFloat(appointment.fee).toFixed(2)}` : "Not set"}</Typography>
                                <Typography className="label">Payment:</Typography>
                                <Typography>{appointment.payment_status}</Typography>
                            </InfoGrid>
                            {canDoctorSetFee && (
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <AttachMoneyIcon color="action" />
                                    <TextField type="number" label="Set Fee ($)" variant="outlined" size="small" value={feeInput}
                                        onChange={(e) => setFeeInput(e.target.value)} sx={{ flexGrow: 1 }} disabled={isUpdating}
                                        inputProps={{ step: "0.01", min: "0" }}/>
                                    <Button variant="contained" onClick={() => handleDoctorUpdate({ fee: feeInput })}
                                        disabled={isUpdating || !feeInput || feeInput === appointment.fee}>
                                        {isUpdating ? <CircularProgress size={24}/> : "Set"}
                                    </Button>
                                </Stack>
                            )}
                             {canPatientPay && <Button variant="contained" color="success" startIcon={<PaymentIcon />} onClick={handlePayment}>Pay ${parseFloat(appointment.fee).toFixed(2)} Now</Button>}
                             {canJoinVideo && !showVideoCall && <Button variant="contained" color="primary" startIcon={<VideocamIcon />} onClick={() => setShowVideoCall(true)}>Join Secure Video Call</Button>}
                             {canDoctorComplete && <Button variant="contained" color="success" startIcon={<CheckCircleOutlineIcon />} onClick={() => handleDoctorUpdate({ status: "completed" })} disabled={isUpdating}>Mark as Completed</Button>}
                        </Stack>
                    </CardContent>
                </InfoCard>
                 <InfoCard>
                    <CardContent>
                        <SectionHeader><MedicalInformationIcon /><Typography variant="h6">Prescription & Documents</Typography></SectionHeader>
                        <Stack spacing={2}>
                            {appointment.prescription_path ? (
                                <Button variant="outlined" startIcon={<DownloadIcon />} href={`${process.env.REACT_APP_API_BASE_URL.replace("/api", "")}${appointment.prescription_path}`} target="_blank" rel="noopener noreferrer">Download Prescription</Button>
                            ) : canDoctorCreatePrescription ? (
                                <Button variant="contained" startIcon={<PostAddIcon />} onClick={() => setIsPrescriptionModalOpen(true)}>Create Prescription</Button>
                            ) : (isPatientView && <Typography variant="body2" color="text.secondary">No prescription has been issued yet.</Typography>)}
                            
                            {appointment.payment_status === 'paid' && appointment.fee > 0 && (
                                <Button variant="contained" color="secondary"
                                    startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <DownloadForOfflineIcon />}
                                    onClick={handleDownloadInvoice}
                                    disabled={isDownloading}>
                                    {isDownloading ? 'Preparing...' : 'Download Invoice'}
                                </Button>
                            )}
                            {isPatientView && appointment.pharmacy_id && (
                                <Alert severity="info" icon={<LocalPharmacyIcon fontSize="inherit"/>}>
                                    Prescription sent to pharmacy: <strong>{pharmacies.find(p => p.id === appointment.pharmacy_id)?.name || '...'}</strong>
                                </Alert>
                            )}
                        </Stack>
                    </CardContent>
                </InfoCard>

                {}
                {isDoctorView && (
                  <InfoCard>
                    <CardContent>
                      <SectionHeader><HistoryIcon /><Typography variant="h6">Patient History</Typography></SectionHeader>
                      {isHistoryLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={30} />
                        </Box>
                      ) : (
                         <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                             {patientHistory.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" align="center">No previous appointments found.</Typography>
                             ) : (
                                <List dense>
                                    {patientHistory.map(histApp => (
                                        <ListItem
                                            key={histApp.id}
                                            divider
                                            secondaryAction={
                                                <Button size="small" component={RouterLink} to={`/appointments/${histApp.id}`} target="_blank">
                                                    View
                                                </Button>
                                            }
                                        >
                                            <ListItemText
                                                primary={new Date(histApp.scheduled_time).toLocaleDateString()}
                                                secondary={`${histApp.service_name || 'Consultation'} - ${histApp.status}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                             )}
                         </Box>
                      )}
                    </CardContent>
                  </InfoCard>
                )}
            </Stack>
        </Grid>
      </Grid>
       
      {isPatientView && appointment.status === "completed" && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button variant="contained" color="secondary" component={RouterLink} to={`/submit-claim/${appointmentId}`}>File Insurance Claim</Button>
        </Box>
      )}

      {}
      <PrescriptionModal open={isPrescriptionModalOpen} onClose={() => setIsPrescriptionModalOpen(false)} onSubmit={handleGeneratePrescription} pharmacies={pharmacies}/>
      <Modal open={showVideoCall}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '98vw', md: '90vw' }, height: { xs: '90vh', md: '90vh' }, maxWidth: '1600px', maxHeight: '900px', bgcolor: 'background.paper', boxShadow: 24, p: 0.5, outline: 'none', borderRadius: 2, display: 'flex' }}>
          {showVideoCall && <VideoCallSelfHosted roomName={`appt-${appointmentId}`} onLeaveCall={handleLeaveCall}/>}
        </Box>
      </Modal>

    </Container>
  );
};

export default AppointmentDetailsPage;