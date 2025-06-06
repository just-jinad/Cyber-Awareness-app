'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Plus, Trash2, Eye, Settings, HelpCircle } from 'lucide-react';
import Link from 'next/link';

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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuiz.title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    if (newQuiz.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    if (newQuiz.type === 'pin-protected' && !newQuiz.pin) {
      toast.error('Pin is required for pin-protected quizzes');
      return;
    }

    for (const [i, q] of newQuiz.questions.entries()) {
      if (!q.text.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return;
      }
      
      const nonEmptyOptions = q.options.filter((opt) => opt.trim() !== '');
      if (q.type !== 'true-false' && nonEmptyOptions.length < 2) {
        toast.error(`Question ${i + 1} must have at least two non-empty options.`);
        return;
      }
      if (!q.correct || (q.type !== 'true-false' && !nonEmptyOptions.includes(q.correct))) {
        toast.error(`Question ${i + 1} must have a valid correct answer.`);
        return;
      }
    }

    setLoading(true);
    
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
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [...newQuiz.questions, { type: 'multiple-choice', text: '', options: ['', ''], correct: '', score: 1, feedback: '' }],
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

  const totalQuestions = newQuiz.questions.length;
  const totalScore = newQuiz.questions.reduce((sum, q) => sum + (q.score || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/quizzes">
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Quiz</h1>
          <p className="text-gray-400 mt-1">Build interactive quizzes for your students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quiz Settings */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Quiz Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Quiz Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                  placeholder="Enter quiz title"
                  required
                  maxLength={100}
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {newQuiz.title.length}/100 characters
                </div>
              </div>

              {/* Quiz Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quiz Type <span className="text-red-400">*</span>
                </label>
                <Select
                  value={newQuiz.type}
                  onValueChange={(value) => setNewQuiz({ ...newQuiz, type: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select quiz type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="public" className="text-white hover:bg-gray-600">Public (No Login Required)</SelectItem>
                    <SelectItem value="module-linked" className="text-white hover:bg-gray-600">Module-Linked (Login Required)</SelectItem>
                    <SelectItem value="pin-protected" className="text-white hover:bg-gray-600">Pin-Protected (Optional Login)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pin Field */}
              {newQuiz.type === 'pin-protected' && (
                <div>
                  <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-2">
                    Pin <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="pin"
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                    value={newQuiz.pin}
                    onChange={(e) => setNewQuiz({ ...newQuiz, pin: e.target.value })}
                    placeholder="Enter pin for quiz access"
                    required
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Questions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Questions ({totalQuestions})
                </CardTitle>
                <Button
                  type="button"
                  onClick={addQuestion}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {newQuiz.questions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-lg">
                  <HelpCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No questions added yet</p>
                  <Button
                    type="button"
                    onClick={addQuestion}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Question
                  </Button>
                </div>
              ) : (
                newQuiz.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="bg-gray-700 border border-gray-600 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-white">Question {questionIndex + 1}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeQuestion(questionIndex)} 
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Question Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                      <Select
                        value={question.type}
                        onValueChange={(value) => updateQuestion(questionIndex, 'type', value)}
                      >
                        <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-600 border-gray-500">
                          <SelectItem value="multiple-choice" className="text-white hover:bg-gray-500">Multiple Choice</SelectItem>
                          <SelectItem value="true-false" className="text-white hover:bg-gray-500">True/False</SelectItem>
                          <SelectItem value="scenario-based" className="text-white hover:bg-gray-500">Scenario-Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Question Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Question Text</label>
                      <textarea
                        rows={3}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors resize-vertical"
                        value={question.text}
                        onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                        placeholder="Enter your question here..."
                        required
                      />
                    </div>

                    {/* Options or True/False */}
                    {question.type !== 'true-false' ? (
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-sm font-medium text-gray-300">Options</label>
                          <Button 
                            type="button" 
                            size="sm"
                            variant="outline" 
                            onClick={() => addOption(questionIndex)}
                            className="border-gray-500 text-gray-300 hover:bg-gray-600 hover:text-white"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Option
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-3">
                              <span className="text-gray-400 text-sm w-6">{String.fromCharCode(65 + optionIndex)}.</span>
                              <input
                                type="text"
                                className="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                                value={option}
                                onChange={(e) => {
                                  const updatedOptions = [...question.options];
                                  updatedOptions[optionIndex] = e.target.value;
                                  updateQuestion(questionIndex, 'options', updatedOptions);
                                }}
                                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                required
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeOption(questionIndex, optionIndex)}
                                disabled={question.options.length <= 2}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {/* Correct Answer for Multiple Choice */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Correct Answer</label>
                          <Select
                            value={question.correct}
                            onValueChange={(value) => updateQuestion(questionIndex, 'correct', value)}
                          >
                            <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                              <SelectValue placeholder="Select correct answer" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-600 border-gray-500">
                              {question.options.filter((option) => option.trim() !== '').map((option, idx) => (
                                <SelectItem key={idx} value={option} className="text-white hover:bg-gray-500">
                                  {String.fromCharCode(65 + question.options.indexOf(option))}. {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Correct Answer</label>
                        <Select
                          value={question.correct}
                          onValueChange={(value) => updateQuestion(questionIndex, 'correct', value)}
                        >
                          <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-600 border-gray-500">
                            <SelectItem value="true" className="text-white hover:bg-gray-500">True</SelectItem>
                            <SelectItem value="false" className="text-white hover:bg-gray-500">False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Score and Feedback */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Score (Points)</label>
                        <input
                          type="number"
                          min="0"
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                          value={question.score}
                          onChange={(e) => updateQuestion(questionIndex, 'score', parseInt(e.target.value) || 0)}
                          placeholder="Points"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Feedback <span className="text-gray-500">(optional)</span></label>
                        <input
                          type="text"
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                          value={question.feedback}
                          onChange={(e) => updateQuestion(questionIndex, 'feedback', e.target.value)}
                          placeholder="Explain the answer..."
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              onClick={handleAddQuiz}
              disabled={loading || !newQuiz.title.trim() || newQuiz.questions.length === 0}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Quiz...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Quiz
                </>
              )}
            </Button>
            <Link href="/dashboard/quizzes">
              <Button 
                type="button" 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                disabled={loading}
              >
                Cancel
              </Button>
            </Link>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-800 border-gray-700 sticky top-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Quiz Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Quiz Title */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {newQuiz.title || 'Quiz Title'}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className={`px-2 py-1 rounded text-xs ${
                      newQuiz.type === 'public' ? 'bg-green-900 text-green-300' :
                      newQuiz.type === 'module-linked' ? 'bg-blue-900 text-blue-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {newQuiz.type === 'public' ? 'Public' :
                       newQuiz.type === 'module-linked' ? 'Module-Linked' :
                       'Pin-Protected'}
                    </span>
                  </div>
                </div>

                {/* Quiz Stats */}
                <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Questions:</span>
                    <span className="text-white font-medium">{totalQuestions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Score:</span>
                    <span className="text-white font-medium">{totalScore} points</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Quiz Type:</span>
                    <span className="text-white font-medium capitalize">{newQuiz.type.replace('-', ' ')}</span>
                  </div>
                  {newQuiz.type === 'pin-protected' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Pin Set:</span>
                      <span className="text-white font-medium">{newQuiz.pin ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                </div>

                {/* Question Types Breakdown */}
                {totalQuestions > 0 && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Question Types</h4>
                    <div className="space-y-2 text-sm">
                      {['multiple-choice', 'true-false', 'scenario-based'].map(type => {
                        const count = newQuiz.questions.filter(q => q.type === type).length;
                        if (count === 0) return null;
                        return (
                          <div key={type} className="flex justify-between">
                            <span className="text-gray-400 capitalize">{type.replace('-', ' ')}:</span>
                            <span className="text-white">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Help Text */}
                <div className="bg-cyan-900/20 border border-cyan-800 rounded-lg p-4">
                  <h4 className="text-cyan-300 font-medium mb-2">Tips</h4>
                  <ul className="text-sm text-cyan-200 space-y-1">
                    <li>• Add at least one question to create the quiz</li>
                    <li>• Each question needs a correct answer</li>
                    <li>• Set appropriate scores for each question</li>
                    <li>• Add feedback to help students learn</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}