'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MoreHorizontal, TrendingUp, TrendingDown, Download, Users, Globe, Activity, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Metrics {
  totalModules: number;
  totalSimulations: number;
  totalQuizzes: number;
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
  { name: 'Dec', value: 55000, secondary: 48000 }
];

const countryData = [
  { country: 'United States', percentage: 65, flag: '🇺🇸' },
  { country: 'Canada', percentage: 20, flag: '🇨🇦' },
  { country: 'Germany', percentage: 15, flag: '🇩🇪' },
  { country: 'United Kingdom', percentage: 10, flag: '🇬🇧' },
  { country: 'France', percentage: 8, flag: '🇫🇷' }
];

const transactionData = [
  { id: 'TRX A', amount: '$46,513.23', date: 'Dec 13, 2023', status: 'Processing', user: 'Chris Ryan', avatar: 'CR' },
  { id: 'MTCH', amount: '$12,645.89', date: 'Dec 12, 2023', status: 'Success', user: 'Jessee Barron', avatar: 'JB' },
  { id: 'OODS', amount: '$45,513.23', date: 'Dec 11, 2023', status: 'Success', user: 'Luke Barron', avatar: 'LB' },
  { id: 'JAROS', amount: '$12,645.89', date: 'Dec 10, 2023', status: 'Success', user: 'Jack Nicholson', avatar: 'JN' }
];

export default function DashboardHome() {
  const [metrics, setMetrics] = useState<Metrics>({ totalModules: 0, totalSimulations: 0, totalQuizzes: 0 });

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

    fetchMetrics();
  }, []);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>

      {/* Analytics and Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart */}
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

        {/* Sessions by Country */}
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

      {/* Transaction History */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Transaction History</CardTitle>
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Account</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactionData.map((transaction, index) => (
                  <tr key={transaction.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-4 px-4 text-sm text-white">{transaction.id}</td>
                    <td className="py-4 px-4 text-sm text-gray-300">{transaction.date}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'Success' 
                          ? 'bg-green-600 text-green-100' 
                          : 'bg-yellow-600 text-yellow-100'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-xs text-white font-medium">
                          {transaction.avatar}
                        </div>
                        <span className="text-sm text-gray-300">{transaction.user}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-white font-medium">{transaction.amount}</td>
                    <td className="py-4 px-4">
                      <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                        More
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}