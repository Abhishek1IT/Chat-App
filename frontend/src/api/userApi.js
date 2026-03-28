import api from "./axios";

// Use relative path, since axios baseURL is already /api
export const getAllUsers = () => {
  return api.get("auth/users");
};