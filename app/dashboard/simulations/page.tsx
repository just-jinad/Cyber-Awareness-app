'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Simulation {
  id: number;
  title: string;
  steps: { scenario: string; options: string[]; nextStep: (number | null)[]; outcome?: string }[];
}

export default function SimulationsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; simId: number | null }>({ open: false, simId: null });

  useEffect(() => {
    const fetchSimulations = async () => {
      const res = await fetch('/api/simulations');
      if (res.ok) {
        const data = await res.json();
        setSimulations(data);
      }
    };
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchSimulations();
    }
  }, [status, session]);

  const handleDeleteClick = (simId: number) => {
    setDeleteDialog({ open: true, simId });
  };

  const confirmDelete = async () => {
    if (deleteDialog.simId === null) return;
    const res = await fetch(`/api/simulations/${deleteDialog.simId}`, { method: 'DELETE' });
    if (res.ok) {
      setSimulations(simulations.filter(s => s.id !== deleteDialog.simId));
      toast.success('Simulation deleted');
    } else {
      toast.error('Failed to delete simulation');
    }
    setDeleteDialog({ open: false, simId: null });
  };

  if (status === 'loading') return <div className="container mx-auto p-6">Loading...</div>;
  if (!session?.user?.role || session.user.role !== 'ADMIN') return <div className="container mx-auto p-6">Unauthorized</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Simulations Dashboard</h1>
      <div className="mb-4">
        <Button onClick={() => router.push('/dashboard/simulations/create')}>Create New Simulation</Button>
      </div>
      <div className="space-y-4">
        {simulations.map((sim) => (
          <Card key={sim.id}>
            <CardHeader>
              <CardTitle>{sim.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Steps: {sim.steps.length}</p>
              <Button variant="outline" onClick={() => router.push(`/dashboard/simulations/edit/${sim.id}`)} className="mt-2 mr-2">
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteClick(sim.id)}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={deleteDialog.open} onOpenChange={open => setDeleteDialog(d => ({ ...d, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this simulation? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, simId: null })}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}