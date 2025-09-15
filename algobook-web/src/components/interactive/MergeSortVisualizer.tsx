'use client';

import React, { useState, useEffect } from 'react';

interface MergeStep {
  type: 'divide' | 'merge';
  level: number;
  left: number[];
  right: number[];
  result: number[];
  description: string;
  leftRange: [number, number];
  rightRange: [number, number];
  isActive: boolean;
  fullArray: number[];
  activeRange: [number, number];
}

interface MergeSortVisualizerProps {
  initialArray?: number[];
  showSteps?: boolean;
}

const DEFAULT_ARRAY = [38, 27, 43, 3, 9, 82, 10];

export default function MergeSortVisualizer({ 
  initialArray = DEFAULT_ARRAY, 
  showSteps = true 
}: MergeSortVisualizerProps) {
  const [array, setArray] = useState<number[]>(initialArray);
  const [steps, setSteps] = useState<MergeStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [customInput, setCustomInput] = useState('');

  // Generate merge sort steps
  const generateSteps = (arr: number[]): MergeStep[] => {
    const allSteps: MergeStep[] = [];
    let stepLevel = 0;
    const originalArray = [...arr];

    function mergeSort(array: number[], start: number, end: number, currentFullArray: number[]): number[] {
      if (array.length <= 1) {
        return array;
      }

      const mid = Math.floor(array.length / 2);
      const left = array.slice(0, mid);
      const right = array.slice(mid);

      // Add divide step
      allSteps.push({
        type: 'divide',
        level: stepLevel,
        left: left,
        right: right,
        result: array,
        description: `Divide: Split [${array.join(', ')}] into [${left.join(', ')}] and [${right.join(', ')}]`,
        leftRange: [start, start + mid - 1],
        rightRange: [start + mid, end],
        isActive: false,
        fullArray: [...currentFullArray],
        activeRange: [start, end]
      });

      stepLevel++;
      const sortedLeft = mergeSort(left, start, start + mid - 1, currentFullArray);
      const sortedRight = mergeSort(right, start + mid, end, currentFullArray);
      stepLevel--;

      const merged = merge(sortedLeft, sortedRight);

      // Update the full array with merged result
      const updatedFullArray = [...currentFullArray];
      for (let i = 0; i < merged.length; i++) {
        updatedFullArray[start + i] = merged[i];
      }

      // Add merge step
      allSteps.push({
        type: 'merge',
        level: stepLevel,
        left: sortedLeft,
        right: sortedRight,
        result: merged,
        description: `Merge: Combine [${sortedLeft.join(', ')}] and [${sortedRight.join(', ')}] → [${merged.join(', ')}]`,
        leftRange: [start, start + mid - 1],
        rightRange: [start + mid, end],
        isActive: false,
        fullArray: [...updatedFullArray],
        activeRange: [start, end]
      });

      return merged;
    }

    function merge(left: number[], right: number[]): number[] {
      const result = [];
      let i = 0, j = 0;

      while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
          result.push(left[i]);
          i++;
        } else {
          result.push(right[j]);
          j++;
        }
      }

      result.push(...left.slice(i));
      result.push(...right.slice(j));
      return result;
    }

    mergeSort(arr, 0, arr.length - 1, [...arr]);
    return allSteps;
  };

  useEffect(() => {
    const newSteps = generateSteps(array);
    setSteps(newSteps);
    setCurrentStep(0);
  }, [array]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed]);

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleArrayChange = () => {
    try {
      const newArray = customInput.split(',').map(num => parseInt(num.trim())).filter(n => !isNaN(n));
      if (newArray.length > 0 && newArray.length <= 10) {
        setArray(newArray);
        setCustomInput('');
      } else {
        alert('Please enter 1-10 valid numbers separated by commas');
      }
    } catch (error) {
      alert('Invalid input format. Use comma-separated numbers like: 3,1,4,1,5');
    }
  };

  const getElementColor = (value: number, step: MergeStep, index: number, arrayType: 'left' | 'right' | 'result') => {
    if (!step) return 'bg-blue-500';
    
    switch (arrayType) {
      case 'left':
        return step.type === 'divide' ? 'bg-red-400' : 'bg-green-400';
      case 'right':
        return step.type === 'divide' ? 'bg-yellow-400' : 'bg-blue-400';
      case 'result':
        return step.type === 'merge' ? 'bg-purple-500' : 'bg-gray-400';
      default:
        return 'bg-blue-500';
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🔄 Merge Sort Visualizer
        </h3>
        <p className="text-gray-700">
          Watch how merge sort uses divide-and-conquer to sort arrays efficiently in O(n log n) time.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlay}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            🔄 Reset
          </button>
          <button
            onClick={handleStepBackward}
            disabled={currentStep === 0}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            ⏮️
          </button>
          <button
            onClick={handleStepForward}
            disabled={currentStep >= steps.length - 1}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            ⏭️
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Speed:</label>
          <select 
            value={speed} 
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={2000}>Slow</option>
            <option value={1000}>Normal</option>
            <option value={500}>Fast</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="3,1,4,1,5,9,2"
            className="border rounded px-2 py-1 text-sm w-32"
          />
          <button
            onClick={handleArrayChange}
            className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm transition-colors"
          >
            Set Array
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Step Description */}
      {currentStepData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              currentStepData.type === 'divide' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {currentStepData.type.toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">Level {currentStepData.level}</span>
          </div>
          <p className="text-sm text-blue-800 font-medium">{currentStepData.description}</p>
        </div>
      )}

      {/* Visualization */}
      {currentStepData && (
        <div className="mb-6">
          <div className="space-y-6">
            {/* Full Array Context */}
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Complete Array Context 
                <span className="text-xs text-gray-500 ml-2">
                  (Highlighting active section: positions {currentStepData.activeRange[0]} to {currentStepData.activeRange[1]})
                </span>
              </h4>
              <div className="flex justify-center gap-1">
                {currentStepData.fullArray.map((value, index) => {
                  const isInActiveRange = index >= currentStepData.activeRange[0] && index <= currentStepData.activeRange[1];
                  const isInLeftRange = index >= currentStepData.leftRange[0] && index <= currentStepData.leftRange[1];
                  const isInRightRange = index >= currentStepData.rightRange[0] && index <= currentStepData.rightRange[1];
                  
                  let elementClass = 'bg-gray-300 text-gray-600'; // inactive/not being sorted
                  
                  if (isInActiveRange) {
                    if (isInLeftRange) {
                      elementClass = currentStepData.type === 'divide' ? 'bg-red-500 text-white' : 'bg-green-500 text-white';
                    } else if (isInRightRange) {
                      elementClass = currentStepData.type === 'divide' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white';
                    }
                  }
                  
                  return (
                    <div
                      key={index}
                      className={`w-10 h-10 font-bold rounded flex items-center justify-center transition-all duration-500 ${elementClass}`}
                      title={`Position ${index}: ${value}${isInActiveRange ? ' (active)' : ' (inactive)'}`}
                    >
                      <span className="text-xs">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Split Arrays - Only show when actively working on subsections */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Array */}
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  {currentStepData.type === 'divide' ? 'Left Half' : 'Left Sorted'} 
                  <span className="text-xs text-gray-500 ml-1">
                    [positions {currentStepData.leftRange[0]}-{currentStepData.leftRange[1]}]
                  </span>
                </h4>
                <div className="flex justify-center gap-1">
                  {currentStepData.left.map((value, index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 text-white font-bold rounded flex items-center justify-center transition-all duration-300 ${
                        getElementColor(value, currentStepData, index, 'left')
                      }`}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Array */}
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  {currentStepData.type === 'divide' ? 'Right Half' : 'Right Sorted'}
                  <span className="text-xs text-gray-500 ml-1">
                    [positions {currentStepData.rightRange[0]}-{currentStepData.rightRange[1]}]
                  </span>
                </h4>
                <div className="flex justify-center gap-1">
                  {currentStepData.right.map((value, index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 text-white font-bold rounded flex items-center justify-center transition-all duration-300 ${
                        getElementColor(value, currentStepData, index, 'right')
                      }`}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Result Array (for merge steps) */}
            {currentStepData.type === 'merge' && (
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Merged Result 
                  <span className="text-xs text-gray-500 ml-1">
                    (Updates positions {currentStepData.activeRange[0]}-{currentStepData.activeRange[1]} in full array)
                  </span>
                </h4>
                <div className="flex justify-center gap-1">
                  {currentStepData.result.map((value, index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 text-white font-bold rounded flex items-center justify-center transition-all duration-300 ${
                        getElementColor(value, currentStepData, index, 'result')
                      }`}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3">Legend:</h4>
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">Full Array Context:</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm ml-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Left partition (divide)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Right partition (divide)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Left sorted (merge)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Right sorted (merge)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span>Inactive elements</span>
            </div>
          </div>
          
          <div className="text-sm font-medium text-gray-700 mt-4">Individual Arrays:</div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 text-sm ml-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>Merged result</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>Working subarrays</span>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithm Insights */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">🧠 Key Insights:</h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• <strong>Divide Phase:</strong> Split arrays in half until single elements (O(log n) levels)</li>
          <li>• <strong>Conquer Phase:</strong> Merge sorted subarrays back together (O(n) work per level)</li>
          <li>• <strong>Total Complexity:</strong> O(log n) levels × O(n) work per level = O(n log n)</li>
          <li>• <strong>Stability:</strong> Equal elements maintain their relative order during merging</li>
          <li>• <strong>Predictable:</strong> Always O(n log n) regardless of input data arrangement</li>
        </ul>
      </div>
    </div>
  );
}