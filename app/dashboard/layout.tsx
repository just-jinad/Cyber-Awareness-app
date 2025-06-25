'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Book, Play, List, LogOut, Menu, Home, Bell, Search, User, Settings, BarChart3, Filter, Calendar, UserPen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 text-white`}
      >
        <div className="flex flex-col space-y-4">
          <p className="text-sm font-medium">Are you sure you want to log out?</p>
          <div className="flex space-x-2">
            <Button
              onClick={() => {
                toast.dismiss(t.id);
                signOut({ callbackUrl: '/auth/signin' });
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white flex-1"
            >
              Confirm
            </Button>
            <Button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-600 hover:bg-gray-500 text-white flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Access Denied</div>
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: Home },
    { name: 'Modules', path: '/dashboard/modules', icon: Book },
    { name: 'Simulations', path: '/dashboard/simulations', icon: Play },
    { name: 'Quizzes', path: '/dashboard/quizzes', icon: List },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Assign Module', path: '/dashboard/assign', icon: UserPen },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#111d3c] text-white overflow-hidden">
      <Toaster />
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
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === item.path 
                  ? 'bg-cyan-500 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search or type a command"
                  className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm w-64"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <kbd className="px-2 py-1 text-xs text-gray-400 bg-gray-600 rounded">⌘K</kbd>
                </div>
              </div>

              {/* Date Range */}
              <div className="hidden lg:flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">23 May - 15 Nov, 2024</span>
              </div>

              {/* Filter */}
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
                <Filter className="h-4 w-4" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </Button>

              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-900 p-6">
          {children}
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z quedar-t border-gray-400"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}