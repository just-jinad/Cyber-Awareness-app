'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Quiz {
  id: number;
  title: string;
  pin: string;
  questions: { id: number; type: string; text: string; options: string[]; correct: string; score: number; feedback?: string }[];
}

export default function PinQuizPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [pin, setPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string[]>([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      const res = await fetch(`/api/quizzes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
      } else {
        router.push('/pin-quizzes');
      }
    };
    fetchQuiz();
  }, [id, router]);

  const verifyPin = () => {
    if (quiz && pin === quiz.pin) {
      setPinVerified(true);
    } else {
      alert('Invalid pin');
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !pinVerified) return;
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

    // Save result with optional userId
    await fetch('/api/quiz-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizId: quiz.id,
        score: totalScore,
        answers,
        userId: session?.user?.id,
      }),
    });
  };

  if (!quiz) return <div className="container mx-auto p-6">Loading...</div>;
  if (!pinVerified) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="pin">Enter Pin</Label>
              <Input id="pin" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter pin" />
              <Button onClick={verifyPin}>Verify Pin</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pin-Protected Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.questions.map((question) => (
            <div key={question.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold">{question.text}</h3>
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
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
            <Button onClick={handleSubmit}>Submit</Button>
          ) : (
            <div>
              <p className="text-lg font-semibold">Your Score: {score}</p>
              {feedback.map((msg, idx) => (
                <p key={idx} className={msg.includes('Correct') ? 'text-green-600' : 'text-red-600'}>
                  {msg}
                </p>
              ))}
              <Button variant="outline" onClick={() => router.push('/pin-quizzes')}>
                Return to Pin Quizzes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}