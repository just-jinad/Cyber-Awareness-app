"use client"

import Link from 'next/link';
import { useState } from 'react';

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className={`${
        isSidebarOpen ? 'w-64' : 'w-16'
      } bg-gray-800 transition-all duration-300 ease-in-out p-4 flex flex-col space-y-4`}>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white focus:outline-none"
        >
          {isSidebarOpen ? '<<' : '>>'}
        </button>
        <nav className="mt-4 space-y-2">
          <Link href="/user-dashboard" className="block p-2 hover:bg-gray-700 rounded">Dashboard</Link>
          <Link href="/user-dashboard/simulations" className="block p-2 hover:bg-gray-700 rounded">Simulations</Link>
          <Link href="/user-dashboard/quizzes" className="block p-2 hover:bg-gray-700 rounded">Quizzes</Link>
          <Link href="/user-dashboard/modules" className="block p-2 hover:bg-gray-700 rounded">Modules</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}