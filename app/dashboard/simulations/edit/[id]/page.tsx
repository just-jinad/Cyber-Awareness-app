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
import { ArrowLeft, Save, Plus, Trash2, Eye, Settings, Target, Loader2, List, GitBranch } from 'lucide-react';
import Link from 'next/link';

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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; stepIndex: number | null; optionIndex: number | null }>({ open: false, stepIndex: null, optionIndex: null });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fetchSimulation = async () => {
      try {
        const res = await fetch(`/api/simulations/${id}`);
        if (!res.ok) throw new Error('Failed to fetch simulation');
        const text = await res.text();
        if (!text) throw new Error('Simulation not found');
        const data = JSON.parse(text);
        const updatedSteps = data.steps.map((step: any) => ({
          ...step,
          outcomes: step.outcomes || step.options.map(() => ''),
        }));
        setSimulation({ ...data, steps: updatedSteps });
      } catch (err) {
        toast.error('Failed to load simulation');
        setSimulation(null);
      } finally {
        timer = setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchSimulation();
    return () => clearTimeout(timer);
  }, [id]);

  const handleEditSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulation) return;

    if (!simulation.title.trim()) {
      toast.error('Please enter a simulation title');
      return;
    }

    setUpdating(true);

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
    } finally {
      setUpdating(false);
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

  // Show spinner while loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-cyan-500 mb-4" size={48} />
        <span className="text-lg font-medium text-gray-300">Loading simulation...</span>
      </div>
    );
  }

  if (simulation === null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/simulations">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Simulations
            </Button>
          </Link>
        </div>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <p className="text-red-400 text-lg">Simulation not found or failed to load.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/simulations">
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Simulations
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Simulation</h1>
          <p className="text-gray-400 mt-1">Update your interactive simulation content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Save className="h-5 w-5 mr-2" />
                Simulation Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSimulation} className="space-y-6">
                {/* Title Field */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Simulation Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                    value={simulation.title}
                    onChange={(e) => setSimulation({ ...simulation, title: e.target.value })}
                    required
                    placeholder="Enter a descriptive title for your simulation"
                    maxLength={100}
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {simulation.title.length}/100 characters
                  </div>
                </div>

                {/* Steps Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-300">
                      Simulation Steps <span className="text-red-400">*</span>
                    </label>
                    <Button
                      type="button"
                      onClick={addStep}
                      variant="outline"
                      size="sm"
                      className="border-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>

                  {simulation.steps.map((step, stepIndex) => (
                    <Card key={stepIndex} className="bg-gray-700 border-gray-600">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-white text-lg flex items-center">
                            <Settings className="h-5 w-5 mr-2" />
                            Step {stepIndex + 1}
                          </CardTitle>
                          {simulation.steps.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeStep(stepIndex)} 
                              type="button"
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Scenario Field */}
                        <div>
                          <label htmlFor={`scenario-${stepIndex}`} className="block text-sm font-medium text-gray-300 mb-2">
                            Scenario Description <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            id={`scenario-${stepIndex}`}
                            rows={3}
                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors resize-vertical"
                            value={step.scenario}
                            onChange={(e) => updateStep(stepIndex, 'scenario', e.target.value)}
                            placeholder="Describe the scenario users will encounter..."
                            required
                          />
                        </div>

                        {/* Options Section */}
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-300">
                              Options <span className="text-red-400">*</span>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(stepIndex)}
                              className="border-gray-500 text-gray-300 hover:bg-gray-600 hover:text-white"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Option
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {step.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="bg-gray-600 rounded-lg p-4 space-y-3">
                                <div className="flex items-start space-x-3">
                                  <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-400 mb-1">
                                      Option {optionIndex + 1}
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full bg-gray-500 border border-gray-400 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                                      value={option}
                                      onChange={(e) => updateOption(stepIndex, optionIndex, e.target.value)}
                                      placeholder={`Enter option ${optionIndex + 1}`}
                                      required
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveOption(stepIndex, optionIndex)}
                                    disabled={step.options.length <= 2}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {/* Next Step Selection */}
                                  <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">
                                      Next Step
                                    </label>
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
                                      <SelectTrigger className="bg-gray-500 border-gray-400 text-white">
                                        <SelectValue placeholder="Select next step" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-gray-600 border-gray-500">
                                        <SelectItem key="end" value="end" className="text-white hover:bg-gray-500">
                                          End Simulation
                                        </SelectItem>
                                        {simulation.steps.map((_, idx) => {
                                          const nextStepNum = idx + 1;
                                          if (idx !== stepIndex && nextStepNum > stepIndex + 1) {
                                            return (
                                              <SelectItem
                                                key={`future-step-${idx}`}
                                                value={`future-step-${idx}`}
                                                className="text-white hover:bg-gray-500"
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
                                            className="text-white hover:bg-gray-500"
                                          >
                                            Step {stepIndex + 2} (Next in Sequence)
                                          </SelectItem>
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Outcome Field (only for end steps) */}
                                  {step.nextStep[optionIndex] === null && (
                                    <div>
                                      <label className="block text-xs font-medium text-gray-400 mb-1">
                                        Outcome
                                      </label>
                                      <input
                                        type="text"
                                        className="w-full bg-gray-500 border border-gray-400 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                                        value={step.outcomes?.[optionIndex] || ''}
                                        onChange={(e) => updateOutcome(stepIndex, optionIndex, e.target.value)}
                                        placeholder="e.g., 'success', 'neutral', 'breach'"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <Button
                    type="submit"
                    disabled={updating || !simulation.title.trim()}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating Simulation...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Simulation
                      </>
                    )}
                  </Button>
                  <Link href="/dashboard/simulations">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      disabled={updating}
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-800 border-gray-700 sticky top-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Preview Title */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {simulation.title || 'Simulation Title'}
                  </h3>
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    <GitBranch className="h-4 w-4 mr-1" />
                    Interactive Simulation
                  </div>
                </div>

                {/* Steps Overview */}
                <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <List className="h-4 w-4 mr-2" />
                    Steps Overview
                  </div>
                  {simulation.steps.map((step, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex items-center text-cyan-400 mb-1">
                        <Target className="h-3 w-3 mr-1" />
                        Step {index + 1}
                      </div>
                      <p className="text-gray-300 text-xs mb-1 line-clamp-2">
                        {step.scenario || `Step ${index + 1} scenario...`}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {step.options.length} option{step.options.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Simulation Stats */}
                <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Title length:</span>
                    <span className="text-white">{simulation.title.length} chars</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total steps:</span>
                    <span className="text-white">{simulation.steps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total options:</span>
                    <span className="text-white">
                      {simulation.steps.reduce((sum, step) => sum + step.options.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-cyan-400">Editing</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={open => setDeleteDialog(d => ({ ...d, open }))}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-gray-300">Are you sure you want to remove this option? This action cannot be undone.</p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ open: false, stepIndex: null, optionIndex: null })}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRemoveOption}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}