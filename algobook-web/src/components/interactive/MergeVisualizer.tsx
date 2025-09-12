'use client';

import React, { useState } from 'react';

interface MergeStep {
  leftArray: number[];
  rightArray: number[];
  merged: number[];
  leftPointer: number;
  rightPointer: number;
  step: number;
  message: string;
  comparing?: { left: number; right: number };
  added?: { value: number; from: 'left' | 'right' };
}

interface MergeVisualizerProps {
  id: string;
  title?: string;
  description?: string;
  initialLeft?: number[];
  initialRight?: number[];
}

export default function MergeVisualizer({
  id: _id = "merge-visualizer",
  title = "Merge Two Sorted Lists Visualization",
  description = "Watch how two sorted lists are efficiently combined into one sorted list",
  initialLeft = [1, 4, 7, 9],
  initialRight = [2, 3, 5, 8, 10]
}: MergeVisualizerProps) {
  const [leftArray, setLeftArray] = useState<number[]>(initialLeft);
  const [rightArray, setRightArray] = useState<number[]>(initialRight);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<MergeStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [speed, setSpeed] = useState(1500);
  const [result, setResult] = useState<number[] | null>(null);
  const [leftInput, setLeftInput] = useState('1,4,7,9');
  const [rightInput, setRightInput] = useState('2,3,5,8,10');
  
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const generateMergeSteps = (left: number[], right: number[]): MergeStep[] => {
    const steps: MergeStep[] = [];
    const merged: number[] = [];
    let leftIndex = 0;
    let rightIndex = 0;
    let stepCount = 0;

    // Initial step
    steps.push({
      leftArray: [...left],
      rightArray: [...right],
      merged: [],
      leftPointer: 0,
      rightPointer: 0,
      step: stepCount++,
      message: "Starting merge process with two sorted arrays"
    });

    // Main merge loop
    while (leftIndex < left.length && rightIndex < right.length) {
      const leftValue = left[leftIndex];
      const rightValue = right[rightIndex];
      
      // Comparison step
      steps.push({
        leftArray: [...left],
        rightArray: [...right],
        merged: [...merged],
        leftPointer: leftIndex,
        rightPointer: rightIndex,
        step: stepCount++,
        message: `Comparing ${leftValue} and ${rightValue}`,
        comparing: { left: leftValue, right: rightValue }
      });

      if (leftValue <= rightValue) {
        merged.push(leftValue);
        steps.push({
          leftArray: [...left],
          rightArray: [...right],
          merged: [...merged],
          leftPointer: leftIndex + 1,
          rightPointer: rightIndex,
          step: stepCount++,
          message: `${leftValue} ≤ ${rightValue}, so add ${leftValue} from left array`,
          added: { value: leftValue, from: 'left' }
        });
        leftIndex++;
      } else {
        merged.push(rightValue);
        steps.push({
          leftArray: [...left],
          rightArray: [...right],
          merged: [...merged],
          leftPointer: leftIndex,
          rightPointer: rightIndex + 1,
          step: stepCount++,
          message: `${leftValue} > ${rightValue}, so add ${rightValue} from right array`,
          added: { value: rightValue, from: 'right' }
        });
        rightIndex++;
      }
    }

    // Add remaining elements from left array
    while (leftIndex < left.length) {
      const leftValue = left[leftIndex];
      merged.push(leftValue);
      steps.push({
        leftArray: [...left],
        rightArray: [...right],
        merged: [...merged],
        leftPointer: leftIndex + 1,
        rightPointer: rightIndex,
        step: stepCount++,
        message: `Right array exhausted, add remaining ${leftValue} from left array`,
        added: { value: leftValue, from: 'left' }
      });
      leftIndex++;
    }

    // Add remaining elements from right array
    while (rightIndex < right.length) {
      const rightValue = right[rightIndex];
      merged.push(rightValue);
      steps.push({
        leftArray: [...left],
        rightArray: [...right],
        merged: [...merged],
        leftPointer: leftIndex,
        rightPointer: rightIndex + 1,
        step: stepCount++,
        message: `Left array exhausted, add remaining ${rightValue} from right array`,
        added: { value: rightValue, from: 'right' }
      });
      rightIndex++;
    }

    // Final step
    steps.push({
      leftArray: [...left],
      rightArray: [...right],
      merged: [...merged],
      leftPointer: leftIndex,
      rightPointer: rightIndex,
      step: stepCount++,
      message: `Merge complete! Combined ${left.length + right.length} elements into one sorted array`
    });

    return steps;
  };

  const runMerge = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setCurrentStep(-1);
    setResult(null);
    
    const mergeSteps = generateMergeSteps(leftArray, rightArray);
    setSteps(mergeSteps);
    
    await sleep(speed * 0.5);
    
    for (let i = 0; i < mergeSteps.length; i++) {
      setCurrentStep(i);
      await sleep(speed);
    }
    
    const finalStep = mergeSteps[mergeSteps.length - 1];
    setResult(finalStep.merged);
    
    setIsRunning(false);
  };

  const reset = () => {
    setCurrentStep(-1);
    setSteps([]);
    setResult(null);
    setIsRunning(false);
  };

  const parseCustomArrays = () => {
    try {
      const leftParsed = leftInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const rightParsed = rightInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      
      if (leftParsed.length > 0 && rightParsed.length > 0) {
        // Ensure arrays are sorted
        leftParsed.sort((a, b) => a - b);
        rightParsed.sort((a, b) => a - b);
        
        setLeftArray(leftParsed);
        setRightArray(rightParsed);
        setLeftInput(leftParsed.join(','));
        setRightInput(rightParsed.join(','));
        reset();
      }
    } catch (e) {
      console.error('Failed to parse custom arrays:', e);
    }
  };

  const generateRandomArrays = () => {
    const generateSortedArray = (size: number) => {
      const arr = [];
      let current = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < size; i++) {
        arr.push(current);
        current += Math.floor(Math.random() * 4) + 1;
      }
      return arr;
    };

    const leftSize = 3 + Math.floor(Math.random() * 4); // 3-6 elements
    const rightSize = 3 + Math.floor(Math.random() * 4); // 3-6 elements
    
    const newLeft = generateSortedArray(leftSize);
    const newRight = generateSortedArray(rightSize);
    
    setLeftArray(newLeft);
    setRightArray(newRight);
    setLeftInput(newLeft.join(','));
    setRightInput(newRight.join(','));
    reset();
  };

  const getCurrentStepData = () => {
    if (currentStep === -1 || currentStep >= steps.length) return null;
    return steps[currentStep];
  };

  const getElementStyle = (value: number, arrayType: 'left' | 'right' | 'merged', index: number) => {
    const stepData = getCurrentStepData();
    if (!stepData) return 'bg-gray-100 border-gray-300';
    
    const { leftPointer, rightPointer, comparing, added } = stepData;
    
    if (arrayType === 'merged') {
      if (added && added.value === value && index === stepData.merged.length - 1) {
        return added.from === 'left' 
          ? 'bg-blue-200 border-blue-500 ring-2 ring-blue-300 animate-pulse'
          : 'bg-green-200 border-green-500 ring-2 ring-green-300 animate-pulse';
      }
      return 'bg-yellow-100 border-yellow-400';
    }
    
    if (arrayType === 'left') {
      if (index < leftPointer) {
        return 'bg-gray-200 border-gray-400 opacity-60'; // Already processed
      } else if (index === leftPointer) {
        if (comparing) {
          return 'bg-blue-200 border-blue-500 ring-2 ring-blue-300';
        }
        return 'bg-blue-100 border-blue-400';
      }
      return 'bg-gray-100 border-gray-300';
    }
    
    if (arrayType === 'right') {
      if (index < rightPointer) {
        return 'bg-gray-200 border-gray-400 opacity-60'; // Already processed
      } else if (index === rightPointer) {
        if (comparing) {
          return 'bg-green-200 border-green-500 ring-2 ring-green-300';
        }
        return 'bg-green-100 border-green-400';
      }
      return 'bg-gray-100 border-gray-300';
    }
    
    return 'bg-gray-100 border-gray-300';
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
          <div className="grid md:grid-cols-2 gap-4">
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
                  onClick={runMerge}
                  disabled={isRunning}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  {isRunning ? 'Running...' : 'Start Merge'}
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

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Left Array (comma-separated):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={leftInput}
                    onChange={(e) => setLeftInput(e.target.value)}
                    disabled={isRunning}
                    placeholder="1,4,7,9"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Right Array (comma-separated):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rightInput}
                    onChange={(e) => setRightInput(e.target.value)}
                    disabled={isRunning}
                    placeholder="2,3,5,8,10"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={parseCustomArrays}
                disabled={isRunning}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 transition-colors"
              >
                Apply Arrays
              </button>
              <button
                onClick={generateRandomArrays}
                disabled={isRunning}
                className="px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
              >
                Generate Random Arrays
              </button>
            </div>
          </div>
        </div>

        {/* Array Visualization */}
        <div className="space-y-6">
          {/* Left Array */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-blue-800">
                Left Array ({leftArray.length} elements)
              </h4>
              {getCurrentStepData() && (
                <div className="text-xs text-blue-600">
                  Pointer at index: {getCurrentStepData()?.leftPointer}
                </div>
              )}
            </div>
            <div className="flex gap-1 p-4 bg-blue-50 rounded-lg overflow-x-auto">
              {leftArray.map((value, index) => (
                <div
                  key={index}
                  className={`
                    min-w-[3rem] h-12 flex items-center justify-center 
                    border-2 rounded font-mono text-sm font-semibold
                    transition-all duration-300
                    ${getElementStyle(value, 'left', index)}
                  `}
                >
                  <div className="text-center">
                    <div className="text-xs text-gray-500">{index}</div>
                    <div>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Array */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-green-800">
                Right Array ({rightArray.length} elements)
              </h4>
              {getCurrentStepData() && (
                <div className="text-xs text-green-600">
                  Pointer at index: {getCurrentStepData()?.rightPointer}
                </div>
              )}
            </div>
            <div className="flex gap-1 p-4 bg-green-50 rounded-lg overflow-x-auto">
              {rightArray.map((value, index) => (
                <div
                  key={index}
                  className={`
                    min-w-[3rem] h-12 flex items-center justify-center 
                    border-2 rounded font-mono text-sm font-semibold
                    transition-all duration-300
                    ${getElementStyle(value, 'right', index)}
                  `}
                >
                  <div className="text-center">
                    <div className="text-xs text-gray-500">{index}</div>
                    <div>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Merged Array */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-yellow-800">
              Merged Array ({getCurrentStepData()?.merged.length || 0} elements)
            </h4>
            <div className="flex gap-1 p-4 bg-yellow-50 rounded-lg min-h-[5rem] overflow-x-auto">
              {getCurrentStepData()?.merged.map((value, index) => (
                <div
                  key={index}
                  className={`
                    min-w-[3rem] h-12 flex items-center justify-center 
                    border-2 rounded font-mono text-sm font-semibold
                    transition-all duration-300
                    ${getElementStyle(value, 'merged', index)}
                  `}
                >
                  <div className="text-center">
                    <div className="text-xs text-gray-500">{index}</div>
                    <div>{value}</div>
                  </div>
                </div>
              )) || (
                <div className="flex items-center justify-center w-full text-gray-500 italic text-sm">
                  Merged elements will appear here...
                </div>
              )}
            </div>
          </div>

          {/* Current Step Information */}
          {isRunning && getCurrentStepData() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Step {getCurrentStepData()?.step}: {getCurrentStepData()?.message}
              </p>
              {getCurrentStepData()?.comparing && (
                <div className="text-xs text-blue-700">
                  Comparing elements: Left[{getCurrentStepData()?.leftPointer}] = {getCurrentStepData()?.comparing?.left} 
                  vs Right[{getCurrentStepData()?.rightPointer}] = {getCurrentStepData()?.comparing?.right}
                </div>
              )}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-green-600">✓ Merge Complete!</span>
              </div>
              <div className="text-sm text-green-800">
                Successfully merged arrays of {leftArray.length} and {rightArray.length} elements 
                into one sorted array of {result.length} elements: [{result.join(', ')}]
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Time complexity: O(n + m) where n and m are the lengths of the input arrays.
                This is optimal since we must examine every element at least once.
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
                <div className="w-4 h-4 bg-blue-200 border-2 border-blue-500 rounded"></div>
                <span>Current element in left array</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 border-2 border-green-500 rounded"></div>
                <span>Current element in right array</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
                <span>Element in merged array</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 border-2 border-gray-400 rounded opacity-60"></div>
                <span>Already processed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-200 border-2 border-blue-500 rounded ring-2 ring-blue-300"></div>
                <span>Currently comparing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
                <span>Not yet processed</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded text-sm text-blue-800">
            <strong>How Merge Works:</strong> Compare the smallest unprocessed elements from each array.
            Take the smaller one and add it to the result. Repeat until one array is empty, then add all 
            remaining elements from the other array. This maintains sorted order! ⚡
          </div>
        </div>
      </div>
    </div>
  );
}