import api from "./axios";

export const myChats = () => {
    return api.get("/chats/my");
};

export const accessChat = (data) => {
    return api.post("/chats/access", data);
};

export const lodeMessages = (userId) => {
    return api.get(`/chats/${userId}`);
};