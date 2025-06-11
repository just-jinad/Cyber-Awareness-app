'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface UserProgress {
  level: string;
  progress: number;
  modules: { title: string; level: string; status: string; score: number }[];
}

export default function UserDashboard() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/user-progress');
        const data = await res.json();
        if (res.ok) setProgress(data);
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };
    fetchProgress();
  }, []);

  if (!progress) return <div className="text-white">Loading...</div>;

  const progressPercentage = Math.min(100, (progress.progress / 75) * 100); // Cap at 100%, 75% for advanced

  return (
    <div className="space-y-6 p-6 bg-grey">
      <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">My Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-300">Level: {progress.level}</p>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-1">Progress: {progress.progress.toFixed(2)}% (55% for Intermediate, 75% for Advanced)</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">My Modules</CardTitle>
        </CardHeader>
        <CardContent>
          {progress.modules.length === 0 ? (
            <p className="text-sm text-gray-400">No modules assigned yet.</p>
          ) : (
            <ul className="space-y-2">
              {progress.modules.map((module, index) => (
                <li key={index} className="text-sm text-gray-300">
                  {module.title} - Status: {module.status || 'Not Started'}, Level: {module.level}, Score: {module.score}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Available Content</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li><Link href="/modules" className="text-cyan-400 hover:text-cyan-300">View Modules</Link></li>
            <li><Link href="/quizzes?type=public" className="text-cyan-400 hover:text-cyan-300">Take Public Quizzes</Link></li>
            <li><Link href="/simulations" className="text-cyan-400 hover:text-cyan-300">Try Simulations</Link></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}