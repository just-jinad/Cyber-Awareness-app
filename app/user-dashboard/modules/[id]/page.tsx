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
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;

    const fetchModuleAndProgress = async () => {
      try {
        const moduleRes = await fetch(`/api/modules/${id}`);
        if (!moduleRes.ok) throw new Error('Module not found');
        const moduleData = await moduleRes.json();
        setModule(moduleData);

        const progressRes = await fetch(`/api/user-progress?userId=${session.user!.id}&moduleId=${id}`);
        const progressData = await progressRes.json();
        if (progressRes.ok && progressData.status === 'completed') {
          setIsCompleted(true);
        }
      } catch (error) {
        console.error('Error fetching module or progress:', error);
        router.push('/user-dashboard/modules');
      }
    };
    fetchModuleAndProgress();
  }, [id, status, session?.user?.id, router]);

  const handleComplete = async () => {
    if (!session?.user?.id || !module || isCompleted) {
      setErrorMessage(isCompleted ? 'Module already completed' : 'Invalid session or module');
      return;
    }

    try {
      const res = await fetch('/api/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          moduleId: module.id,
          score: 100,
          status: 'completed',
          timeTaken: 0,
        }),
      });
      if (res.ok) {
        setIsCompleted(true);
        await fetch('/api/assignments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.user.id, contentId: module.id, contentType: 'module', status: 'done' }),
        });
        setTimeout(() => router.push('/user-dashboard'), 5000);
      } else {
        throw new Error('Failed to update progress');
      }
    } catch (error) {
      console.error('Error marking module as completed:', error);
      setErrorMessage('Failed to mark module as completed. Please try again.');
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
          {errorMessage && <p className="text-red-600 mt-4">{errorMessage}</p>}
          {isCompleted ? (
            <p className="text-green-600 mt-4">Completed! (Redirecting in 5 seconds...)</p>
          ) : (
            <Button
              onClick={handleComplete}
              className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white"
              disabled={isCompleted}
            >
              Mark as Completed
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}