import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = 'http://localhost:5000/api';
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // For demo, we'll simulate a logged-in user
          setUser({
            id: 1,
            username: 'Rudra-Hatte',
            email: 'rudra@ytstudy.com'
          });
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      // For demo purposes, simulate successful login
      if (email === 'demo@ytstudy.com' && password === 'demo123') {
        const user = {
          id: 1,
          username: 'Rudra-Hatte',
          email: 'demo@ytstudy.com'
        };
        const token = 'demo_token_123';
        
        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        
        return { success: true, user };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      // For demo purposes, simulate successful registration
      const user = {
        id: 1,
        username: userData.username,
        email: userData.email
      };
      const token = 'demo_token_123';
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};