'use client';

import React, { useState } from 'react';

interface SearchStep {
  left: number;
  right: number;
  mid: number;
  target: number;
  comparison: 'less' | 'greater' | 'equal' | 'none';
  found: boolean;
  step: number;
}

interface BinarySearchVisualizerProps {
  id: string;
  title?: string;
  description?: string;
  initialArray?: number[];
}

export default function BinarySearchVisualizer({
  id: _id = "binary-search-visualizer",
  title = "Binary Search Visualization",
  description = "Watch how binary search eliminates half the possibilities at each step",
  initialArray = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29]
}: BinarySearchVisualizerProps) {
  const [array, setArray] = useState<number[]>(initialArray);
  const [target, setTarget] = useState<number>(13);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<SearchStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [speed, setSpeed] = useState(1500);
  const [result, setResult] = useState<{ found: boolean; index: number; steps: number } | null>(null);
  const [customArray, setCustomArray] = useState('1,3,5,7,9,11,13,15,17,19,21,23,25,27,29');
  
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const binarySearchSteps = (arr: number[], target: number): SearchStep[] => {
    const steps: SearchStep[] = [];
    let left = 0;
    let right = arr.length - 1;
    let stepCount = 0;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      stepCount++;
      
      let comparison: 'less' | 'greater' | 'equal' = 'equal';
      let found = false;
      
      if (arr[mid] === target) {
        comparison = 'equal';
        found = true;
      } else if (arr[mid] < target) {
        comparison = 'less';
      } else {
        comparison = 'greater';
      }

      steps.push({
        left,
        right,
        mid,
        target,
        comparison,
        found,
        step: stepCount
      });

      if (found) break;
      
      if (arr[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // If not found, add final step showing search space exhausted
    if (steps.length === 0 || !steps[steps.length - 1].found) {
      steps.push({
        left,
        right,
        mid: -1,
        target,
        comparison: 'none',
        found: false,
        step: stepCount + 1
      });
    }

    return steps;
  };

  const runSearch = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setCurrentStep(-1);
    setResult(null);
    
    const searchSteps = binarySearchSteps(array, target);
    setSteps(searchSteps);
    
    await sleep(speed * 0.5);
    
    for (let i = 0; i < searchSteps.length; i++) {
      setCurrentStep(i);
      await sleep(speed);
    }
    
    const finalStep = searchSteps[searchSteps.length - 1];
    const foundIndex = finalStep.found ? finalStep.mid : -1;
    
    setResult({
      found: finalStep.found,
      index: foundIndex,
      steps: searchSteps.length
    });
    
    setIsRunning(false);
  };

  const reset = () => {
    setCurrentStep(-1);
    setSteps([]);
    setResult(null);
    setIsRunning(false);
  };

  const parseCustomArray = () => {
    try {
      const parsed = customArray.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (parsed.length > 0) {
        // Ensure array is sorted
        parsed.sort((a, b) => a - b);
        setArray(parsed);
        reset();
      }
    } catch (e) {
      console.error('Failed to parse custom array:', e);
    }
  };

  const generateRandomArray = () => {
    const size = 10 + Math.floor(Math.random() * 6); // 10-15 elements
    const arr = [];
    let current = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < size; i++) {
      arr.push(current);
      current += Math.floor(Math.random() * 4) + 1; // Add 1-4
    }
    
    setArray(arr);
    setCustomArray(arr.join(','));
    reset();
  };

  const getCurrentStepData = () => {
    if (currentStep === -1 || currentStep >= steps.length) return null;
    return steps[currentStep];
  };

  const getElementStyle = (index: number) => {
    const stepData = getCurrentStepData();
    if (!stepData) return 'bg-gray-100 border-gray-300';
    
    const { left, right, mid, comparison, found } = stepData;
    
    if (index === mid && found) {
      return 'bg-green-200 border-green-500 ring-2 ring-green-300';
    } else if (index === mid) {
      return comparison === 'less' 
        ? 'bg-orange-200 border-orange-500'
        : comparison === 'greater'
        ? 'bg-red-200 border-red-500'
        : 'bg-blue-200 border-blue-500';
    } else if (index >= left && index <= right) {
      return 'bg-blue-50 border-blue-300';
    } else {
      return 'bg-gray-100 border-gray-300 opacity-50';
    }
  };

  const getStepMessage = () => {
    const stepData = getCurrentStepData();
    if (!stepData) return '';
    
    const { mid, comparison, found, step } = stepData;
    
    if (found) {
      return `Step ${step}: Found! Target ${target} is at position ${mid}`;
    } else if (comparison === 'none') {
      return `Step ${step}: Search space exhausted - target not found`;
    } else {
      const midValue = array[mid];
      if (comparison === 'less') {
        return `Step ${step}: ${midValue} < ${target}, search right half`;
      } else {
        return `Step ${step}: ${midValue} > ${target}, search left half`;
      }
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div className="px-6 py-4 space-y-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Target Value:</label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
                disabled={isRunning}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Speed:</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                disabled={isRunning}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
              >
                <option value={2500}>Slow</option>
                <option value={1500}>Normal</option>
                <option value={800}>Fast</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Actions:</label>
              <div className="flex gap-2">
                <button
                  onClick={runSearch}
                  disabled={isRunning}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  {isRunning ? 'Running...' : 'Start Search'}
                </button>
                <button
                  onClick={reset}
                  disabled={isRunning}
                  className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Custom Array (comma-separated):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customArray}
                  onChange={(e) => setCustomArray(e.target.value)}
                  disabled={isRunning}
                  placeholder="1,3,5,7,9,11,13"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
                />
                <button
                  onClick={parseCustomArray}
                  disabled={isRunning}
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Quick Actions:</label>
              <button
                onClick={generateRandomArray}
                disabled={isRunning}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
              >
                Generate Random Array
              </button>
            </div>
          </div>
        </div>

        {/* Array Visualization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-800">
              Sorted Array ({array.length} elements)
            </h4>
            {getCurrentStepData() && (
              <div className="text-sm text-gray-600">
                Searching range: [{getCurrentStepData()?.left}, {getCurrentStepData()?.right}]
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1 p-4 bg-gray-50 rounded-lg overflow-x-auto">
            {array.map((value, index) => (
              <div
                key={index}
                className={`
                  min-w-[3rem] h-12 flex items-center justify-center 
                  border-2 rounded font-mono text-sm font-semibold
                  transition-all duration-300
                  ${getElementStyle(index)}
                `}
              >
                <div className="text-center">
                  <div className="text-xs text-gray-500">{index}</div>
                  <div>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Current Step Information */}
          {isRunning && getCurrentStepData() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                {getStepMessage()}
              </p>
              {getCurrentStepData()?.comparison !== 'none' && (
                <div className="text-xs text-blue-700">
                  Checking middle element at index {getCurrentStepData()?.mid}: {array[getCurrentStepData()?.mid || 0]}
                </div>
              )}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`border rounded-lg p-4 ${
              result.found 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-bold ${result.found ? 'text-green-600' : 'text-red-600'}`}>
                  {result.found ? '✓ Found!' : '✗ Not Found'}
                </span>
              </div>
              <div className={`text-sm ${result.found ? 'text-green-800' : 'text-red-800'}`}>
                {result.found 
                  ? `Target ${target} found at index ${result.index} in ${result.steps} steps`
                  : `Target ${target} not found in the array (searched in ${result.steps} steps)`
                }
              </div>
              <div className="text-xs text-gray-600 mt-2">
                With linear search, this would take up to {array.length} steps. 
                Binary search did it in {result.steps} steps! 
                {result.steps < array.length / 2 && '🚀'}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-800 mb-3">📖 Legend:</h5>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded"></div>
                <span>Current search range</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-200 border-2 border-blue-500 rounded"></div>
                <span>Middle element being checked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 border-2 border-green-500 rounded"></div>
                <span>Target found!</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-200 border-2 border-orange-500 rounded"></div>
                <span>Too small - search right</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 border-2 border-red-500 rounded"></div>
                <span>Too large - search left</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded opacity-50"></div>
                <span>Outside search range</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded text-sm text-blue-800">
            <strong>How Binary Search Works:</strong> Start in the middle. If the target is smaller, 
            search the left half. If larger, search the right half. Repeat until found or no more elements to check.
            This eliminates half the possibilities at each step! ⚡
          </div>
        </div>
      </div>
    </div>
  );
}