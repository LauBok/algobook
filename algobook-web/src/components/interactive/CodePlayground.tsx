'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { PyodideRunner } from '@/lib/api/pyodide';
import { LineExecutor } from '@/lib/api/line-executor';
import { settingsManager } from '@/lib/utils/settings';

interface CodePlaygroundProps {
  initialCode: string;
  description?: string;
  hints?: string[];
  editable?: boolean;
  showOutput?: boolean;
  prepend?: string;
  postpend?: string;
  onCodeChange?: (code: string) => void;
}


export default function CodePlayground({ 
  initialCode, 
  description, 
  hints = [], 
  editable = true,
  showOutput = true,
  prepend = '',
  postpend = '',
  onCodeChange
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string>('');
  const [showHints, setShowHints] = useState(false);
  const [editorHeight, setEditorHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [inputData, setInputData] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [terminalMode, setTerminalMode] = useState(true);
  const [settings, setSettings] = useState(() => {
    try {
      return settingsManager.getSettings();
    } catch {
      return { showLineNumbers: true, showHints: true, fontSize: 'medium', theme: 'system' } as any;
    }
  });
  const [terminalHistory, setTerminalHistory] = useState<Array<{type: 'output' | 'input' | 'prompt' | 'system', content: string}>>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [isPopout, setIsPopout] = useState(false);
  const [popoutFontSize, setPopoutFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('algobook_popout_font_size');
      return saved ? parseInt(saved) : 16;
    }
    return 16;
  });
  // const [interpreter] = useState(() => new PythonInterpreter()); // Reserved for future use

  // Ensure client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Subscribe to settings changes
  useEffect(() => {
    try {
      const unsubscribe = settingsManager.subscribe((newSettings) => {
        setSettings(newSettings);
      });
      return unsubscribe;
    } catch (error) {
      console.error('Failed to subscribe to settings:', error);
    }
  }, []);

  // Apply settings-based hints visibility
  useEffect(() => {
    // Only show hints if settings allow it AND user has manually enabled them, not by default
    setShowHints(false);
  }, [settings?.showHints, hints]);

  // Handle ESC key to close popout modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isPopout) {
        setIsPopout(false);
      }
    };

    if (isPopout) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isPopout]);

  // Save popout font size to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('algobook_popout_font_size', popoutFontSize.toString());
    }
  }, [popoutFontSize]);

  const adjustPopoutFontSize = (delta: number) => {
    setPopoutFontSize(prev => Math.max(10, Math.min(24, prev + delta)));
  };

  const runCode = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setError('');
    setShowTerminal(true); // Show terminal when code is run
    console.log('Setting showTerminal to true, showOutput:', showOutput);

    if (terminalMode) {
      await runInteractiveMode();
    } else {
      setOutput('Running...');
      await runBatchMode();
    }
  };

  const runBatchMode = async () => {
    try {
      // Initialize Pyodide if needed
      if (!PyodideRunner.isReady()) {
        setOutput('Loading Python interpreter...');
        await PyodideRunner.initialize();
      }
      
      // Parse inputs from input data (one per line)
      const inputs = inputData.trim() ? inputData.trim().split('\n') : [];
      
      // Combine prepend + user code + postpend
      const combinedCode = (prepend ? prepend + '\n' : '') + 
                          code + 
                          (postpend ? '\n' + postpend : '');
      
      const result = await PyodideRunner.executeCodeSync(combinedCode, inputs);
      
      if (result.success) {
        setOutput(result.output || 'Code executed successfully (no output)');
      } else {
        const cleanError = cleanErrorMessage(result.error || 'Unknown error');
        setOutput(cleanError);
        setError(cleanError);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setOutput(`Error: ${errorMessage}`);
    } finally {
      setIsRunning(false);
    }
  };


  const runInteractiveMode = async () => {
    // Reset terminal state
    setTerminalHistory([]);
    setCurrentInput('');
    setIsWaitingForInput(false);
    
    // Start terminal session
    setTerminalHistory([{type: 'system', content: 'Starting interactive Python session...'}]);
    
    try {
      // Initialize the line executor
      if (!LineExecutor.isReady()) {
        setTerminalHistory(prev => [...prev, {type: 'system', content: 'Loading Python interpreter...'}]);
        await LineExecutor.initialize();
        setTerminalHistory(prev => [...prev, {type: 'system', content: 'Python interpreter ready.'}]);
      }
      
      // Clear terminal for fresh execution
      setTerminalHistory([{type: 'system', content: 'Python interpreter ready.'}]);
      
      // Set up direct terminal output callback
      LineExecutor.setTerminalOutputCallback((output) => {
        setTerminalHistory(prev => [...prev, {type: output.type, content: output.content}]);
      });
      
      // Reset the executor state
      LineExecutor.reset();
      
      // Combine prepend + user code + postpend
      const combinedCode = (prepend ? prepend + '\n' : '') + 
                          code + 
                          (postpend ? '\n' + postpend : '');
      
      // Count prepended lines for accurate error reporting
      const prependLineCount = prepend ? prepend.split('\n').length : 0;
      
      // Execute the code - outputs will be sent directly to terminal via callback
      const result = await LineExecutor.executeCode(combinedCode, prependLineCount);
      
      // Handle waiting for input
      if (result.waitingForInput) {
        if (result.inputPrompt) {
          setTerminalHistory(prev => [...prev, {type: 'prompt', content: result.inputPrompt || ''}]);
        }
        setIsWaitingForInput(true);
        return; // Don't set isRunning to false yet
      }
      
      // Handle completion
      if (result.success) {
        setTerminalHistory(prev => [...prev, {type: 'system', content: 'Program completed.'}]);
      } else {
        setTerminalHistory(prev => [...prev, {type: 'output', content: cleanErrorMessage(result.error || '')}]);
      }
      
      // Program completed successfully without waiting for input
      setIsRunning(false);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setTerminalHistory(prev => [...prev, {type: 'output', content: `Error: ${errorMessage}`}]);
      setIsRunning(false);
    }
  };

  const handleTerminalInput = async (input: string) => {
    if (!isWaitingForInput) return;

    // Don't add user input manually - let stdin handler show it in correct position
    setIsWaitingForInput(false);
    setCurrentInput('');
    
    try {
      // Clear terminal for re-execution
      setTerminalHistory([{type: 'system', content: 'Python interpreter ready.'}]);
      
      // Set up terminal callback for continued execution
      LineExecutor.setTerminalOutputCallback((output) => {
        setTerminalHistory(prev => [...prev, {type: output.type, content: output.content}]);
      });
      
      // Continue execution with the provided input - outputs will go directly to terminal
      const result = await LineExecutor.continueWithInput(input);
      
      // Check if waiting for more input
      if (result.waitingForInput) {
        if (result.inputPrompt) {
          setTerminalHistory(prev => [...prev, {type: 'prompt', content: result.inputPrompt || ''}]);
        }
        setIsWaitingForInput(true);
        console.log('🐛 Terminal Debug - Still waiting for more input');
        return; // Still waiting for input
      }
      
      // Program completed
      if (result.success) {
        setTerminalHistory(prev => [...prev, {type: 'system', content: 'Program completed.'}]);
        console.log('🐛 Terminal Debug - Program completed successfully');
      } else {
        setTerminalHistory(prev => [...prev, {type: 'output', content: cleanErrorMessage(result.error || '')}]);
        console.log('🐛 Terminal Debug - Program completed with error');
      }
      
      setIsRunning(false);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setTerminalHistory(prev => [...prev, {type: 'output', content: `Error: ${errorMessage}`}]);
      setIsRunning(false);
    }
  };


  const resetCode = () => {
    setCode(initialCode);
    setOutput('');
    setError('');
    setTerminalHistory([]);
    setCurrentInput('');
    setIsWaitingForInput(false);
    setInputData('');
    setShowTerminal(false);
    LineExecutor.reset();
  };

  const cleanErrorMessage = (errorMsg: string): string => {
    if (!errorMsg) return 'Unknown error';
    
    // If the error already has line number (from our line executor), return as-is
    if (errorMsg.startsWith('Line ')) {
      return errorMsg;
    }
    
    // Otherwise, clean up traceback for other error sources
    const lines = errorMsg.split('\n');
    
    // Look for the actual Python error (ErrorType: message)
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.match(/^\w+Error: /)) {
        return line;
      }
    }
    
    // Fallback: return the last non-empty, non-traceback line
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line && !line.includes('File "') && !line.includes('line ')) {
        return line;
      }
    }
    
    return errorMsg;
  };

  const resetTerminal = async () => {
    setTerminalHistory([]);
    setCurrentInput('');
    setIsWaitingForInput(false);
    setOutput('');
    setError('');
    LineExecutor.reset();

    // Automatically re-run the code with fresh environment
    // Keep isRunning as true during the restart process
    if (terminalMode) {
      await runInteractiveMode();
    }
  };

  const openPopout = () => {
    setIsPopout(true);
    setShowTerminal(true); // Show terminal in popout by default
  };

  const closePopout = () => {
    setIsPopout(false);
  };

  // Monaco editor ref for layout recalculation
  const editorRef = React.useRef<any>(null);

  // Calculate initial height based on code lines
  React.useEffect(() => {
    const lines = initialCode.split('\n').length;
    const minHeight = 375; // Match the drag minimum
    const maxHeight = 600;
    const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, lines * 24 + 50));
    setEditorHeight(calculatedHeight);
  }, [initialCode]);

  // Force layout recalculation when editor is ready
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // Set up scroll-through behavior
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      let boundaryScrollCount = 0;
      let boundaryScrollTimeout: NodeJS.Timeout | null = null;
      const BOUNDARY_SCROLL_THRESHOLD = 25; // Much higher threshold for intentional scroll-through
      const BOUNDARY_RESET_DELAY = 150; // Slightly longer reset delay

      editorDomNode.addEventListener('wheel', (e: WheelEvent) => {
        const scrollTop = editor.getScrollTop();
        const scrollHeight = editor.getScrollHeight();
        const editorHeight = editor.getLayoutInfo().height;

        // Calculate if we're at the boundaries (exact boundaries)
        const tolerance = 0;
        const isAtTop = scrollTop <= tolerance;
        const isAtBottom = scrollTop >= scrollHeight - editorHeight - tolerance;

        // Check if we're trying to scroll beyond the boundaries
        const scrollingUp = e.deltaY < 0;
        const scrollingDown = e.deltaY > 0;

        // Check if we're at a boundary and trying to scroll beyond
        const atBoundaryAndScrollingBeyond = (scrollingUp && isAtTop) || (scrollingDown && isAtBottom);

        if (atBoundaryAndScrollingBeyond) {
          // Increment boundary scroll counter
          boundaryScrollCount++;

          // Reset the timeout
          if (boundaryScrollTimeout) {
            clearTimeout(boundaryScrollTimeout);
          }
          boundaryScrollTimeout = setTimeout(() => {
            boundaryScrollCount = 0;
          }, BOUNDARY_RESET_DELAY);

          // Only scroll page after threshold is reached
          if (boundaryScrollCount >= BOUNDARY_SCROLL_THRESHOLD) {
            // Prevent the editor from handling this scroll
            e.preventDefault();
            e.stopPropagation();

            // Manually scroll the page
            window.scrollBy({
              top: e.deltaY,
              behavior: 'auto'
            });
            return;
          } else {
            // Block scroll but don't trigger page scroll yet
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        } else {
          // Not at boundary - reset counter and allow normal editor scroll
          boundaryScrollCount = 0;
          if (boundaryScrollTimeout) {
            clearTimeout(boundaryScrollTimeout);
            boundaryScrollTimeout = null;
          }
        }

        // Don't prevent default - let the editor handle the scroll normally
      }, { passive: false, capture: true });
    }

    // Force layout recalculation after a short delay
    setTimeout(() => {
      editor.layout();
      // Force a refresh to fix first line alignment
      const model = editor.getModel();
      if (model) {
        const value = model.getValue();
        model.setValue('');
        model.setValue(value);
      }
    }, 100);
  };

  // Handle dragging for resizing
  const [dragStartY, setDragStartY] = React.useState<number>(0);
  const [dragStartHeight, setDragStartHeight] = React.useState<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setDragStartY(e.clientY);
    setDragStartHeight(editorHeight);
    e.preventDefault();
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const deltaY = e.clientY - dragStartY;
      const newHeight = dragStartHeight + deltaY;
      
      // Hard-coded minimum for testing
      const minHeight = 375;
      
      // Constrain height - cannot be smaller than Monaco's actual content
      const constrainedHeight = Math.max(minHeight, Math.min(800, newHeight));
      
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

  // Show loading skeleton during SSR (but not for inline executable examples)
  if (!isMounted && showOutput !== true) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {description && (
          <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
            <p className="text-sm text-gray-700">{description}</p>
          </div>
        )}
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1">
            <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Python Code</h3>
              <div className="flex gap-2">
                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-64 bg-gray-50 flex items-center justify-center">
              <div className="text-sm text-gray-500">Loading editor...</div>
            </div>
          </div>
          {showOutput && (
            <div className="lg:w-80 lg:border-l border-t lg:border-t-0 border-gray-200">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">Input & Output</h3>
              </div>
              <div className="h-64 bg-gray-50"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm max-w-none w-full">
      {description && (
        <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
          <p className="text-sm text-gray-700">{description}</p>
        </div>
      )}

      <div className="flex flex-col">
        {/* Code Editor */}
        {!isPopout && (
        <div className="w-full">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-medium text-gray-700">Python Code</h4>
              <button
                onClick={openPopout}
                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                title="Open in expanded view"
              >
                🔍 Expand
              </button>
            </div>
            <div className="flex gap-2">
              {showTerminal ? (
                <button
                  onClick={() => setShowTerminal(false)}
                  className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                  title="Hide terminal"
                >
                  Hide Terminal
                </button>
              ) : (
                <button
                  onClick={() => setShowTerminal(true)}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  title="Show terminal"
                >
                  Show Terminal
                </button>
              )}
              <button
                onClick={() => setTerminalMode(!terminalMode)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  terminalMode
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={terminalMode ? 'Switch to batch mode' : 'Switch to terminal mode'}
              >
                {terminalMode ? '🖥️ Terminal Mode' : '📄 Batch Mode'}
              </button>
              <button
                onClick={resetCode}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                Reset Code
              </button>
              <button
                onClick={isRunning ? resetTerminal : runCode}
                disabled={false}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  isRunning
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isRunning ? 'Restart' : (showTerminal ? 'Run Code' : 'Run Code & Show Output')}
              </button>
            </div>
          </div>
          
          <div className="relative monaco-container-wrapper bg-white">
            <div 
              id="editor-container" 
              className="monaco-alignment-fix bg-white"
              style={{ height: `${editorHeight - 8}px` }}
            >
              <style jsx>{`
                .monaco-alignment-fix .monaco-editor .view-lines .view-line {
                  left: 0 !important;
                  text-indent: 0 !important;
                  margin-left: 0 !important;
                  padding-left: 0 !important;
                }
                
                .monaco-alignment-fix .monaco-editor .view-lines .view-line:first-child {
                  left: 0 !important;
                  text-indent: 0 !important;
                  margin-left: 0 !important;
                  padding-left: 0 !important;
                }
                
                .monaco-alignment-fix .monaco-editor .margin {
                  left: 0 !important;
                }
                
                .monaco-alignment-fix {
                  border-bottom: 1px solid #e5e7eb;
                }
              `}</style>
              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                onChange={(value) => {
                  const newCode = value || '';
                  setCode(newCode);
                  onCodeChange?.(newCode);
                }}
                onMount={handleEditorDidMount}
                options={{
                  readOnly: !editable,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: (() => {
                    try {
                      return settingsManager.getEditorFontSize();
                    } catch {
                      return 14;
                    }
                  })(),
                  lineNumbers: settings?.showLineNumbers ? 'on' : 'off',
                  automaticLayout: true,
                  theme: (() => {
                    try {
                      return settingsManager.getMonacoTheme();
                    } catch {
                      return 'vs-light';
                    }
                  })(),
                }}
              />
            </div>
            {/* Resize Handle - clearly separated below the white editor */}
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

        {/* Collapsed View When Popout is Active */}
        {isPopout && (
          <div className="w-full p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <div className="text-purple-700 font-medium mb-1">Code Playground opened in expanded view</div>
            <button
              onClick={closePopout}
              className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Close Expanded View
            </button>
          </div>
        )}

        {/* Output Panel */}
        {showOutput && showTerminal && (
          <div className="w-full border-t border-gray-200">
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-700">
                {terminalMode ? '🖥️ Interactive Terminal' : '📄 Input & Output'}
              </h4>
            </div>
            
            {!terminalMode && (
              /* Batch Mode Input Field */
              <div className="px-6 py-3 border-b border-gray-200 bg-blue-50">
                <label className="text-xs font-medium text-blue-700 mb-1 block">
                  Input (for input() function):
                </label>
                <textarea
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  placeholder="Enter input data (one value per line)"
                  className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:border-blue-400 focus:outline-none resize-none"
                  rows={2}
                />
                <div className="text-xs text-blue-600 mt-1">
                  💡 For multiple inputs, put each on a new line in the order they&apos;ll be requested
                </div>
              </div>
            )}

            {terminalMode ? (
              /* Terminal Mode */
              <div className="flex flex-col" style={{ height: `${editorHeight}px` }}>
                <div className="flex-1 p-4 overflow-auto bg-gray-900 text-green-400 text-sm" style={{ fontFamily: 'Consolas, "SF Mono", Menlo, "Roboto Mono", "Ubuntu Mono", "Courier New", monospace' }}>
                  {terminalHistory.length === 0 ? (
                    <div className="text-gray-500">Terminal ready. Click &ldquo;Run Code&rdquo; to start...</div>
                  ) : (
                    terminalHistory.map((entry, index) => (
                      <div key={index} className={`mb-1 whitespace-pre-wrap ${
                        entry.type === 'input' ? 'text-yellow-300' : 
                        entry.type === 'prompt' ? 'text-blue-300' : 
                        entry.type === 'system' ? 'text-gray-400 italic' : 'text-green-400'
                      }`}>
                        {entry.type === 'input' && '> '}
                        {entry.content || '\u00A0'}
                      </div>
                    ))
                  )}
                  {isWaitingForInput && (
                    <div className="flex items-center">
                      <span className="text-yellow-300">{'> '}</span>
                      <input
                        type="text"
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleTerminalInput(currentInput);
                          }
                        }}
                        className="flex-1 bg-transparent border-none outline-none text-yellow-300 ml-1"
                        style={{ fontFamily: 'Consolas, "SF Mono", Menlo, "Roboto Mono", "Ubuntu Mono", "Courier New", monospace' }}
                        placeholder="Type input and press Enter..."
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Batch Mode Output */
              <div className="h-64 p-4 overflow-auto">
                {error ? (
                  <div className="text-red-600 text-sm whitespace-pre-wrap" style={{ fontFamily: 'Consolas, "SF Mono", Menlo, "Roboto Mono", "Ubuntu Mono", "Courier New", monospace' }}>
                    <div className="text-red-700 font-medium mb-1">Error:</div>
                    {error}
                  </div>
                ) : (
                  <div className="text-gray-800 text-sm whitespace-pre-wrap" style={{ fontFamily: 'Consolas, "SF Mono", Menlo, "Roboto Mono", "Ubuntu Mono", "Courier New", monospace' }}>
                    {output || 'Click "Run Code" to see output here.'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hints Panel */}
      {showHints && Array.isArray(hints) && hints.length > 0 && (
        <div className="px-4 py-3 bg-yellow-50 border-t border-gray-200">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Hints:</h4>
          <ul className="space-y-1">
            {Array.isArray(hints) ? hints.map((hint, index) => (
              <li key={index} className="text-sm text-yellow-700">
                {index + 1}. {typeof hint === 'string' ? hint : JSON.stringify(hint)}
              </li>
            )) : null}
          </ul>
        </div>
      )}

      {/* Expanded Code Playground Modal */}
      {isPopout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-5/6 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">🔍 Expanded Code Playground</h3>
              <div className="flex gap-2">
                <button
                  onClick={resetCode}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  🔄 Reset Code
                </button>
                <button
                  onClick={closePopout}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Code Editor Section */}
              <div className="flex-[2] flex flex-col border-r border-gray-200">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700">Python Code</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTerminalMode(!terminalMode)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        terminalMode
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={terminalMode ? 'Switch to batch mode' : 'Switch to terminal mode'}
                    >
                      {terminalMode ? '🖥️ Terminal Mode' : '📄 Batch Mode'}
                    </button>
                    <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                      <button
                        onClick={() => adjustPopoutFontSize(-1)}
                        className="text-xs px-1 py-0.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        title="Decrease font size"
                      >
                        A-
                      </button>
                      <span className="text-xs text-gray-600 px-1">{popoutFontSize}px</span>
                      <button
                        onClick={() => adjustPopoutFontSize(1)}
                        className="text-xs px-1 py-0.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        title="Increase font size"
                      >
                        A+
                      </button>
                    </div>
                    <button
                      onClick={isRunning ? resetTerminal : runCode}
                      className={`text-xs px-3 py-1 rounded transition-colors ${
                        isRunning
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isRunning ? 'Restart' : 'Run Code'}
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <Editor
                    height="100%"
                    defaultLanguage="python"
                    value={code}
                    onChange={(value) => {
                      const newCode = value || '';
                      setCode(newCode);
                      onCodeChange?.(newCode);
                    }}
                    options={{
                      readOnly: !editable,
                      minimap: { enabled: true },
                      scrollBeyondLastLine: false,
                      fontSize: popoutFontSize,
                      lineNumbers: settings?.showLineNumbers ? 'on' : 'off',
                      automaticLayout: true,
                      theme: (() => {
                        try {
                          return settingsManager.getMonacoTheme();
                        } catch {
                          return 'vs-light';
                        }
                      })(),
                    }}
                  />
                </div>
              </div>

              {/* Terminal Section */}
              {showOutput && (
                <div className="flex-[1] flex flex-col">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700">
                      {terminalMode ? '🖥️ Interactive Terminal' : '📄 Input & Output'}
                    </h4>
                  </div>

                  {!terminalMode && (
                    <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
                      <label className="text-xs font-medium text-blue-700 mb-1 block">
                        Input (for input() function):
                      </label>
                      <textarea
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                        placeholder="Enter input data (one value per line)"
                        className="w-full px-2 py-1 text-xs border border-blue-200 rounded focus:border-blue-400 focus:outline-none resize-none"
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="flex-1 overflow-hidden">
                    {terminalMode ? (
                      <div className="h-full p-4 overflow-auto bg-gray-900 text-green-400 text-sm" style={{ fontFamily: 'Consolas, "SF Mono", Menlo, "Roboto Mono", "Ubuntu Mono", "Courier New", monospace' }}>
                        {terminalHistory.length === 0 ? (
                          <div className="text-gray-500">Terminal ready. Click "Run Code" to start...</div>
                        ) : (
                          terminalHistory.map((entry, index) => (
                            <div key={index} className={`mb-1 whitespace-pre-wrap ${
                              entry.type === 'input' ? 'text-yellow-300' :
                              entry.type === 'prompt' ? 'text-blue-300' :
                              entry.type === 'system' ? 'text-gray-400 italic' : 'text-green-400'
                            }`}>
                              {entry.type === 'input' && '> '}
                              {entry.content || '\u00A0'}
                            </div>
                          ))
                        )}
                        {isWaitingForInput && (
                          <div className="flex items-center">
                            <span className="text-yellow-300">{'> '}</span>
                            <input
                              type="text"
                              value={currentInput}
                              onChange={(e) => setCurrentInput(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleTerminalInput(currentInput);
                                }
                              }}
                              className="flex-1 bg-transparent border-none outline-none text-yellow-300 ml-1"
                              style={{ fontFamily: 'Consolas, "SF Mono", Menlo, "Roboto Mono", "Ubuntu Mono", "Courier New", monospace' }}
                              placeholder="Type input and press Enter..."
                              autoFocus
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full p-4 overflow-auto">
                        {error ? (
                          <div className="text-red-600 text-sm whitespace-pre-wrap" style={{ fontFamily: 'Consolas, "SF Mono", Menlo, "Roboto Mono", "Ubuntu Mono", "Courier New", monospace' }}>
                            <div className="text-red-700 font-medium mb-1">Error:</div>
                            {error}
                          </div>
                        ) : (
                          <div className="text-gray-800 text-sm whitespace-pre-wrap" style={{ fontFamily: 'Consolas, "SF Mono", Menlo, "Roboto Mono", "Ubuntu Mono", "Courier New", monospace' }}>
                            {output || 'Click "Run Code" to see output here.'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}