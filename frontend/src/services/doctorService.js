import axiosInstance from "./axiosInstance";

const API_URL = "/doctors/";

const getDashboard = async () => {
  const response = await axiosInstance.get(API_URL + "dashboard");
  return response.data;
};

const updateProfile = async (profileData) => {
  const response = await axiosInstance.put(API_URL + "profile", profileData);
  return response.data;
};

const getPatientHistory = async (patientId) => {
  const response = await axiosInstance.get(API_URL + `patient-history/${patientId}`);
  return response.data;
};

const doctorService = {
  getDashboard,
  updateProfile,
  getPatientHistory,
};

export default doctorService;