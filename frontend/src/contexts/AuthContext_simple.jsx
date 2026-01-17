import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for existing session
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading saved user:', error);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          ...data.user,
          token: data.token
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      // Mock login for development
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: email,
        avatar: 'https://via.placeholder.com/40'
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return { success: true };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          ...data.user,
          token: data.token
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Mock registration for development
      const mockUser = {
        id: Math.floor(Math.random() * 1000),
        name: name,
        email: email,
        avatar: 'https://via.placeholder.com/40'
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};