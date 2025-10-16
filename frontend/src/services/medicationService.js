import axiosInstance from "./axiosInstance";

const API_URL = "/medications/";

const requestMed = async (requestData) => {
  try {
    const response = await axiosInstance.post(API_URL + "request", requestData);
    return response.data;
  } catch (error) {
    console.error("Error requesting medication:", error);
    throw error;
  }
};

const medicationService = {
  requestMed,
};

export default medicationService;