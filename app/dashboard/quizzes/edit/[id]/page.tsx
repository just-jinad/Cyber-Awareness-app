"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Eye, Plus, Trash2, Settings, HelpCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quizzes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setQuiz(data);
        } else {
          toast.error("Quiz not found");
          router.push("/dashboard/quizzes");
        }
      } catch (error) {
        toast.error("Failed to load quiz");
        router.push("/dashboard/quizzes");
      } finally {
        timer = setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchQuiz();
    return () => clearTimeout(timer);
  }, [id, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz?.title?.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }
    if (quiz.questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
      });
      
      if (res.ok) {
        toast.success("Quiz updated successfully!");
        router.push("/dashboard/quizzes");
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to update quiz");
      }
    } catch (error) {
      toast.error("An error occurred while updating the quiz");
    } finally {
      setSaving(false);
    }
  };

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
        { type: 'multiple-choice', text: '', options: ['', ''], correct: '', score: 1, feedback: '' },
      ],
    });
  };

  const removeQuestion = (questionIndex: number) => {
    setQuiz({ ...quiz, questions: quiz.questions.filter((_: any, idx: number) => idx !== questionIndex) });
  };

  // Show spinner while loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-cyan-500 mb-4" size={48} />
        <span className="text-lg font-medium text-gray-300">Loading quiz...</span>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/quizzes">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quizzes
            </Button>
          </Link>
        </div>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <p className="text-red-400 text-lg">Quiz not found or failed to load.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalScore = quiz.questions.reduce((sum: number, q: any) => sum + (q.score || 0), 0);

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
          <h1 className="text-2xl font-bold text-white">Edit Quiz</h1>
          <p className="text-gray-400 mt-1">Update your quiz content and settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Quiz Settings Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Quiz Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Quiz Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                    value={quiz.title}
                    onChange={e => setQuiz({ ...quiz, title: e.target.value })}
                    required
                    placeholder="Enter a descriptive title for your quiz"
                    maxLength={100}
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {quiz.title?.length || 0}/100 characters
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    Questions ({quiz.questions.length})
                  </CardTitle>
                  <Button
                    type="button"
                    onClick={addQuestion}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    disabled={saving}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {quiz.questions.map((question: any, questionIndex: number) => (
                    <div key={questionIndex} className="bg-gray-700 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">Question {questionIndex + 1}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeQuestion(questionIndex)} 
                          type="button"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Question Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Question Type
                          </label>
                          <select
                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            value={question.type}
                            onChange={e => updateQuestion(questionIndex, 'type', e.target.value)}
                          >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="true-false">True/False</option>
                            <option value="scenario-based">Scenario-Based</option>
                          </select>
                        </div>

                        {/* Question Score */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Points
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            value={question.score}
                            onChange={e => updateQuestion(questionIndex, 'score', parseInt(e.target.value) || 0)}
                            placeholder="Points"
                          />
                        </div>
                      </div>

                      {/* Question Text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Question Text <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          rows={3}
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-vertical"
                          value={question.text}
                          onChange={e => updateQuestion(questionIndex, 'text', e.target.value)}
                          placeholder="Enter your question here..."
                        />
                      </div>

                      {/* Options */}
                      {question.type !== 'true-false' ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-300">
                              Answer Options
                            </label>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => addOption(questionIndex)}
                              className="border-gray-500 text-gray-300 hover:bg-gray-600 hover:text-white"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Option
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {question.options.map((option: string, optionIndex: number) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <span className="text-gray-400 text-sm font-medium min-w-[20px]">
                                  {String.fromCharCode(65 + optionIndex)}:
                                </span>
                                <input
                                  type="text"
                                  className="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(questionIndex, optionIndex)}
                                  disabled={question.options.length <= 2}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Correct Answer Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Correct Answer <span className="text-red-400">*</span>
                            </label>
                            <select
                              className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              value={question.correct}
                              onChange={e => updateQuestion(questionIndex, 'correct', e.target.value)}
                            >
                              <option value="">Select correct answer</option>
                              {question.options.map((option: string, idx: number) => (
                                <option key={idx} value={option}>
                                  {String.fromCharCode(65 + idx)}: {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Correct Answer <span className="text-red-400">*</span>
                          </label>
                          <select
                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            value={question.correct}
                            onChange={e => updateQuestion(questionIndex, 'correct', e.target.value)}
                          >
                            <option value="">Select correct answer</option>
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        </div>
                      )}

                      {/* Feedback */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Explanation/Feedback <span className="text-gray-500">(optional)</span>
                        </label>
                        <textarea
                          rows={2}
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-vertical"
                          value={question.feedback}
                          onChange={e => updateQuestion(questionIndex, 'feedback', e.target.value)}
                          placeholder="Explain why this is the correct answer..."
                        />
                      </div>
                    </div>
                  ))}

                  {quiz.questions.length === 0 && (
                    <div className="text-center py-8">
                      <HelpCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No questions added yet</p>
                      <Button
                        type="button"
                        onClick={addQuestion}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Question
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={saving || !quiz.title?.trim() || quiz.questions.length === 0}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating Quiz...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Quiz
                  </>
                )}
              </Button>
              <Link href="/dashboard/quizzes">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  disabled={saving}
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-800 border-gray-700 sticky top-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Quiz Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Quiz Title Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {quiz.title || 'Untitled Quiz'}
                  </h3>
                </div>

                {/* Quiz Stats */}
                <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Questions:</span>
                    <span className="text-white font-medium">{quiz.questions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Points:</span>
                    <span className="text-white font-medium">{totalScore}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Question Types:</span>
                    <div className="text-right">
                      {Object.entries(
                        quiz.questions.reduce((acc: any, q: any) => {
                          acc[q.type] = (acc[q.type] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([type, count]) => (
                        <div key={type} className="text-white text-xs">
                          {type}: {count as number}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-yellow-400">Editing</span>
                  </div>
                </div>

                {/* Question Summary */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Questions Preview</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {quiz.questions.map((q: any, idx: number) => (
                      <div key={idx} className="bg-gray-700 rounded p-3 text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-gray-400">Q{idx + 1}</span>
                          <span className="text-cyan-400 text-xs">{q.score}pts</span>
                        </div>
                        <p className="text-white text-xs line-clamp-2">
                          {q.text || 'No question text'}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-400 text-xs capitalize">{q.type}</span>
                          <span className={`text-xs ${q.correct ? 'text-green-400' : 'text-red-400'}`}>
                            {q.correct ? 'Answer set' : 'No answer'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}