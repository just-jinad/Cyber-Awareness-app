'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';

interface Quiz {
  id: number;
  title: string;
  type: string;
}

export default function PublicQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      const res = await fetch('/api/quizzes?type=public');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      }
      setIsLoading(false);
    };
    fetchQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Public Cybersecurity{' '}
            <span className="text-cyan-400">Quizzes</span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-3xl mx-auto">
            Test your cybersecurity knowledge with our free public quizzes. Challenge yourself and learn key skills to stay safe online.
          </p>
        </div>
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="bg-slate-800 border-slate-600 transition-all duration-300 group hover:transform hover:scale-105"
              >
                <CardHeader>
                  <CardTitle className="text-white group-hover:text-cyan-400 transition-colors">
                    {quiz.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/public-quizzes/${quiz.id}`}>
                    <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                      Take Quiz
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}