import api from "./axios";

export const getAllUsers = () => {
  return api.get("/users/all-with-last-message");
};

export const profileUser = () => {
  return api.get("/auth/profile");
};