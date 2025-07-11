"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Minus,
  GitBranch,
  Play,
  Target,
} from "lucide-react";
import Link from "next/link";

interface Step {
  scenario: string;
  options: string[];
  nextStep: (number | null)[];
  outcomes?: string[];
}

export default function CreateSimulation() {
  const [newSimulation, setNewSimulation] = useState({
    title: "",
    steps: [
      {
        scenario: "",
        options: ["", ""],
        nextStep: [null, null] as (number | null)[],
        outcomes: ["", ""],
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleViewportChange = () => {
      const button = document.querySelector(".floating-add-step") as HTMLElement | null;
      if (button && window.visualViewport) {
        button.style.bottom = `${window.visualViewport.offsetTop + 16}px`;
      }
    };
    window.visualViewport?.addEventListener("resize", handleViewportChange);
    return () =>
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
  }, []);

  const handleAddSimulation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSimulation.title.trim()) {
      toast.error("Please enter a simulation title");
      return;
    }

    // Validate steps
    for (let i = 0; i < newSimulation.steps.length; i++) {
      const step = newSimulation.steps[i];
      if (!step.scenario.trim()) {
        toast.error(`Please enter a scenario for Step ${i + 1}`);
        return;
      }
      for (let j = 0; j < step.options.length; j++) {
        if (!step.options[j].trim()) {
          toast.error(`Please enter Option ${j + 1} for Step ${i + 1}`);
          return;
        }
      }
    }

    setLoading(true);

    const updatedSteps = newSimulation.steps.map((step) => ({
      ...step,
      outcomes: step.options.map((_, idx) => step.outcomes?.[idx] || ""),
    }));

    try {
      const res = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newSimulation, steps: updatedSteps }),
      });
      if (res.ok) {
        toast.success("Simulation created successfully!");
        router.push("/dashboard/simulations");
      } else {
        const { error } = await res.json();
        toast.error(`Failed to create simulation: ${error || "Unknown error"}`);
      }
    } catch (error) {
      toast.error("An error occurred while creating the simulation");
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    setNewSimulation({
      ...newSimulation,
      steps: [
        ...newSimulation.steps,
        {
          scenario: "",
          options: ["", ""],
          nextStep: [null, null] as (number | null)[],
          outcomes: ["", ""],
        },
      ],
    });
  };

  const removeStep = (stepIndex: number) => {
    if (newSimulation.steps.length > 1) {
      setNewSimulation({
        ...newSimulation,
        steps: newSimulation.steps.filter((_, index) => index !== stepIndex),
      });
    }
  };

  const addOption = (stepIndex: number) => {
    const updatedSteps = [...newSimulation.steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      options: [...updatedSteps[stepIndex].options, ""],
      nextStep: [...updatedSteps[stepIndex].nextStep, null],
      outcomes: [...(updatedSteps[stepIndex].outcomes || []), ""],
    };
    setNewSimulation({ ...newSimulation, steps: updatedSteps });
  };

  const removeOption = (stepIndex: number, optionIndex: number) => {
    const updatedSteps = [...newSimulation.steps];
    if (updatedSteps[stepIndex].options.length <= 2) {
      toast.error("Each step must have at least two options");
      return;
    }
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      options: updatedSteps[stepIndex].options.filter(
        (_, idx) => idx !== optionIndex
      ),
      nextStep: updatedSteps[stepIndex].nextStep.filter(
        (_, idx) => idx !== optionIndex
      ),
      outcomes: (updatedSteps[stepIndex].outcomes || []).filter(
        (_, idx) => idx !== optionIndex
      ),
    };
    setNewSimulation({ ...newSimulation, steps: updatedSteps });
  };

  const updateStep = (stepIndex: number, field: keyof Step, value: any) => {
    const updatedSteps = [...newSimulation.steps];
    if (field === "options") {
      const updatedOptions = value as string[];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        [field]: updatedOptions,
        nextStep: Array(updatedOptions.length).fill(null) as (number | null)[],
        outcomes: Array(updatedOptions.length).fill("") as string[],
      };
    } else if (field === "nextStep") {
      const updatedNextStep = value as (number | null)[];
      if (updatedNextStep.length !== updatedSteps[stepIndex].options.length) {
        toast.error("Number of next steps must match number of options");
        return;
      }
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        [field]: updatedNextStep,
      };
    } else if (field === "outcomes") {
      const updatedOutcomes = value as string[];
      if (updatedOutcomes.length !== updatedSteps[stepIndex].options.length) {
        toast.error("Number of outcomes must match number of options");
        return;
      }
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        [field]: updatedOutcomes,
      };
    } else {
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], [field]: value };
    }
    setNewSimulation({ ...newSimulation, steps: updatedSteps });
  };

  const updateOption = (
    stepIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedSteps = [...newSimulation.steps];
    const updatedOptions = [...updatedSteps[stepIndex].options];
    updatedOptions[optionIndex] = value;
    updateStep(stepIndex, "options", updatedOptions);
  };

  const updateNextStep = (
    stepIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedSteps = [...newSimulation.steps];
    const updatedNextStep = [...updatedSteps[stepIndex].nextStep];
    if (value === "end") {
      updatedNextStep[optionIndex] = null;
    } else if (value.startsWith("future-step-")) {
      updatedNextStep[optionIndex] = parseInt(value.split("-")[2], 10);
    } else if (value.startsWith("next-step-")) {
      updatedNextStep[optionIndex] = parseInt(value.split("-")[2], 10);
    }
    updateStep(stepIndex, "nextStep", updatedNextStep);
  };

  const updateOutcome = (
    stepIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedSteps = [...newSimulation.steps];
    const updatedOutcomes = [...(updatedSteps[stepIndex].outcomes || [])];
    updatedOutcomes[optionIndex] = value;
    updateStep(stepIndex, "outcomes", updatedOutcomes);
  };

  const getTotalOptions = () => {
    return newSimulation.steps.reduce(
      (total, step) => total + step.options.length,
      0
    );
  };

  const getEndingPaths = () => {
    return newSimulation.steps.reduce((total, step) => {
      return total + step.nextStep.filter((next) => next === null).length;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/simulations">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Simulations
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Simulation</h1>
          <p className="text-gray-400 mt-1">Build interactive decision-making scenarios</p>
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
              <form onSubmit={handleAddSimulation} className="space-y-6">
                {/* Title Field */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Simulation Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm sm:px-4 sm:py-3 sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                    value={newSimulation.title}
                    onChange={(e) =>
                      setNewSimulation({ ...newSimulation, title: e.target.value })
                    }
                    placeholder="Enter a descriptive title for your simulation"
                    maxLength={100}
                    required
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {newSimulation.title.length}/100 characters
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-300">
                      Simulation Steps <span className="text-red-400">*</span>
                    </label>
                    {/* Floating button replaces inline Add Step button */}
                  </div>

                  {newSimulation.steps.map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className="bg-gray-700 border border-gray-600 rounded-lg p-4 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          <GitBranch className="h-4 w-4 mr-2" />
                          Step {stepIndex + 1}
                        </h3>
                        {newSimulation.steps.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(stepIndex)}
                            type="button"
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>

                      {/* Scenario */}
                      <div>
                        <label
                          htmlFor={`scenario-${stepIndex}`}
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          Scenario Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          id={`scenario-${stepIndex}`}
                          rows={3}
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-2 py-2 text-sm sm:px-4 sm:py-3 sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors resize-vertical"
                          value={step.scenario}
                          onChange={(e) =>
                            updateStep(stepIndex, "scenario", e.target.value)
                          }
                          placeholder="Describe the scenario users will encounter"
                          required
                        />
                      </div>

                      {/* Options */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-sm font-medium text-gray-300">
                            Decision Options <span className="text-red-400">*</span>
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

                        {step.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="bg-gray-600 border border-gray-500 rounded-lg p-3 mb-3 space-y-3"
                          >
                            <div className="flex items-center space-x-3">
                              <input
                                type="text"
                                className="flex-1 bg-gray-500 border border-gray-400 rounded px-2 py-1 text-sm sm:px-3 sm:py-2 sm:text-base text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                                value={option}
                                onChange={(e) =>
                                  updateOption(stepIndex, optionIndex, e.target.value)
                                }
                                placeholder={`Option ${optionIndex + 1}`}
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(stepIndex, optionIndex)}
                                disabled={step.options.length <= 2}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center space-x-3">
                              <label className="text-sm text-gray-300 whitespace-nowrap">
                                Next Step:
                              </label>
                              <Select
                                value={
                                  step.nextStep[optionIndex] === null
                                    ? "end"
                                    : newSimulation.steps.findIndex(
                                        (_, idx) => idx === step.nextStep[optionIndex]
                                      ) > stepIndex + 1
                                    ? `future-step-${step.nextStep[optionIndex]}`
                                    : `next-step-${step.nextStep[optionIndex]}`
                                }
                                onValueChange={(value) =>
                                  updateNextStep(stepIndex, optionIndex, value)
                                }
                              >
                                <SelectTrigger className="bg-gray-500 border-gray-400 text-white">
                                  <SelectValue placeholder="Select next step" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-700 border-gray-600">
                                  <SelectItem
                                    key="end"
                                    value="end"
                                    className="text-white hover:bg-gray-600"
                                  >
                                    End Simulation
                                  </SelectItem>
                                  {newSimulation.steps.map((_, idx) => {
                                    const nextStepNum = idx + 1;
                                    if (idx !== stepIndex && nextStepNum > stepIndex + 1) {
                                      return (
                                        <SelectItem
                                          key={`future-step-${idx}`}
                                          value={`future-step-${idx}`}
                                          className="text-white hover:bg-gray-600"
                                        >
                                          Step {nextStepNum}
                                        </SelectItem>
                                      );
                                    }
                                    return null;
                                  })}
                                  {stepIndex + 1 < newSimulation.steps.length && (
                                    <SelectItem
                                      key={`next-in-sequence-${stepIndex}`}
                                      value={`next-step-${stepIndex + 1}`}
                                      className="text-white hover:bg-gray-600"
                                    >
                                      Step {stepIndex + 2} (Next in Sequence)
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            {step.nextStep[optionIndex] === null && (
                              <div>
                                <label className="block text-sm text-gray-300 mb-1">
                                  Outcome <span className="text-gray-500">(optional)</span>
                                </label>
                                <input
                                  type="text"
                                  className="w-full bg-gray-500 border border-gray-400 rounded px-2 py-1 text-sm sm:px-3 sm:py-2 sm:text-base text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                                  value={step.outcomes?.[optionIndex] || ""}
                                  onChange={(e) =>
                                    updateOutcome(stepIndex, optionIndex, e.target.value)
                                  }
                                  placeholder="e.g., 'success', 'neutral', 'breach'"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating Add Step Button */}
                <Button
                  type="button"
                  onClick={addStep}
                  className="floating-add-step fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full p-2 sm:p-3 shadow-lg z-50 md:p-4"
                >
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <Button
                    type="submit"
                    disabled={loading || !newSimulation.title.trim()}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Simulation...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Simulation
                      </>
                    )}
                  </Button>
                  <Link href="/dashboard/simulations">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      disabled={loading}
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
          {/* Toggle button only for small screens */}
          <Button
            className="lg:hidden mb-4 w-full bg-gray-700 text-white"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? "Hide Preview" : "Show Preview"}
          </Button>
          
          {/* Preview card: show if isSidebarOpen on small screens, always show on lg screens */}
          <div className={`${!isSidebarOpen ? 'hidden lg:block' : 'block'}`}>
            <Card className="bg-gray-800 border-gray-700 lg:sticky lg:top-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <Play className="h-4 w-4 mr-2" />
                      {newSimulation.title || "Simulation Title"}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Interactive decision-making scenario with multiple paths and outcomes.
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Steps:</span>
                      <span className="text-white">{newSimulation.steps.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Options:</span>
                      <span className="text-white">{getTotalOptions()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Ending Paths:</span>
                      <span className="text-white">{getEndingPaths()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Title Length:</span>
                      <span className="text-white">{newSimulation.title.length} chars</span>
                    </div>
                  </div>
                  {newSimulation.steps.length > 0 && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Target className="h-4 w-4 mr-2 text-cyan-400" />
                        <span className="text-sm font-medium text-gray-300">
                          Current Steps
                        </span>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {newSimulation.steps.map((step, index) => (
                          <div key={index} className="text-sm">
                            <div className="text-white font-medium">Step {index + 1}</div>
                            <div className="text-gray-400 truncate">
                              {step.scenario || "No scenario defined"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {step.options.length} option{step.options.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}