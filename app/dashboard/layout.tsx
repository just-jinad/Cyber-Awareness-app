'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Book, Play, List, LogOut, Menu, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return <div>Access Denied</div>;
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Modules', path: '/dashboard/modules', icon: Book },
    { name: 'Simulations', path: '/dashboard/simulations', icon: Play },
    { name: 'Quizzes', path: '/dashboard/quizzes', icon: List },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Side Navbar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white md:static md:w-64 md:min-h-screen flex-shrink-0`}
      >
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
        </div>
        <nav className="flex flex-col p-2 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center p-2 rounded-lg ${
                pathname === item.path ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
              aria-label={item.name}
            >
              <item.icon className="mr-2" size={20} />
              {item.name}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="flex items-center p-2 rounded-lg hover:bg-gray-700 mt-auto"
            aria-label="Logout"
          >
            <LogOut className="mr-2" size={20} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="fl">
        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle Sidebar"
          >
            <Menu size={24} />
          </Button>
        </div>

        {children}
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}