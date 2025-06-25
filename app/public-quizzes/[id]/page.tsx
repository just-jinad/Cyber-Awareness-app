'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';

interface Quiz {
  id: number;
  title: string;
  questions: { id: number; type: string; text: string; options: string[]; correct: string; score: number; feedback?: string }[];
}

export default function PublicQuizPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      const res = await fetch(`/api/quizzes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
      } else {
        router.push('/public-quizzes');
      }
      setIsLoading(false);
    };
    fetchQuiz();
  }, [id, router]);

  const handleSubmit = async () => {
    if (!quiz) return;
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

    // Save anonymous result (no userId)
    await fetch('/api/quiz-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId: quiz.id, score: totalScore, answers }),
    });
  };

  if (isLoading || !quiz) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl lg:text-4xl font-bold mb-6">
          {quiz.title}
          <span className="text-cyan-400"> Quiz</span>
        </h1>
        <Card className="bg-slate-800 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Public Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quiz.questions.map((question) => {
              const options = Array.isArray(question.options) ? question.options : [];
              return (
                <div key={question.id} className="border border-slate-600 rounded-lg p-4 bg-slate-900">
                  <h3 className="text-lg font-semibold text-white mb-2">{question.text}</h3>
                  <RadioGroup
                    value={answers[question.id] || ''}
                    onValueChange={(value: string) => setAnswers({ ...answers, [question.id]: value })}
                    disabled={score !== null}
                    className="space-y-2"
                  >
                    {options.map((option, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                        <Label htmlFor={`${question.id}-${idx}`} className="text-gray-200">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              );
            })}
            {score === null ? (
              <Button
                className="bg-cyan-500 hover:bg-cyan-600 text-white mt-4"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            ) : (
              <div className="space-y-4 mt-4">
                <p className="text-lg font-semibold text-white">
                  Your Score: <span className="text-cyan-400">{score}</span>
                </p>
                {feedback.map((msg, idx) => (
                  <p
                    key={idx}
                    className={msg.includes('Correct') ? 'text-green-400' : 'text-red-400'}
                  >
                    {msg}
                  </p>
                ))}
                <Button
                  variant="outline"
                  className="text-cyan-400 border-slate-600 hover:text-cyan-300 hover:bg-slate-700"
                  onClick={() => router.push('/public-quizzes')}
                >
                  Return to Public Quizzes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}