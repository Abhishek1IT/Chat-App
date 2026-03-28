import api from "./axios";

export const forgotPassword = (Api) => {
   return api.post("/password/forgotpassword", Api);
};

export const resetPassword = (token, Api) => {
    return api.put(`/password/resetpassword/${token}`, Api);
};