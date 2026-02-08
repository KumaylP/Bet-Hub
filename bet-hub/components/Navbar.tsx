import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const Navbar: React.FC<{ onSearchChange?: (query: string) => void }> = ({ onSearchChange }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setShowDropdown(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background-dark/95 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-1 group">
              <span className="text-2xl font-black text-white tracking-tighter group-hover:text-gray-200 transition-colors">Bet</span>
              <span className="text-2xl font-black text-black bg-primary px-1.5 rounded-md tracking-tighter group-hover:bg-primary-hover transition-colors">hub</span>
            </Link>

            <div className="hidden md:flex items-center w-80 h-10 bg-background-card border border-white/10 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
              <div className="px-3 text-gray-500">
                <span className="material-symbols-outlined !text-[20px]">search</span>
              </div>
              <input
                type="text"
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500"
                placeholder="Search markets..."
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
              >
                Markets
              </Link>
              {user && (
                <>
                  <Link
                    to="/private"
                    className={`text-sm font-medium transition-colors ${isActive('/private') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/create"
                    className={`text-sm font-medium transition-colors ${isActive('/create') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                  >
                    Create
                  </Link>

                </>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 bg-background-card border border-white/10 rounded-lg px-3 py-1.5" title="Trust Score">
                    <span className="material-symbols-outlined text-blue-400 !text-[16px]">verified_user</span>
                    <span className="text-white text-sm font-medium">{user.trust}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 bg-background-card border border-white/10 rounded-lg px-3 py-1.5">
                    <span className="material-symbols-outlined text-primary !text-[16px]">monetization_on</span>
                    <span className="text-white text-sm font-medium">{user.money.toFixed(2)}</span>
                  </div>

                  <Link
                    to="/loans"
                    className="hidden sm:flex items-center gap-1.5 bg-background-card border border-white/10 hover:border-primary/30 rounded-lg px-3 py-1.5 transition-all text-sm font-medium text-gray-400 hover:text-white"
                  >
                    <span className="material-symbols-outlined !text-[16px]">account_balance</span>
                    <span>Loan</span>
                  </Link>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-black font-bold text-xs cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {user.name.substring(0, 2).toUpperCase()}
                    </button>
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-background-card py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[60]">
                        <div className="px-4 py-2 text-sm text-gray-300 border-b border-white/10">
                          {user.name}
                        </div>
                        <button
                          onClick={logout}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-all hover:bg-primary-hover"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;