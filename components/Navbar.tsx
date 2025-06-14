"use client"
import React, { useState } from 'react';
import { Shield, Menu, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuizDropdownOpen, setIsQuizDropdownOpen] = useState(false);
  const [isQuizDropdownHovered, setIsQuizDropdownHovered] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isQuizDropdownOpen) setIsQuizDropdownOpen(false); // Close dropdown when main menu toggles
  };

  const toggleQuizDropdown = () => {
    setIsQuizDropdownOpen(!isQuizDropdownOpen);
  };

  const handleMouseEnter = () => {
    setIsQuizDropdownHovered(true);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      setIsQuizDropdownHovered(false);
    }, 5000); // Slight delay to allow mouse to move to dropdown
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-cyan-400" />
            <span className="text-white text-xl font-bold">CyberAware</span>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">Home</Link>
            <Link href="/modules" className="text-gray-300 hover:text-white transition-colors text-sm">Modules</Link>
            <Link href="/simulations" className="text-gray-300 hover:text-white transition-colors text-sm">Simulations</Link>
            <div 
              className="relative group" 
              onMouseEnter={handleMouseEnter} 
              onMouseLeave={handleMouseLeave}
            >
              <button className="text-gray-300 hover:text-white transition-colors text-sm flex items-center space-x-1">
                <span>Quizzes</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div 
                className={`absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg transition-all duration-200 ease-in-out pointer-events-auto
                  ${isQuizDropdownHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
              >
                <Link href="/quizzes/public-quzzies" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors text-sm">
                  Public Quiz
                </Link>
                <Link href="/pin-quzzies" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors text-sm">
                  Pin Quizzes
                </Link>
                <Link href="/quizzes/module" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors text-sm">
                  Module Quizzes
                </Link>
              </div>
            </div>
            <Link href="/About" className="text-gray-300 hover:text-white transition-colors text-sm">About</Link>
            <Link href="/Contact" className="text-gray-300 hover:text-white transition-colors text-sm">Contact</Link>
            <Link href="/auth/signin" className="text-gray-300 hover:text-white transition-colors text-sm">Login</Link>
          </div>
          
          {/* Desktop CTA Button */}
          <Link href="/auth/signup">
            <button className="hidden cursor-pointer md:block bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors text-sm font-medium">
              Get Started
            </button>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-900/98 backdrop-blur-sm border-t border-slate-800">
          <Link href="/" className="text-gray-300 hover:text-white block px-3 py-2 text-base transition-all duration-200 transform hover:translate-x-1">Home</Link>
          <Link href="/modules" className="text-gray-300 hover:text-white block px-3 py-2 text-base transition-all duration-200 transform hover:translate-x-1">Modules</Link>
          <Link href="/simulations" className="text-gray-300 hover:text-white block px-3 py-2 text-base transition-all duration-200 transform hover:translate-x-1">Simulations</Link>
          <div>
            <button
              onClick={toggleQuizDropdown}
              className="text-gray-300 hover:text-white flex items-center w-full px-3 py-2 text-base transition-all duration-200 transform hover:translate-x-1"
            >
              <span>Quizzes</span>
              <ChevronDown className={`h-4 w-4 ml-2 transform transition-transform duration-200 ${isQuizDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`pl-6 space-y-1 transition-all duration-200 ease-in-out ${
              isQuizDropdownOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <Link href="/Redacted" className="text-gray-300 hover:text-white block px-3 py-2 text-sm transition-all duration-200 transform hover:translate-x-1">
                Public Quiz
              </Link>
              <Link href="/quizzes/pin" className="text-gray-300 hover:text-white block px-3 py-2 text-sm transition-all duration-200 transform hover:translate-x-1">
                Pin Quizzes
              </Link>
              <Link href="/quizzes/module" className="text-gray-300 hover:text-white block px-3 py-2 text-sm transition-all duration-200 transform hover:translate-x-1">
                Module Quizzes
              </Link>
            </div>
          </div>
          <Link href="/About" className="text-gray-300 hover:text-white block px-3 py-2 text-base transition-all duration-200 transform hover:translate-x-1">About</Link>
          <Link href="/Contact" className="text-gray-300 hover:text-white block px-3 py-2 text-base transition-all duration-200 transform hover:translate-x-1">Contact</Link>
          <Link href="/auth/signin" className="text-gray-300 hover:text-white block px-3 py-2 text-base transition-all duration-200 transform hover:translate-x-1">Login</Link>
          <div className="px-3 py-2">
            <Link href="/auth/signup">
              <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;