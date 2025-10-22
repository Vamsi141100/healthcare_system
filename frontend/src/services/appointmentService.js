import axiosInstance from "./axiosInstance";

const API_URL = "/appointments/";

const createAppointment = async (appointmentData) => {
  const response = await axiosInstance.post(API_URL, appointmentData);
  return response.data;
};

const getMyAppointments = async (filters = {}) => {
  const response = await axiosInstance.get(API_URL + "my", { params: filters });
  return response.data;
};

const getAppointmentById = async (id) => {
  const response = await axiosInstance.get(API_URL + id);
  return response.data;
};

const updateAppointment = async (id, updateData) => {
  const response = await axiosInstance.put(API_URL + id, updateData);
  return response.data;
};

const generatePrescription = async (id, prescriptionData) => {
  const response = await axiosInstance.post(API_URL + id + "/prescription", prescriptionData);
  return response.data;
};

const getAvailableDoctors = async (specialization = null) => {
  try {
    const params = {};
    if (specialization) {
      params.specialization = specialization;
    }
    const response = await axiosInstance.get("/doctors/list", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching available doctors:", error);
    throw error;
  }
};

const getServices = async (category = null) => {
  try {
    const params = {};
    if (category) {
      params.category = category;
    }
    const response = await axiosInstance.get("/services/list", { params });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};
const markAsPaid = async (id) => {
  const response = await axiosInstance.put(API_URL + id + "/pay");
  return response.data;
};
const downloadInvoice = async (id) => {
  const response = await axiosInstance.get(API_URL + id + "/invoice", {
    responseType: 'blob', 
  });
  return response.data;
};

const appointmentService = {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointment,
  
  generatePrescription,
  getAvailableDoctors,
  getServices,
  markAsPaid,
  downloadInvoice,
};

export default appointmentService;