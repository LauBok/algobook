'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface VisualizationStep {
  step: number;
  left: number;
  right: number;
  mid: number;
  leftHalfSorted: boolean;
  rightHalfSorted: boolean;
  targetInSortedHalf: boolean;
  comparison: string;
  action: string;
  found: boolean;
  array: number[];
  target: number;
}

interface RotatedArraySearchVisualizerProps {
  defaultArray?: number[];
  defaultTarget?: number;
  defaultRotation?: number;
}

export default function RotatedArraySearchVisualizer({ 
  defaultArray = [0, 1, 2, 4, 5, 6, 7],
  defaultTarget = 0,
  defaultRotation = 4
}: RotatedArraySearchVisualizerProps) {
  const [originalArray, setOriginalArray] = useState<number[]>(defaultArray);
  const [rotationAmount, setRotationAmount] = useState<number>(defaultRotation);
  const [target, setTarget] = useState<number>(defaultTarget);
  const [inputTarget, setInputTarget] = useState<string>(defaultTarget.toString());
  const [inputArray, setInputArray] = useState<string>(defaultArray.join(', '));
  const [inputRotation, setInputRotation] = useState<string>(defaultRotation.toString());
  
  const [steps, setSteps] = useState<VisualizationStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showRotation, setShowRotation] = useState<boolean>(true);

  // Create rotated array (memoized to prevent infinite re-renders)
  const rotatedArray = React.useMemo(() => {
    const createRotatedArray = (arr: number[], rotation: number): number[] => {
      const n = arr.length;
      const normalizedRotation = rotation % n;
      return [...arr.slice(normalizedRotation), ...arr.slice(0, normalizedRotation)];
    };
    return createRotatedArray(originalArray, rotationAmount);
  }, [originalArray, rotationAmount]);

  // Generate search steps for rotated array
  const generateSteps = (nums: number[], target: number): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    let left = 0;
    let right = nums.length - 1;
    let stepNum = 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midVal = nums[mid];
      
      // Determine which half is sorted
      const leftHalfSorted = nums[left] <= nums[mid];
      const rightHalfSorted = nums[mid] <= nums[right];
      
      let comparison: string;
      let action: string;
      let found = false;
      let targetInSortedHalf = false;

      if (midVal === target) {
        comparison = `nums[${mid}] = ${midVal} equals ${target}`;
        action = `Found target at index ${mid}!`;
        found = true;
      } else {
        // Determine which half to search
        if (leftHalfSorted) {
          comparison = `Left half [${left}..${mid}] is sorted: [${nums[left]}..${nums[mid]}]`;
          if (nums[left] <= target && target < midVal) {
            action = `Target ${target} is in sorted left half`;
            targetInSortedHalf = true;
          } else {
            action = `Target ${target} must be in right half`;
            targetInSortedHalf = false;
          }
        } else {
          comparison = `Right half [${mid}..${right}] is sorted: [${nums[mid]}..${nums[right]}]`;
          if (midVal < target && target <= nums[right]) {
            action = `Target ${target} is in sorted right half`;
            targetInSortedHalf = true;
          } else {
            action = `Target ${target} must be in left half`;
            targetInSortedHalf = false;
          }
        }
      }

      steps.push({
        step: stepNum,
        left,
        right,
        mid,
        leftHalfSorted,
        rightHalfSorted,
        targetInSortedHalf,
        comparison,
        action,
        found,
        array: [...nums],
        target
      });

      if (found) break;

      // Update search boundaries
      if (leftHalfSorted) {
        if (nums[left] <= target && target < midVal) {
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      } else {
        if (midVal < target && target <= nums[right]) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      stepNum++;
    }

    // If not found
    if (steps.length === 0 || !steps[steps.length - 1].found) {
      steps.push({
        step: stepNum,
        left,
        right,
        mid: -1,
        leftHalfSorted: false,
        rightHalfSorted: false,
        targetInSortedHalf: false,
        comparison: `Search space exhausted (left=${left} > right=${right})`,
        action: `Target ${target} not found in array`,
        found: false,
        array: [...nums],
        target
      });
    }

    return steps;
  };

  // Initialize steps
  useEffect(() => {
    const newSteps = generateSteps(rotatedArray, target);
    setSteps(newSteps);
    setCurrentStep(-1);
    setIsCompleted(false);
    setIsPlaying(false);
  }, [rotatedArray, target]);

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
    }, 1800);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length]);

  const handleArrayChange = () => {
    try {
      const newArray = inputArray.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (newArray.length > 0) {
        newArray.sort((a, b) => a - b); // Ensure sorted for demonstration
        setOriginalArray(newArray);
      }
    } catch (e) {
      // Invalid input, ignore
    }
  };

  const handleRotationChange = () => {
    const newRotation = parseInt(inputRotation);
    if (!isNaN(newRotation) && newRotation >= 0) {
      setRotationAmount(newRotation % originalArray.length);
    }
  };

  const handleTargetChange = () => {
    const newTarget = parseInt(inputTarget);
    if (!isNaN(newTarget)) {
      setTarget(newTarget);
    }
  };

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

  const currentStepData = currentStep >= 0 ? steps[currentStep] : null;

  const getCellClass = (index: number) => {
    if (!currentStepData) return 'bg-gray-100 border-gray-300';
    
    const { left, right, mid, found, leftHalfSorted, rightHalfSorted, targetInSortedHalf } = currentStepData;
    
    // Found target
    if (index === mid && found) {
      return 'bg-green-200 border-green-500 animate-pulse font-bold';
    }
    
    // Current middle element
    if (index === mid && mid >= 0) {
      return 'bg-yellow-200 border-yellow-500 font-bold';
    }
    
    // Search space exhausted
    if (left > right) {
      return 'bg-gray-100 border-gray-300 opacity-50';
    }
    
    // Within current search range
    if (index >= left && index <= right) {
      // Highlight sorted half differently (exclude mid from halves since it's already highlighted)
      if (leftHalfSorted && index >= left && index < mid) {
        return targetInSortedHalf 
          ? 'bg-blue-200 border-blue-400' // Sorted half with target
          : 'bg-blue-100 border-blue-300'; // Sorted half without target
      }
      if (rightHalfSorted && index > mid && index <= right) {
        return targetInSortedHalf 
          ? 'bg-blue-200 border-blue-400' // Sorted half with target
          : 'bg-blue-100 border-blue-300'; // Sorted half without target
      }
      // Mixed/rotated half (excluding mid)
      if (index !== mid) {
        return 'bg-purple-100 border-purple-300';
      }
      // If we reach here, it's mid and not found, let yellow highlighting take precedence
      return 'bg-gray-100 border-gray-300';
    }
    
    // Outside search range
    return 'bg-gray-100 border-gray-300 opacity-50';
  };

  const getRotationClass = (index: number) => {
    if (!showRotation) return 'bg-gray-100 border-gray-300';
    
    // Highlight the rotation point
    if (index === rotationAmount % originalArray.length) {
      return 'bg-red-200 border-red-500 font-bold animate-pulse';
    }
    
    return 'bg-gray-100 border-gray-300';
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🔄 Rotated Array Search Visualization
        </h3>
        <p className="text-gray-700">
          See how binary search adapts to find elements in rotated sorted arrays!
        </p>
      </div>

      {/* Input Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Array (will be sorted):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputArray}
                onChange={(e) => setInputArray(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0, 1, 2, 4, 5, 6, 7"
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
              Rotation Amount:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputRotation}
                onChange={(e) => setInputRotation(e.target.value)}
                min="0"
                max={originalArray.length - 1}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleRotationChange}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Rotate
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

        {/* Toggle Rotation View */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRotation(!showRotation)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            {showRotation ? 'Hide' : 'Show'} Rotation Process
          </button>
          <span className="text-sm text-gray-600">
            Toggle to see how the array was rotated
          </span>
        </div>
      </div>

      {/* Array Visualization */}
      <div className="mb-6">
        {showRotation && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Original Sorted Array:</h4>
            <div className="flex flex-wrap gap-1 justify-center mb-4">
              {originalArray.map((value, index) => (
                <div
                  key={index}
                  className={`w-12 h-12 border-2 rounded flex items-center justify-center font-bold text-sm transition-all duration-300 ${getRotationClass(index)}`}
                >
                  {value}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600 mb-2">
              ↓ Rotate by {rotationAmount} positions ↓
            </div>
          </div>
        )}

        <h4 className="font-semibold text-gray-800 mb-3">
          Rotated Array {showRotation ? `(rotated by ${rotationAmount})` : ''}:
        </h4>
        <div className="flex flex-wrap gap-1 justify-center mb-4">
          {rotatedArray.map((value, index) => (
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
          {rotatedArray.map((_, index) => (
            <div key={index} className="w-12 text-center text-xs text-gray-500">
              {index}
            </div>
          ))}
        </div>
      </div>

      {/* Two Halves Analysis */}
      {currentStepData && currentStepData.mid >= 0 && !currentStepData.found && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">🧩 Two Halves Analysis:</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className={`p-3 rounded ${currentStepData.leftHalfSorted ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-gray-100'}`}>
              <div className="font-semibold">Left Half [{currentStepData.left}..{currentStepData.mid - 1}]:</div>
              <div>Values: [{rotatedArray.slice(currentStepData.left, currentStepData.mid).join(', ')}]</div>
              <div className="mt-1">
                {currentStepData.leftHalfSorted ? '✅ Properly Sorted' : '❌ Contains Rotation'}
              </div>
            </div>
            <div className={`p-3 rounded ${currentStepData.rightHalfSorted ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-gray-100'}`}>
              <div className="font-semibold">Right Half [{currentStepData.mid + 1}..{currentStepData.right}]:</div>
              <div>Values: [{rotatedArray.slice(currentStepData.mid + 1, currentStepData.right + 1).join(', ')}]</div>
              <div className="mt-1">
                {currentStepData.rightHalfSorted ? '✅ Properly Sorted' : '❌ Contains Rotation'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step Information */}
      {currentStepData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">
            Step {currentStepData.step}:
          </h4>
          <div className="space-y-2 text-sm">
            {currentStepData.mid >= 0 && (
              <div>
                <strong>Search Range:</strong> left = {currentStepData.left}, right = {currentStepData.right}, mid = {currentStepData.mid}
              </div>
            )}
            <div><strong>Analysis:</strong> {currentStepData.comparison}</div>
            <div><strong>Decision:</strong> {currentStepData.action}</div>
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
      <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Legend:</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-500 rounded"></div>
            <span>Current Middle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 border-2 border-green-500 rounded"></div>
            <span>Target Found!</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 border-2 border-blue-400 rounded"></div>
            <span>Sorted Half (with target)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
            <span>Sorted Half</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 border-2 border-purple-300 rounded"></div>
            <span>Mixed/Rotated Half</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded opacity-50"></div>
            <span>Eliminated</span>
          </div>
        </div>
      </div>

      {/* Educational Notes */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Key Insights:</h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• <strong>At least one half is always properly sorted</strong> - this is the key insight!</li>
          <li>• We can apply normal binary search logic to the sorted half</li>
          <li>• Check if target belongs in the sorted half, then decide which way to go</li>
          <li>• The rotation point creates exactly two sorted subarrays joined together</li>
          <li>• Time complexity remains O(log n) just like regular binary search</li>
        </ul>
      </div>
    </div>
  );
}