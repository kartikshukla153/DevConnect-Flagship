import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  connectSocket,
  disconnectSocket,
} from "../socket/socket";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      disconnectSocket();

      localStorage.removeItem("token");

      setUser(null);

      setLoading(false);

      return;
    }

    localStorage.setItem("token", token);

    try {
      const decoded = jwtDecode(token);

      console.log("JWT:", decoded);

      setUser(decoded);

      
    } catch (err) {
      console.error(err);

      disconnectSocket();

      localStorage.removeItem("token");

      setToken(null);

      setUser(null);
    }

    setLoading(false);
  }, [token]);

  const login = (jwt) => {
    setToken(jwt);
  };

  const logout = () => {
    disconnectSocket();

    localStorage.removeItem("token");

    setToken(null);

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        login,
        logout,
        loading,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};