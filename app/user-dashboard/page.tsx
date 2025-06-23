'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  assignments: { contentId: number; contentType: ContentType; status: string; user: { username: string }; admin: { username: string } }[];
}

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
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (status === 'loading' || !session?.user?.id) return;

    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/user-progress?userId=${session.user!.id}`);
        if (!res.ok) throw new Error(`Failed to fetch progress: ${res.statusText}`);
        const data = await res.json();
        if (!data) throw new Error('No progress data returned');

        const assignmentsRes = await fetch(`/api/assignments?userId=${session.user!.id}`);
        if (!assignmentsRes.ok) throw new Error(`Failed to fetch assignments: ${assignmentsRes.statusText}`);
        const assignments = await assignmentsRes.json();
        console.log('Fetched assignments:', assignments); // Debug log
        if (!Array.isArray(assignments)) throw new Error('Assignments is not an array');

        setProgress({ ...data, assignments });
      } catch (error) {
        console.error('Error fetching progress or assignments:', error);
        setErrorMessage('Failed to load progress or assignments. Please try again.');
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
      if (!res.ok) throw new Error(`Failed to update progress: ${res.statusText}`);
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
    } catch (error) {
      console.error(`Error marking ${contentType} as completed:`, error);
      setErrorMessage(`Failed to mark ${contentType} as completed. Please try again.`);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  if (status === 'loading' || !progress) {
    return <div className="container mx-auto p-6 text-white">Loading...</div>;
  }

  if (!session?.user) {
    return <div className="container mx-auto p-6 text-white">Please log in to view your dashboard.</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Welcome, {session.user?.name || 'User'}!</h1>
      {errorMessage && (
        <Alert className="bg-red-800 border-red-700">
          <AlertDescription className="text-white">{errorMessage}</AlertDescription>
        </Alert>
      )}
      {completionMessage && (
        <Alert className="bg-green-800 border-green-700">
          <AlertDescription className="text-white">{completionMessage}</AlertDescription>
        </Alert>
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
          <p className="text-md text-gray-400 mt-2">Progress: {Math.round(progressPercentage)}%</p>
          <div className="mt-4 space-y-2 text-sm text-gray-300">
            <p>Simulations: {progress.simulations.filter(s => s.status === 'completed').length}/1</p>
            <p>Quizzes: {progress.quizzes.filter(q => q.status === 'completed').length}/2</p>
            <p>Modules: {progress.modules.filter(m => m.status === 'completed').length}/2</p>
          </div>
        </CardContent>
      </Card>

     <Card className="bg-gray-800 border-gray-600">
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
                const progressItem = getProgressItems(progress, contentType).find(i => i.id === assignment.contentId);
                return (
                  <li key={index} className="text-lg text-gray-300 flex items-center space-x-2">
                    <Link
                      href={`/user-dashboard/${assignment.contentType}s/${assignment.contentId}`}
                      className="text-cyan-400 hover:text-cyan-200"
                    >
                      {progressItem?.title || `Content ID: ${assignment.contentId}`}
                    </Link>
                    <span>- Status: {assignment.status}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleComplete(assignment.contentId, contentType)}
                            disabled={progressItem?.status === 'completed'}
                            className={`px-2 text-sm ${progressItem?.status === 'completed' ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                          >
                            {progressItem?.status === 'completed' ? 'Completed' : 'Mark Completed'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {progressItem?.status === 'completed' ? 'Already completed' : 'Mark as completed'}
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