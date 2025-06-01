'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface Module {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
}

export default function EditModule() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [module, setModule] = useState<Module | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fetchModule = async () => {
      try {
        const res = await fetch(`/api/modules/${id}`);
        if (!res.ok) throw new Error('Failed to fetch module');
        const text = await res.text();
        if (!text) throw new Error('Module not found');
        const data: Module = JSON.parse(text);
        setModule(data);
      } catch (err) {
        toast.error('Failed to load module');
        setModule(null);
      } finally {
        timer = setTimeout(() => setLoading(false), 6000);
      }
    };
    fetchModule();
    return () => clearTimeout(timer);
  }, [id]);

  const handleEditModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!module) return;

    const formData = new FormData();
    formData.append('title', module.title);
    formData.append('content', module.content);
    if (newImage) {
      formData.append('image', newImage);
    }

    const res = await fetch(`/api/modules/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (res.ok) {
      toast.success('Module updated!');
      router.push('/dashboard/modules');
    } else {
      toast.error('Failed to update module');
    }
  };

  // Show spinner for at least 6 seconds or while loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <span className="text-lg font-medium text-muted-foreground">Loading module...</span>
      </div>
    );
  }

  if (module === null) {
    return <div className="text-destructive">Module not found or failed to load.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Module</h1>
      <Card>
        <CardHeader>
          <CardTitle>Edit Module</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEditModule} className="space-y-4">
            <div>
              <Label htmlFor="title">Module Title</Label>
              <Input
                id="title"
                value={module.title}
                onChange={(e) => setModule({ ...module, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="content">Module Content</Label>
              <Input
                id="content"
                value={module.content}
                onChange={(e) => setModule({ ...module, content: e.target.value })}
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
                  setNewImage(file);
                }}
              />
              {module.imageUrl && (
                <img src={module.imageUrl} alt={module.title} className="mt-2 max-w-xs" />
              )}
            </div>
            <Button type="submit">Update Module</Button>
            <Button
              variant="outline"
              className="ml-2"
              onClick={() => router.push('/dashboard/modules')}
            >
              Cancel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}