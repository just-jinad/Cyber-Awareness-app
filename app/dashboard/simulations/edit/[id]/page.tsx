'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Step {
  scenario: string;
  options: string[];
  nextStep: (number | null)[];
  outcomes?: string[];
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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; stepIndex: number | null; optionIndex: number | null }>({ open: false, stepIndex: null, optionIndex: null });

  useEffect(() => {
    const fetchSimulation = async () => {
      const res = await fetch(`/api/simulations/${id}`);
      if (res.ok) {
        const data = await res.json();
        const updatedSteps = data.steps.map((step: any) => ({
          ...step,
          outcomes: step.outcomes || step.options.map(() => ''),
        }));
        setSimulation({ ...data, steps: updatedSteps });
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
    if (!simulation) { return; }
    setSimulation({
      ...simulation,
      steps: [...simulation.steps, { scenario: '', options: ['', ''], nextStep: [null, null] as (number | null)[], outcomes: ['', ''] }],
    });
  };

  const removeStep = (stepIndex: number) => {
    if (!simulation || simulation.steps.length <= 1) { return; }
    setSimulation({
      ...simulation,
      steps: simulation.steps.filter((_, index) => index !== stepIndex),
    });
  };

  const addOption = (stepIndex: number) => {
    if (!simulation) { return; }
    const updatedSteps = [...simulation.steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      options: [...updatedSteps[stepIndex].options, ''],
      nextStep: [...updatedSteps[stepIndex].nextStep, null],
      outcomes: [...(updatedSteps[stepIndex].outcomes || []), ''],
    };
    setSimulation({ ...simulation, steps: updatedSteps });
  };

  const removeOption = (stepIndex: number, optionIndex: number) => {
    if (!simulation) { return; }
    const updatedSteps = [...simulation.steps];
    if (updatedSteps[stepIndex].options.length <= 2) {
      toast.error('Each step must have at least two options');
      return;
    }
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      options: updatedSteps[stepIndex].options.filter((_, idx) => idx !== optionIndex),
      nextStep: updatedSteps[stepIndex].nextStep.filter((_, idx) => idx !== optionIndex),
      outcomes: (updatedSteps[stepIndex].outcomes || []).filter((_, idx) => idx !== optionIndex),
    };
    setSimulation({ ...simulation, steps: updatedSteps });
  };

  const updateStep = (stepIndex: number, field: keyof Step, value: any) => {
    if (!simulation) { return; }
    const updatedSteps = [...simulation.steps];
    if (field === 'options') {
      const updatedOptions = value as string[];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        [field]: updatedOptions,
        nextStep: Array(updatedOptions.length).fill(null) as (number | null)[],
        outcomes: Array(updatedOptions.length).fill('') as string[],
      };
    } else if (field === 'nextStep') {
      const updatedNextStep = value as (number | null)[];
      if (updatedNextStep.length !== updatedSteps[stepIndex].options.length) {
        toast.error('Number of next steps must match number of options');
        return;
      }
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], [field]: updatedNextStep };
    } else if (field === 'outcomes') {
      const updatedOutcomes = value as string[];
      if (updatedOutcomes.length !== updatedSteps[stepIndex].options.length) {
        toast.error('Number of outcomes must match number of options');
        return;
      }
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], [field]: updatedOutcomes };
    } else {
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], [field]: value };
    }
    setSimulation({ ...simulation, steps: updatedSteps });
  };

  const updateOption = (stepIndex: number, optionIndex: number, value: string) => {
    if (!simulation) { return; }
    const updatedSteps = [...simulation.steps];
    const updatedOptions = [...updatedSteps[stepIndex].options];
    updatedOptions[optionIndex] = value;
    updateStep(stepIndex, 'options', updatedOptions);
  };

  const updateNextStep = (stepIndex: number, optionIndex: number, value: string) => {
    if (!simulation) { return; }
    const updatedSteps = [...simulation.steps];
    const updatedNextStep = [...updatedSteps[stepIndex].nextStep];
    if (value === 'end') {
      updatedNextStep[optionIndex] = null;
    } else if (value.startsWith('future-step-')) {
      updatedNextStep[optionIndex] = parseInt(value.split('-')[2], 10);
    } else if (value.startsWith('next-step-')) {
      updatedNextStep[optionIndex] = parseInt(value.split('-')[2], 10);
    }
    updateStep(stepIndex, 'nextStep', updatedNextStep);
  };

  const updateOutcome = (stepIndex: number, optionIndex: number, value: string) => {
    if (!simulation) { return; }
    const updatedSteps = [...simulation.steps];
    const updatedOutcomes = [...(updatedSteps[stepIndex].outcomes || [])];
    updatedOutcomes[optionIndex] = value;
    updateStep(stepIndex, 'outcomes', updatedOutcomes);
  };

  const handleRemoveOption = (stepIndex: number, optionIndex: number) => {
    setDeleteDialog({ open: true, stepIndex, optionIndex });
  };

  const confirmRemoveOption = () => {
    if (deleteDialog.stepIndex !== null && deleteDialog.optionIndex !== null) {
      removeOption(deleteDialog.stepIndex, deleteDialog.optionIndex);
    }
    setDeleteDialog({ open: false, stepIndex: null, optionIndex: null });
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
                  <div className="flex justify-between items-center">
                    <Label>Options</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addOption(stepIndex)}
                      className="text-sm"
                    >
                      Add Option
                    </Button>
                  </div>
                  {step.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-4">
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
                            value={
                              step.nextStep[optionIndex] === null
                                ? 'end'
                                : simulation.steps.findIndex((_, idx) => idx === step.nextStep[optionIndex]) >
                                    stepIndex + 1
                                ? `future-step-${step.nextStep[optionIndex]}`
                                : `next-step-${step.nextStep[optionIndex]}`
                            }
                            onValueChange={(value) => updateNextStep(stepIndex, optionIndex, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Select next step" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem key="end" value="end">
                                End Simulation
                              </SelectItem>
                              {simulation.steps.map((_, idx) => {
                                const nextStepNum = idx + 1;
                                if (idx !== stepIndex && nextStepNum > stepIndex + 1) {
                                  return (
                                    <SelectItem
                                      key={`future-step-${idx}`}
                                      value={`future-step-${idx}`}
                                    >
                                      Step {nextStepNum}
                                    </SelectItem>
                                  );
                                }
                                return null;
                              })}
                              {stepIndex + 1 < simulation.steps.length && (
                                <SelectItem
                                  key={`next-in-sequence-${stepIndex}`}
                                  value={`next-step-${stepIndex + 1}`}
                                >
                                  Step {stepIndex + 2} (Next in Sequence)
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => handleRemoveOption(stepIndex, optionIndex)}
                            className="text-sm"
                            disabled={step.options.length <= 2}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      {step.nextStep[optionIndex] === null && (
                        <div className="space-y-2 ml-4">
                          <Label htmlFor={`outcome-${stepIndex}-${optionIndex}`}>Outcome</Label>
                          <Input
                            id={`outcome-${stepIndex}-${optionIndex}`}
                            value={step.outcomes?.[optionIndex] || ''}
                            onChange={(e) => updateOutcome(stepIndex, optionIndex, e.target.value)}
                            placeholder="e.g., 'success', 'neutral', 'breach'"
                          />
                        </div>
                      )}
                    </div>
                  ))}
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
      <Dialog open={deleteDialog.open} onOpenChange={open => setDeleteDialog(d => ({ ...d, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to remove this option? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="destructive" onClick={confirmRemoveOption}>Delete</Button>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, stepIndex: null, optionIndex: null })}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}