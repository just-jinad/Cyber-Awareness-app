'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Image as ImageIcon, Eye, MoreHorizontal, Search, Filter } from 'lucide-react';

interface Module {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
}

export default function ModulesList() {
  const [modules, setModules] = useState<Module[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/modules');
      const data: Module[] = await res.json();
      setModules(data);
    } catch (error) {
      toast.error('Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleDeleteModule = (id: number) => {
    setModuleToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteModule = async () => {
    if (moduleToDelete === null) return;
    
    try {
      const res = await fetch(`/api/modules/${moduleToDelete}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        toast.success('Module deleted successfully!');
        fetchModules();
      } else {
        toast.error('Failed to delete module');
      }
    } catch (error) {
      toast.error('Failed to delete module');
    }
    
    setShowDeleteModal(false);
    setModuleToDelete(null);
  };

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Modules</h1>
            <p className="text-gray-400 mt-1">Manage your learning modules</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Modules</h1>
          <p className="text-gray-400 mt-1">Manage your learning modules and educational content</p>
        </div>
        <Link href="/dashboard/modules/create">
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add New Module
          </Button>
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center space-x-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search modules..."
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
          {filteredModules.length} of {modules.length} modules
        </div>
      </div>

      {/* Modules Grid */}
      {filteredModules.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {searchTerm ? 'No modules found' : 'No modules yet'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Create your first module to get started with your educational content.'
            }
          </p>
          {!searchTerm && (
            <Link href="/dashboard/modules/create">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create First Module
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModules.map((module) => (
            <Card key={module.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-200 group">
              <div className="relative">
                {module.imageUrl ? (
                  <img 
                    src={module.imageUrl} 
                    alt={module.title} 
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-t-lg flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-white opacity-50" />
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="bg-black/50 hover:bg-black/70 text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{module.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{module.content}</p>
                
                <div className="flex items-center space-x-2">
                  <Link href={`/dashboard/modules/edit/${module.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteModule(module.id)}
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
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300">
              Are you sure you want to delete this module? This action cannot be undone and will permanently remove all associated content.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteModule}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}