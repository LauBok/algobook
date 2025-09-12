'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Square, RotateCcw } from 'lucide-react';
import { AlgorithmState, WindowWidgetProps, AlgorithmStep } from '@/lib/types/algorithm-widget';

export default function WindowWidget({ 
  title, 
  initialData, 
  children, 
  onStateChange 
}: WindowWidgetProps) {
  const [state, setState] = useState<AlgorithmState>({
    currentStep: 0,
    steps: [],
    isPlaying: false,
    isPaused: false,
    isComplete: false,
    speed: 1000, // 1 second between steps
  });

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize steps when component mounts or data changes
  useEffect(() => {
    // Steps will be provided by the parent component through the children's props
    // This is a placeholder that will be overridden by the enhanced wrapper
    const steps: AlgorithmStep[] = [
      {
        id: 0,
        description: "Initial state",
        data: initialData,
      }
    ];
    
    setState(prev => ({
      ...prev,
      steps,
      currentStep: 0,
      isComplete: false,
    }));
    setIsInitialized(true);
  }, [initialData]);

  // Notify parent of state changes only after initialization and when state actually changes
  useEffect(() => {
    if (isInitialized) {
      onStateChange?.(state);
    }
  }, [state, onStateChange, isInitialized]);

  const play = useCallback(() => {
    if (state.currentStep >= state.steps.length - 1) {
      setState(prev => ({ ...prev, isComplete: true }));
      return;
    }

    setState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
    
    const id = setInterval(() => {
      setState(prev => {
        if (prev.currentStep >= prev.steps.length - 1) {
          return { ...prev, isPlaying: false, isComplete: true };
        }
        return { ...prev, currentStep: prev.currentStep + 1 };
      });
    }, state.speed);
    
    setIntervalId(id);
  }, [state.currentStep, state.steps.length, state.speed]);

  const pause = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
  }, [intervalId]);

  const stop = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      isPaused: false, 
      currentStep: 0,
      isComplete: false 
    }));
  }, [intervalId]);

  const reset = useCallback(() => {
    stop();
    setState(prev => ({ 
      ...prev, 
      currentStep: 0,
      isComplete: false 
    }));
  }, [stop]);

  const stepForward = useCallback(() => {
    setState(prev => {
      const nextStep = Math.min(prev.currentStep + 1, prev.steps.length - 1);
      const isComplete = nextStep >= prev.steps.length - 1;
      return { 
        ...prev, 
        currentStep: nextStep,
        isComplete 
      };
    });
  }, []);

  const stepBackward = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      currentStep: Math.max(prev.currentStep - 1, 0),
      isComplete: false 
    }));
  }, []);

  const changeSpeed = useCallback((newSpeed: number) => {
    setState(prev => ({ ...prev, speed: newSpeed }));
    
    // If currently playing, restart with new speed
    if (state.isPlaying && intervalId) {
      clearInterval(intervalId);
      const id = setInterval(() => {
        setState(prev => {
          if (prev.currentStep >= prev.steps.length - 1) {
            return { ...prev, isPlaying: false, isComplete: true };
          }
          return { ...prev, currentStep: prev.currentStep + 1 };
        });
      }, newSpeed);
      setIntervalId(id);
    }
  }, [state.isPlaying, intervalId]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const currentStepData = state.steps[state.currentStep];

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">
          Step {state.currentStep + 1} of {state.steps.length}
        </div>
      </div>

      {/* Algorithm Visualization Area */}
      <div className="mb-4 min-h-[200px] bg-gray-50 rounded-lg p-4">
        {React.cloneElement(children as React.ReactElement, {
          ...currentStepData,
          algorithmState: state
        })}
      </div>

      {/* Current Step Description */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          {currentStepData?.description || "Ready to start"}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={state.isPlaying ? pause : play}
          disabled={state.isComplete}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {state.isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {state.isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          onClick={stop}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Square size={16} />
          Stop
        </button>

        <button
          onClick={stepBackward}
          disabled={state.currentStep === 0}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <SkipBack size={16} />
          Step Back
        </button>

        <button
          onClick={stepForward}
          disabled={state.currentStep >= state.steps.length - 1}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <SkipForward size={16} />
          Step Forward
        </button>

        <button
          onClick={reset}
          className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Speed:</label>
        <input
          type="range"
          min="100"
          max="3000"
          step="100"
          value={state.speed}
          onChange={(e) => changeSpeed(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm text-gray-600 min-w-[60px]">
          {(3000 - state.speed + 100) / 300}x
        </span>
      </div>
    </div>
  );
}