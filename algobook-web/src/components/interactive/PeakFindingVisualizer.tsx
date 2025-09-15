'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface VisualizationStep {
  step: number;
  left: number;
  right: number;
  mid: number;
  leftSlope: 'ascending' | 'descending' | 'none';
  rightSlope: 'ascending' | 'descending' | 'none';
  comparison: string;
  action: string;
  isPeak: boolean;
  array: number[];
}

interface PeakFindingVisualizerProps {
  defaultArray?: number[];
}

export default function PeakFindingVisualizer({ 
  defaultArray = [1, 2, 3, 1]
}: PeakFindingVisualizerProps) {
  const [array, setArray] = useState<number[]>(defaultArray);
  const [inputArray, setInputArray] = useState<string>(defaultArray.join(', '));
  
  const [steps, setSteps] = useState<VisualizationStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Find all peaks in the array for educational purposes
  const allPeaks = useMemo(() => {
    const peaks: number[] = [];
    for (let i = 0; i < array.length; i++) {
      const leftVal = i > 0 ? array[i - 1] : Number.NEGATIVE_INFINITY;
      const rightVal = i < array.length - 1 ? array[i + 1] : Number.NEGATIVE_INFINITY;
      if (array[i] >= leftVal && array[i] >= rightVal) {
        peaks.push(i);
      }
    }
    return peaks;
  }, [array]);

  // Generate peak finding steps
  const generateSteps = (nums: number[]): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    let left = 0;
    let right = nums.length - 1;
    let stepNum = 1;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      
      // Get slopes
      const leftVal = mid > 0 ? nums[mid - 1] : Number.NEGATIVE_INFINITY;
      const midVal = nums[mid];
      const rightVal = mid < nums.length - 1 ? nums[mid + 1] : Number.NEGATIVE_INFINITY;
      
      const leftSlope = mid === 0 ? 'none' : (leftVal < midVal ? 'ascending' : 'descending');
      const rightSlope = mid === nums.length - 1 ? 'none' : (midVal < rightVal ? 'ascending' : 'descending');
      
      let comparison: string;
      let action: string;
      let isPeak = false;

      // Check if current element is a peak
      if (midVal >= leftVal && midVal >= rightVal) {
        comparison = `nums[${mid}] = ${midVal} is ≥ both neighbors`;
        action = `Found a peak at index ${mid}!`;
        isPeak = true;
      } else if (rightSlope === 'ascending') {
        comparison = `nums[${mid}] = ${midVal} < nums[${mid + 1}] = ${rightVal}`;
        action = `Ascending slope detected → search right half`;
      } else {
        comparison = `nums[${mid}] = ${midVal} > nums[${mid + 1}] = ${rightVal}`;
        action = `Descending slope detected → search left half`;
      }

      steps.push({
        step: stepNum,
        left,
        right,
        mid,
        leftSlope,
        rightSlope,
        comparison,
        action,
        isPeak,
        array: [...nums]
      });

      if (isPeak) break;

      // Update boundaries based on slope
      if (rightSlope === 'ascending') {
        left = mid + 1;
      } else {
        right = mid;
      }

      stepNum++;
    }

    // If we exit the loop without finding a peak, left === right
    if (steps.length === 0 || !steps[steps.length - 1].isPeak) {
      const finalIndex = left;
      steps.push({
        step: stepNum,
        left: finalIndex,
        right: finalIndex,
        mid: finalIndex,
        leftSlope: 'none',
        rightSlope: 'none',
        comparison: `Converged to single element at index ${finalIndex}`,
        action: `Found peak at index ${finalIndex} (value: ${nums[finalIndex]})`,
        isPeak: true,
        array: [...nums]
      });
    }

    return steps;
  };

  // Initialize steps
  useEffect(() => {
    const newSteps = generateSteps(array);
    setSteps(newSteps);
    setCurrentStep(-1);
    setIsCompleted(false);
    setIsPlaying(false);
  }, [array]);

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
        setArray(newArray);
      }
    } catch (e) {
      // Invalid input, ignore
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
    // Show all peaks in light green when not actively searching
    if (!currentStepData && allPeaks.includes(index)) {
      return 'bg-green-100 border-green-400 relative';
    }

    if (!currentStepData) return 'bg-gray-100 border-gray-300';
    
    const { left, right, mid, isPeak } = currentStepData;
    
    // Found peak
    if (index === mid && isPeak) {
      return 'bg-green-200 border-green-500 animate-pulse font-bold';
    }
    
    // Current middle element being examined
    if (index === mid) {
      return 'bg-yellow-200 border-yellow-500 font-bold';
    }
    
    // Search space exhausted
    if (left > right) {
      return 'bg-gray-100 border-gray-300 opacity-50';
    }
    
    // Within current search range
    if (index >= left && index <= right) {
      return 'bg-blue-100 border-blue-300';
    }
    
    // Outside search range
    return 'bg-gray-100 border-gray-300 opacity-50';
  };

  const getSlopeIndicator = (index: number) => {
    if (index >= array.length - 1) return '';
    
    const current = array[index];
    const next = array[index + 1];
    
    if (current < next) return '↗️';
    if (current > next) return '↘️';
    return '→';
  };

  const getSlopeClass = (index: number) => {
    if (!currentStepData) return '';
    
    const { mid, leftSlope, rightSlope } = currentStepData;
    
    if (index === mid - 1 && leftSlope === 'ascending') return 'bg-green-50 border-green-300';
    if (index === mid - 1 && leftSlope === 'descending') return 'bg-red-50 border-red-300';
    if (index === mid && rightSlope === 'ascending') return 'bg-green-50 border-green-300';
    if (index === mid && rightSlope === 'descending') return 'bg-red-50 border-red-300';
    
    return '';
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🏔️ Peak Finding Visualization
        </h3>
        <p className="text-gray-700">
          See how binary search finds peaks by following slopes instead of comparing values!
        </p>
      </div>

      {/* Input Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Array (any values, peaks will be found):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputArray}
                onChange={(e) => setInputArray(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1, 2, 3, 1"
              />
              <button
                onClick={handleArrayChange}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
          
          <div className="text-sm">
            <div className="text-gray-600 mb-1">All peaks in array:</div>
            <div className="font-mono text-green-600 font-bold">
              {allPeaks.length > 0 
                ? allPeaks.map(i => `[${i}]: ${array[i]}`).join(', ')
                : 'No peaks found'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Array Visualization */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Array with Slope Indicators:</h4>
        
        {/* Array elements */}
        <div className="flex flex-wrap gap-1 justify-center mb-2">
          {array.map((value, index) => (
            <div key={index} className="relative">
              <div
                className={`w-16 h-16 border-2 rounded flex items-center justify-center font-bold text-sm transition-all duration-300 ${getCellClass(index)}`}
              >
                {value}
                {/* Peak indicator */}
                {!currentStepData && allPeaks.includes(index) && (
                  <div className="absolute -top-2 -right-2 text-xs bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                    🏔️
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Slope indicators */}
        <div className="flex flex-wrap gap-1 justify-center mb-2">
          {array.map((_, index) => (
            <div key={index} className="w-16 text-center">
              {index < array.length - 1 && (
                <div className={`text-lg p-1 rounded ${getSlopeClass(index)}`}>
                  {getSlopeIndicator(index)}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Index labels */}
        <div className="flex flex-wrap gap-1 justify-center">
          {array.map((_, index) => (
            <div key={index} className="w-16 text-center text-xs text-gray-500">
              {index}
            </div>
          ))}
        </div>
      </div>

      {/* Slope Analysis */}
      {currentStepData && currentStepData.mid >= 0 && !currentStepData.isPeak && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">📈 Slope Analysis:</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded bg-blue-100">
              <div className="font-semibold">Left Slope (index {currentStepData.mid - 1} → {currentStepData.mid}):</div>
              <div className="flex items-center gap-2 mt-1">
                {currentStepData.mid > 0 ? (
                  <>
                    <span>{array[currentStepData.mid - 1]} → {array[currentStepData.mid]}</span>
                    <span className="text-lg">
                      {currentStepData.leftSlope === 'ascending' ? '↗️' : '↘️'}
                    </span>
                    <span className={currentStepData.leftSlope === 'ascending' ? 'text-green-600' : 'text-red-600'}>
                      {currentStepData.leftSlope}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">Boundary (treat as -∞)</span>
                )}
              </div>
            </div>
            <div className="p-3 rounded bg-blue-100">
              <div className="font-semibold">Right Slope (index {currentStepData.mid} → {currentStepData.mid + 1}):</div>
              <div className="flex items-center gap-2 mt-1">
                {currentStepData.mid < array.length - 1 ? (
                  <>
                    <span>{array[currentStepData.mid]} → {array[currentStepData.mid + 1]}</span>
                    <span className="text-lg">
                      {currentStepData.rightSlope === 'ascending' ? '↗️' : '↘️'}
                    </span>
                    <span className={currentStepData.rightSlope === 'ascending' ? 'text-green-600' : 'text-red-600'}>
                      {currentStepData.rightSlope}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">Boundary (treat as -∞)</span>
                )}
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
            <div>
              <strong>Search Range:</strong> left = {currentStepData.left}, right = {currentStepData.right}, mid = {currentStepData.mid}
            </div>
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
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-500 rounded"></div>
              <span>Current Middle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border-2 border-green-500 rounded"></div>
              <span>Peak Found!</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
              <span>Search Range</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded opacity-50"></div>
              <span>Eliminated</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">↗️</span>
              <span>Ascending slope (follow upward)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">↘️</span>
              <span>Descending slope (peak on left)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏔️</span>
              <span>Peak (≥ both neighbors)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Notes */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Key Insights:</h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• <strong>Follow the slope</strong>: If ascending (nums[mid] &lt; nums[mid+1]), go right</li>
          <li>• <strong>Guaranteed convergence</strong>: Following upward slope always leads to a peak</li>
          <li>• <strong>Boundary conditions</strong>: Array edges treated as negative infinity</li>
          <li>• <strong>Multiple peaks OK</strong>: Algorithm finds any peak, not necessarily the highest</li>
          <li>• <strong>Still O(log n)</strong>: Same time complexity as binary search</li>
          <li>• <strong>Local optimization</strong>: Different from global search - we find local maxima</li>
        </ul>
      </div>
    </div>
  );
}