import axiosInstance from "./axiosInstance";
const API_URL = "/stats/";

const getPublicStats = async () => {
  const response = await axiosInstance.get(API_URL);
  return response.data;
};

const statsService = {
  getPublicStats,
};

export default statsService;