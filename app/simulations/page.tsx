'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Simulation {
  id: number;
  title: string;
  scenario: string;
  choices: string[];
  correctAction: number;
}

export default function Simulations() {
  const { data: session, status } = useSession();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [currentSimulation, setCurrentSimulation] = useState<Simulation | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/simulations')
        .then((res) => res.json())
        .then((data) => {
          setSimulations(data);
          setCurrentSimulation(data[0] || null);
        });
    }
  }, [status]);

  const handleChoice = async (choiceIndex: number) => {
    if (!currentSimulation || !session) return;

    const isCorrect = choiceIndex === currentSimulation.correctAction;
    setFeedback(isCorrect ? 'Correct! You reported the phishing email.' : 'Incorrect. You clicked a phishing link!');

    // Save to UserProgress
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        simulationId: currentSimulation.id,
        score: isCorrect ? 100 : 0,
      }),
    });
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="p-6">
        <p>Please <Link href="/auth/signin" className="text-blue-500">sign in</Link> to access simulations.</p>
      </div>
    );
  }

  if (!currentSimulation) {
    return <div className="p-6">No simulations available.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Interactive Simulations</h1>
      <Card>
        <CardHeader>
          <CardTitle>{currentSimulation.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{currentSimulation.scenario}</p>
          <div className="space-x-2">
            {currentSimulation.choices.map((choice, index) => (
              <Button key={index} onClick={() => handleChoice(index)}>
                {choice}
              </Button>
            ))}
          </div>
          {feedback && <p className="mt-4">{feedback}</p>}
        </CardContent>
      </Card>
    </div>
  );
}