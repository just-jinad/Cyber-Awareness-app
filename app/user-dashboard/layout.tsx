'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, Home, Book, Play, List, User } from 'lucide-react';

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/user-dashboard', icon: Home },
    { name: 'Simulations', path: '/user-dashboard/simulations', icon: Play },
    { name: 'Quizzes', path: '/user-dashboard/quizzes', icon: List },
    { name: 'Modules', path: '/user-dashboard/modules', icon: Book },
  ];

  return (
    <div className="flex h-screen bg-[#111d3c] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-cyan-500 hover:bg-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-lg font-semibold">CyberAware</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-gray-700 hover:text-white text-gray-300`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold">User Dashboard</h1>
            </div>

            {/* User Profile Icon */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
