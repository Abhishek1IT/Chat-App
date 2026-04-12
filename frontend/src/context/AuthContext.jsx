import { createContext, useEffect, useState } from "react";
import { getToken, removeToken, setToken } from "../utils/storage";
import { profileUser } from "../api/userApi.js";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const loadUser = async () => {
    try {
      const { data } = await profileUser();
      setUser(data.user);
    } catch {
      removeToken();
      setUser(null);
    }
  };

  useEffect(() => {
    if (getToken()) loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}