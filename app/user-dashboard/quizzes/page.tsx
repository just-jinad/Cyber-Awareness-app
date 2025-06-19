'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Quizzes() {
  const { data: session, status } = useSession();
  const [publicQuizzes, setPublicQuizzes] = useState<{ id: number; title: string }[]>([]);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isPinLoading, setIsPinLoading] = useState(false);

  useEffect(() => {
    const fetchPublicQuizzes = async () => {
      try {
        const res = await fetch('/api/quizzes?type=public');
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setPublicQuizzes(data);
      } catch (error) {
        console.error('Error fetching public quizzes:', error);
      }
    };
    fetchPublicQuizzes();
  }, []);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setIsPinLoading(true);

    if (!pin || pin.length < 4) {
      setPinError('Please enter a valid PIN (at least 4 characters).');
      setIsPinLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/quizzes/pin/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid PIN. Please try again.');
      }

      const data = await response.json();
      // Store PIN temporarily for re-validation
      sessionStorage.setItem('quizPin', pin);
      window.location.href = `/user-dashboard/quizzes/${data.quizId}?pinVerified=true`; // Updated redirect
    } catch (error) {
      setPinError((error as Error).message || 'An error occurred. Please try again.');
    } finally {
      setIsPinLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quizzes</h1>

      {/* Pin Quizzes */}
      {session?.user && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Pin-Protected Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">Enter Quiz PIN</Label>
                <Input
                  id="pin"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  className="bg-gray-900 text-white border-gray-600"
                  disabled={isPinLoading}
                />
              </div>
              {pinError && <p className="text-red-400 text-sm">{pinError}</p>}
              <Button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
                disabled={isPinLoading}
              >
                {isPinLoading ? 'Loading...' : 'Start Quiz'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Public Quizzes */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Public Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          {publicQuizzes.length === 0 ? (
            <p className="text-sm text-gray-400">No public quizzes available.</p>
          ) : (
            <ul className="space-y-2">
              {publicQuizzes.map((quiz) => (
                <li key={quiz.id} className="text-sm text-gray-300">
                  <Link
                    href={`/quizzes/public/${quiz.id}`}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {quiz.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Module Quizzes Placeholder */}
      <Card className="bg-gray-800 border-gray-700 opacity-50">
        <CardHeader>
          <CardTitle>Module-Linked Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">Coming soon! Quizzes tied to your learning modules.</p>
        </CardContent>
      </Card>
    </div>
  );
}