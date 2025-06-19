'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Simulation {
  id: number;
  title: string;
  steps: { scenario: string; options: string[]; nextStep: (number | null)[]; outcomes?: string[] }[];
}

interface StepState {
  currentStep: number;
  choices: (string | null)[];
  timeTaken: number;
}

export default function SimulationPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [stepState, setStepState] = useState<StepState>({ currentStep: 0, choices: [], timeTaken: 0 });
  const [feedback, setFeedback] = useState<string>('');
  const [fakeCredentials, setFakeCredentials] = useState({ username: '', password: '' });
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;

    const fetchSimulationAndProgress = async () => {
      try {
        const simRes = await fetch(`/api/simulations/${id}`);
        if (!simRes.ok) throw new Error('Simulation not found');
        const simData = await simRes.json();
        setSimulation(simData);
        setStepState({ currentStep: 0, choices: new Array(simData.steps.length).fill(null), timeTaken: 0 });

        const progressRes = await fetch(`/api/user-progress?userId=${session.user!.id}&simulationId=${id}`);
        const progressData = await progressRes.json();
        if (progressRes.ok && progressData.status === 'completed') {
          setIsCompleted(true);
        }
      } catch (error) {
        console.error('Error fetching simulation or progress:', error);
        router.push('/user-dashboard/simulations');
      }
    };
    fetchSimulationAndProgress();
  }, [id, status, session?.user?.id, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'authenticated' && simulation && stepState.currentStep < simulation.steps.length && !feedback && !isCompleted) {
      timer = setInterval(() => {
        setStepState((prev) => ({ ...prev, timeTaken: prev.timeTaken + 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, simulation, stepState.currentStep, feedback, isCompleted]);

  const handleAction = (optionIndex: number) => {
    if (!simulation || isCompleted) return;
    const currentStepData = simulation.steps[stepState.currentStep];
    const nextStepIndex = currentStepData.nextStep[optionIndex];

    setStepState((prev) => {
      const newChoices = [...prev.choices];
      newChoices[prev.currentStep] = currentStepData.options[optionIndex];
      return { ...prev, choices: newChoices };
    });

    if (nextStepIndex !== null) {
      if (nextStepIndex < 0 || nextStepIndex >= simulation.steps.length) {
        setFeedback('Error: Invalid next step.');
        return;
      }
      setStepState((prev) => ({ ...prev, currentStep: nextStepIndex, timeTaken: 0 }));
      setFeedback('');
      setFakeCredentials({ username: '', password: '' });
    } else {
      const outcome = currentStepData.outcomes?.[optionIndex] || 'neutral';
      const feedbackText = `You chose "${currentStepData.options[optionIndex]}". Result: ${outcome}. ${
        outcome === 'breach' ? 'This exposed your data.' : outcome === 'success' ? 'Well done!' : 'Neutral outcome.'
      }`;
      setFeedback(feedbackText);
      handleComplete(outcome === 'success' ? 100 : 0);
    }
  };

  const handleFakeLogin = () => {
    if (!fakeCredentials.username || !fakeCredentials.password) {
      setFeedback('Please enter both username and password.');
      return;
    }
    handleAction(0);
  };

  const handleComplete = async (score: number) => {
    if (!session?.user?.id || !simulation || isCompleted) return;
    try {
      const res = await fetch('/api/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          simulationId: simulation.id,
          score,
          status: feedback.includes('breach') ? 'failed' : 'completed',
          timeTaken: stepState.timeTaken,
        }),
      });
      if (res.ok) {
        setIsCompleted(true);
        await fetch('/api/assignments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.user.id, contentId: simulation.id, contentType: 'simulation', status: 'done' }),
        });
        setFeedback(feedback + ' (Redirecting in 5 seconds...)');
        setTimeout(() => router.push('/user-dashboard'), 5000);
      }
    } catch (error) {
      console.error('Error marking simulation as completed:', error);
      setFeedback('Error saving progress. Please try again.');
    }
  };

  if (status === 'loading') return <div className="container mx-auto p-6">Loading...</div>;
  if (!session) return <div className="container mx-auto p-6">Please sign in to access this simulation.</div>;
  if (!simulation) return <div className="container mx-auto p-6">Simulation not found.</div>;

  const currentStepData = simulation.steps[stepState.currentStep];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{simulation.title}</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Step {stepState.currentStep + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCompleted ? (
            <p className="text-green-600">Simulation completed! (Redirecting in 5 seconds...)</p>
          ) : (
            <>
              {stepState.currentStep === 0 ? (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="bg-gray-200 p-2 rounded-t flex justify-between">
                    <span className="font-semibold">From: hr-support@company.com</span>
                    <span>Subject: Urgent Action Required</span>
                  </div>
                  <p className="mt-2">{currentStepData.scenario}</p>
                  <div className="mt-4 space-y-2">
                    {currentStepData.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={stepState.choices[stepState.currentStep] === option ? 'default' : 'outline'}
                        onClick={() => handleAction(index)}
                        disabled={stepState.choices[stepState.currentStep] !== null}
                        className="w-full"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="bg-blue-100 p-2 rounded-t text-center font-semibold">Company Login Portal</div>
                  <p className="mt-2">{currentStepData.scenario}</p>
                  {currentStepData.options[0] === 'Enter credentials' && stepState.choices[stepState.currentStep] === null ? (
                    <div className="mt-4 space-y-2">
                      <Input
                        placeholder="Username"
                        value={fakeCredentials.username}
                        onChange={(e) => setFakeCredentials({ ...fakeCredentials, username: e.target.value })}
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={fakeCredentials.password}
                        onChange={(e) => setFakeCredentials({ ...fakeCredentials, password: e.target.value })}
                      />
                      <Button onClick={handleFakeLogin} className="w-full">
                        Submit
                      </Button>
                      {currentStepData.options.slice(1).map((option, index) => (
                        <Button
                          key={index + 1}
                          variant={stepState.choices[stepState.currentStep] === option ? 'default' : 'outline'}
                          onClick={() => handleAction(index + 1)}
                          disabled={stepState.choices[stepState.currentStep] !== null}
                          className="w-full mt-2"
                        >
                          {option}
                        </Button>
                      ))}
                      {feedback && <p className="text-red-600 mt-2">{feedback}</p>}
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      {currentStepData.options.map((option, index) => (
                        <Button
                          key={index}
                          variant={stepState.choices[stepState.currentStep] === option ? 'default' : 'outline'}
                          onClick={() => handleAction(index)}
                          disabled={stepState.choices[stepState.currentStep] !== null}
                          className="w-full"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <p className="text-lg">Time Elapsed: {stepState.timeTaken} seconds</p>
              {feedback && (
                <div className="mt-4">
                  <p className={`text-lg ${feedback.includes('breach') ? 'text-red-600' : feedback.includes('success') ? 'text-green-600' : 'text-gray-600'}`}>
                    {feedback}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}