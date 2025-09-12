// Simple line-by-line Python executor using Pyodide
export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  waitingForInput?: boolean;
  inputPrompt?: string;
}

export interface TerminalOutput {
  type: 'output' | 'input' | 'prompt';
  content: string;
}

class LineExecutorService {
  private pyodide: any = null;
  private currentLine = 0;
  private lines: string[] = [];
  private lineNumbers: number[] = []; // Track original line numbers
  private waitingForInput = false;
  private inputPrompt = '';
  private _jsInputQueue: string[] = []; // JavaScript-side input queue
  private _jsInputIndex = 0; // Index for reading from queue without consuming
  private terminalOutputCallback?: (output: TerminalOutput) => void;
  private prependLineCount = 0; // Track how many lines are prepended

  async initialize(): Promise<void> {
    if (this.pyodide) return;

    try {
      // Load Pyodide from CDN
      if (!(window as any).loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      this.pyodide = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
        stdin: (prompt: any) => {
          console.log('🎤 STDIN called with prompt:', JSON.stringify(prompt));
          console.log('📍 Current input index:', (this as any)._jsInputIndex);
          console.log('🎯 Available inputs:', (this as any)._jsInputQueue);
          console.log('🔄 Current execution state - should we have input?', (this as any)._jsInputIndex < (this as any)._jsInputQueue.length);
          console.log('🔧 Terminal callback available?', !!(this as any).terminalOutputCallback);
          
          // Check if we have inputs at current index
          if ((this as any)._jsInputQueue && (this as any)._jsInputIndex < (this as any)._jsInputQueue.length) {
            const result = (this as any)._jsInputQueue[(this as any)._jsInputIndex];
            console.log('✅ BEFORE increment - index:', (this as any)._jsInputIndex, 'returning:', result);
            (this as any)._jsInputIndex++; // Move to next input for next call
            console.log('✅ AFTER increment - next index will be:', (this as any)._jsInputIndex);
            
            // Write input directly to terminal (prompt already shown by custom input function)
            if ((this as any).terminalOutputCallback) {
              (this as any).terminalOutputCallback({ type: 'input', content: result });
            }
            
            return result;
          } else {
            // No input available at current index - show prompt and wait for user input
            console.log('❌ No input available at index', (this as any)._jsInputIndex, 'Queue length:', (this as any)._jsInputQueue.length);
            console.log('🚨 THROWING EOF - execution should pause here');
            
            // Store the prompt (even if undefined)
            (window as any)._pendingInputPrompt = prompt || '';
            
            // Don't try to show prompt here - let the custom input() function handle it via stdout
            throw new Error('EOF');
          }
        },
        stdout: (text: any) => {
          // Send Python output directly to terminal - no hardcoded detection
          if (this.terminalOutputCallback) {
            this.terminalOutputCallback({ type: 'output', content: text });
          }
        },
        stderr: (text: any) => {
          // Send Python errors directly to terminal  
          if (this.terminalOutputCallback) {
            this.terminalOutputCallback({ type: 'output', content: text });
          }
          console.log('stderr:', text);
        }
      });

      // Set up simple input override to show prompts
      this.pyodide.runPython(`
import builtins

# Store original input function  
_original_input = builtins.input

# Simple override: just show prompt then call original  
def input(prompt=''):
    if prompt:
        # Display prompt with newline (since end='' doesn't work)
        print(prompt, flush=True)
    return _original_input('')

builtins.input = input
      `);

      // Set up timing functions - keep original implementations
      this.pyodide.runPython(`
import time
# Use default timing functions - they should work even with limited precision
      `);

      // Set up simple session-based deterministic execution
      this.pyodide.runPython(`
import random
import sys

# Generate a random seed for this code execution session  
_session_seed = None
_input_queue = []  # Queue of inputs for this session

def _initialize_session_determinism():
    global _session_seed
    import random
    if _session_seed is None:
        # Generate truly random seed for this session
        import os
        _session_seed = int.from_bytes(os.urandom(4), 'big')
    
    # Set the same seed for all re-executions within this session
    random.seed(_session_seed)
    try:
        import numpy as np
        np.random.seed(_session_seed)
    except ImportError:
        pass

def _reset_session():
    global _session_seed, _input_queue
    _session_seed = None
    _input_queue = []

def _add_input(input_value):
    global _input_queue
    _input_queue.append(input_value)

def _get_next_input(prompt=""):
    global _input_queue
    if _input_queue:
        return _input_queue.pop(0)
    else:
        # No more inputs available - this will trigger EOF error
        raise EOFError(f"No input available for prompt: {prompt}")
      `);

    } catch (error) {
      throw new Error(`Failed to initialize Python: ${error}`);
    }
  }

  async executeCode(code: string, prependLineCount: number = 0): Promise<ExecutionResult> {
    if (!this.pyodide) {
      await this.initialize();
    }

    // Reset session for new code execution (new random seed)
    this.pyodide.runPython('_reset_session()');
    
    // Reset JavaScript-side input queue and index
    this._jsInputQueue = [];
    this._jsInputIndex = 0;

    // Set prepend line count for error line number adjustment
    this.prependLineCount = prependLineCount;

    // Treat entire code as one multi-line block - much simpler approach!
    this.lines = [code.trim()];
    this.lineNumbers = [1];
    this.currentLine = 0;
    this.waitingForInput = false;

    try {
      // Try to execute the entire code at once
      return await this.executeNextLines();
    } catch (error) {
      return {
        success: false,
        output: '', // Output sent directly to terminal
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // groupIntoBlocks method removed - we now treat all code as one block for simpler execution
  
  // Removed unused helper methods (startsMultiLineConstruct, isPartOfBlock, hasUnclosedDelimiters, etc.)
  // since we now use simplified single-block execution approach

  async continueWithInput(input: string): Promise<ExecutionResult> {
    if (!this.waitingForInput) {
      throw new Error('Not waiting for input');
    }

    try {
      // Add input to our JavaScript-side queue
      this._jsInputQueue.push(input);
      console.log('📥 LineExecutor - Added input to JS queue:', input);
      console.log('🎯 FULL INPUT QUEUE:', this._jsInputQueue);
      console.log('📊 Queue length:', this._jsInputQueue.length);
      
      // Clear waiting state
      this.waitingForInput = false;
      
      // Reset input index for re-execution from beginning
      this._jsInputIndex = 0;
      console.log('🔄 Reset input index to 0 for re-execution');
      console.log('🎯 BEFORE re-execution - Queue:', this._jsInputQueue);
      console.log('📍 BEFORE re-execution - Index:', this._jsInputIndex);
      
      // Re-execute the code - it will use inputs from the JS queue and maintain determinism
      const result = await this.executeNextLines();
      
      console.log('🏁 AFTER re-execution - Queue:', this._jsInputQueue);
      console.log('📍 AFTER re-execution - Index:', this._jsInputIndex);
      console.log('⚡ AFTER re-execution - Result waiting for input:', result.waitingForInput);
      console.log('🔍 DEBUG INPUT WRITE STATUS:', (window as any)._debugInputWrite);
      
      console.log('📤 LineExecutor - continueWithInput result:', {
        success: result.success,
        waitingForInput: result.waitingForInput,
        outputLength: result.output?.length || 0,
        error: result.error
      });
      console.log('🎯 INPUT QUEUE AFTER EXECUTION:', this._jsInputQueue);
      console.log('📊 Queue length after execution:', this._jsInputQueue.length);
      
      // For successful re-execution, we want to show clean output (not cumulative)
      // The JavaScript side can handle clearing the terminal display while keeping the final result
      return result;
      
    } catch (error) {
      console.log('❌ LineExecutor - continueWithInput error:', error);
      return {
        success: false,
        output: '', // Output sent directly to terminal
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async executeNextLines(): Promise<ExecutionResult> {
    while (this.currentLine < this.lines.length) {
      const code = this.lines[this.currentLine];
      console.log('Executing entire code block');
      
      try {
        // Initialize session determinism (same seed for re-executions)
        this.pyodide.runPython('_initialize_session_determinism()');
        
        // Output goes directly to terminal via stdout/stderr handlers
        
        // Execute code normally - but first set up input override in the execution context
        console.log('🚀 About to execute Python code:', code.substring(0, 100) + '...');
        
        // Input override should already be set up globally
        
        this.pyodide.runPython(code);
        console.log('✅ Python code execution completed (or paused for input)');
        
        // If we get here, execution completed successfully
        this.currentLine++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log('Execution error:', errorMsg);
        console.log('Error type:', typeof error);
        console.log('Full error object:', error);
        
        // Check if this is an input-related error (EOF from stdin handler)
        if (errorMsg.includes('EOF') || errorMsg.includes('I/O error') || (window as any)._pendingInputPrompt !== undefined) {
          console.log('🔍 Detected input needed - processing prompt');
          const prompt = (window as any)._pendingInputPrompt || '';
          console.log('🏷️ Extracted prompt:', JSON.stringify(prompt));
          delete (window as any)._pendingInputPrompt;
          
          // Set up for input collection
          this.waitingForInput = true;
          this.inputPrompt = prompt;
          
          console.log('🎯 Returning waitingForInput result with prompt:', JSON.stringify(prompt));
          return {
            success: true,
            output: '', // Output sent directly to terminal
            waitingForInput: true,
            inputPrompt: prompt
          };
        }
        
        // For other errors, extract actual line number from Pyodide
        const cleanedError = this.extractLineNumberFromError(errorMsg);
        
        return {
          success: false,
          output: '', // Output sent directly to terminal
          error: cleanedError
        };
      }
    }

    // All code executed successfully
    return {
      success: true,
      output: '', // Output sent directly to terminal
    };
  }

  private handleInputLine(line: string): ExecutionResult {
    console.log('Processing input line:', line);
    
    // More flexible approach: find input() calls and extract variable name and prompt
    // Handle nested parentheses in the prompt properly
    let inputCallMatch = null;
    let promptArg = '';
    
    const inputStart = line.indexOf('input(');
    if (inputStart !== -1) {
      // Find the matching closing parenthesis
      let parenCount = 0;
      let pos = inputStart + 5; // Start after 'input'
      let inputEnd = -1;
      
      while (pos < line.length) {
        if (line[pos] === '(') {
          parenCount++;
        } else if (line[pos] === ')') {
          parenCount--;
          if (parenCount === 0) {
            inputEnd = pos;
            break;
          }
        }
        pos++;
      }
      
      if (inputEnd !== -1) {
        // Extract the content between input( and )
        promptArg = line.substring(inputStart + 6, inputEnd).trim();
        inputCallMatch = [line.substring(inputStart, inputEnd + 1), promptArg];
      }
    }
    
    if (!inputCallMatch) {
      console.log('No input() call found');
      return this.handleUnexpectedInput();
    }
    let prompt = '';
    
    if (promptArg) {
      try {
        // If it's a quoted string, extract it
        if ((promptArg.startsWith('"') && promptArg.endsWith('"')) || 
            (promptArg.startsWith("'") && promptArg.endsWith("'"))) {
          prompt = promptArg.slice(1, -1);
        } else {
          // Try to evaluate it as a Python expression
          const result = this.pyodide.runPython(promptArg);
          prompt = result || '';
        }
      } catch {
        prompt = promptArg;
      }
    }
    
    // Find the variable being assigned to
    const assignMatch = line.match(/(\w+)\s*=/);
    if (!assignMatch) {
      console.log('No assignment found');
      return this.handleUnexpectedInput();
    }
    
    const varName = assignMatch[1];
    console.log('Variable name:', varName, 'Prompt:', prompt);
    
    // Note: Don't print the prompt here - CodePlayground handles display
    
    this.inputPrompt = prompt;
    this.waitingForInput = true;
    
    // Store the full line and variable name for processing later
    this.pyodide.runPython(`_input_var_name = "${varName}"`);
    this.pyodide.runPython(`_input_line = """${line.replace(/"/g, '\\"')}"""`);
    this.pyodide.runPython(`_user_input = None`);
    
    return {
      success: true,
      output: '', // Output sent directly to terminal,
      waitingForInput: true,
      inputPrompt: prompt
    };
  }

  private handleMultiLineInputBlock(block: string): ExecutionResult {
    console.log('Processing multi-line input block:', block);
    
    // Take a snapshot of the current execution state before running the multi-line block
    // Reset print history before starting a new multiline chunk
    this.pyodide.runPython(`
_take_execution_snapshot()
_reset_print_history()
_multi_line_block = """${block.replace(/"/g, '\\"')}"""
_is_multi_line_input = True
_inputs_provided = []
    `);
    
    // Get the first input prompt by executing with no inputs
    let firstPrompt = '';
    try {
      const promptResult = this.pyodide.runPython(`
# Execute the block with no inputs to get the first prompt
result = _execute_with_input_responses(_multi_line_block, [])
result if isinstance(result, str) else ""
      `);
      firstPrompt = promptResult === 'True' ? '' : (promptResult || '');
    } catch (e) {
      console.log('Could not determine first prompt:', e);
      firstPrompt = '';
    }
    
    this.inputPrompt = firstPrompt;
    this.waitingForInput = true;
    
    return {
      success: true,
      output: '', // Output sent directly to terminal,
      waitingForInput: true,
      inputPrompt: firstPrompt
    };
  }

  private findNextInputLine(block: string): string {
    const lines = block.split('\n');
    for (const line of lines) {
      if (this.containsInputCall(line)) {
        return line;
      }
    }
    return '';
  }

  private extractPromptFromLine(line: string): string {
    if (!line) return '';
    
    const inputStart = line.indexOf('input(');
    if (inputStart === -1) return '';
    
    let parenCount = 0;
    let pos = inputStart + 5;
    let inputEnd = -1;
    
    while (pos < line.length) {
      if (line[pos] === '(') {
        parenCount++;
      } else if (line[pos] === ')') {
        parenCount--;
        if (parenCount === 0) {
          inputEnd = pos;
          break;
        }
      }
      pos++;
    }
    
    if (inputEnd === -1) return '';
    
    const promptArg = line.substring(inputStart + 6, inputEnd).trim();
    if (!promptArg) return '';
    
    try {
      if ((promptArg.startsWith('"') && promptArg.endsWith('"')) || 
          (promptArg.startsWith("'") && promptArg.endsWith("'"))) {
        return promptArg.slice(1, -1);
      } else {
        const result = this.pyodide.runPython(promptArg);
        return result || '';
      }
    } catch {
      return promptArg;
    }
  }
  
  private handleUnexpectedInput(): ExecutionResult {
    this.inputPrompt = '';
    this.waitingForInput = true;
    return {
      success: true,
      output: '', // Output sent directly to terminal,
      waitingForInput: true,
      inputPrompt: ''
    };
  }

  private containsInputCall(line: string): boolean {
    // More precise detection of input() calls vs functions that contain 'input'
    // Look for patterns like: variable = input(...) or input(...) standalone
    const inputCallPatterns = [
      /\binput\s*\(/,           // input( with word boundary
      /=\s*input\s*\(/,         // = input(
      /^\s*input\s*\(/          // line starting with input(
    ];
    
    // Exclude patterns that are function definitions or other functions containing 'input'
    const excludePatterns = [
      /def\s+\w*input/,         // function definitions like def validate_user_input
      /\w+_input\s*\(/,         // function calls like validate_user_input(
      /\w+input\s*\(/           // function calls like userinput(
    ];
    
    // Check if line matches input patterns but not exclude patterns
    const hasInputCall = inputCallPatterns.some(pattern => pattern.test(line));
    const hasExcludedCall = excludePatterns.some(pattern => pattern.test(line));
    
    return hasInputCall && !hasExcludedCall;
  }

  // Extract actual line number from Pyodide error messages
  private extractLineNumberFromError(errorMessage: string): string {
    try {
      // Look for line number patterns in Pyodide errors
      // Pattern: 'File "<exec>", line X, in <module>'
      const lineMatch = errorMessage.match(/File "<exec>", line (\d+), in/);
      if (lineMatch) {
        const pyodideLineNumber = parseInt(lineMatch[1], 10);
        
        // Adjust line number by subtracting prepended lines
        const adjustedLineNumber = Math.max(1, pyodideLineNumber - this.prependLineCount);
        
        // Extract the actual error type and message
        const errorTypeMatch = errorMessage.match(/(\w+Error: .+)$/m);
        const errorType = errorTypeMatch ? errorTypeMatch[1] : 'Error';
        
        return `Line ${adjustedLineNumber}: ${errorType}`;
      }
      
      // If no line number found, try to extract just the error type
      const errorTypeMatch = errorMessage.match(/(\w+Error: .+)$/m);
      if (errorTypeMatch) {
        return errorTypeMatch[1];
      }
      
      // Fallback: return cleaned up message
      return errorMessage.replace(/Traceback[\s\S]*?(\w+Error: .+)/, '$1');
    } catch {
      // If parsing fails, return original message
      return errorMessage;
    }
  }

  // getOutput() removed - outputs go directly to terminal via callbacks

  isReady(): boolean {
    return this.pyodide !== null;
  }

  setTerminalOutputCallback(callback: (output: TerminalOutput) => void): void {
    this.terminalOutputCallback = callback;
  }

  reset(): void {
    this.currentLine = 0;
    this.lines = [];
    this.lineNumbers = [];
    this.waitingForInput = false;
    this.inputPrompt = '';
    this._jsInputQueue = [];
    this._jsInputIndex = 0;
    this.prependLineCount = 0;
    
    if (this.pyodide) {
      // Reset Python environment
      this.pyodide.runPython(`
# Clear variables (keep builtins and our helper functions)
for name in list(globals().keys()):
    if not name.startswith('_') and name not in [
        '__builtins__', '__name__', '__doc__', 
        'sys', 'io'
    ]:
        del globals()[name]

# Reset input variables
_user_input = None
_input_var_name = None
_multi_line_block = None
_is_multi_line_input = False

# Reset print history tracking
_print_history = 0
_temp_print_snapshot = 0

# No output capture needed - outputs go directly to terminal
      `);
    }
  }
}

export const LineExecutor = new LineExecutorService();