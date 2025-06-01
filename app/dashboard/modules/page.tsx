'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Module {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
}

export default function ModulesList() {
  const [modules, setModules] = useState<Module[]>([]);

  const fetchModules = async () => {
    const res = await fetch('/api/modules');
    const data: Module[] = await res.json();
    setModules(data);
  };

  useEffect(() => {
    fetchModules();
  }, []);

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Modules</h1>
        <Link href="/dashboard/modules/create">
          <Button>Add New Module</Button>
        </Link>
      </div>
      {/* List of Modules */}
      <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-2 grid-cols-1">
        {modules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <CardTitle>{module.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{module.content}</p>
              {module.imageUrl && (
                <img src={module.imageUrl} alt={module.title} className="mt-2 max-w-xs" />
              )}
              <div className="mt-4 space-x-2">
                <Link href={`/dashboard/modules/edit/${module.id}`}>
                  <Button variant="outline">Edit</Button>
                </Link>
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