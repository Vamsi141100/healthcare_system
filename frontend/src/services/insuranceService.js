import axiosInstance from "./axiosInstance";

const API_URL = "/insurance/claims/";

const submitClaim = async (appointmentId, formData) => {
  const response = await axiosInstance.post(API_URL + appointmentId, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

const getAllClaims = async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
}

const updateClaimStatus = async (claimId, data) => {
    const response = await axiosInstance.put(API_URL + claimId, data);
    return response.data;
}

const insuranceService = {
  submitClaim,
  getAllClaims,
  updateClaimStatus,
};

export default insuranceService;