'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Quiz {
  id: number;
  title: string;
  type: string;
}

export default function QuizzesPage() {
  const { data: session, status } = useSession();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const res = await fetch('/api/quizzes?type=module-linked');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      }
    };
    if (status === 'authenticated') fetchQuizzes();
  }, [status]);

  if (status === 'loading') return <div className="container mx-auto p-6">Loading...</div>;
  if (!session) return <div className="container mx-auto p-6">Please sign in to view quizzes.</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Quizzes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-xs text-muted-foreground">Type: {quiz.type}</div>
              <Link href={`/quizzes/${quiz.id}`}>
                <Button>Take Quiz</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}