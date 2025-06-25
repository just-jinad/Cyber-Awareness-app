'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MoreHorizontal, TrendingUp, Download, Users, Globe, Activity, Eye, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Metrics {
  totalModules: number;
  totalSimulations: number;
  totalQuizzes: number;
}

interface User {
  id: number;
  username: string;
  level: string;
  createdAt: string;
  role?: 'USER' | 'ADMIN';
}

interface UserProgress {
  userId: string;
  username: string;
  level: string;
  progress: number;
  activities: { title: string; type: string; level: string; status: string; score: number }[];
}

const analyticsData = [
  { name: 'Jan', value: 20000, secondary: 15000 },
  { name: 'Feb', value: 25000, secondary: 18000 },
  { name: 'Mar', value: 22000, secondary: 16000 },
  { name: 'Apr', value: 28000, secondary: 22000 },
  { name: 'May', value: 32000, secondary: 25000 },
  { name: 'Jun', value: 35000, secondary: 28000 },
  { name: 'Jul', value: 38000, secondary: 30000 },
  { name: 'Aug', value: 42000, secondary: 35000 },
  { name: 'Sep', value: 45000, secondary: 38000 },
  { name: 'Oct', value: 48000, secondary: 40000 },
  { name: 'Nov', value: 52000, secondary: 45000 },
  { name: 'Dec', value: 55000, secondary: 48000 },
];

const countryData = [
  { country: 'United States', percentage: 65, flag: '🇺🇸' },
  { country: 'Canada', percentage: 20, flag: '🇨🇦' },
  { country: 'Germany', percentage: 15, flag: '🇩🇪' },
  { country: 'United Kingdom', percentage: 10, flag: '🇬🇧' },
  { country: 'France', percentage: 8, flag: '🇫🇷' },
];

export default function DashboardHome() {
  const [metrics, setMetrics] = useState<Metrics>({ totalModules: 0, totalSimulations: 0, totalQuizzes: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [levelCounts, setLevelCounts] = useState<{ [key: string]: number }>({ beginner: 0, intermediate: 0, advanced: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserProgress, setSelectedUserProgress] = useState<UserProgress | null>(null);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [modulesRes, simulationsRes, quizzesRes] = await Promise.all([
          fetch('/api/modules'),
          fetch('/api/simulations'),
          fetch('/api/quizzes'),
        ]);

        const modules = await modulesRes.json();
        const simulations = await simulationsRes.json();
        const quizzes = await quizzesRes.json();

        setMetrics({
          totalModules: Array.isArray(modules) ? modules.length : 0,
          totalSimulations: Array.isArray(simulations) ? simulations.length : 0,
          totalQuizzes: Array.isArray(quizzes) ? quizzes.length : 0,
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
        
        const counts = data.reduce((acc: { [key: string]: number }, user: User) => {
          acc[user.level] = (acc[user.level] || 0) + 1;
          return acc;
        }, { beginner: 0, intermediate: 0, advanced: 0 });
        setLevelCounts(counts);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchMetrics();
    fetchUsers();
  }, []);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const handleDelete = async (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await fetch('/api/users', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userId }),
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(users.filter(user => user.id !== userId));
          const userLevel = users.find(u => u.id === userId)?.level || 'beginner';
          setLevelCounts(prev => {
            const newCounts = { ...prev };
            newCounts[userLevel] = Math.max(0, newCounts[userLevel] - 1);
            return newCounts;
          });
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleRoleUpdate = async (userId: number, newRole: 'USER' | 'ADMIN') => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const fetchUserProgress = async (userId: number) => {
    try {
      const res = await fetch(`/api/user-progress?userId=${userId}`);
      const data = await res.json();
      if (res.ok && data) {
        setSelectedUserProgress(data);
      } else {
        setSelectedUserProgress(null);
        console.warn('No progress data or invalid response:', data);
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
      setSelectedUserProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors">
            <Download className="h-4 w-4 mr-2 inline" />
            Download
          </button>
          <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
            Add Filter
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Modules</p>
                <p className="text-3xl font-bold text-white">{metrics.totalModules.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">Learning Content</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Simulations</p>
                <p className="text-3xl font-bold text-white">{metrics.totalSimulations.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">Practice Sessions</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Quizzes</p>
                <p className="text-3xl font-bold text-white">{metrics.totalQuizzes.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">Assessments</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Content</p>
                <p className="text-3xl font-bold text-white">{(metrics.totalModules + metrics.totalSimulations + metrics.totalQuizzes).toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">All Items</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">User Levels</p>
                <p className="text-3xl font-bold text-white">Total: {users.length}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-300">Beginner: {levelCounts.beginner}</p>
                  <p className="text-sm text-gray-300">Intermediate: {levelCounts.intermediate}</p>
                  <p className="text-sm text-gray-300">Advanced: {levelCounts.advanced}</p>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics and Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Analytics</CardTitle>
              <p className="text-sm text-gray-400">Sales Performance</p>
            </div>
            <button className="p-2 hover:bg-gray-700 rounded-lg">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <defs>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorPrimary)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="secondary" 
                    stroke="#06b6d4" 
                    fillOpacity={1} 
                    fill="url(#colorSecondary)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Sessions by Country</CardTitle>
            <button className="p-2 hover:bg-gray-700 rounded-lg">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {countryData.map((country, index) => (
                <div key={country.country} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{country.flag}</span>
                      <span className="text-sm text-gray-300">{country.country}</span>
                    </div>
                    <span className="text-sm text-gray-400">{country.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Progress */}
      {selectedUserProgress && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Progress for {selectedUserProgress.username}</CardTitle>
            <button
              onClick={() => setSelectedUserProgress(null)}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-300">Level: {selectedUserProgress.level}</p>
            <p className="text-lg text-gray-300">Progress: {selectedUserProgress.progress.toFixed(2)}%</p>
            <h3 className="text-lg font-semibold mt-4 text-white">Activities:</h3>
            <ul className="space-y-2">
              {selectedUserProgress.activities.map((activity, index) => (
                <li key={index} className="text-lg text-gray-300">
                  {activity.type}: {activity.title} - Level: {activity.level}, Status: {activity.status}, Score: {activity.score}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* User List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">User List</CardTitle>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600">
              Download
            </button>
            <button className="px-3 py-1 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">
              Add Filter
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Username</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Level</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Sign-up Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Progress</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-4 px-4 text-sm text-white">{user.username}</td>
                    <td className="py-4 px-4 text-sm text-gray-300">{user.level}</td>
                    <td className="py-4 px-4 text-sm text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-sm text-gray-300">
                      {user.role || 'USER'}
                    </td>
                    <td className="py-4 px-4 flex space-x-2">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <select
                        value={user.role || 'USER'}
                        onChange={(e) => handleRoleUpdate(user.id, e.target.value as 'USER' | 'ADMIN')}
                        className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => fetchUserProgress(user.id)}
                        className="px-2 py-1 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"
                      >
                        View Progress
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}