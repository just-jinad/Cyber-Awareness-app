'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Quiz {
  id: number;
  title: string;
  type: string;
  pin?: string;
  moduleId?: number;
  questions: { id: number; type: string; text: string; options: string[]; correct: string; score: number; feedback?: string }[];
}

export default function QuizPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string[]>([]);

  useEffect(() => {
    const fetchQuizAndVerifyPin = async () => {
      try {
        // Fetch quiz data
        const res = await fetch(`/api/quizzes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setQuiz(data);

          // Check if PIN is pre-verified via query parameter
          if (data.type === 'pin-protected' && searchParams.get('pinVerified') === 'true') {
            const storedPin = sessionStorage.getItem('quizPin');
            if (storedPin) {
              // Re-validate PIN server-side
              const verifyResponse = await fetch('/api/quizzes/pin/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin: storedPin, quizId: id }),
              });

              if (verifyResponse.ok) {
                setIsPinVerified(true);
                sessionStorage.removeItem('quizPin'); // Clean up
              } else {
                setPinError('PIN validation failed. Please re-enter PIN.');
                sessionStorage.removeItem('quizPin');
              }
            } else {
              setPinError('No PIN found. Please re-enter PIN.');
            }
          } else if (data.type !== 'pin-protected') {
            setIsPinVerified(true); // Auto-verify non-pin quizzes
          }
        } else {
          router.push('/user-dashboard/quizzes');
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        router.push('/user-dashboard/quizzes');
      }
    };

    if (status === 'authenticated' || status === 'unauthenticated') fetchQuizAndVerifyPin();
  }, [id, status, router, searchParams]);

  const verifyPin = async () => {
    if (!quiz) return;
    setPinError('');

    if (!pin || pin.length < 4) {
      setPinError('Please enter a valid PIN (at least 4 characters).');
      return;
    }

    try {
      const response = await fetch('/api/quizzes/pin/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, quizId: quiz.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid PIN. Please try again.');
      }

      setIsPinVerified(true);
    } catch (error) {
      setPinError((error as Error).message || 'An error occurred. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !session || (!isPinVerified && quiz.type === 'pin-protected')) return;
    let totalScore = 0;
    const feedbackMessages: string[] = [];

    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correct) {
        totalScore += question.score;
        feedbackMessages.push(`Question ${question.id}: Correct! ${question.feedback || ''}`);
      } else {
        feedbackMessages.push(
          `Question ${question.id}: Incorrect. The correct answer is "${question.correct}". ${question.feedback || ''}`
        );
      }
    });

    setScore(totalScore);
    setFeedback(feedbackMessages);

    try {
      const res = await fetch('/api/quiz-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quiz.id, score: totalScore, answers, userId: session?.user?.id }),
      });
      const data = await res.json();
      console.log('Quiz result response:', data);

      // Only update progress for module-linked quizzes
      if (quiz.type === 'module-linked' && quiz.moduleId) {
        const progressRes = await fetch('/api/user-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user!.id,
            moduleId: quiz.moduleId,
            score: totalScore,
            status: totalScore > 0 ? 'completed' : 'failed',
            timeTaken: 0,
          }),
        });
        const progressData = await progressRes.json();
        console.log('Progress update response:', progressData);

        if (progressRes.ok) {
          setFeedback([...feedbackMessages, 'Redirecting in 5 seconds...']);
          setTimeout(() => router.push('/user-dashboard'), 5000);
        }
      } else {
        setFeedback([...feedbackMessages, 'Quiz completed! Returning to dashboard...']);
        setTimeout(() => router.push('/user-dashboard/quizzes'), 5000);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  if (status === 'loading') return <div className="container mx-auto p-6">Loading...</div>;
  if (!session && quiz?.type !== 'public') return <div className="container mx-auto p-6">Please sign in to access this quiz.</div>;
  if (!quiz) return <div className="container mx-auto p-6">Quiz not found.</div>;

  if (quiz.type === 'pin-protected' && !isPinVerified) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Enter PIN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">Quiz PIN</Label>
                <Input
                  id="pin"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  className="bg-gray-900 text-white border-gray-600"
                />
              </div>
              {pinError && <p className="text-red-400 text-sm">{pinError}</p>}
              <Button
                onClick={verifyPin}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Verify PIN
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.questions.map((question) => (
            <div key={question.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold">{question.text}</h3>
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value: string) => setAnswers({ ...answers, [question.id]: value })}
                disabled={score !== null}
              >
                {question.options.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                    <Label htmlFor={`${question.id}-${idx}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
          {score === null ? (
            <Button onClick={handleSubmit} className="bg-cyan-600 hover:bg-cyan-700 text-white">Submit</Button>
          ) : (
            <div>
              <p className="text-lg font-semibold">Your Score: {score}</p>
              {feedback.map((msg, idx) => (
                <p key={idx} className={msg.includes('Correct') ? 'text-green-600' : 'text-red-600'}>
                  {msg}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}