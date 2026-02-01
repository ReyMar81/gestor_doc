import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister, getUser } from '../api/authService';
import apiClient from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedTagId, setSelectedTagId] = useState(null);


  const [globalRefetchTrigger, setGlobalRefetchTrigger] = useState(0);

  const globalRefetch = () => {
    setGlobalRefetchTrigger((count) => count + 1);
  };


  useEffect(() => {
    const loadUser = async () => {
      if (authToken) {
        apiClient.defaults.headers.common['Authorization'] = `Token ${authToken}`;
        try {
          const userData = await getUser();
          setUser(userData);
        } catch (e) {
          setAuthToken(null);
          localStorage.removeItem('authToken');
          setUser(null);
        }
      } else {
        delete apiClient.defaults.headers.common['Authorization'];
      }
      setLoading(false);
    };
    loadUser();
  }, [authToken]);

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    const token = data.key;
    localStorage.setItem('authToken', token);
    apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
    
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (e) {
      console.error("Error al obtener el usuario después de iniciar sesión", e);
    }
    
    setAuthToken(token);
  };

  const logout = async () => {
    await apiLogout();
    setAuthToken(null);
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    authToken,
    user,
    login,
    logout,
    loading,
    register: apiRegister,
    isAuthenticated: !!authToken,
    selectedFolderId,
    setSelectedFolderId,
    selectedTagId,
    setSelectedTagId,
    globalRefetchTrigger,
    globalRefetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};