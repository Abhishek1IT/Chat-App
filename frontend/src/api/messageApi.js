import api from "./axios";

export const sendMessageAPI = (data) =>
  api.post("/messages/send", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const seenAPI = (data) => 
  api.put("/messages/seen", data);

export const deleteMessageAPI = (id) => 
  api.delete(`/messages/delete/${id}`);

export const editMessageAPI = (id, data) =>
  api.patch(`/messages/edit/${id}`, data);

export const forwardMessageAPI = (data) => 
  api.post("/messages/forward", data);

export const deleteMessageForMeAPI = (id) =>
  api.delete(`/messages/deleteforme/${id}`);
