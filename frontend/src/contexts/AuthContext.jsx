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
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          // Verify token is still valid with backend
          const response = await axios.get('/auth/profile');
          
          if (response.data.success) {
            setUser(response.data.data.user);
            setToken(savedToken);
          } else {
            // Token is invalid, clear storage
            logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // Check if it's a network error vs auth error
          if (error.response?.status === 401) {
            logout(); // Invalid token
          } else {
            // Network error, try to use saved user data temporarily
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
              setToken(savedToken);
            } catch (parseError) {
              logout();
            }
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { user: userData, token: authToken } = response.data.data;
        
        // Store in state
        setUser(userData);
        setToken(authToken);
        
        // Store in localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
        return { success: true, user: userData };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response?.data?.message) {
        return { 
          success: false, 
          error: error.response.data.message 
        };
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        return { 
          success: false, 
          error: 'Network error. Please check your connection and try again.' 
        };
      } else {
        return { 
          success: false, 
          error: 'Login failed. Please try again.' 
        };
      }
    }
  };

  const register = async (userData) => {
    try {
      // Handle both old format (name, email, password) and new format (userData object)
      let registrationData;
      
      if (typeof userData === 'string') {
        // Old format: register(name, email, password)
        const [name, email, password] = arguments;
        registrationData = {
          username: name.replace(/\s+/g, '').toLowerCase(),
          email,
          password,
          firstName: name.split(' ')[0] || '',
          lastName: name.split(' ').slice(1).join(' ') || ''
        };
      } else {
        // New format: register(userDataObject)
        registrationData = userData;
      }

      const response = await axios.post('/auth/register', registrationData);

      if (response.data.success) {
        const { user: newUser, token: authToken } = response.data.data;
        
        // Store in state
        setUser(newUser);
        setToken(authToken);
        
        // Store in localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // Update axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
        return { success: true, user: newUser };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different types of errors
      if (error.response?.data?.message) {
        return { 
          success: false, 
          error: error.response.data.message 
        };
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        return { 
          success: false, 
          error: 'Network error. Please check your connection and try again.' 
        };
      } else {
        return { 
          success: false, 
          error: 'Registration failed. Please try again.' 
        };
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Add utility methods for API calls
  const apiCall = async (method, endpoint, data = null) => {
    try {
      const config = {
        method,
        url: endpoint,
        ...(data && { data })
      };
      
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`API call failed: ${method} ${endpoint}`, error);
      
      // If token is invalid, logout user
      if (error.response?.status === 401) {
        logout();
      }
      
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    token,
    isAuthenticated: !!user,
    apiCall // Utility for making authenticated API calls
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};