import axiosInstance from "./axiosInstance";

const API_URL = "/admin/";

const getAllUsers = async (filters = {}) => {
  const response = await axiosInstance.get(API_URL + "users", {
    params: filters,
  });
  return response.data;
};

const getUserById = async (id) => {
  const response = await axiosInstance.get(API_URL + "users/" + id);
  return response.data;
};

const updateUser = async (id, userData) => {
  const response = await axiosInstance.put(API_URL + "users/" + id, userData);
  return response.data;
};

const deleteUser = async (id) => {
  const response = await axiosInstance.delete(API_URL + "users/" + id);
  return response.data;
};

const getAllAppointments = async (filters = {}) => {
  const response = await axiosInstance.get(API_URL + "appointments", {
    params: filters,
  });
  return response.data;
};

const deleteAppointment = async (id) => {
  const response = await axiosInstance.delete(API_URL + "appointments/" + id);
  return response.data;
};

const adminService = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllAppointments,
  deleteAppointment,
};

export default adminService;