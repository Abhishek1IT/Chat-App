import api from "./axios";

export const registerUser = (Api) => {
    return api.post("/auth/register", Api);
};

export const loginUser = (Api) => {
    return api.post("/auth/login", Api);
};

export const logoutUser = () => {
    api.post("/auth/logout");
};

export const profileUser = () => {
    return api.get("/auth/profile");
};