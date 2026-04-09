import { createContext, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export default function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const s = io(process.env.REACT_APP_SOCKET_URL);
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (socket && user?._id) {
      socket.emit("userOnline", user._id);
    }
  }, [socket, user]);

  useEffect(() => {
    if (!socket) return;
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };
    socket.on("onlineUsers", handleOnlineUsers);
    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    // Group events
    socket.on("GroupCreated", () => {});
    socket.on("AddAdmin", () => {});
    socket.on("RemoveAdmin", () => {});
    socket.on("AdminRemoveUser", () => {});
    socket.on("LeaveGroup", () => {});
    socket.on("Delete Group", () => {});
    return () => {
      socket.off("GroupCreated");
      socket.off("AddAdmin");
      socket.off("RemoveAdmin");
      socket.off("AdminRemoveUser");
      socket.off("LeaveGroup");
      socket.off("Delete Group");
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}