'use client';

import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

interface Module {
  id: number;
  title: string;
  content: string;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [modules, setModules] = useState<Module[]>([]);
  const [newModule, setNewModule] = useState({ title: '', content: '' });

  const fetchModules = async () => {
    const res = await fetch('/api/modules');
    const data: Module[] = await res.json();
    setModules(data);
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newModule),
    });
    if (res.ok) {
      toast.success('Module added!');
      setNewModule({ title: '', content: '' });
      fetchModules();
    } else {
      toast.error('Failed to add module');
    }
  };

  // Fix session.user possibly undefined and role type
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => signOut({ callbackUrl: '/auth/signin' })}>Sign Out</Button>
      </div>

      {/* Add Module Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Module</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddModule} className="space-y-4">
            <div>
              <Label htmlFor="title">Module Title</Label>
              <Input
                id="title"
                value={newModule.title}
                // Fix implicit any for event handlers
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewModule({ ...newModule, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="content">Module Content</Label>
              <Input
                id="content"
                value={newModule.content}
                // Fix implicit any for event handlers
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewModule({ ...newModule, content: e.target.value })}
                required
              />
            </div>
            <Button type="submit">Add Module</Button>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}