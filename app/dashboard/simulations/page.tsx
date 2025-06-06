'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Image as ImageIcon, Eye, MoreHorizontal, Search, Filter, Play } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/simulations');
        if (res.ok) {
          const data = await res.json();
          setSimulations(data);
        }
      } catch (error) {
        toast.error('Failed to fetch simulations');
      } finally {
        setLoading(false);
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
      toast.success('Simulation deleted successfully!');
    } else {
      toast.error('Failed to delete simulation');
    }
    setDeleteDialog({ open: false, simId: null });
  };

  const filteredSimulations = simulations.filter(simulation =>
    simulation.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Simulations</h1>
            <p className="text-gray-400 mt-1">Manage your interactive simulations</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded mb-4"></div>
                <div className="h-32 bg-gray-700 rounded mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-700 rounded flex-1"></div>
                  <div className="h-8 bg-gray-700 rounded flex-1"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-white mb-2">Unauthorized</h3>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Simulations</h1>
          <p className="text-gray-400 mt-1">Manage your interactive simulations and scenarios</p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/simulations/create')}
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Simulation
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center space-x-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search simulations..."
            className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <div className="text-sm text-gray-400">
          {filteredSimulations.length} of {simulations.length} simulations
        </div>
      </div>

      {/* Simulations Grid */}
      {filteredSimulations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {searchTerm ? 'No simulations found' : 'No simulations yet'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Create your first simulation to get started with interactive scenarios.'
            }
          </p>
          {!searchTerm && (
            <Button 
              onClick={() => router.push('/dashboard/simulations/create')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Simulation
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSimulations.map((simulation) => (
            <Card key={simulation.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-200 group">
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-blue-600 rounded-t-lg flex items-center justify-center">
                  <Play className="h-12 w-12 text-white opacity-50" />
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="bg-black/50 hover:bg-black/70 text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{simulation.title}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {simulation.steps.length} step{simulation.steps.length !== 1 ? 's' : ''} • Interactive scenario
                </p>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/simulations/edit/${simulation.id}`)}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(simulation.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={open => setDeleteDialog(d => ({ ...d, open }))}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300">
              Are you sure you want to delete this simulation? This action cannot be undone and will permanently remove all associated content.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ open: false, simId: null })}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Simulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}