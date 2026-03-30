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
    console.log("Socket connected", s);
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

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}