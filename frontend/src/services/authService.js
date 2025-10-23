import axiosInstance from "./axiosInstance";
const API_URL = "/auth/";
const register = async (userData) => {
  const response = await axiosInstance.post(API_URL + "register", userData);
  if (response.data && response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (userData) => {
  const response = await axiosInstance.post(API_URL + "login", userData);
  if (response.data && response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("profile");
};

const authService = {
  register,
  login,
  logout,
};

export default authService;