'use client';

import React, { useState, useEffect } from 'react';

interface PartitionStep {
  array: number[];
  i: number;
  j: number;
  pivot: number;
  pivotIndex: number;
  description: string;
  action: 'compare' | 'swap' | 'final' | 'start';
  highlightSwap?: [number, number];
}

interface LomutoPartitionVisualizerProps {
  initialArray?: number[];
}

const DEFAULT_ARRAY = [64, 34, 25, 12, 22, 11, 45];

export default function LomutoPartitionVisualizer({ 
  initialArray = DEFAULT_ARRAY
}: LomutoPartitionVisualizerProps) {
  const [array, setArray] = useState<number[]>(initialArray);
  const [steps, setSteps] = useState<PartitionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500);
  const [customInput, setCustomInput] = useState('');

  // Generate partitioning steps using Lomuto algorithm
  const generatePartitionSteps = (arr: number[]): PartitionStep[] => {
    const steps: PartitionStep[] = [];
    const workingArray = [...arr];
    const pivot = workingArray[workingArray.length - 1];
    const pivotIndex = workingArray.length - 1;
    let i = -1;

    // Initial state
    steps.push({
      array: [...workingArray],
      i: i,
      j: -1,
      pivot: pivot,
      pivotIndex: pivotIndex,
      description: `Starting partition with pivot ${pivot}. Boundary i = ${i} (no small elements yet)`,
      action: 'start'
    });

    // Process each element
    for (let j = 0; j < workingArray.length - 1; j++) {
      // Compare step
      steps.push({
        array: [...workingArray],
        i: i,
        j: j,
        pivot: pivot,
        pivotIndex: pivotIndex,
        description: `Comparing ${workingArray[j]} with pivot ${pivot}`,
        action: 'compare'
      });

      if (workingArray[j] <= pivot) {
        i++;
        if (i !== j) {
          // Swap step
          [workingArray[i], workingArray[j]] = [workingArray[j], workingArray[i]];
          steps.push({
            array: [...workingArray],
            i: i,
            j: j,
            pivot: pivot,
            pivotIndex: pivotIndex,
            description: `${workingArray[i]} ≤ ${pivot}, so we expand the small region by moving it to position ${i}`,
            action: 'swap',
            highlightSwap: [i, j]
          });
        } else {
          // No swap needed, but still increment i
          steps.push({
            array: [...workingArray],
            i: i,
            j: j,
            pivot: pivot,
            pivotIndex: pivotIndex,
            description: `${workingArray[j]} ≤ ${pivot}, already in correct position, expand boundary to ${i}`,
            action: 'compare'
          });
        }
      } else {
        steps.push({
          array: [...workingArray],
          i: i,
          j: j,
          pivot: pivot,
          pivotIndex: pivotIndex,
          description: `${workingArray[j]} > ${pivot}, leave it in the large region`,
          action: 'compare'
        });
      }
    }

    // Final pivot placement
    i++;
    [workingArray[i], workingArray[pivotIndex]] = [workingArray[pivotIndex], workingArray[i]];
    steps.push({
      array: [...workingArray],
      i: i,
      j: workingArray.length - 1,
      pivot: pivot,
      pivotIndex: i,
      description: `Place pivot ${pivot} in its final position ${i}. Partitioning complete!`,
      action: 'final',
      highlightSwap: [i, pivotIndex]
    });

    return steps;
  };

  useEffect(() => {
    const newSteps = generatePartitionSteps(array);
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

  const getElementColor = (index: number, step: PartitionStep) => {
    if (!step) return 'bg-blue-500';
    
    // Highlight swapped elements
    if (step.highlightSwap && step.highlightSwap.includes(index)) {
      return 'bg-orange-500 animate-pulse';
    }
    
    // Pivot element
    if (index === step.pivotIndex) {
      return 'bg-purple-600';
    }
    
    // Current j position
    if (index === step.j && step.j >= 0) {
      return 'bg-yellow-500';
    }
    
    // Small elements region (0 to i)
    if (step.i >= 0 && index <= step.i && index < step.pivotIndex) {
      return 'bg-green-500';
    }
    
    // Large elements region (i+1 to j-1)
    if (step.i >= 0 && index > step.i && index < step.j && index < step.pivotIndex) {
      return 'bg-red-500';
    }
    
    // Unprocessed elements
    if (index > step.j && index < step.pivotIndex) {
      return 'bg-gray-400';
    }
    
    return 'bg-blue-400';
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🎯 Lomuto Partitioning Algorithm
        </h3>
        <p className="text-gray-700">
          Watch the step-by-step Lomuto partitioning process. See how the boundary pointer maintains two regions!
        </p>
      </div>

      {/* Algorithm Strategy */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">🧠 Lomuto Strategy:</h4>
        <div className="text-blue-700 text-sm space-y-1">
          <div><strong>Goal:</strong> Partition array so elements ≤ pivot are left, elements &gt; pivot are right</div>
          <div><strong>Method:</strong> Use boundary pointer <span className="text-green-600 font-bold">i</span> and explorer pointer <span className="text-yellow-600 font-bold">j</span></div>
          <div><strong>Invariant:</strong> Elements [0..i] are ≤ pivot, elements [i+1..j-1] are &gt; pivot</div>
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
            <option value={2500}>Slow</option>
            <option value={1500}>Normal</option>
            <option value={800}>Fast</option>
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
              currentStepData.action === 'start' ? 'bg-blue-100 text-blue-800' :
              currentStepData.action === 'compare' ? 'bg-yellow-100 text-yellow-800' :
              currentStepData.action === 'swap' ? 'bg-orange-100 text-orange-800' :
              'bg-green-100 text-green-800'
            }`}>
              {currentStepData.action.toUpperCase()}
            </span>
            {currentStepData.i >= 0 && (
              <span className="text-sm text-gray-600">
                i = {currentStepData.i}
              </span>
            )}
            {currentStepData.j >= 0 && (
              <span className="text-sm text-gray-600">
                j = {currentStepData.j}
              </span>
            )}
          </div>
          <p className="text-sm text-purple-800 font-medium">{currentStepData.description}</p>
        </div>
      )}

      {/* Array Visualization */}
      {currentStepData && (
        <div className="mb-6">
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Partitioning Process
            </h4>
            
            <div className="flex justify-center gap-1 mb-2">
              {currentStepData.array.map((value, index) => (
                <div
                  key={index}
                  className={`w-12 h-12 text-white font-bold rounded flex items-center justify-center transition-all duration-500 ${
                    getElementColor(index, currentStepData)
                  }`}
                  title={`Index ${index}: ${value}`}
                >
                  {value}
                </div>
              ))}
            </div>
            
            {/* Pointer indicators */}
            <div className="flex justify-center gap-1 mb-2">
              {currentStepData.array.map((_, index) => (
                <div key={index} className="w-12 h-6 flex flex-col items-center justify-center text-center">
                  {/* i pointer */}
                  {index === currentStepData.i && currentStepData.i >= 0 && (
                    <div className="text-green-600 font-bold text-xs leading-none">
                      i
                    </div>
                  )}
                  {/* j pointer */}
                  {index === currentStepData.j && currentStepData.j >= 0 && (
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
            
            {/* Index labels */}
            <div className="flex justify-center gap-1 mb-4">
              {currentStepData.array.map((_, index) => (
                <div key={index} className="w-12 text-center text-xs text-gray-500">
                  {index}
                </div>
              ))}
            </div>

            {/* Region visualization */}
            {currentStepData.i >= 0 && (
              <div className="mt-4 flex justify-center">
                <div className="flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Small region [0..{currentStepData.i}]: ≤ {currentStepData.pivot}</span>
                  </div>
                  {currentStepData.i < currentStepData.j - 1 && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Large region [{currentStepData.i + 1}..{Math.max(currentStepData.j - 1, currentStepData.i)}]: &gt; {currentStepData.pivot}</span>
                    </div>
                  )}
                  {currentStepData.j < currentStepData.array.length - 1 && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gray-400 rounded"></div>
                      <span>Unprocessed: [{currentStepData.j + 1}..{currentStepData.array.length - 2}]</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3">Understanding the Colors:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-600 rounded"></div>
            <span><strong>Pivot:</strong> Element being partitioned around</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span><strong>Current (j):</strong> Element being examined</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span><strong>Small (≤ pivot):</strong> Elements in left region</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span><strong>Large (&gt; pivot):</strong> Elements in right region</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span><strong>Unprocessed:</strong> Not yet examined</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span><strong>Swapping:</strong> Elements being moved</span>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">🎯 Key Insights:</h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• <strong>Boundary Maintenance:</strong> The <span className="text-green-600 font-bold">i</span> pointer always marks the end of the "small elements" region</li>
          <li>• <strong>Systematic Scanning:</strong> The <span className="text-yellow-600 font-bold">j</span> pointer examines every element from left to right</li>
          <li>• <strong>Conditional Swapping:</strong> Only swap when we find small elements in the wrong region</li>
          <li>• <strong>Final Placement:</strong> After scanning, swap pivot to position i+1 for its final sorted position</li>
          <li>• <strong>O(n) Efficiency:</strong> Each element is visited exactly once, making partitioning linear time</li>
        </ul>
      </div>
    </div>
  );
}