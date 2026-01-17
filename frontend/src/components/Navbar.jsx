import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext_simple';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import ProfileDropdown from './ProfileDropdown';
import DarkModeToggle from './DarkModeToggle';
import { LayoutDashboard, BookOpen, PlusCircle, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-dark-900 shadow-sm w-full border-b border-gray-200 dark:border-dark-700 transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Desktop Menu */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <Logo />
            </Link>
            
            {/* Desktop Menu */}
            {isAuthenticated && user && (
              <div className="hidden md:flex md:ml-6 md:space-x-8">
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

          {/* Right side - Dark Mode, Profile, Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <DarkModeToggle />
            
            {/* Desktop Auth Buttons or Profile */}
            {isAuthenticated && user ? (
              <>
                <div className="hidden md:block">
                  <ProfileDropdown />
                </div>
                {/* Mobile Menu Button (only for authenticated users) */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 focus:outline-none"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  to="/login"
                  className="text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && isAuthenticated && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200 dark:border-dark-700"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              {/* Mobile Navigation Links */}
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                to="/courses"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Courses
              </Link>
              <Link
                to="/create-course"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                Create Course
              </Link>

              {/* Mobile Profile Section */}
              <div className="border-t border-gray-200 dark:border-dark-700 pt-4 mt-4">
                <div className="flex items-center px-3 mb-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;