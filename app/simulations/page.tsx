'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

interface Simulation {
  id: number;
  title: string;
  scenario: string;
  choices: string[];
  correctAction: number;
}

export default function SimulationsList() {
  const { data: session, status } = useSession();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimulations = async () => {
      setLoading(true);
      const res = await fetch('/api/simulations');
      const data: Simulation[] = await res.json();
      setSimulations(data);
      setLoading(false);
    };
    if (status === 'authenticated') {
      fetchSimulations();
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading simulations...</span>
      </div>
    );
  }

  if (!session) {
    return <div>Please sign in to access simulations.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cybersecurity Simulations</h1>
      <div className="grid gap-4">
        {simulations.map((simulation) => (
          <Card key={simulation.id}>
            <CardHeader>
              <CardTitle>{simulation.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{simulation.scenario}</p>
              <Link href={`/simulations/${simulation.id}`}>
                <Button className="mt-4">Start Simulation</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}