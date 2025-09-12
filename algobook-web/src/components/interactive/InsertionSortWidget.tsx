'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ListVisualization from './ListVisualization';
import { generateInsertionSortSteps } from '@/lib/algorithms/insertion-sort';

interface InsertionSortWidgetProps {
  initialData?: number[];
  title?: string;
  className?: string;
}

export default function InsertionSortWidget({ 
  initialData = [64, 34, 25, 12, 22, 11, 90],
  title = "Insertion Sort",
  className = ""
}: InsertionSortWidgetProps) {
  const steps = useMemo(() => generateInsertionSortSteps(initialData), [initialData]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500); // Default to 1.00x speed
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const currentStep = steps[currentStepIndex] || {
    data: initialData,
    highlight: [],
    compare: undefined,
    swap: undefined,
    sorted: []
  };

  const play = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) {
      return;
    }
    setIsPlaying(true);
    const id = setInterval(() => {
      setCurrentStepIndex(prev => {
        const next = prev + 1;
        if (next >= steps.length - 1) {
          setIsPlaying(false);
          return steps.length - 1;
        }
        return next;
      });
    }, speed);
    setIntervalId(id);
  }, [currentStepIndex, steps.length, speed]);

  const pause = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsPlaying(false);
  }, [intervalId]);

  const reset = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, [intervalId]);

  const stepForward = useCallback(() => {
    setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const stepBackward = useCallback(() => {
    setCurrentStepIndex(prev => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // Get additional state from insertion sort step
  const insertionStep = steps[currentStepIndex];
  const currentElement = insertionStep?.key;
  const sortedBoundary = insertionStep?.sortedBoundary || 0;

  return (
    <div className={`algorithm-widget ${className}`}>
      <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="text-sm text-gray-500">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>

        {/* Algorithm Visualization Area */}
        <div className="mb-4 min-h-[200px] bg-gray-50 rounded-lg p-4">
          <ListVisualization
            data={currentStep.data || initialData}
            highlight={currentStep.highlight}
            compare={currentStep.compare}
            swap={currentStep.swap}
            sorted={currentStep.sorted || []}
            sortedBoundary={sortedBoundary}
          />
          
          {/* Additional insertion sort info */}
          <div className="mt-4 flex justify-between items-center text-sm">
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-gray-600">Sorted region</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                <span className="text-gray-600">Unsorted region</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 border border-blue-400 rounded"></div>
                <span className="text-gray-600">Current element</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-200 border border-yellow-400 rounded"></div>
                <span className="text-gray-600">Comparing</span>
              </div>
            </div>
            
            <div className="text-right">
              {currentElement !== undefined && (
                <div className="text-gray-700">
                  <span className="font-medium">Inserting:</span> {currentElement}
                </div>
              )}
              {sortedBoundary > 0 && (
                <div className="text-gray-600 text-xs">
                  Sorted region: indices [0...{sortedBoundary - 1}]
                </div>
              )}
              {sortedBoundary < (currentStep.data || initialData).length && (
                <div className="text-gray-600 text-xs">
                  Unsorted region: indices [{sortedBoundary}...{(currentStep.data || initialData).length - 1}]
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Step Description */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            {currentStep.description || "Ready to start"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={isPlaying ? pause : play}
            disabled={currentStepIndex >= steps.length - 1}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPlaying ? '⏸️' : '▶️'}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={reset}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            🔄 Reset
          </button>

          <button
            onClick={stepBackward}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ⏮️ Step Back
          </button>

          <button
            onClick={stepForward}
            disabled={currentStepIndex >= steps.length - 1}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ⏭️ Step Forward
          </button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Speed:</label>
          <input
            type="range"
            min="0"
            max="9"
            step="1"
            value={(() => {
              const speedLevels = [6000, 3000, 2000, 1500, 1200, 1000, 750, 500, 300, 150]; // 0.25x to 10x
              return speedLevels.indexOf(speed);
            })()}
            onChange={(e) => {
              const speedLevels = [6000, 3000, 2000, 1500, 1200, 1000, 750, 500, 300, 150]; // 0.25x to 10x
              setSpeed(speedLevels[Number(e.target.value)]);
            }}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 min-w-[60px]">
            {(1500 / speed).toFixed(2)}x
          </span>
        </div>
      </div>
      
      {/* Algorithm Information Panel */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="mt-2 text-xs text-gray-600">
          <strong>How it works:</strong> Insertion sort maintains two regions: a sorted region (left) and an unsorted region (right). 
          It repeatedly takes the first element from the unsorted region and inserts it into its correct position 
          within the sorted region, expanding the sorted region by one element each time.
        </div>
      </div>
    </div>
  );
}