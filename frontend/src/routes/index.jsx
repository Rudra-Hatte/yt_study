import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext_simple';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Courses from '../pages/Courses';
import CourseView from '../pages/CourseView';
import CreateCourse from '../pages/CreateCourse';
import AutomatedCourseGenerator from '../components/AutomatedCourseGenerator';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
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
      <Route 
        path="/courses/:courseId" 
        element={
          <ProtectedRoute>
            <CourseView />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create-course" 
        element={
          <ProtectedRoute>
            <CreateCourse />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/generate-course" 
        element={
          <ProtectedRoute>
            <AutomatedCourseGenerator />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;