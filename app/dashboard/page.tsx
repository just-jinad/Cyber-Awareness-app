'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

interface Module {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [modules, setModules] = useState<Module[]>([]);
  const [newModule, setNewModule] = useState({ title: '', content: '', image: null as File | null });
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchModules = async () => {
    const res = await fetch('/api/modules');
    const data: Module[] = await res.json();
    setModules(data);
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchModules();
    }
  }, [status]);

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

  const handleEditModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('title', editingModule.title);
    formData.append('content', editingModule.content);
    if (newModule.image) {
      formData.append('image', newModule.image);
    }

    const res = await fetch(`/api/modules/${editingModule.id}`, {
      method: 'PUT',
      body: formData,
    });
    setLoading(false);
    if (res.ok) {
      toast.success('Module updated!');
      setEditingModule(null);
      setNewModule({ title: '', content: '', image: null });
      fetchModules();
    } else {
      toast.error('Failed to update module');
    }
  };

  const handleDeleteModule = async (id: number) => {
    const res = await fetch(`/api/modules/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      toast.success('Module deleted!');
      fetchModules();
    } else {
      toast.error('Failed to delete module');
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => signOut({ callbackUrl: '/auth/signin' })}>Sign Out</Button>
      </div>

      {/* Add/Edit Module Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingModule ? 'Edit Module' : 'Add New Module'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={editingModule ? handleEditModule : handleAddModule} className="space-y-4">
            <div>
              <Label htmlFor="title">Module Title</Label>
              <Input
                id="title"
                value={editingModule ? editingModule.title : newModule.title}
                onChange={(e) =>
                  editingModule
                    ? setEditingModule({ ...editingModule, title: e.target.value })
                    : setNewModule({ ...newModule, title: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="content">Module Content</Label>
              <Input
                id="content"
                value={editingModule ? editingModule.content : newModule.content}
                onChange={(e) =>
                  editingModule
                    ? setEditingModule({ ...editingModule, content: e.target.value })
                    : setNewModule({ ...newModule, content: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="image">Module Image (Optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setNewModule({ ...newModule, image: file });
                }}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {editingModule ? (loading ? 'Updating...' : 'Update Module') : (loading ? 'Adding...' : 'Add Module')}
            </Button>
            {editingModule && (
              <Button
                variant="outline"
                className="ml-2"
                onClick={() => {
                  setEditingModule(null);
                  setNewModule({ title: '', content: '', image: null });
                }}
              >
                Cancel
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* List Modules */}
      <div className="grid gap-4">
        {modules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <CardTitle>{module.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{module.content}</p>
              {module.imageUrl && (
                <img
                  src={module.imageUrl}
                  alt={module.title}
                  className="mt-2 max-w-xs"
                />
              )}
              <div className="mt-4 space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingModule(module);
                    setNewModule({ title: '', content: '', image: null });
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteModule(module.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}