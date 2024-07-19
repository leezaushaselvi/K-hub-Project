import React, { createContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => localStorage.getItem("tokens") ? JSON.parse(localStorage.getItem("tokens")) : null);

  const login = async (email, password) => {
    const response = await axios.post("http://localhost:8000/token", { username: email, password });
    setAuthTokens(response.data);
    localStorage.setItem("tokens", JSON.stringify(response.data));
  };

  const logout = () => {
    setAuthTokens(null);
    localStorage.removeItem("tokens");
  };

  return (
    <AuthContext.Provider value={{ authTokens, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
