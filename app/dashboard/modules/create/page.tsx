'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Module {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
}

export default function ModulesList() {
  const [modules, setModules] = useState<Module[]>([]);
  const [newModule, setNewModule] = useState({ title: '', content: '', image: null as File | null });
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<number | null>(null);

  const fetchModules = async () => {
    const res = await fetch('/api/modules');
    const data: Module[] = await res.json();
    setModules(data);
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
    const res = await fetch(`/api/modules/${moduleToDelete}`, {
      method: 'DELETE',
    });
    setShowDeleteModal(false);
    setModuleToDelete(null);
    if (res.ok) {
      toast.success('Module deleted!');
      fetchModules();
    } else {
      toast.error('Failed to delete module');
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('title', newModule.title);
    formData.append('content', newModule.content);
    if (newModule.image) {
      formData.append('image', newModule.image);
    }
    const res = await fetch('/api/modules', {
      method: 'POST',
      body: formData,
    });
    setLoading(false);
    if (res.ok) {
      toast.success('Module added!');
      setNewModule({ title: '', content: '', image: null });
      fetchModules();
    } else {
      toast.error('Failed to add module');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Modules</h1>
      </div>
      {/* Create Module Form */}
      <form
        onSubmit={handleAddModule}
        className="mb-8 space-y-6 max-w-lg bg-card p-8 rounded-xl shadow-lg border border-border"
      >
        <div>
          <label htmlFor="title" className="block font-semibold mb-2 text-sm text-foreground">Title</label>
          <input
            id="title"
            className="input input-bordered w-full rounded-md px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/60 bg-background text-foreground"
            value={newModule.title}
            onChange={e => setNewModule({ ...newModule, title: e.target.value })}
            required
            placeholder="Enter module title"
          />
        </div>
        <div>
          <label htmlFor="content" className="block font-semibold mb-2 text-sm text-foreground">Content</label>
          <textarea
            id="content"
            className="input input-bordered w-full min-h-[120px] rounded-md px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/60 bg-background text-foreground resize-vertical"
            value={newModule.content}
            onChange={e => setNewModule({ ...newModule, content: e.target.value })}
            required
            placeholder="Enter module content"
          />
        </div>
        <div>
          <label htmlFor="image" className="block font-semibold mb-2 text-sm text-foreground">Image (optional)</label>
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            onChange={e => {
              const file = e.target.files?.[0] || null;
              setNewModule({ ...newModule, image: file });
            }}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full mt-2">
          {loading ? 'Adding...' : 'Add Module'}
        </Button>
      </form>
      {/* List of Modules */}
      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-2 grid-cols-1">
        {modules.map((module) => (
          <Card key={module.id} className="flex flex-col h-full rounded-xl shadow-md border bg-card">
            <CardHeader>
              <CardTitle className="truncate text-lg font-semibold">{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="flex-1 mb-2 text-sm text-muted-foreground line-clamp-4">{module.content}</div>
              {module.imageUrl && (
                <img src={module.imageUrl} alt={module.title} className="mt-2 w-full h-32 object-cover rounded-md border" />
              )}
              <div className="mt-4 flex gap-2">
                <Link href={`/dashboard/modules/edit/${module.id}`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteModule(module.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this module? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteModule}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}