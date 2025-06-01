'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Metrics {
  totalModules: number;
  totalSimulations: number;
  totalQuizzes: number;
}

export default function DashboardHome() {
  const [metrics, setMetrics] = useState<Metrics>({ totalModules: 0, totalSimulations: 0, totalQuizzes: 0 });

  useEffect(() => {
    const fetchMetrics = async () => {
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
    };

    fetchMetrics();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{metrics.totalModules}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Simulations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{metrics.totalSimulations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{metrics.totalQuizzes}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No new notifications.</p>
        </CardContent>
      </Card>
    </div>
  );
}