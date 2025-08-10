import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Import actual page components
import Register from './pages/Register';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Courses from './pages/Courses';

// Only Dashboard is defined locally (you can move this to a separate file later)
const Dashboard = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p>Welcome to your dashboard!</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses" 
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              } 
            />
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;