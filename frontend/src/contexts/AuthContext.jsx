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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Mock mode - set to true to test without backend
  const MOCK_MODE = true; // Change to false when backend is ready
  
  // Mock user data
  const mockUser = {
    id: 'mock-user-id',
    name: 'Demo User',
    email: 'demo@ytstudy.com',
    role: 'user'
  };

  useEffect(() => {
    if (MOCK_MODE) {
      // Auto-login in mock mode
      setUser(mockUser);
    } else {
      // Check for existing token
      const token = localStorage.getItem('token');
      if (token) {
        // Verify token with backend
        verifyToken(token);
      }
    }
  }, []);

  const register = async (userData) => {
    if (MOCK_MODE) {
      // Mock registration
      setLoading(true);
      setTimeout(() => {
        setUser({
          ...mockUser,
          name: userData.firstName + ' ' + userData.lastName,
          email: userData.email
        });
        setLoading(false);
      }, 1000);
      return { success: true };
    }
    
    // Real registration logic here
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    if (MOCK_MODE) {
      // Mock login
      setLoading(true);
      setTimeout(() => {
        setUser(mockUser);
        setLoading(false);
      }, 1000);
      return { success: true };
    }
    
    // Real login logic here
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
    mockMode: MOCK_MODE
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};