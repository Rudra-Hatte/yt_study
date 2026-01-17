import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext_simple';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import ProfileDropdown from './ProfileDropdown';
import DarkModeToggle from './DarkModeToggle';
import { LayoutDashboard, BookOpen, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-dark-900 shadow-sm w-full border-b border-gray-200 dark:border-dark-700 transition-colors duration-200">
      <div className="w-full px-0">
        <div className="flex justify-between h-16">
          <div className="flex items-center pl-2">
            <Link to="/" className="flex-shrink-0">
              <Logo />
            </Link>
            
            {isAuthenticated && user && (
              <div className="ml-4 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 border-b-2 border-transparent hover:border-primary-600 dark:hover:border-primary-400 transition-all duration-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 border-b-2 border-transparent hover:border-primary-600 dark:hover:border-primary-400 transition-all duration-200"
                >
                  <BookOpen className="w-4 h-4" />
                  Courses
                </Link>
                <Link
                  to="/create-course"
                  className="inline-flex items-center gap-2 px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100 border-b-2 border-transparent hover:border-primary-600 dark:hover:border-primary-400 transition-all duration-200"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Course
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pr-2">
            <DarkModeToggle />
            {isAuthenticated && user ? (
              <ProfileDropdown />
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;