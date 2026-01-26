import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/api';

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
        const parsedUser = JSON.parse(savedUser);
        console.log('📦 Loaded user from storage:', parsedUser);
        
        // CRITICAL: If user data is corrupted (no token AND no name), force logout
        if ((!parsedUser.token || parsedUser.token === 'undefined') && 
            (!parsedUser.name || parsedUser.name === 'undefined' || parsedUser.name === 'Unknown')) {
          console.error('🚨 CORRUPTED USER DATA DETECTED! Forcing logout...');
          localStorage.clear();
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Migration: Fix incomplete user data
        let needsUpdate = false;
        
        // Add token if missing
        if (!parsedUser.token) {
          console.log('⚠️ No token found, generating mock token...');
          const mockToken = 'mock-jwt-token-' + Date.now();
          parsedUser.token = mockToken;
          needsUpdate = true;
        }
        
        // Add name if missing
        if (!parsedUser.name || parsedUser.name === 'undefined') {
          console.log('⚠️ No name found, setting default name...');
          parsedUser.name = parsedUser.email ? parsedUser.email.split('@')[0] : 'User';
          needsUpdate = true;
        }
        
        // Add email if missing
        if (!parsedUser.email) {
          console.log('⚠️ No email found, setting default...');
          parsedUser.email = 'user@example.com';
          needsUpdate = true;
        }
        
        // Save updated user data
        if (needsUpdate) {
          console.log('✅ Migrated user data:', parsedUser);
          localStorage.setItem('user', JSON.stringify(parsedUser));
          localStorage.setItem('token', parsedUser.token);
        }
        
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading saved user:', error);
      // Clear corrupted data
      console.log('🧹 Clearing corrupted localStorage...');
      localStorage.clear();
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
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
      const mockToken = 'mock-jwt-token-' + Date.now();
      const mockUser = {
        id: 1,
        name: email.split('@')[0], // Use email username as name
        email: email,
        avatar: 'https://via.placeholder.com/40',
        token: mockToken // Include token for API calls
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);
      return { success: true };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
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
      const mockToken = 'mock-jwt-token-' + Date.now();
      const mockUser = {
        id: Math.floor(Math.random() * 1000),
        name: name,
        email: email,
        avatar: 'https://via.placeholder.com/40',
        token: mockToken // Include token for API calls
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);
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