import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext_simple';
import { CourseProvider } from './contexts/CourseContext';
import Navbar from './components/Navbar';
import AppRoutes from './routes';
import AIChatBot from './components/AIChatBot';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CourseProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
            <Navbar />
            <main className="w-full">
              <AppRoutes />
            </main>
            <AIChatBot />
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                className: 'dark:bg-dark-800 dark:text-gray-100',
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </CourseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;