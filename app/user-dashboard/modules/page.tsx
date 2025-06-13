'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Modules() {
  const { data: session, status } = useSession();
  const [modules, setModules] = useState<{ id: number; title: string; level: string }[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) return;

    const fetchModules = async () => {
      try {
        const res = await fetch('/api/modules');
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setModules(data);
      } catch (error) {
        console.error('Error fetching modules:', error);
      }
    };
    fetchModules();
  }, [session?.user?.id, status]);

  if (status === 'loading') {
    return <div className="text-white">Loading...</div>;
  }

  if (!session?.user) {
    return <div className="text-white">Please log in to view modules.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Modules</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardContent>
          {modules.length === 0 ? (
            <p className="text-sm text-gray-400">No modules available.</p>
          ) : (
            <ul className="space-y-2">
              {modules.map((module) => (
                <li key={module.id} className="text-sm text-gray-300">
                  <Link href={`/user-dashboard/modules/${module.id}`} className="text-cyan-400 hover:text-cyan-300">{module.title} (Level: {module.level})</Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}