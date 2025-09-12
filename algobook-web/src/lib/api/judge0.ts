// Judge0 API integration for code execution

import { Judge0Submission, Judge0Response } from '@/lib/types';

const JUDGE0_API_URL = process.env.NEXT_PUBLIC_JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const PYTHON_LANGUAGE_ID = 71; // Python 3.8.1

export class Judge0Service {
  // Challenge mode persistent context
  private static challengeContext: {
    pyodideInstance: any;
    sessionActive: boolean;
    userCode: string;
  } | null = null;

  private static async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${JUDGE0_API_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add RapidAPI headers if using RapidAPI
    if (process.env.NEXT_PUBLIC_JUDGE0_RAPIDAPI_KEY) {
      (headers as any)['X-RapidAPI-Key'] = process.env.NEXT_PUBLIC_JUDGE0_RAPIDAPI_KEY;
      (headers as any)['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }

  static async submitCode(
    sourceCode: string,
    stdin?: string,
    expectedOutput?: string
  ): Promise<string> {
    const submission: Judge0Submission = {
      source_code: sourceCode,
      language_id: PYTHON_LANGUAGE_ID,
      stdin,
      expected_output: expectedOutput,
      cpu_time_limit: 10, // 10 seconds
      memory_limit: 128000, // 128MB
    };

    try {
      const response = await this.makeRequest('/submissions?base64_encoded=false&wait=false', {
        method: 'POST',
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.token;
    } catch (error) {
      console.error('Error submitting code:', error);
      throw new Error('Failed to submit code for execution');
    }
  }

  static async getSubmissionResult(token: string): Promise<Judge0Response> {
    try {
      const response = await this.makeRequest(`/submissions/${token}?base64_encoded=false`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting submission result:', error);
      throw new Error('Failed to get execution result');
    }
  }

  static async executeCode(
    sourceCode: string,
    stdin?: string,
    expectedOutput?: string,
    maxWaitTime: number = 10000,
    submissionMode: boolean = false
  ): Promise<Judge0Response> {
    console.log('🚀 executeCode called with submissionMode:', submissionMode);
    
    // Try local execution first
    try {
      return await this.executeCodeLocally(sourceCode, stdin, submissionMode);
    } catch (localError) {
      console.warn('Local execution failed, trying Judge0 API:', localError);
      
      // Fallback to Judge0 API
      try {
        const token = await this.submitCode(sourceCode, stdin, expectedOutput);

        // Poll for result
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitTime) {
          const result = await this.getSubmissionResult(token);
          
          if (result.status.id > 2) {
            return result;
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        throw new Error('Code execution timeout');
      } catch {
        throw new Error('Both local and API execution failed');
      }
    }
  }

  private static pyodideInstance: any = null;
  private static pyodideLoading = false;
  private static lastSubmissionMode: boolean | null = null;

  // Force complete reset of Pyodide environment
  private static forceReset() {
    console.log('Forcing complete Pyodide reset...');
    this.pyodideInstance = null;
    this.pyodideLoading = false;
    this.lastSubmissionMode = null;
    
    // Clear any cached Pyodide from window
    if (typeof window !== 'undefined') {
      (window as any).loadPyodide = undefined;
      (window as any).pyodide = undefined;
    }
    
    // Remove any existing Pyodide scripts
    const existingScripts = document.querySelectorAll('script[src*="pyodide"]');
    existingScripts.forEach(script => script.remove());
  }

  private static async loadPyodide(): Promise<any> {
    if (typeof window === 'undefined') {
      throw new Error('Pyodide can only run in browser');
    }


    if (this.pyodideInstance) {
      try {
        // Test if the instance is still functional
        this.pyodideInstance.runPython('1+1');
        return this.pyodideInstance;
      } catch (error) {
        console.warn('Existing Pyodide instance corrupted, forcing reset:', error);
        this.forceReset();
      }
    }

    if (this.pyodideLoading) {
      // Wait for existing load
      while (this.pyodideLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.pyodideInstance;
    }

    this.pyodideLoading = true;

    try {
      // Save and temporarily disable AMD to prevent module conflicts
      const saveDefine = (window as any).define?.amd;
      if (saveDefine) {
        (window as any).define.amd = null;
      }

      // Load Pyodide script if not already loaded
      if (!(window as any).loadPyodide) {
        console.log('Loading Pyodide script...');
        const scriptUrl = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
        const script = document.createElement('script');
        script.src = scriptUrl;
        
        await new Promise((resolve, reject) => {
          script.onload = () => {
            console.log('Pyodide script loaded');
            resolve(undefined);
          };
          script.onerror = (error) => {
            console.error('Failed to load Pyodide script:', error);
            reject(error);
          };
          document.head.appendChild(script);
        });
      }

      // Initialize Pyodide
      console.log('Initializing Pyodide...');
      this.pyodideInstance = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
      });

      // Restore AMD define if it was present
      if (saveDefine) {
        (window as any).define.amd = saveDefine;
      }
      console.log('Pyodide initialized successfully');

      this.pyodideLoading = false;
      return this.pyodideInstance;
    } catch (error) {
      this.pyodideLoading = false;
      console.error('Failed to load Pyodide:', error);
      throw new Error(`Failed to load Python runtime: ${error}`);
    }
  }

  private static async executeCodeLocally(sourceCode: string, stdin?: string, submissionMode: boolean = false): Promise<Judge0Response> {
    // Reset Pyodide for clean execution
    console.log('Resetting Pyodide for clean execution...');
    this.resetPyodide();

    const pyodide = await this.loadPyodide();
    
    let stdout = '';
    let stderr = '';

    try {
      // Setup input data in Python globals
      const inputData = stdin || '';
      pyodide.globals.set('_stdin_data', inputData);
      pyodide.globals.set('_submission_mode', submissionMode);
      
      // Redirect stdout/stderr to capture output and setup input
      pyodide.runPython(`
import sys
import builtins
from io import StringIO

_stdout_backup = sys.stdout
_stderr_backup = sys.stderr
_input_backup = builtins.input
sys.stdout = StringIO()
sys.stderr = StringIO()

# Setup input data
_input_lines = []
if _stdin_data:
    _input_lines = _stdin_data.strip().split('\\n')
_input_index = 0

def _custom_input(prompt=''):
    global _input_index
    if prompt:
        sys.stdout.write(str(prompt))
    if _input_index < len(_input_lines):
        value = _input_lines[_input_index]
        _input_index += 1
        # Only echo input in interactive mode (not submission mode)
        if not _submission_mode:
            sys.stdout.write(value + '\\n')
        return value
    else:
        raise EOFError('No more input available')

# Replace built-in input function
builtins.input = _custom_input
`);

      // Execute the user code
      pyodide.runPython(sourceCode);
      
      // Get captured output
      stdout = pyodide.runPython('sys.stdout.getvalue()');
      stderr = pyodide.runPython('sys.stderr.getvalue()');

      // Restore stdout/stderr and input
      pyodide.runPython(`
sys.stdout = _stdout_backup
sys.stderr = _stderr_backup
builtins.input = _input_backup
`);

      return {
        token: 'pyodide-execution',
        stdout: stdout || '',
        stderr: stderr || '',
        compile_output: '',
        status: {
          id: 3, // Accepted
          description: 'Accepted'
        },
        time: '0.001',
        memory: 1024
      };

    } catch (error) {

      // Restore stdout/stderr and input in case of error
      try {
        pyodide.runPython(`
sys.stdout = _stdout_backup
sys.stderr = _stderr_backup
builtins.input = _input_backup
`);
      } catch {}

      // Extract actual line number from Pyodide error
      const errorMessage = String(error);
      const cleanedError = this.extractLineNumberFromError(errorMessage);

      return {
        token: 'pyodide-error',
        stdout: '',
        stderr: cleanedError,
        compile_output: '',
        status: {
          id: 6, // Runtime Error
          description: 'Runtime Error'
        },
        time: '0.001',
        memory: 1024
      };
    }
  }

  // Extract actual line number from Pyodide error messages
  private static extractLineNumberFromError(errorMessage: string): string {
    try {
      // Look for line number patterns in Pyodide errors
      // Pattern: 'File "<exec>", line X, in <module>'
      const lineMatch = errorMessage.match(/File "<exec>", line (\d+), in/);
      if (lineMatch) {
        const lineNumber = parseInt(lineMatch[1], 10);
        
        // Extract the actual error type and message
        const errorTypeMatch = errorMessage.match(/(\w+Error: .+)$/m);
        const errorType = errorTypeMatch ? errorTypeMatch[1] : 'Error';
        
        return `Line ${lineNumber}: ${errorType}`;
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

  // Public method to manually reset Pyodide when needed
  static resetPyodide() {
    this.forceReset();
  }

  static interpretStatus(statusId: number): {
    type: 'success' | 'error' | 'timeout' | 'runtime-error' | 'compilation-error';
    message: string;
  } {
    switch (statusId) {
      case 3:
        return { type: 'success', message: 'Accepted' };
      case 4:
        return { type: 'error', message: 'Wrong Answer' };
      case 5:
        return { type: 'timeout', message: 'Time Limit Exceeded' };
      case 6:
        return { type: 'compilation-error', message: 'Compilation Error' };
      case 7:
        return { type: 'runtime-error', message: 'Runtime Error (SIGSEGV)' };
      case 8:
        return { type: 'runtime-error', message: 'Runtime Error (SIGXFSZ)' };
      case 9:
        return { type: 'runtime-error', message: 'Runtime Error (SIGFPE)' };
      case 10:
        return { type: 'runtime-error', message: 'Runtime Error (SIGABRT)' };
      case 11:
        return { type: 'runtime-error', message: 'Runtime Error (NZEC)' };
      case 12:
        return { type: 'runtime-error', message: 'Runtime Error (Other)' };
      case 13:
        return { type: 'error', message: 'Internal Error' };
      case 14:
        return { type: 'error', message: 'Exec Format Error' };
      default:
        return { type: 'error', message: 'Unknown Status' };
    }
  }

  // Helper method for running test cases
  static async runTestCases(
    sourceCode: string,
    testCases: Array<{ input: string; expectedOutput: string }>,
    echoInput: boolean = false,
    prepend: string = '',
    postpend: string = ''
  ): Promise<Array<{
    input: string;
    expectedOutput: string;
    actualOutput?: string;
    passed: boolean;
    error?: string;
    executionTime?: number;
  }>> {
    const results = [];

    for (const testCase of testCases) {
      try {
        // Add timeout wrapper for each test case
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Test execution timeout (15 seconds)')), 15000);
        });

        // Combine prepend + student code + postpend
        const combinedCode = (prepend ? prepend + '\n' : '') + 
                            sourceCode + 
                            (postpend ? '\n' + postpend : '');

        const result = await Promise.race([
          this.executeCode(
            combinedCode,
            testCase.input,
            testCase.expectedOutput,
            10000,
            !echoInput // submission mode - echo based on echoInput parameter
          ),
          timeoutPromise
        ]);

        const status = this.interpretStatus(result.status.id);
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
      } catch (error) {
        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  // Challenge mode methods for persistent execution
  static async initializeChallengeSession(userCode: string): Promise<void> {
    console.log('Initializing challenge session...');
    
    // Reset any existing session
    this.resetChallengeSession();
    
    // Create fresh Pyodide instance
    const pyodide = await this.loadPyodide();
    
    // Execute user's complete code (setup function, global variables, etc.)
    try {
      pyodide.runPython(userCode);
      
      this.challengeContext = {
        pyodideInstance: pyodide,
        sessionActive: true,
        userCode: userCode
      };
      
      console.log('Challenge session initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize challenge session: ${error}`);
    }
  }

  static async executeChallengeFunction(
    functionName: string, 
    args: any[] = []
  ): Promise<any> {
    if (!this.challengeContext?.sessionActive) {
      throw new Error('Challenge session not initialized');
    }

    const pyodide = this.challengeContext.pyodideInstance;
    
    try {
      // Convert arguments to Python format
      const pythonArgs = args.map(arg => 
        typeof arg === 'string' ? `"${arg}"` : String(arg)
      ).join(', ');
      
      // Call the function and get result
      const result = pyodide.runPython(`${functionName}(${pythonArgs})`);
      
      return result;
    } catch (error) {
      throw new Error(`Failed to execute ${functionName}: ${error}`);
    }
  }

  static resetChallengeSession(): void {
    if (this.challengeContext) {
      console.log('Resetting challenge session...');
      this.challengeContext.sessionActive = false;
      this.challengeContext = null;
    }
  }

  static isChallengeSessionActive(): boolean {
    return this.challengeContext?.sessionActive ?? false;
  }
}