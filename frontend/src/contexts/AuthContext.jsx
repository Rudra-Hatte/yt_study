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
            name: 'Rudra Hatte',
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo credentials
      if (email === 'demo@ytstudy.com' && password === 'demo123') {
        const user = {
          id: 1,
          name: 'Rudra Hatte',
          username: 'Rudra-Hatte',
          email: 'demo@ytstudy.com'
        };
        const token = 'demo_token_' + Date.now();
        
        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        
        return { success: true, user };
      } else if (email === 'rudra@ytstudy.com' && password === 'rudra123') {
        const user = {
          id: 2,
          name: 'Rudra Hatte',
          username: 'Rudra-Hatte',
          email: 'rudra@ytstudy.com'
        };
        const token = 'rudra_token_' + Date.now();
        
        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        
        return { success: true, user };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Check if email already exists (demo)
      if (email === 'demo@ytstudy.com' || email === 'rudra@ytstudy.com') {
        return { 
          success: false, 
          error: 'Email already exists. Please use a different email.' 
        };
      }
      
      // Simulate successful registration
      const user = {
        id: Date.now(), // Simple ID generation for demo
        name: name,
        username: name.replace(/\s+/g, '-').toLowerCase(),
        email: email
      };
      
      // For demo, we'll auto-login after registration
      // In real app, you might want to redirect to login or send verification email
      const token = 'new_user_token_' + Date.now();
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
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