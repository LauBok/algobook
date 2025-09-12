'use client';

import React, { useState } from 'react';

interface CallFrame {
  functionName: string;
  parameter: number;
  id: number;
  message?: string;
  isReturning?: boolean;
}

interface CallStackVisualizerProps {
  id: string;
  title?: string;
  description?: string;
  functionName?: string;
  maxValue?: number;
  showCountdown?: boolean;
  showFactorial?: boolean;
  showFibonacci?: boolean;
}

export default function CallStackVisualizer({
  id = "callstack-visualizer",
  title = "Recursive Call Stack Visualization",
  description = "Watch how function calls stack up and return values",
  functionName = "countdown",
  maxValue = 5,
  showCountdown = true,
  showFactorial = true,
  showFibonacci = false
}: CallStackVisualizerProps) {
  const [stack, setStack] = useState<CallFrame[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [, setCurrentStep] = useState(0);
  const [output, setOutput] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState(3);
  const [speed, setSpeed] = useState(1000); // milliseconds

  const reset = () => {
    setStack([]);
    setCurrentStep(0);
    setOutput([]);
    setIsRunning(false);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms / (speed / 1000)));

  const visualizeCountdown = async (n: number) => {
    setIsRunning(true);
    setOutput([]);
    setStack([]);
    
    await executeCountdown(n, 1);
    
    setIsRunning(false);
  };

  const executeCountdown = async (n: number, frameId: number): Promise<void> => {
    // Add this call to the stack
    const newFrame: CallFrame = {
      functionName: `${functionName}(${n})`,
      parameter: n,
      id: frameId,
      message: n === 1 ? "Base case reached!" : `Calling ${functionName}(${n-1})`
    };
    
    setStack(prev => [...prev, newFrame]);
    await sleep(speed);
    
    // Print the number (this happens before the recursive call)
    setOutput(prev => [...prev, `${n}`]);
    await sleep(speed * 0.5);
    
    // Base case: if n is 1, we're done with this call
    if (n === 1) {
      // Mark this frame as returning
      setStack(prev => prev.map(frame => 
        frame.id === frameId 
          ? { ...frame, message: "Returning...", isReturning: true }
          : frame
      ));
      await sleep(speed);
      
      // Remove this frame from stack
      setStack(prev => prev.filter(frame => frame.id !== frameId));
      await sleep(speed * 0.5);
      return;
    }
    
    // Recursive case: call countdown(n-1)
    await executeCountdown(n - 1, frameId + 1);
    
    // After recursive call returns, mark this frame as returning
    setStack(prev => prev.map(frame => 
      frame.id === frameId 
        ? { ...frame, message: "Returning...", isReturning: true }
        : frame
    ));
    await sleep(speed);
    
    // Remove this frame from stack
    setStack(prev => prev.filter(frame => frame.id !== frameId));
    await sleep(speed * 0.5);
  };

  const visualizeFactorial = async (n: number) => {
    setIsRunning(true);
    setOutput([]);
    setStack([]);
    
    const result = await executeFactorial(n, 1);
    setOutput(prev => [...prev, `Final result: ${result}`]);
    
    setIsRunning(false);
  };

  const visualizeFibonacci = async (n: number) => {
    setIsRunning(true);
    setOutput([]);
    setStack([]);
    
    const result = await executeFibonacci(n, 1);
    setOutput(prev => [...prev, `Final result: ${result}`]);
    
    setIsRunning(false);
  };

  const executeFactorial = async (n: number, frameId: number): Promise<number> => {
    // Add this call to the stack
    const newFrame: CallFrame = {
      functionName: `factorial(${n})`,
      parameter: n,
      id: frameId,
      message: n <= 1 ? "Base case: return 1" : `Computing ${n} * factorial(${n-1})`
    };
    
    setStack(prev => [...prev, newFrame]);
    await sleep(speed);
    
    let result: number;
    
    if (n <= 1) {
      result = 1;
      setOutput(prev => [...prev, `factorial(${n}) = 1`]);
    } else {
      const subResult = await executeFactorial(n - 1, frameId + 1);
      result = n * subResult;
      setOutput(prev => [...prev, `factorial(${n}) = ${n} * ${subResult} = ${result}`]);
    }
    
    await sleep(speed * 0.5);
    
    // Mark this frame as returning with result
    setStack(prev => prev.map(frame => 
      frame.id === frameId 
        ? { ...frame, message: `Returning ${result}`, isReturning: true }
        : frame
    ));
    await sleep(speed);
    
    // Remove this frame from stack
    setStack(prev => prev.filter(frame => frame.id !== frameId));
    await sleep(speed * 0.5);
    
    return result;
  };

  const executeFibonacci = async (n: number, frameId: number): Promise<number> => {
    // Add this call to the stack
    const newFrame: CallFrame = {
      functionName: `fibonacci(${n})`,
      parameter: n,
      id: frameId,
      message: n <= 2 ? "Base case: return 1" : `Computing fib(${n-1}) + fib(${n-2})`
    };
    
    setStack(prev => [...prev, newFrame]);
    await sleep(speed);
    
    let result: number;
    
    if (n <= 2) {
      result = 1;
      setOutput(prev => [...prev, `fibonacci(${n}) = 1`]);
      await sleep(speed * 0.5);
    } else {
      // Two recursive calls - this creates the branching tree structure
      const fib1 = await executeFibonacci(n - 1, frameId * 10 + 1);
      const fib2 = await executeFibonacci(n - 2, frameId * 10 + 2);
      result = fib1 + fib2;
      setOutput(prev => [...prev, `fibonacci(${n}) = ${fib1} + ${fib2} = ${result}`]);
      await sleep(speed * 0.5);
    }
    
    // Mark this frame as returning with result
    setStack(prev => prev.map(frame => 
      frame.id === frameId 
        ? { ...frame, message: `Returning ${result}`, isReturning: true }
        : frame
    ));
    await sleep(speed);
    
    // Remove this frame from stack
    setStack(prev => prev.filter(frame => frame.id !== frameId));
    await sleep(speed * 0.5);
    
    return result;
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor={`${id}-input`} className="text-sm font-medium text-gray-700">
              Input:
            </label>
            <input
              id={`${id}-input`}
              type="number"
              min="1"
              max={maxValue}
              value={inputValue}
              onChange={(e) => setInputValue(parseInt(e.target.value) || 1)}
              disabled={isRunning}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor={`${id}-speed`} className="text-sm font-medium text-gray-700">
              Speed:
            </label>
            <select
              id={`${id}-speed`}
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              disabled={isRunning}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            >
              <option value={2000}>Slow</option>
              <option value={1000}>Normal</option>
              <option value={500}>Fast</option>
            </select>
          </div>

          <div className="flex gap-2 flex-wrap">
            {showCountdown && (
              <button
                onClick={() => visualizeCountdown(inputValue)}
                disabled={isRunning}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                Run Countdown
              </button>
            )}
            {showFactorial && (
              <button
                onClick={() => visualizeFactorial(inputValue)}
                disabled={isRunning}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 transition-colors"
              >
                Run Factorial
              </button>
            )}
            {showFibonacci && (
              <button
                onClick={() => visualizeFibonacci(inputValue)}
                disabled={isRunning}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
              >
                Run Fibonacci
              </button>
            )}
            <button
              onClick={reset}
              disabled={isRunning}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Visualization Area */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Call Stack */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              📚 Call Stack
              {stack.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {stack.length} frame{stack.length !== 1 ? 's' : ''}
                </span>
              )}
            </h4>
            <div className="min-h-[200px] border border-gray-200 rounded-lg p-3 bg-gray-50">
              {stack.length === 0 ? (
                <div className="text-gray-500 text-sm italic text-center py-8">
                  Stack is empty - click a button to start visualization
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Render stack from top to bottom (most recent first) */}
                  {[...stack].reverse().map((frame, index) => (
                    <div
                      key={frame.id}
                      className={`p-3 rounded border-l-4 transition-all duration-300 ${
                        frame.isReturning 
                          ? 'bg-red-50 border-red-400 border border-red-200' 
                          : index === 0 
                            ? 'bg-blue-50 border-blue-400 border border-blue-200'
                            : 'bg-white border-gray-300 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold">
                          {frame.functionName}
                        </span>
                        {index === 0 && !frame.isReturning && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            EXECUTING
                          </span>
                        )}
                        {frame.isReturning && (
                          <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                            RETURNING
                          </span>
                        )}
                      </div>
                      {frame.message && (
                        <div className="text-xs text-gray-600 mt-1">
                          {frame.message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Stack depth indicator */}
            {stack.length > 0 && (
              <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                Maximum recursion depth: {Math.max(0, ...stack.map(f => f.id))} / 1000
              </div>
            )}
          </div>

          {/* Output */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-800">📺 Output</h4>
            <div className="min-h-[200px] border border-gray-200 rounded-lg p-3 bg-black text-green-400 font-mono text-sm overflow-auto">
              {output.length === 0 ? (
                <div className="text-gray-500 italic">
                  Output will appear here...
                </div>
              ) : (
                <div className="space-y-1">
                  {output.map((line, index) => (
                    <div key={index} className="animate-pulse">
                      {line}
                    </div>
                  ))}
                  {isRunning && (
                    <div className="text-yellow-400 animate-pulse">
                      ⏳ Executing...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-800 mb-2">📖 How to Read This:</h5>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border-l-4 border-blue-400 rounded-sm"></div>
                <span>Currently executing function</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border border-gray-300 rounded-sm"></div>
                <span>Waiting function call</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 border border-red-200 rounded-sm"></div>
                <span>Function returning</span>
              </div>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <p>• Stack grows upward as functions call each other</p>
              <p>• Functions return in reverse order (LIFO - Last In, First Out)</p>
              <p>• Each function waits for inner calls to complete</p>
              <p>• Fibonacci shows branching recursion (two calls per function)</p>
              <p>• The call stack is limited (usually ~1000 frames)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}