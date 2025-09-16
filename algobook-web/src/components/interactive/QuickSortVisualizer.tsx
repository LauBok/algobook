'use client';

import React, { useState, useEffect } from 'react';

interface QuickSortStep {
  type: 'partition' | 'recursion';
  level: number;
  array: number[];
  low: number;
  high: number;
  pivotIndex: number;
  pivotValue: number;
  currentJ?: number;
  currentI?: number;
  description: string;
  isActive: boolean;
  partitionResult?: number;
  leftElements?: number[];
  rightElements?: number[];
}

interface QuickSortVisualizerProps {
  initialArray?: number[];
}

const DEFAULT_ARRAY = [64, 34, 25, 12, 22, 11, 45];

export default function QuickSortVisualizer({ 
  initialArray = DEFAULT_ARRAY
}: QuickSortVisualizerProps) {
  const [array, setArray] = useState<number[]>(initialArray);
  const [steps, setSteps] = useState<QuickSortStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [customInput, setCustomInput] = useState('');

  // Generate quick sort steps
  const generateSteps = (arr: number[]): QuickSortStep[] => {
    const allSteps: QuickSortStep[] = [];
    let stepLevel = 0;
    const workingArray = [...arr];

    function quickSort(array: number[], low: number, high: number, level: number): void {
      if (low < high) {
        // Add recursion step
        allSteps.push({
          type: 'recursion',
          level: level,
          array: [...array],
          low: low,
          high: high,
          pivotIndex: high,
          pivotValue: array[high],
          description: `Sorting subarray [${low}..${high}]: [${array.slice(low, high + 1).join(', ')}]`,
          isActive: false
        });

        // Perform partitioning
        const pivotPos = partition(array, low, high, level);
        
        // Add partition result step
        allSteps.push({
          type: 'partition',
          level: level,
          array: [...array],
          low: low,
          high: high,
          pivotIndex: pivotPos,
          pivotValue: array[pivotPos],
          description: `Partitioned around pivot ${array[pivotPos]} at position ${pivotPos}`,
          isActive: false,
          partitionResult: pivotPos,
          leftElements: array.slice(low, pivotPos),
          rightElements: array.slice(pivotPos + 1, high + 1)
        });

        // Recursively sort left and right parts
        quickSort(array, low, pivotPos - 1, level + 1);
        quickSort(array, pivotPos + 1, high, level + 1);
      } else {
        // Add step for base case (single element or empty subarray)
        if (low === high) {
          allSteps.push({
            type: 'recursion',
            level: level,
            array: [...array],
            low: low,
            high: high,
            pivotIndex: low,
            pivotValue: array[low],
            description: `Base case: Single element ${array[low]} at position ${low} is already sorted`,
            isActive: false
          });
        } else if (low > high) {
          allSteps.push({
            type: 'recursion',
            level: level,
            array: [...array],
            low: low,
            high: high,
            pivotIndex: -1,
            pivotValue: 0,
            description: `Base case: Empty subarray [${low}..${high}] - nothing to sort`,
            isActive: false
          });
        }
      }
    }

    function partition(array: number[], low: number, high: number, level: number): number {
      const pivot = array[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        // Add step for each comparison
        allSteps.push({
          type: 'partition',
          level: level,
          array: [...array],
          low: low,
          high: high,
          pivotIndex: high,
          pivotValue: pivot,
          currentJ: j,
          currentI: i,
          description: `Comparing ${array[j]} with pivot ${pivot}`,
          isActive: false
        });

        if (array[j] <= pivot) {
          i++;
          if (i !== j) {
            [array[i], array[j]] = [array[j], array[i]];
            // Add step for swap
            allSteps.push({
              type: 'partition',
              level: level,
              array: [...array],
              low: low,
              high: high,
              pivotIndex: high,
              pivotValue: pivot,
              currentJ: j,
              currentI: i,
              description: `${array[j]} ≤ ${pivot}, swapped positions ${i} and ${j}`,
              isActive: false
            });
          }
        }
      }

      // Final swap to place pivot in correct position
      i++;
      [array[i], array[high]] = [array[high], array[i]];
      
      return i;
    }

    quickSort(workingArray, 0, workingArray.length - 1, 0);
    
    // Add final completion step
    allSteps.push({
      type: 'partition',
      level: 0,
      array: [...workingArray],
      low: 0,
      high: workingArray.length - 1,
      pivotIndex: -1,
      pivotValue: 0,
      description: `Sorting complete! Final sorted array: [${workingArray.join(', ')}]`,
      isActive: false,
      partitionResult: -1
    });
    
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
      if (newArray.length > 0 && newArray.length <= 12) {
        setArray(newArray);
        setCustomInput('');
      } else {
        alert('Please enter 1-12 valid numbers separated by commas');
      }
    } catch (error) {
      alert('Invalid input format. Use comma-separated numbers like: 3,1,4,1,5');
    }
  };

  const getElementColor = (index: number, step: QuickSortStep) => {
    if (!step) return 'bg-blue-500';
    
    // Color coding for different element types
    if (index === step.pivotIndex) {
      return 'bg-purple-600'; // Pivot
    }
    
    if (step.currentJ !== undefined && index === step.currentJ) {
      return 'bg-yellow-500'; // Current element being compared
    }
    
    if (step.currentI !== undefined && index <= step.currentI && index >= step.low) {
      return 'bg-green-500'; // Elements ≤ pivot
    }
    
    if (index >= step.low && index <= step.high) {
      if (step.currentJ !== undefined && step.currentI !== undefined && index < step.currentJ && index > step.currentI) {
        return 'bg-red-500'; // Elements > pivot
      }
      return 'bg-blue-400'; // Active range
    }
    
    return 'bg-gray-400'; // Inactive elements
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          ⚡ QuickSort Visualizer
        </h3>
        <p className="text-gray-700">
          Watch how QuickSort partitions arrays around pivots and recursively sorts subarrays in-place.
        </p>
      </div>

      {/* Algorithm Overview */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">🧠 How QuickSort Works:</h4>
        <div className="text-blue-700 text-sm space-y-2">
          <div><strong>1. Pick a Pivot:</strong> Choose an element from the array (we use the last element)</div>
          <div><strong>2. Partition:</strong> Rearrange so smaller elements go left, larger elements go right</div>
          <div><strong>3. Pivot is Now Sorted:</strong> The pivot is in its final correct position!</div>
          <div><strong>4. Recursively Sort:</strong> Apply the same process to left and right subarrays</div>
        </div>
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
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Step Description */}
      {currentStepData && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              currentStepData.type === 'recursion' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {currentStepData.type.toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">Level {currentStepData.level}</span>
            {currentStepData.type === 'partition' && (
              <span className="text-sm text-gray-600">
                Range: [{currentStepData.low}..{currentStepData.high}]
              </span>
            )}
          </div>
          <p className="text-sm text-purple-800 font-medium">{currentStepData.description}</p>
          
          {/* Detailed explanation based on step type */}
          <div className="mt-3 text-xs text-purple-700 bg-white p-3 rounded border">
            {currentStepData.type === 'recursion' ? (
              <div>
                <strong>What's happening:</strong> We're starting to sort the subarray from position {currentStepData.low} to {currentStepData.high}. 
                Our pivot is <strong>{currentStepData.pivotValue}</strong> (the last element). 
                We need to rearrange elements so everything ≤ {currentStepData.pivotValue} goes left, everything &gt; {currentStepData.pivotValue} goes right.
              </div>
            ) : currentStepData.currentJ !== undefined ? (
              <div>
                <strong>Partitioning Strategy:</strong> We're checking element <strong>{currentStepData.array[currentStepData.currentJ]}</strong> at position {currentStepData.currentJ}. 
                We compare it with pivot <strong>{currentStepData.pivotValue}</strong>. 
                {currentStepData.array[currentStepData.currentJ] <= currentStepData.pivotValue 
                  ? `Since ${currentStepData.array[currentStepData.currentJ]} ≤ ${currentStepData.pivotValue}, we'll move it to the "small elements" section on the left.`
                  : `Since ${currentStepData.array[currentStepData.currentJ]} > ${currentStepData.pivotValue}, we leave it where it is (it's already in the "large elements" section).`
                }
              </div>
            ) : currentStepData.partitionResult !== undefined ? (
              <div>
                <strong>Partition Complete!</strong> The pivot <strong>{currentStepData.pivotValue}</strong> is now in its final sorted position at index {currentStepData.partitionResult}. 
                All elements to the left are ≤ {currentStepData.pivotValue}, all elements to the right are &gt; {currentStepData.pivotValue}. 
                Next, we'll recursively sort the left and right subarrays.
              </div>
            ) : (
              <div>
                <strong>Processing:</strong> {currentStepData.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Array Visualization */}
      {currentStepData && (
        <div className="mb-6">
          {/* Partitioning Strategy Visual */}
          {currentStepData.type === 'partition' && currentStepData.currentJ !== undefined && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="text-sm font-semibold text-yellow-800 mb-2">🎯 Partitioning Strategy in Action:</h5>
              <div className="text-xs text-yellow-700 space-y-1">
                <div><strong>Boundary (i = {currentStepData.currentI}):</strong> Everything from start to position {currentStepData.currentI} is ≤ {currentStepData.pivotValue}</div>
                <div><strong>Explorer (j = {currentStepData.currentJ}):</strong> We're checking position {currentStepData.currentJ} with value {currentStepData.array[currentStepData.currentJ]}</div>
                <div><strong>Goal:</strong> If current element ≤ pivot, swap it into the "small elements" region and expand the boundary</div>
              </div>
            </div>
          )}

          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Array State
              {currentStepData.currentJ !== undefined && (
                <span className="text-xs text-gray-500 ml-2">
                  (boundary i={currentStepData.currentI}, explorer j={currentStepData.currentJ}, pivot={currentStepData.pivotValue})
                </span>
              )}
            </h4>
            <div className="flex justify-center gap-1 mb-2">
              {currentStepData.array.map((value, index) => (
                <div
                  key={index}
                  className={`w-12 h-12 text-white font-bold rounded flex items-center justify-center transition-all duration-500 ${
                    getElementColor(index, currentStepData)
                  }`}
                  title={`Index ${index}: ${value}${index === currentStepData.pivotIndex ? ' (pivot)' : ''}`}
                >
                  {value}
                </div>
              ))}
            </div>
            
            {/* Pointer indicators */}
            {currentStepData.type === 'partition' && currentStepData.currentJ !== undefined && (
              <div className="flex justify-center gap-1 mb-2">
                {currentStepData.array.map((_, index) => (
                  <div key={index} className="w-12 h-6 flex flex-col items-center justify-center text-center">
                    {/* i pointer */}
                    {index === currentStepData.currentI && (
                      <div className="text-green-600 font-bold text-xs leading-none">
                        i
                      </div>
                    )}
                    {/* j pointer */}
                    {index === currentStepData.currentJ && (
                      <div className="text-yellow-600 font-bold text-xs leading-none">
                        j
                      </div>
                    )}
                    {/* pivot pointer */}
                    {index === currentStepData.pivotIndex && (
                      <div className="text-purple-600 font-bold text-xs leading-none">
                        pivot
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Index labels */}
            <div className="flex justify-center gap-1 mb-4">
              {currentStepData.array.map((_, index) => (
                <div key={index} className="w-12 text-center text-xs text-gray-500">
                  {index}
                </div>
              ))}
            </div>

            {/* Visual boundary explanation */}
            {currentStepData.type === 'partition' && currentStepData.currentJ !== undefined && (
              <div className="mt-4 flex justify-center">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Region [0..i]: Elements ≤ {currentStepData.pivotValue}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Region [i+1..j-1]: Elements &gt; {currentStepData.pivotValue}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Position j: Currently examining</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Partition Results */}
          {currentStepData.type === 'partition' && currentStepData.partitionResult !== undefined && (
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Left Partition (≤ pivot)</h5>
                <div className="flex justify-center gap-1">
                  {(currentStepData.leftElements || []).map((value, index) => (
                    <div key={index} className="w-10 h-10 bg-green-500 text-white font-bold rounded flex items-center justify-center text-sm">
                      {value}
                    </div>
                  ))}
                  {(currentStepData.leftElements || []).length === 0 && (
                    <div className="text-sm text-gray-500 py-3">Empty</div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Pivot</h5>
                <div className="flex justify-center">
                  <div className="w-10 h-10 bg-purple-600 text-white font-bold rounded flex items-center justify-center text-sm">
                    {currentStepData.pivotValue}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Final position</div>
              </div>

              <div className="text-center">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Right Partition (&gt; pivot)</h5>
                <div className="flex justify-center gap-1">
                  {(currentStepData.rightElements || []).map((value, index) => (
                    <div key={index} className="w-10 h-10 bg-red-500 text-white font-bold rounded flex items-center justify-center text-sm">
                      {value}
                    </div>
                  ))}
                  {(currentStepData.rightElements || []).length === 0 && (
                    <div className="text-sm text-gray-500 py-3">Empty</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3">Understanding the Colors:</h4>
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">During Partitioning:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm ml-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-600 rounded"></div>
              <span><strong>Pivot:</strong> Element we're organizing around</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span><strong>Current (j):</strong> Element we're examining now</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span><strong>Small (≤ pivot):</strong> Elements moved to left region</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span><strong>Large (&gt; pivot):</strong> Elements staying in right region</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <span><strong>Active range:</strong> Part of array being sorted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span><strong>Inactive:</strong> Already sorted or not yet reached</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded border text-xs text-blue-700">
            <strong>💡 Key Insight:</strong> Watch how the <span className="text-green-600 font-bold">i</span> pointer 
            maintains the boundary between small and large elements! When <span className="text-yellow-600 font-bold">j</span>{' '}
            finds a small element, we move it to the green region by swapping and advancing <span className="text-green-600 font-bold">i</span>.
          </div>
        </div>
      </div>

      {/* Algorithm Insights */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">⚡ Key Insights:</h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• <strong>Partition Strategy:</strong> Work is done BEFORE recursion (unlike merge sort)</li>
          <li>• <strong>In-place Sorting:</strong> Uses O(1) extra space by swapping elements within array</li>
          <li>• <strong>Pivot Magic:</strong> After partitioning, pivot is in its final sorted position</li>
          <li>• <strong>Performance Dependency:</strong> Quality depends heavily on pivot selection</li>
          <li>• <strong>Average Case:</strong> O(n log n) when pivots divide arrays reasonably well</li>
          <li>• <strong>Worst Case:</strong> O(n²) when pivots are always smallest/largest elements</li>
        </ul>
      </div>
    </div>
  );
}