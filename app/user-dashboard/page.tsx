'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface UserProgress {
  level: string;
  progress: number;
  modules: { id: number; title: string; level: string; status: string; score: number }[];
  assignments: { contentId: number; contentType: string; status: string }[];
  completedCount: number;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState<UserProgress | null>({
    level: 'beginner',
    progress: 0,
    modules: [],
    assignments: [],
    completedCount: 0,
  });
  const [progressPercentage, setProgressPercentage] = useState<number>(0);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) return;

    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/user-progress?userId=${session.user!.id}`);
        const data = await res.json();
        if (res.ok && data) {
          const assignmentsRes = await fetch(`/api/assignments?userId=${session.user!.id}`);
          const assignments = await assignmentsRes.json();
          setProgress({ ...data, assignments: assignments || [], completedCount: data.completedCount });
        } else {
          setProgress({ level: 'beginner', progress: 0, modules: [], assignments: [], completedCount: 0 });
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
        setProgress({ level: 'beginner', progress: 0, modules: [], assignments: [], completedCount: 0 });
      }
    };
    fetchProgress();
  }, [session?.user?.id, status]);

  const handleComplete = async (moduleId: number) => {
    if (!progress || progress.modules.find(m => m.id === moduleId)?.status === 'completed') return;

    try {
      const res = await fetch('/api/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user!.id,
          moduleId,
          score: 100, // Example score
          status: 'completed',
          timeTaken: 0,
        }),
      });
      const data = await res.json();
      if (res.ok && data.progress) {
        // Update module status and completed count
        setProgress((prev) => {
          if (!prev) return prev;
          const updatedModules = prev.modules.map(m =>
            m.id === moduleId ? { ...m, status: 'completed' } : m
          );
          const newCompletedCount = updatedModules.filter(m => m.status === 'completed').length;

          // Update assignment status to 'done' for the completed module
          const updatedAssignments = prev.assignments.map(a =>
            a.contentId === moduleId && a.contentType === 'module' ? { ...a, status: 'done' } : a
          );

          return { ...prev, modules: updatedModules, completedCount: newCompletedCount, assignments: updatedAssignments };
        });

        // Optional: Sync with backend to update assignment status
        await fetch(`/api/assignments/${moduleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session?.user!.id, status: 'done' }),
        });
      }
    } catch (error) {
      console.error('Error marking as completed:', error);
    }
  };

  useEffect(() => {
    if (!progress) return;

    const requiredForIntermediate = 5;
    const requiredForAdvanced = 10;
    let newProgressPercentage = 0;

    if (progress.level === 'beginner' && progress.completedCount < requiredForIntermediate) {
      newProgressPercentage = (progress.completedCount / requiredForIntermediate) * 100;
    } else if (progress.level === 'intermediate' && progress.completedCount < requiredForAdvanced) {
      newProgressPercentage = ((progress.completedCount - requiredForIntermediate) / (requiredForAdvanced - requiredForIntermediate)) * 100;
    } else {
      newProgressPercentage = 100;
    }

    setProgressPercentage(newProgressPercentage);

    const promoteToIntermediate = progress.completedCount >= requiredForIntermediate && progress.level === 'beginner';
    const promoteToAdvanced = progress.completedCount >= requiredForAdvanced && progress.level === 'intermediate';

    if (promoteToIntermediate || promoteToAdvanced) {
      fetch(`/api/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session?.user!.id,
          level: promoteToAdvanced ? 'advanced' : 'intermediate',
        }),
      }).then(() => {
        setProgress((prev) =>
          prev ? { ...prev, level: promoteToAdvanced ? 'advanced' : 'intermediate' } : prev
        );
      });
    }
  }, [progress, session?.user!.id]);

  if (status === 'loading') {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!session?.user) {
    return <div className="container mx-auto p-6">Please log in to view your dashboard.</div>;
  }

  if (!progress) return <div className="container mx-auto p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Dashboard</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">My Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-300">Level: {progress.level}</p>
          <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
            <div
              className="bg-cyan-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
          <p className="text-lg text-gray-400 mt-2">
            Progress: {progress.completedCount} of {progress.level === 'beginner' ? 5 : 10} completed
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">My Modules</CardTitle>
        </CardHeader>
        <CardContent>
          {progress.modules.length === 0 ? (
            <p className="text-lg text-gray-400">No modules assigned yet.</p>
          ) : (
            <ul className="space-y-2">
              {progress.modules.map((module) => (
                <li key={module.id} className="text-lg text-gray-300">
                  <Link
                    href={`/user-dashboard/modules/${module.id}`}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {module.title}
                  </Link>
                  <button
                    onClick={() => handleComplete(module.id)}
                    disabled={module.status === 'completed'}
                    className={`ml-4 px-2 py-1 rounded ${module.status === 'completed' ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {module.status === 'completed' ? 'Completed' : 'Mark Completed'}
                  </button>
                </li>
              ))}
            </ul>
          )}
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
              {progress.assignments.map((assignment, index) => (
                <li key={index} className="text-lg text-gray-300">
                  <Link
                    href={`/user-dashboard/${assignment.contentType}s/${assignment.contentId}`}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {assignment.contentType.charAt(0).toUpperCase() + assignment.contentType.slice(1)} {assignment.contentId}
                  </Link> - Status: {assignment.status}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}