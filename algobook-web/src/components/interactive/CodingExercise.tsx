'use client';

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Judge0Service } from '@/lib/api/judge0';
import { ProgressManager } from '@/lib/utils/progress';
import { settingsManager } from '@/lib/utils/settings';
import CodePlayground from './CodePlayground';

interface TestCase {
  input: string;
  expectedOutput: string;
  hidden?: boolean;
}

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed: boolean;
  error?: string;
  executionTime?: number;
}

interface CodingExerciseProps {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  testCases: TestCase[];
  hints?: string[];
  solution?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  echoInput?: boolean;
  prepend?: string;
  postpend?: string;
}

export default function CodingExercise({
  id,
  title,
  description,
  starterCode,
  testCases,
  hints = [],
  solution,
  difficulty,
  echoInput = false,
  prepend = '',
  postpend = ''
}: CodingExerciseProps) {
  const [code, setCode] = useState(() => {
    // Load saved code from localStorage or use starter code
    if (typeof window !== 'undefined') {
      const savedCode = localStorage.getItem(`coding-exercise-${id}`);
      return savedCode || starterCode;
    }
    return starterCode;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testProgress, setTestProgress] = useState<{ current: number; total: number } | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [editorHeight, setEditorHeight] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [mode, setMode] = useState<'practice' | 'submit'>('practice');
  const [resetCounter, setResetCounter] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debug logging to identify hints issue
  useEffect(() => {
    console.log(`[CodingExercise ${id}] Hints received:`, hints);
  }, [id, hints]);

  // Load previous progress
  useEffect(() => {
    const progress = ProgressManager.getExerciseProgress(id);
    if (progress) {
      setAttempts(progress.attempts);
      setCompleted(progress.completed);
    }
  }, [id]);

  // Save code to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && code !== starterCode) {
      localStorage.setItem(`coding-exercise-${id}`, code);
    }
  }, [code, id, starterCode]);

  const stopTests = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunning(false);
    setTestResults([]);
  };

  const runTests = async () => {
    if (isRunning) {
      stopTests();
      return;
    }

    setIsRunning(true);
    setTestProgress({ current: 0, total: testCases.length });
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // Create abort controller for this execution
    abortControllerRef.current = new AbortController();

    try {
      const results: TestResult[] = [];
      
      // Run test cases one by one with progress updates
      for (let i = 0; i < testCases.length; i++) {
        // Check if we were aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        // Update progress
        setTestProgress({ current: i + 1, total: testCases.length });
        
        const testCase = testCases[i];
        try {
          // Add timeout wrapper for each test case
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Test execution timeout (15 seconds)')), 15000);
          });

          // Combine prepend + student code + postpend
          const combinedCode = (prepend ? prepend + '\n' : '') + 
                              code + 
                              (postpend ? '\n' + postpend : '');

          const result = await Promise.race([
            Judge0Service.executeCode(
              combinedCode,
              testCase.input,
              testCase.expectedOutput,
              10000,
              !echoInput // submission mode - echo based on echoInput parameter
            ),
            timeoutPromise
          ]);

          const status = Judge0Service.interpretStatus(result.status.id);
          const actualOutput = (result.stdout || '').trim();
          const expectedOutput = testCase.expectedOutput.trim();
          const passed = result.status.id === 3 && actualOutput === expectedOutput;

          results.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: result.stdout || '',
            passed,
            error: status.type !== 'success' ? status.message : undefined,
            executionTime: result.time ? parseFloat(result.time) : undefined,
          });

          // Update results in real-time so user can see progress
          setTestResults([...results]);

        } catch (error) {
          results.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            passed: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          
          // Update results to show the error immediately
          setTestResults([...results]);
        }
      }

      const passedCount = results.filter(r => r.passed).length;
      const allPassed = passedCount === testCases.length;
      
      if (allPassed && !completed) {
        setCompleted(true);
      }

      // Update progress  
      const currentProgress = ProgressManager.getExerciseProgress(id);
      
      ProgressManager.updateExerciseProgress(id, {
        attempts: newAttempts,
        completed: allPassed,
        bestScore: Math.max(
          currentProgress?.bestScore || 0,
          Math.round((passedCount / testCases.length) * 100)
        ),
        timeSpent: 0, // Time is now tracked at section level
      });

    } catch (error) {
      // Don't show error if it was aborted
      if (!abortControllerRef.current?.signal.aborted) {
        console.error('Error running tests:', error);
        // Show error feedback to user
        setTestResults([{
          input: '',
          expectedOutput: '',
          actualOutput: '',
          passed: false,
          error: error instanceof Error ? error.message : 'Failed to run tests. Please try again.'
        }]);
      }
    } finally {
      if (abortControllerRef.current) {
        abortControllerRef.current = null;
      }
      setIsRunning(false);
      setTestProgress(null);
    }
  };

  const resetCode = () => {
    setCode(starterCode);
    setTestResults([]);
    setShowSolution(false);
    setResetCounter(prev => prev + 1);
    // Clear localStorage for this exercise
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`coding-exercise-${id}`);
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  // Calculate initial height based on starter code lines
  useEffect(() => {
    const lines = starterCode.split('\n').length;
    const minHeight = 400;
    const maxHeight = 700;
    const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, lines * 24 + 50));
    setEditorHeight(calculatedHeight);
  }, [starterCode]);

  // Handle dragging for resizing
  const [dragStartY, setDragStartY] = useState<number>(0);
  const [dragStartHeight, setDragStartHeight] = useState<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setDragStartY(e.clientY);
    setDragStartHeight(editorHeight);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const deltaY = e.clientY - dragStartY;
      const newHeight = dragStartHeight + deltaY;
      
      // Constrain height
      const minHeight = 300;
      const maxHeight = 800;
      const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      
      setEditorHeight(constrainedHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, dragStartY, dragStartHeight]);

  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testCases.length;
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-3">
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMode('practice')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  mode === 'practice'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                🎯 Practice Mode
              </button>
              <button
                onClick={() => setMode('submit')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  mode === 'submit'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📝 Submit Mode
              </button>
            </div>
            
            <span className={`px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor()}`}>
              {difficulty.toUpperCase()}
            </span>
            {completed && (
              <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800 border border-green-200">
                ✓ COMPLETED
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
        
        {attempts > 0 && (
          <div className="mt-3 text-sm text-gray-600">
            Attempts: {attempts} | Best Score: {Math.round(successRate)}%
          </div>
        )}
      </div>

      {/* Mode-Based Content */}
      {mode === 'practice' ? (
        /* Practice Mode - CodePlayground */
        <div className="border-b border-gray-200">
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">🎯</span>
                <h4 className="text-sm font-medium text-blue-800">Practice Mode</h4>
              </div>
              <div className="flex gap-2">
                {hints.length > 0 && (
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                  >
                    {showHints ? 'Hide' : 'Show'} Hints ({hints.length})
                  </button>
                )}
                
                {solution && (
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                  >
                    {showSolution ? 'Hide' : 'Show'} Solution
                  </button>
                )}
                
                <button
                  onClick={resetCode}
                  className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  Reset Code
                </button>
              </div>
            </div>
            <p className="text-xs text-blue-700">
              Test your code interactively with the terminal. Perfect for debugging and experimenting!
            </p>
          </div>
          <CodePlayground
            key={`${id}-reset-${resetCounter}-${showSolution ? 'solution' : 'normal'}`}
            initialCode={showSolution && solution ? solution : code}
            editable={!showSolution}
            showOutput={true}
            hints={Array.isArray(hints) ? hints : []}
            prepend={prepend}
            postpend={postpend}
            onCodeChange={(newCode) => !showSolution && setCode(newCode)}
          />
        </div>
      ) : (
        /* Submit Mode - Traditional Editor */
        <div className="border-b border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-green-50 border-b border-green-100">
            <div className="flex items-center gap-2">
              <span className="text-green-600">📝</span>
              <h4 className="text-sm font-medium text-green-800">Submit Mode</h4>
            </div>
            <div className="flex gap-2">
              {hints.length > 0 && (
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                >
                  {showHints ? 'Hide' : 'Show'} Hints ({hints.length})
                </button>
              )}
              
              {solution && (
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                >
                  {showSolution ? 'Hide' : 'Show'} Solution
                </button>
              )}
              
              <button
                onClick={resetCode}
                className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                Reset Code
              </button>
              
              <button
                onClick={runTests}
                className={`text-xs px-4 py-1 rounded transition-colors ${
                  isRunning 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isRunning ? 'Stop Tests' : 'Run Tests'}
              </button>
            </div>
          </div>
          
          {/* Progress indicator */}
          {testProgress && (
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Running Tests ({testProgress.current} of {testProgress.total})
                </span>
                <span className="text-sm text-blue-600">
                  {Math.round((testProgress.current / testProgress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(testProgress.current / testProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="px-6 py-2 bg-green-50 border-b border-green-100">
            <p className="text-xs text-green-700">
              Ready to submit? Your code will be tested against all test cases including hidden ones.
            </p>
            <p className="text-xs text-green-600 mt-1">
              💡 If submission gets stuck or shows errors, try refreshing the page and resubmitting.
            </p>
          </div>

          <div className="relative">
            <div 
              className="bg-white"
              style={{ height: `${editorHeight}px` }}
            >
              <Editor
                key={`editor-${resetCounter}-${showSolution ? 'solution' : 'normal'}`}
                height="100%"
                defaultLanguage="python"
                value={showSolution && solution ? solution : code}
                onChange={(value) => !showSolution && setCode(value || '')}
                options={{
                  readOnly: showSolution,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  lineNumbers: 'on',
                  automaticLayout: true,
                  theme: 'vs-light',
                }}
              />
            </div>
            {/* Resize Handle */}
            <div
              className={`h-2 cursor-row-resize bg-gray-100 hover:bg-gray-200 transition-colors border-t border-gray-200 ${isResizing ? 'bg-blue-200' : ''}`}
              onMouseDown={handleMouseDown}
              title="Drag to resize editor"
              style={{ zIndex: 10 }}
            >
              <div className="flex justify-center pt-0.5">
                <div className="w-8 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hints */}
      {showHints && hints.length > 0 && (
        <div className="px-6 py-4 bg-yellow-50 border-b border-gray-200">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Hints:</h4>
          <ul className="space-y-1">
            {hints.map((hint, index) => (
              <li key={index} className="text-sm text-yellow-700">
                {index + 1}. {typeof hint === 'string' ? hint : JSON.stringify(hint)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Test Results</h4>
            <div className={`text-sm font-medium ${passedTests === totalTests ? 'text-green-600' : 'text-gray-600'}`}>
              {passedTests}/{totalTests} passed ({Math.round(successRate)}%)
            </div>
          </div>

          <div className="space-y-2">
            {testResults.filter(result => !result.passed).length === 0 ? (
              <div className="p-3 rounded border bg-green-50 border-green-200">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm text-green-800 font-medium">All tests passed!</span>
                </div>
              </div>
            ) : (
              // Only show the first failed test
              (() => {
                const firstFailedTest = testResults.find(result => !result.passed);
                testResults.findIndex(result => !result.passed);
                if (!firstFailedTest) return null;
                
                return (
                  <div className="p-3 rounded border bg-red-50 border-red-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        First Failed Test
                      </span>
                      <span className="text-xs font-bold text-red-600">✗ FAILED</span>
                    </div>

                    <div className="text-sm space-y-3">
                      {/* Input Section */}
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">📥 Input:</div>
                        <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded-r">
                          <code className="text-blue-800 font-mono whitespace-pre-wrap">
                            {firstFailedTest.input || '(no input)'}
                          </code>
                        </div>
                      </div>

                      {/* Your Output */}
                      <div>
                        <div className="font-semibold text-red-700 mb-1">❌ Your Output:</div>
                        <div className="bg-red-50 border-l-4 border-red-300 p-3 rounded-r min-h-[60px]">
                          <code className="text-red-800 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                            {firstFailedTest.actualOutput || '(no output)'}
                          </code>
                        </div>
                      </div>

                      {/* Expected Output - Hidden */}
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">✅ Expected Output:</div>
                        <div className="bg-gray-100 border-l-4 border-gray-300 p-3 rounded-r">
                          <div className="text-gray-600 italic">
                            Hidden - Fix your code to see if it matches!
                          </div>
                        </div>
                      </div>

                      {/* Error Section */}
                      {firstFailedTest.error && (
                        <div>
                          <div className="font-semibold text-red-700 mb-1">🚨 Error:</div>
                          <div className="bg-red-50 border-l-4 border-red-300 p-3 rounded-r">
                            <code className="text-red-800 font-mono text-sm whitespace-pre-wrap">
                              {firstFailedTest.error}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {passedTests === totalTests && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <div className="text-green-800 font-medium flex items-center gap-2">
                🎉 Congratulations! All tests passed!
              </div>
              <p className="text-sm text-green-700 mt-1">
                Your solution works correctly for all test cases. Great job!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Visible Test Cases - Only show when no test results yet */}
      {testResults.length === 0 && (
        <div className="px-6 py-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Test Cases</h4>
        <div className="space-y-2">
          {testCases
            .filter(tc => !tc.hidden)
            .map((testCase, index) => (
              <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Test Case {index + 1}</span>
                </div>
                <div className="p-4 space-y-3">
                  {/* Input Section */}
                  <div>
                    <div className="font-medium text-gray-700 mb-2">📥 Input:</div>
                    <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded-r">
                      <code className="text-blue-800 font-mono text-sm whitespace-pre-wrap">
                        {testCase.input || '(no input)'}
                      </code>
                    </div>
                  </div>

                  {/* Expected Output Section */}
                  <div>
                    <div className="font-medium text-gray-700 mb-2">✅ Expected Output:</div>
                    <div className="bg-gray-100 border-l-4 border-gray-300 p-3 rounded-r">
                      <code className="text-gray-800 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                        {testCase.expectedOutput}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          
          {testCases.some(tc => tc.hidden) && (
            <div className="text-xs text-gray-500 italic">
              + {testCases.filter(tc => tc.hidden).length} hidden test case(s)
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}