import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import ProfileDropdown from './ProfileDropdown';

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
    <nav className="bg-white shadow-sm w-full">
      <div className="w-full px-0"> {/* Changed from px-4 to px-0 */}
        <div className="flex justify-between h-16">
          <div className="flex items-center pl-2"> {/* Added pl-2 for minimal padding */}
            <Link to="/" className="flex-shrink-0">
              <Logo />
            </Link>
            
            {user && (
              <div className="ml-4 sm:flex sm:space-x-8"> {/* Adjusted margin */}
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-indigo-600 transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-indigo-600 transition-colors duration-200"
                >
                  Courses
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center pr-2"> {/* Added pr-2 for minimal padding */}
            {user ? (
              <ProfileDropdown />
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
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