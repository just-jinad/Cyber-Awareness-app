'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Module {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
}

export default function ModuleDetail() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [module, setModule] = useState<Module | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;

    const fetchModuleAndProgress = async () => {
      try {
        const moduleRes = await fetch(`/api/modules/${id}`);
        if (!moduleRes.ok) throw new Error('Module not found');
        const moduleData = await moduleRes.json();
        setModule(moduleData);

        const progressRes = await fetch(`/api/user-progress?userId=${session.user!.id}&moduleId=${id}`);
        const progressData = await progressRes.json();
        if (progressRes.ok && progressData.status === 'completed') {
          setIsCompleted(true);
          setMessage({ text: 'Module already completed!', type: 'success' });
        }
      } catch (error) {
        console.error('Error fetching module or progress:', error);
        setMessage({ text: 'Module not found.', type: 'error' });
        setTimeout(() => router.push('/dashboard/user'), 3000);
      }
    };
    fetchModuleAndProgress();
  }, [id, status, session?.user?.id, router]);

  const handleComplete = async () => {
    if (!session?.user?.id || !module || isCompleted) {
      setMessage({
        text: isCompleted ? 'Module already completed' : 'Invalid session or module',
        type: 'error',
      });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          moduleId: module.id,
          score: 100,
          status: 'completed',
          timeTaken: 0,
        }),
      });
      if (res.ok) {
        setIsCompleted(true);
        setMessage({ text: 'Completed! Redirecting in 5 seconds...', type: 'success' });
        await fetch('/api/assignments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.user.id, contentId: module.id, contentType: 'module', status: 'done' }),
        });
        setTimeout(() => router.push('/dashboard/user'), 5000);
      } else {
        throw new Error('Failed to update progress');
      }
    } catch (error) {
      console.error('Error marking module as completed:', error);
      setMessage({ text: 'Failed to mark module as completed. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Please sign in to view this module.</div>
      </div>
    );
  }

  if (!module) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            isCompleted 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {isCompleted ? 'Completed' : 'In Progress'}
          </span>
        </div>

        {/* Date */}
        <div className="text-gray-500 text-sm mb-4">
          {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">
          {module.title}
        </h1>

        {/* Hero Image */}
        {module.imageUrl && (
          <div className="mb-8">
            <img
              src={module.imageUrl}
              alt={module.title}
              className="w-full h-80 object-cover rounded-xl shadow-lg"
            />
          </div>
        )}

        {/* Message Alert */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg border-l-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Module Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Module Overview</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            This comprehensive module will guide you through essential concepts and practical applications. 
            Complete the content below to advance your learning journey and unlock your next milestone.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {module.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Completion Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
          <div className="text-center">  
            <Button
              onClick={handleComplete}
              disabled={isCompleted || isLoading}
              className={`px-8 py-3 text-lg font-medium rounded-lg transition-all duration-200 ${
                isCompleted || isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Completing...
                </span>
              ) : isCompleted ? (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Completed
                </span>
              ) : (
                'Completed'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}