import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("pmt_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await authApi.me();
        setUser(data);
      } catch (error) {
        localStorage.removeItem("pmt_token");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const persistSession = (data) => {
    localStorage.setItem("pmt_token", data.token);
    setUser(data);
  };

  const login = async (payload) => {
    const { data } = await authApi.login(payload);
    persistSession(data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    persistSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("pmt_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }
  return context;
};

export default AuthContext;
