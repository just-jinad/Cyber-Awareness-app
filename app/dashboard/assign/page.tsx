'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSession } from 'next-auth/react';

type ContentType = 'module' | 'quiz' | 'simulation';

interface User {
  id: number;
  username: string;
}

interface Content {
  id: number;
  title: string;
}

interface Assignment {
  contentId: number;
  contentType: ContentType;
  status: string;
  user: { username: string };
  admin: { username: string };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [contentId, setContentId] = useState<number | null>(null);
  const [contentType, setContentType] = useState<ContentType>('module');
  const [modules, setModules] = useState<Content[]>([]);
  const [quizzes, setQuizzes] = useState<Content[]>([]);
  const [simulations, setSimulations] = useState<Content[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'loading' || !session?.user?.role || session.user.role !== 'ADMIN') return;

    const fetchData = async () => {
      try {
        // Fetch users
        const usersRes = await fetch('/api/users');
        const usersData = await usersRes.json();
        setUsers(usersData || []);

        // Fetch content
        const [modulesRes, quizzesRes, simulationsRes] = await Promise.all([
          fetch('/api/modules'),
          fetch('/api/quizzes'),
          fetch('/api/simulations'),
        ]);
        setModules((await modulesRes.json()) || []);
        setQuizzes((await quizzesRes.json()) || []);
        setSimulations((await simulationsRes.json()) || []);
      } catch (error) {
        setMessage({ text: 'Failed to load data', type: 'error' });
      }
    };
    fetchData();
  }, [session?.user?.role, status]);

  useEffect(() => {
    if (!selectedUserId) {
      setAssignments([]);
      return;
    }

    const fetchAssignments = async () => {
      try {
        const res = await fetch(`/api/assignments?userId=${selectedUserId}`);
        const data = await res.json();
        setAssignments(data || []);
      } catch (error) {
        setMessage({ text: 'Failed to load assignments', type: 'error' });
      }
    };
    fetchAssignments();
  }, [selectedUserId]);

  const handleAssign = async () => {
    if (!selectedUserId || !contentId) {
      setMessage({ text: 'Please select a user and content', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, contentId, contentType }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Assignment created or updated!', type: 'success' });
        setAssignments(prev => [...prev.filter(a => !(a.contentId === contentId && a.contentType === contentType)), data.assignment]);
        setContentId(null);
      } else {
        setMessage({ text: data.error || 'Failed to create assignment', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred', type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const getContentOptions = () => {
    switch (contentType) {
      case 'module':
        return modules;
      case 'quiz':
        return quizzes;
      case 'simulation':
        return simulations;
      default:
        return [];
    }
  };

  if (status === 'loading') return <div className="container mx-auto p-6">Loading...</div>;
  if (!session?.user?.role || session.user.role !== 'ADMIN') return <div className="container mx-auto p-6">Unauthorized</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      {message && (
        <Alert className={`border ${message.type === 'success' ? 'bg-green-800 border-green-700' : 'bg-red-800 border-red-700'}`}>
          <AlertDescription className="text-white">{message.text}</AlertDescription>
        </Alert>
      )}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Assign Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={selectedUserId?.toString() || ''}
            onValueChange={(value) => setSelectedUserId(Number(value))}
          >
            <SelectTrigger className="bg-gray-700 text-white border-gray-600">
              <SelectValue placeholder="Select User" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white border-gray-600">
              {users.map(user => (
                <SelectItem key={user.id} value={user.id.toString()}>{user.username}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={contentType}
            onValueChange={(value) => setContentType(value as ContentType)}
          >
            <SelectTrigger className="bg-gray-700 text-white border-gray-600">
              <SelectValue placeholder="Content Type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white border-gray-600">
              <SelectItem value="module">Module</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="simulation">Simulation</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={contentId?.toString() || ''}
            onValueChange={(value) => setContentId(Number(value))}
          >
            <SelectTrigger className="bg-gray-700 text-white border-gray-600">
              <SelectValue placeholder="Select Content" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white border-gray-600">
              {getContentOptions().map(content => (
                <SelectItem key={content.id} value={content.id.toString()}>{content.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAssign}
            disabled={isLoading || !selectedUserId || !contentId}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {isLoading ? 'Assigning...' : 'Assign Content'}
          </Button>
        </CardContent>
      </Card>
      {selectedUserId && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">User Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="text-gray-400">No assignments for this user.</p>
            ) : (
              <ul className="space-y-2">
                {assignments.map((assignment, index) => (
                  <li key={index} className="text-gray-300">
                    {getContentOptions().find(c => c.id === assignment.contentId)?.title || `ID: ${assignment.contentId}`} 
                    ({assignment.contentType}) - Status: {assignment.status}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}