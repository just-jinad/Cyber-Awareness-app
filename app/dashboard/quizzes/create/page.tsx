'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Question {
  type: string;
  text: string;
  options: string[];
  correct: string;
  score: number;
  feedback: string;
}

export default function CreateQuiz() {
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    type: 'module-linked', // Default type
    pin: '', // Optional
    questions: [] as Question[],
  });
  const router = useRouter();

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuiz.type === 'pin-protected' && !newQuiz.pin) {
      toast.error('Pin is required for pin-protected quizzes');
      return;
    }
    for (const [i, q] of newQuiz.questions.entries()) {
      const nonEmptyOptions = q.options.filter((opt) => opt.trim() !== '');
      if (nonEmptyOptions.length < 2) {
        toast.error(`Question ${i + 1} must have at least two non-empty options.`);
        return;
      }
      if (!q.correct || !nonEmptyOptions.includes(q.correct)) {
        toast.error(`Question ${i + 1} must have a valid correct answer.`);
        return;
      }
    }
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newQuiz,
          moduleId: newQuiz.type === 'module-linked' ? 1 : null, // Placeholder, link to module later
        }),
      });
      if (res.ok) {
        toast.success('Quiz created successfully!');
        router.push('/dashboard/quizzes');
      } else {
        const { error } = await res.json();
        toast.error(`Failed to create quiz: ${error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('An error occurred while creating the quiz');
    }
  };

  const addQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [...newQuiz.questions, { type: 'multiple-choice', text: '', options: ['', ''], correct: '', score: 0, feedback: '' }],
    });
  };

  const removeQuestion = (questionIndex: number) => {
    setNewQuiz({
      ...newQuiz,
      questions: newQuiz.questions.filter((_, index) => index !== questionIndex),
    });
  };

  const updateQuestion = (questionIndex: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], [field]: value };
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[questionIndex].options.push('');
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...newQuiz.questions];
    if (updatedQuestions[questionIndex].options.length <= 2) {
      toast.error('Each question must have at least two options');
      return;
    }
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter((_, idx) => idx !== optionIndex);
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddQuiz} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={newQuiz.title}
                onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                placeholder="Enter quiz title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Quiz Type</Label>
              <Select
                value={newQuiz.type}
                onValueChange={(value) => setNewQuiz({ ...newQuiz, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quiz type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (No Login Required)</SelectItem>
                  <SelectItem value="module-linked">Module-Linked (Login Required)</SelectItem>
                  <SelectItem value="pin-protected">Pin-Protected (Optional Login)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newQuiz.type === 'pin-protected' && (
              <div className="space-y-2">
                <Label htmlFor="pin">Pin (Required for Pin-Protected)</Label>
                <Input
                  id="pin"
                  value={newQuiz.pin}
                  onChange={(e) => setNewQuiz({ ...newQuiz, pin: e.target.value })}
                  placeholder="Enter pin"
                  required
                />
              </div>
            )}
            {newQuiz.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Question {questionIndex + 1}</h3>
                  <Button variant="destructive" onClick={() => removeQuestion(questionIndex)} type="button">
                    Remove Question
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value) => updateQuestion(questionIndex, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="true-false">True/False</SelectItem>
                      <SelectItem value="scenario-based">Scenario-Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`text-${questionIndex}`}>Question Text</Label>
                  <Input
                    id={`text-${questionIndex}`}
                    value={question.text}
                    onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                    placeholder="Enter question text"
                    required
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
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const updatedOptions = [...question.options];
                            updatedOptions[optionIndex] = e.target.value;
                            updateQuestion(questionIndex, 'options', updatedOptions);
                          }}
                          placeholder={`Option ${optionIndex + 1}`}
                          required
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
                      <Select
                        value={question.correct}
                        onValueChange={(value) => updateQuestion(questionIndex, 'correct', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          {question.options.filter((option) => option.trim() !== '').map((option, idx) => (
                            <SelectItem key={idx} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Select
                      value={question.correct}
                      onValueChange={(value) => updateQuestion(questionIndex, 'correct', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor={`score-${questionIndex}`}>Score (Points)</Label>
                  <Input
                    id={`score-${questionIndex}`}
                    type="number"
                    value={question.score}
                    onChange={(e) => updateQuestion(questionIndex, 'score', parseInt(e.target.value))}
                    placeholder="Enter score for correct answer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`feedback-${questionIndex}`}>Feedback</Label>
                  <Input
                    id={`feedback-${questionIndex}`}
                    value={question.feedback}
                    onChange={(e) => updateQuestion(questionIndex, 'feedback', e.target.value)}
                    placeholder="Explain why this is the correct answer"
                  />
                </div>
              </div>
            ))}
            <div className="flex space-x-4">
              <Button type="button" onClick={addQuestion} variant="outline">
                Add Question
              </Button>
              <Button type="submit">Create Quiz</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}