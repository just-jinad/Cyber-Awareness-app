'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

type ContentType = 'module' | 'quiz' | 'simulation';

interface ProgressItem {
  id: number;
  title: string;
  type: string;
  status: string;
  score: number;
}

interface UserProgress {
  level: string;
  modules: ProgressItem[];
  quizzes: ProgressItem[];
  simulations: ProgressItem[];
  assignments: { contentId: number; contentType: string; status: string; user: { username: string }; admin: { username: string } }[];
}

// Type-safe function to access progress items
const getProgressItems = (progress: UserProgress, contentType: ContentType): ProgressItem[] => {
  switch (contentType) {
    case 'module':
      return progress.modules;
    case 'quiz':
      return progress.quizzes;
    case 'simulation':
      return progress.simulations;
  }
};

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [completionMessage, setCompletionMessage] = useState<string>('');

  useEffect(() => {
    if (status === 'loading' || !session?.user?.id) return;

    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/user-progress?userId=${session.user!.id}`);
        const data = await res.json();
        if (res.ok && data) {
          const assignmentsRes = await fetch(`/api/assignments?userId=${session.user!.id}`);
          const assignments = await assignmentsRes.json();
          setProgress({ ...data, assignments: assignments || [] });
        } else {
          setProgress({ level: 'beginner', modules: [], quizzes: [], simulations: [], assignments: [] });
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
        setProgress({ level: 'beginner', modules: [], quizzes: [], simulations: [], assignments: [] });
      }
    };
    fetchProgress();
  }, [session?.user?.id, status]);

  useEffect(() => {
    if (!progress || !session?.user?.id) return;

    const completedSimulations = progress.simulations.filter(s => s.status === 'completed').length;
    const completedQuizzes = progress.quizzes.filter(q => q.status === 'completed').length;
    const completedModules = progress.modules.filter(m => m.status === 'completed').length;

    const simulationProgress = Math.min(completedSimulations, 1) / 1; // 20%
    const quizProgress = Math.min(completedQuizzes, 2) / 2; // 40%
    const moduleProgress = Math.min(completedModules, 2) / 2; // 40%

    const totalProgress = (simulationProgress + quizProgress + moduleProgress) / 5 * 100;
    setProgressPercentage(totalProgress);

    if (progress.level === 'beginner' && completedSimulations >= 1 && completedQuizzes >= 2 && completedModules >= 2) {
      fetch(`/api/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: session.user.id, level: 'intermediate' }),
      }).then(() => {
        setProgress(prev => prev ? { ...prev, level: 'intermediate' } : prev);
        setCompletionMessage('Congratulations! You’ve advanced to Intermediate level!');
        setTimeout(() => setCompletionMessage(''), 5000);
      });
    }
  }, [progress, session?.user?.id]);

  const handleComplete = async (contentId: number, contentType: ContentType) => {
    if (!progress || !session?.user?.id || getProgressItems(progress, contentType).find(item => item.id === contentId)?.status === 'completed') {
      return;
    }

    try {
      const res = await fetch('/api/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          [contentType + 'Id']: contentId,
          score: 100,
          status: 'completed',
          timeTaken: 0,
        }),
      });
      if (res.ok) {
        setProgress(prev => {
          if (!prev) return prev;
          const updatedItems = getProgressItems(prev, contentType).map(item =>
            item.id === contentId ? { ...item, status: 'completed' } : item
          );
          const updatedAssignments = prev.assignments.map(a =>
            a.contentId === contentId && a.contentType === contentType ? { ...a, status: 'done' } : a
          );
          return { ...prev, [contentType + 's']: updatedItems, assignments: updatedAssignments };
        });

        await fetch('/api/assignments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.user.id, contentId, contentType, status: 'done' }),
        });
      }
    } catch (error) {
      console.error(`Error marking ${contentType} as completed:`, error);
    }
  };

  if (status === 'loading' || !progress) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!session?.user) {
    return <div className="container mx-auto p-6">Please log in to view your dashboard.</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Dashboard</h1>
      {completionMessage && (
        <Card className="bg-green-800 border-green-700">
          <CardContent className="p-4">
            <p className="text-lg text-white">{completionMessage}</p>
          </CardContent>
        </Card>
      )}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">My Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-300">Level: {progress.level}</p>
          <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
            <div
              className="bg-cyan-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">Progress: {Math.round(progressPercentage)}%</p>
          <div className="mt-4 space-y-2 text-sm text-gray-300">
            <p>Simulations: {progress.simulations.filter(s => s.status === 'completed').length}/1</p>
            <p>Quizzes: {progress.quizzes.filter(q => q.status === 'completed').length}/2</p>
            <p>Modules: {progress.modules.filter(m => m.status === 'completed').length}/2</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">My Assigned Content</CardTitle>
        </CardHeader>
        <CardContent>
          {progress.assignments.length === 0 ? (
            <p className="text-lg text-gray-400">No assignments yet. Contact an admin.</p>
          ) : (
            <ul className="space-y-2">
              {progress.assignments.map((assignment, index) => {
                const contentType = assignment.contentType as ContentType;
                const item = getProgressItems(progress, contentType).find(i => i.id === assignment.contentId);
                if (!item) return null;
                return (
                  <li key={index} className="text-lg text-gray-300 flex items-center space-x-2">
                    <Link
                      href={`/user-dashboard/${assignment.contentType}s/${assignment.contentId}`}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      {item.title}
                    </Link>
                    <span>- Status: {assignment.status}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            onClick={() => handleComplete(assignment.contentId, contentType)}
                            disabled={item.status === 'completed'}
                            className={`px-2 py-1 text-sm ${item.status === 'completed' ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                          >
                            {item.status === 'completed' ? 'Completed' : 'Mark Completed'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {item.status === 'completed' ? 'Already completed' : 'Mark as completed'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}