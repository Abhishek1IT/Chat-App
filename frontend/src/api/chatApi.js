import api from "./axios";

export const myChats = () => {
    return api.get("/chats/my");
};

export const accessChat = (data) => {
    return api.post("/chats/access", data);
};

export const loadMessages = (userId) => {
    return api.get(`/chats/${userId}`);
};

export const createGroupChat = (data) => {
    return api.post("/chats/group", data);
};

export const addAdmin = (data) => {
    return api.put("/chats/addadmin", data);
};

export const removeAdmin = (data) => {
    return api.put("/chats/removeadmin", data);
};

export const adminAddUser = (data) => {
    return api.put("/chats/adminadduser", data);
};

export const adminRemoveUser = (data) => {
    return api.put("/chats/adminremoveuser", data);
};

export const leaveGroup = (data) => {
    return api.put("/chats/leavegroup", data);
};

export const deleteGroup = (groupId) => {
    return api.delete(`/chats/group/${groupId}`);
};