import axiosInstance from "./axiosInstance";

const API_URL = "/users/";

const getMe = async () => {
  const response = await axiosInstance.get(API_URL + "me");
  return response.data;
};

const userService = {
  getMe,
};

export default userService;