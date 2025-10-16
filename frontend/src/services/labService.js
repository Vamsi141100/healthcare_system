import axiosInstance from "./axiosInstance";

const API_URL = "/labs/";

const orderTest = async (orderData) => {
  try {
    const response = await axiosInstance.post(API_URL + "order", orderData);
    return response.data;
  } catch (error) {
    console.error("Error ordering lab test:", error);
    throw error;
  }
};

const labService = {
  orderTest,
};

export default labService;