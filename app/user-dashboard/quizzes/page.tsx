'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Quizzes() {
  const { data: session, status } = useSession();
  const [quizzes, setQuizzes] = useState<{ id: number; title: string; type: string }[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) return;

    const fetchQuizzes = async () => {
      try {
        const res = await fetch('/api/quizzes');
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setQuizzes(data);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };
    fetchQuizzes();
  }, [session?.user?.id, status]);

  if (status === 'loading') {
    return <div className="text-white">Loading...</div>;
  }

  if (!session?.user) {
    return <div className="text-white">Please log in to view quizzes.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quizzes</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardContent>
          {quizzes.length === 0 ? (
            <p className="text-sm text-gray-400">No quizzes available.</p>
          ) : (
            <ul className="space-y-2">
              {quizzes.map((quiz) => (
                <li key={quiz.id} className="text-sm text-gray-300">
                  <Link href={`/user-dashboard/quizzes/${quiz.id}`} className="text-cyan-400 hover:text-cyan-300">{quiz.title} ({quiz.type})</Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}