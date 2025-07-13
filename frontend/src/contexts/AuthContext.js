import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved auth data on app start
  useEffect(() => {
    const savedToken = localStorage.getItem("chatSphereToken");
    const savedUser = localStorage.getItem("chatSphereUser");

    if (savedToken && savedUser) {
      setToken(savedToken);
      const userData = JSON.parse(savedUser);
      setUser(userData);
    }
  }, []);

  // Save auth data to localStorage
  useEffect(() => {
    if (token && user) {
      localStorage.setItem("chatSphereToken", token);
      localStorage.setItem("chatSphereUser", JSON.stringify(user));
    }
  }, [token, user]);

  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("chatSphereToken");
    localStorage.removeItem("chatSphereUser");
  };

  const value = {
    token,
    user,
    isLoading,
    setIsLoading,
    login,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};