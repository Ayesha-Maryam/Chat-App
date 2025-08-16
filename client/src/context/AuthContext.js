import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.get('/users');
        setUser(res.data.data[0]);
        setIsAuthenticated(true);
      } catch (error) {
        console.error(error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (formData) => {
  try {
    const res = await api.post('/auth/register', formData);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.data.user);
    setIsAuthenticated(true);
    navigate('/chat');
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

  const login = async (formData) => {
  try {
    const res = await api.post('/auth/login', formData);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.data.user);
    setIsAuthenticated(true);
    navigate('/chat');
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);