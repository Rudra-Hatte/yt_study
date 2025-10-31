import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <CourseProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="w-full">
              <AppRoutes />
            </main>
            <AIChatBot />
          </div>
        </CourseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;