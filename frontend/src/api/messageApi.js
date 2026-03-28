import api from "./axios";

export const sendMessageAPI = (data) =>
  api.post("/messages/send", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const seenAPI = (data) =>
  api.put("/messages/seen", data);