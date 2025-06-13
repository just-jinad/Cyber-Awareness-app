'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Module {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
}

export default function ModuleDetail() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [module, setModule] = useState<Module | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchModule = async () => {
      const res = await fetch(`/api/modules/${id}`);
      if (res.ok) {
        const data = await res.json();
        setModule(data);
      } else {
        router.push('/user-dashboard/modules');
      }
    };
    if (status === 'authenticated') fetchModule();
  }, [id, status, router]);

  const handleComplete = async () => {
    if (!session?.user?.id || !module) return;
    try {
      const res = await fetch('/api/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          moduleId: module.id,
          score: 100,
          status: 'completed',
          timeTaken: 0, // Add time tracking if needed
        }),
      });
      const data = await res.json();
      console.log('Progress update response:', data);
      if (res.ok) {
        setIsCompleted(true);
        setTimeout(() => router.push('/user-dashboard'), 5000); // 5-second delay
      }
    } catch (error) {
      console.error('Error marking module as completed:', error);
    }
  };

  if (status === 'loading') return <div className="container mx-auto p-6">Loading...</div>;
  if (!session) return <div className="container mx-auto p-6">Please sign in to view this module.</div>;
  if (!module) return <div className="container mx-auto p-6">Module not found.</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{module.title}</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Module</CardTitle>
        </CardHeader>
        <CardContent>
          {module.imageUrl && (
            <img src={module.imageUrl} alt={module.title} className="mb-4 w-full h-64 object-cover rounded-md border" />
          )}
          <div className="prose dark:prose-invert max-w-none text-base leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
            {module.content}
          </div>
          {!isCompleted && (
            <Button onClick={handleComplete} className="mt-4 bg-cyan-600 text-white">
              Mark as Completed
            </Button>
          )}
          {isCompleted && <p className="text-green-600 mt-4">Completed! (Redirecting in 5 seconds...)</p>}
        </CardContent>
      </Card>
    </div>
  );
}