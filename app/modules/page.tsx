'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Module {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
}

export default function Modules() {
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    fetch('/api/modules')
      .then((res) => res.json())
      .then((data) => setModules(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Training Modules</h1>
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
                <Link href={`/modules/${module.id}`}>
                  <Button variant="outline" size="sm">Read More</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}