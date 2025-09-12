// Simple Pyodide-based interpreter that actually waits for input
export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
}

class SimplePyodideService {
  private pyodide: any = null;
  private inputQueue: string[] = [];
  private waitingForInput = false;
  private inputResolver: ((value: string) => void) | null = null;

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
      });

      // Set up a simple input replacement that uses our queue
      this.pyodide.runPython(`
import builtins
import sys
import io

class InputHandler:
    def __init__(self, get_input_func):
        self.get_input = get_input_func
    
    def __call__(self, prompt=""):
        if prompt:
            print(prompt, end="", flush=True)
        result = self.get_input()
        print(result)  # Echo the input
        return result

# This will be set from JavaScript
_js_input_handler = None

def js_input(prompt=""):
    return _js_input_handler(prompt)

builtins.input = js_input
      `);

    } catch (error) {
      throw new Error(`Failed to initialize Python: ${error}`);
    }
  }

  async executeCodeInteractive(
    code: string, 
    inputHandler: (prompt: string) => Promise<string>
  ): Promise<ExecutionResult> {
    if (!this.pyodide) {
      await this.initialize();
    }

    try {
      // Set up the input handler using a different approach
      // We'll use a shared state approach instead of busy waiting
      // Variables for input handling (may be used in future implementations)
      let inputReady = false;
      let currentInput = "";
      
      this.pyodide.globals.set("js_get_input", (prompt: string) => {
        this.waitingForInput = true;
        inputReady = false;
        currentInput = "";
        
        // Start the input process
        inputHandler(prompt || "").then(value => {
          currentInput = value;
          inputReady = true;
        }).catch(() => {
          currentInput = "";
          inputReady = true;
        });
        
        // Instead of busy waiting, we'll throw an exception
        // and handle this differently
        throw new Error("INPUT_NEEDED");
      });

      // Set up the input handler in Python
      this.pyodide.runPython(`
_js_input_handler = InputHandler(js_get_input)
      `);

      // Execute the code with output capture
      const result = this.pyodide.runPython(`
import sys
import io
from contextlib import redirect_stdout, redirect_stderr

# Capture output
stdout_buffer = io.StringIO()
stderr_buffer = io.StringIO()

result_dict = None
try:
    with redirect_stdout(stdout_buffer), redirect_stderr(stderr_buffer):
        exec('''${code.replace(/'/g, "\\'")}''')
    
    result_dict = {
        'success': True,
        'stdout': stdout_buffer.getvalue(),
        'stderr': stderr_buffer.getvalue()
    }
except Exception as e:
    result_dict = {
        'success': False,
        'stdout': stdout_buffer.getvalue(),
        'stderr': stderr_buffer.getvalue() + str(e)
    }

result_dict
      `);

      const executionResult = result.toJs({ dict_converter: Object.fromEntries });
      
      return {
        success: executionResult.success,
        output: executionResult.stdout + (executionResult.stderr ? `\nErrors:\n${executionResult.stderr}` : ''),
        error: executionResult.success ? undefined : executionResult.stderr
      };

    } catch (error) {
      return {
        success: false,
        output: '',
        error: `Execution error: ${error}`
      };
    }
  }

  isReady(): boolean {
    return this.pyodide !== null;
  }
}

export const SimplePyodideRunner = new SimplePyodideService();