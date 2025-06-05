"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      const res = await fetch(`/api/quizzes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
      } else {
        toast.error("Quiz not found");
        router.push("/dashboard/quizzes");
      }
      setLoading(false);
    };
    fetchQuiz();
  }, [id, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/quizzes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quiz),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Quiz updated!");
      router.push("/dashboard/quizzes");
    } else {
      toast.error("Failed to update quiz");
    }
  };

  if (loading) return <div className="container mx-auto p-6">Loading...</div>;
  if (!quiz) return null;

  // Helper functions for editing questions/options
  const updateQuestion = (questionIndex: number, field: string, value: any) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], [field]: value };
    setQuiz({ ...quiz, questions: updatedQuestions });
  };
  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].options = [...updatedQuestions[questionIndex].options, ''];
    setQuiz({ ...quiz, questions: updatedQuestions });
  };
  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...quiz.questions];
    if (updatedQuestions[questionIndex].options.length <= 2) return;
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter((_: string, idx: number) => idx !== optionIndex);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };
  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        { type: 'multiple-choice', text: '', options: ['', ''], correct: '', score: 0, feedback: '' },
      ],
    });
  };
  const removeQuestion = (questionIndex: number) => {
    setQuiz({ ...quiz, questions: quiz.questions.filter((_: any, idx: number) => idx !== questionIndex) });
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={quiz.title} onChange={e => setQuiz({ ...quiz, title: e.target.value })} />
            </div>
            {quiz.questions.map((question: any, questionIndex: number) => (
              <div key={questionIndex} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Question {questionIndex + 1}</h3>
                  <Button variant="destructive" onClick={() => removeQuestion(questionIndex)} type="button">
                    Remove Question
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    className="border rounded px-2 py-1"
                    value={question.type}
                    onChange={e => updateQuestion(questionIndex, 'type', e.target.value)}
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true-false">True/False</option>
                    <option value="scenario-based">Scenario-Based</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`text-${questionIndex}`}>Question Text</Label>
                  <Input
                    id={`text-${questionIndex}`}
                    value={question.text}
                    onChange={e => updateQuestion(questionIndex, 'text', e.target.value)}
                    placeholder="Enter question text"
                  />
                </div>
                {question.type !== 'true-false' ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Options</Label>
                      <Button type="button" variant="outline" onClick={() => addOption(questionIndex)}>
                        Add Option
                      </Button>
                    </div>
                    {question.options.map((option: string, optionIndex: number) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={e => {
                            const updatedOptions = [...question.options];
                            updatedOptions[optionIndex] = e.target.value;
                            updateQuestion(questionIndex, 'options', updatedOptions);
                          }}
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeOption(questionIndex, optionIndex)}
                          disabled={question.options.length <= 2}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <select
                        className="border rounded px-2 py-1"
                        value={question.correct}
                        onChange={e => updateQuestion(questionIndex, 'correct', e.target.value)}
                      >
                        <option value="">Select correct answer</option>
                        {question.options.map((option: string, idx: number) => (
                          <option key={idx} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <select
                      className="border rounded px-2 py-1"
                      value={question.correct}
                      onChange={e => updateQuestion(questionIndex, 'correct', e.target.value)}
                    >
                      <option value="">Select correct answer</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor={`score-${questionIndex}`}>Score (Points)</Label>
                  <Input
                    id={`score-${questionIndex}`}
                    type="number"
                    value={question.score}
                    onChange={e => updateQuestion(questionIndex, 'score', parseInt(e.target.value))}
                    placeholder="Enter score for correct answer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`feedback-${questionIndex}`}>Feedback</Label>
                  <Input
                    id={`feedback-${questionIndex}`}
                    value={question.feedback}
                    onChange={e => updateQuestion(questionIndex, 'feedback', e.target.value)}
                    placeholder="Explain why this is the correct answer"
                  />
                </div>
              </div>
            ))}
            <div className="flex space-x-4">
              <Button
                type="button"
                onClick={addQuestion}
                variant="outline"
                className="cursor-pointer flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : null}
                Add Question
              </Button>
              <Button
                type="submit"
                className="cursor-pointer flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : null}
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/quizzes")}
                className="cursor-pointer"
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
