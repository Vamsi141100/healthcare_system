import axiosInstance from "./axiosInstance";

const API_URL = "/applications/";

const submitApplication = async (formData) => {
  const response = await axiosInstance.post(API_URL + "apply", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

const getMyApplicationStatus = async () => {
  const response = await axiosInstance.get(API_URL + "my");
  
  return response.data;
};

const getAllApplications = async (filters = {}) => {
  const response = await axiosInstance.get(API_URL, { params: filters });
  return response.data;
};

const getApplicationById = async (id) => {
  const response = await axiosInstance.get(API_URL + id);
  return response.data;
};

const reviewApplication = async (id, reviewData) => {
  const response = await axiosInstance.put(
    API_URL + id + "/review",
    reviewData
  );
  return response.data;
};

const applicationService = {
  submitApplication,
  getMyApplicationStatus,
  getAllApplications,
  getApplicationById,
  reviewApplication,
};

export default applicationService;