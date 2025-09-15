'use client';

import React, { useState, useEffect } from 'react';

interface VisualizationStep {
  step: number;
  left: number;
  right: number;
  mid: number;
  comparison: string;
  action: string;
  found: boolean;
  array: number[];
  target: number;
}

interface BinarySearchStepVisualizerProps {
  defaultArray?: number[];
  defaultTarget?: number;
  autoPlay?: boolean;
  playSpeed?: number; // milliseconds between steps
}

export default function BinarySearchStepVisualizer({ 
  defaultArray = [2, 5, 8, 12, 16, 23, 38, 45, 67, 78],
  defaultTarget = 23,
  autoPlay = false,
  playSpeed = 1500
}: BinarySearchStepVisualizerProps) {
  const [array, setArray] = useState<number[]>(defaultArray);
  const [target, setTarget] = useState<number>(defaultTarget);
  const [inputTarget, setInputTarget] = useState<string>(defaultTarget.toString());
  const [inputArray, setInputArray] = useState<string>(defaultArray.join(', '));
  
  const [steps, setSteps] = useState<VisualizationStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Generate binary search steps
  const generateSteps = (arr: number[], target: number): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    let left = 0;
    let right = arr.length - 1;
    let stepNum = 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midValue = arr[mid];
      
      let comparison: string;
      let action: string;
      let found = false;

      if (midValue === target) {
        comparison = `arr[${mid}] = ${midValue} equals ${target}`;
        action = `Found target at index ${mid}!`;
        found = true;
      } else if (midValue < target) {
        comparison = `arr[${mid}] = ${midValue} < ${target}`;
        action = `Search right half (left = ${mid + 1})`;
      } else {
        comparison = `arr[${mid}] = ${midValue} > ${target}`;
        action = `Search left half (right = ${mid - 1})`;
      }

      steps.push({
        step: stepNum,
        left,
        right,
        mid,
        comparison,
        action,
        found,
        array: [...arr],
        target
      });

      if (found) break;

      if (midValue < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }

      stepNum++;
    }

    // If not found, add final step
    if (steps.length === 0 || !steps[steps.length - 1].found) {
      steps.push({
        step: stepNum,
        left,
        right,
        mid: -1,
        comparison: `Search space exhausted (left=${left} > right=${right})`,
        action: `Target ${target} not found in array`,
        found: false,
        array: [...arr],
        target
      });
    }

    return steps;
  };

  // Initialize steps
  useEffect(() => {
    const newSteps = generateSteps(array, target);
    setSteps(newSteps);
    setCurrentStep(-1);
    setIsCompleted(false);
    setIsPlaying(false);
  }, [array, target]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setIsCompleted(true);
      }
    }, playSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, playSpeed]);

  const handleStart = () => {
    setCurrentStep(-1);
    setIsCompleted(false);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > -1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(-1);
    setIsCompleted(false);
    setIsPlaying(false);
  };

  const handleArrayChange = () => {
    try {
      const newArray = inputArray.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (newArray.length > 0) {
        newArray.sort((a, b) => a - b); // Ensure sorted
        setArray(newArray);
      }
    } catch (e) {
      // Invalid input, ignore
    }
  };

  const handleTargetChange = () => {
    const newTarget = parseInt(inputTarget);
    if (!isNaN(newTarget)) {
      setTarget(newTarget);
    }
  };

  const currentStepData = currentStep >= 0 ? steps[currentStep] : null;

  const getCellClass = (index: number) => {
    if (!currentStepData) return 'bg-gray-100 border-gray-300';
    
    const { left, right, mid, found } = currentStepData;
    
    // If target was found
    if (index === mid && found) {
      return 'bg-green-200 border-green-500 animate-pulse';
    }
    
    // If mid is valid and we're checking it
    if (index === mid && mid >= 0) {
      return 'bg-yellow-200 border-yellow-500';
    }
    
    // If search space is exhausted (left > right), show all as eliminated
    if (left > right) {
      return 'bg-gray-100 border-gray-300 opacity-50';
    }
    
    // If within current search range
    if (index >= left && index <= right) {
      return 'bg-blue-100 border-blue-300';
    }
    
    // If outside search range (eliminated)
    return 'bg-gray-100 border-gray-300 opacity-50';
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🔍 Interactive Binary Search Visualization
        </h3>
        <p className="text-gray-700">
          Watch how binary search eliminates half the search space at each step!
        </p>
      </div>

      {/* Input Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Array (comma-separated, will be auto-sorted):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputArray}
                onChange={(e) => setInputArray(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="2, 5, 8, 12, 16, 23, 38, 45, 67, 78"
              />
              <button
                onClick={handleArrayChange}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Value:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputTarget}
                onChange={(e) => setInputTarget(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleTargetChange}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Array Visualization */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Array Visualization:</h4>
        <div className="flex flex-wrap gap-1 justify-center mb-4">
          {array.map((value, index) => (
            <div
              key={index}
              className={`w-12 h-12 border-2 rounded flex items-center justify-center font-bold text-sm transition-all duration-300 ${getCellClass(index)}`}
            >
              {value}
            </div>
          ))}
        </div>
        
        {/* Index labels */}
        <div className="flex flex-wrap gap-1 justify-center">
          {array.map((_, index) => (
            <div key={index} className="w-12 text-center text-xs text-gray-500">
              {index}
            </div>
          ))}
        </div>
      </div>

      {/* Step Information */}
      {currentStepData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">
            Step {currentStepData.step}:
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Search Range:</strong> left = {currentStepData.left}, right = {currentStepData.right}
              {currentStepData.mid >= 0 && (
                <span>, mid = {currentStepData.mid}</span>
              )}
            </div>
            <div><strong>Comparison:</strong> {currentStepData.comparison}</div>
            <div><strong>Action:</strong> {currentStepData.action}</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex justify-center gap-3 flex-wrap">
        <button
          onClick={handleStart}
          disabled={isPlaying}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {isPlaying ? '▶️ Playing...' : '▶️ Play'}
        </button>
        <button
          onClick={handlePrevious}
          disabled={currentStep <= -1 || isPlaying}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          ⬅️ Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep >= steps.length - 1 || isPlaying}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Next ➡️
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          🔄 Reset
        </button>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">Legend:</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
            <span>Search Range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-500 rounded"></div>
            <span>Current Middle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 border-2 border-green-500 rounded"></div>
            <span>Target Found!</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded opacity-50"></div>
            <span>Eliminated</span>
          </div>
        </div>
      </div>

      {/* Educational Notes */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Key Insights:</h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Each step eliminates roughly half of the remaining search space</li>
          <li>• The algorithm makes intelligent decisions based on comparisons</li>
          <li>• Maximum steps needed: ⌈log₂(array length)⌉ = {Math.ceil(Math.log2(array.length))}</li>
          <li>• This visualization shows why binary search is O(log n) complexity!</li>
        </ul>
      </div>
    </div>
  );
}