'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSession } from 'next-auth/react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<{ id: number; username: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [contentId, setContentId] = useState<number | null>(null);
  const [contentType, setContentType] = useState<string>('module');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.role || session.user.role !== 'ADMIN') return;

    const fetchUsers = async () => {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    };
    fetchUsers();
  }, [session?.user?.role, status]);

  const handleAssign = async () => {
    if (!selectedUserId || !contentId) return;
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUserId, contentId, contentType }),
    });
    const data = await res.json();
    if (res.ok) alert('Assignment created!');
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (!session?.user?.role || session.user.role !== 'ADMIN') return <div>Unauthorized</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Assign Content</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(Number(e.target.value))}
            className="mb-4 p-2 border rounded"
          >
            <option value="">Select User</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Content ID"
            value={contentId || ''}
            onChange={(e) => setContentId(Number(e.target.value))}
            className="mb-4 p-2 border rounded"
          />
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="mb-4 p-2 border rounded"
          >
            <option value="module">Module</option>
            <option value="simulation">Simulation</option>
            <option value="quiz">Quiz</option>
          </select>
          <button
            onClick={handleAssign}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Assign
          </button>
        </CardContent>
      </Card>
    </div>
  );
}