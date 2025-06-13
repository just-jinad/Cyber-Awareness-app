'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Simulations() {
  const { data: session, status } = useSession();
  const [simulations, setSimulations] = useState<{ id: number; title: string }[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) return;

    const fetchSimulations = async () => {
      try {
        const res = await fetch('/api/simulations');
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setSimulations(data);
      } catch (error) {
        console.error('Error fetching simulations:', error);
      }
    };
    fetchSimulations();
  }, [session?.user?.id, status]);

  if (status === 'loading') {
    return <div className="text-white">Loading...</div>;
  }

  if (!session?.user) {
    return <div className="text-white">Please log in to view simulations.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Simulations</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardContent>
          {simulations.length === 0 ? (
            <p className="text-sm text-gray-400">No simulations available.</p>
          ) : (
            <ul className="space-y-2">
              {simulations.map((sim) => (
                <li key={sim.id} className="text-sm text-gray-300">
                  <Link href={`/user-dashboard/simulations/${sim.id}`} className="text-cyan-400 hover:text-cyan-300">{sim.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}