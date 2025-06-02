'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Step {
  scenario: string;
  options: string[];
  nextStep: (number | null)[];
  outcome?: string;
}

interface Simulation {
  id: number;
  title: string;
  steps: Step[];
}

export default function EditSimulation() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [simulation, setSimulation] = useState<Simulation | null>(null);

  useEffect(() => {
    const fetchSimulation = async () => {
      const res = await fetch(`/api/simulations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSimulation(data);
      } else {
        toast.error('Failed to load simulation');
        router.push('/dashboard/simulations');
      }
    };
    fetchSimulation();
  }, [id, router]);

  const handleEditSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulation) return;

    try {
      const res = await fetch(`/api/simulations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulation),
      });
      if (res.ok) {
        toast.success('Simulation updated successfully!');
        router.push('/dashboard/simulations');
      } else {
        const { error } = await res.json();
        toast.error(`Failed to update simulation: ${error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('An error occurred while updating the simulation');
    }
  };

  const addStep = () => {
    if (!simulation) return;
    setSimulation({
      ...simulation,
      steps: [...simulation.steps, { scenario: '', options: ['', ''], nextStep: [null, null] as (number | null)[], outcome: '' }],
    });
  };

  const removeStep = (stepIndex: number) => {
    if (!simulation || simulation.steps.length <= 1) return;
    setSimulation({
      ...simulation,
      steps: simulation.steps.filter((_, index) => index !== stepIndex),
    });
  };

  const updateStep = (stepIndex: number, field: keyof Step, value: any) => {
    if (!simulation) return;
    const updatedSteps = [...simulation.steps];
    if (field === 'options') {
      const updatedOptions = value as string[];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        [field]: updatedOptions,
        nextStep: Array(updatedOptions.length).fill(null) as (number | null)[],
      };
    } else if (field === 'nextStep') {
      const updatedNextStep = value as (number | null)[];
      if (updatedNextStep.length !== updatedSteps[stepIndex].options.length) {
        toast.error('Number of next steps must match number of options');
        return;
      }
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], [field]: updatedNextStep };
    } else {
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], [field]: value };
    }
    setSimulation({ ...simulation, steps: updatedSteps });
  };

  const updateOption = (stepIndex: number, optionIndex: number, value: string) => {
    if (!simulation) return;
    const updatedSteps = [...simulation.steps];
    const updatedOptions = [...updatedSteps[stepIndex].options];
    updatedOptions[optionIndex] = value;
    updateStep(stepIndex, 'options', updatedOptions);
  };

  const updateNextStep = (stepIndex: number, optionIndex: number, value: string) => {
    if (!simulation) return;
    const updatedSteps = [...simulation.steps];
    const updatedNextStep = [...updatedSteps[stepIndex].nextStep];
    updatedNextStep[optionIndex] = value === 'end' ? null : parseInt(value, 10);
    updateStep(stepIndex, 'nextStep', updatedNextStep);
  };

  if (!simulation) return <div className="container mx-auto p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Simulation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Edit Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEditSimulation} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Simulation Title</Label>
              <Input
                id="title"
                value={simulation.title}
                onChange={(e) => setSimulation({ ...simulation, title: e.target.value })}
                placeholder="Enter simulation title"
                required
              />
            </div>
            {simulation.steps.map((step, stepIndex) => (
              <div key={stepIndex} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Step {stepIndex + 1}</h3>
                  {simulation.steps.length > 1 && (
                    <Button variant="destructive" onClick={() => removeStep(stepIndex)} type="button">
                      Remove Step
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`scenario-${stepIndex}`}>Scenario</Label>
                  <Input
                    id={`scenario-${stepIndex}`}
                    value={step.scenario}
                    onChange={(e) => updateStep(stepIndex, 'scenario', e.target.value)}
                    placeholder="Describe the scenario"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Options</Label>
                  {step.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-4">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(stepIndex, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                        required
                        className="flex-1"
                      />
                      <div className="flex items-center space-x-2">
                        <Label>Next Step</Label>
                        <Select
                          value={step.nextStep[optionIndex] === null ? 'end' : step.nextStep[optionIndex].toString()}
                          onValueChange={(value: string) => updateNextStep(stepIndex, optionIndex, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select next step" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="end">End Simulation</SelectItem>
                            {simulation.steps.map((_, idx) => (
                              idx !== stepIndex && (
                                <SelectItem key={idx} value={idx.toString()}>
                                  Step {idx + 1}
                                </SelectItem>
                              )
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`outcome-${stepIndex}`}>Outcome (if final step)</Label>
                  <Input
                    id={`outcome-${stepIndex}`}
                    value={step.outcome || ''}
                    onChange={(e) => updateStep(stepIndex, 'outcome', e.target.value)}
                    placeholder="e.g., 'success' or 'breach'"
                  />
                </div>
              </div>
            ))}
            <div className="flex space-x-4">
              <Button type="button" onClick={addStep} variant="outline">
                Add Step
              </Button>
              <Button type="submit">Update Simulation</Button>
              <Button variant="outline" onClick={() => router.push('/dashboard/simulations')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}