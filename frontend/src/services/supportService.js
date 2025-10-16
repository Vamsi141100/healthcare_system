import axiosInstance from "./axiosInstance";

const API_URL = "/support/tickets/";

const submitTicket = async (ticketData) => {
  const response = await axiosInstance.post(API_URL, ticketData);
  return response.data;
};

const getMyTickets = async (filters = {}) => {
  const response = await axiosInstance.get(API_URL + "my", { params: filters });
  return response.data;
};

const getAllTickets = async (filters = {}) => {
  const response = await axiosInstance.get(API_URL, { params: filters });
  return response.data;
};

const getTicketById = async (id) => {
  const response = await axiosInstance.get(API_URL + id);
  return response.data;
};

const answerTicket = async (id, answerData) => {
  const response = await axiosInstance.put(
    API_URL + id + "/answer",
    answerData
  );
  return response.data;
};

const updateTicketStatus = async (id, statusData) => {
  const response = await axiosInstance.put(
    API_URL + id + "/status",
    statusData
  );
  return response.data;
};

const supportService = {
  submitTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  answerTicket,
  updateTicketStatus,
};

export default supportService;