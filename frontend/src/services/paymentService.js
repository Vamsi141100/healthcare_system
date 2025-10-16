import axiosInstance from "./axiosInstance";

const API_URL = "/payments/";

const createCheckoutSession = async (appointmentId) => {
    const response = await axiosInstance.post(API_URL + `create-checkout-session/${appointmentId}`);
    return response.data;
};

const paymentService = {
  createCheckoutSession,
};

export default paymentService;