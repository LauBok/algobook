// Dynamic import to avoid Next.js bundling issues
type PyodideInterface = any;
type LoadPyodideFunction = (config?: any) => Promise<PyodideInterface>;

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
}

class PyodideService {
  private pyodide: PyodideInterface | null = null;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.pyodide) return;
    
    if (this.isLoading) {
      await this.loadPromise;
      return;
    }

    this.isLoading = true;
    this.loadPromise = this.loadPyodideInstance();
    await this.loadPromise;
    this.isLoading = false;
  }

  private async loadPyodideInstance(): Promise<void> {
    try {
      // Use CDN approach directly to avoid dynamic import issues with Turbopack
      let loadPyodide: LoadPyodideFunction;
      
      if (!(window as any).loadPyodide) {
        console.log('Loading Pyodide from CDN...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout loading Pyodide after 10 seconds'));
          }, 10000); // 10 second timeout
          
          script.onload = () => {
            clearTimeout(timeout);
            console.log('Pyodide v0.25.0 loaded successfully from CDN');
            resolve(undefined);
          };
          script.onerror = (error) => {
            clearTimeout(timeout);
            console.error('Failed to load Pyodide from CDN:', error);
            reject(error);
          };
        });
      }
      
      loadPyodide = (window as unknown as { loadPyodide: unknown }).loadPyodide as LoadPyodideFunction;
      
      if (!loadPyodide) {
        throw new Error('loadPyodide function not available after loading script');
      }
      
      console.log('Initializing Pyodide v0.25.0...');
      try {
        this.pyodide = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
        });
        console.log('Pyodide initialization successful');
      } catch (initError) {
        console.error('Pyodide initialization failed:', initError);
        throw new Error(`Pyodide initialization failed: ${(initError as Error).message}`);
      }
      
      // Set up custom input handling - initialize without the import first
      this.pyodide.runPython(`
import sys
import io
import builtins
import time

# Create a simple blocking input replacement
class InteractiveInput:
    def __init__(self):
        self.prompt_function = None
        self.waiting_for_input = False
        self.input_result = None
    
    def set_prompt_function(self, func):
        self.prompt_function = func
    
    def __call__(self, prompt=""):
        if prompt:
            print(prompt, end="", flush=True)
        if self.prompt_function:
            try:
                # Set up waiting state
                self.waiting_for_input = True
                self.input_result = None
                
                # Call the JavaScript function 
                self.prompt_function(prompt)
                
                # Wait for the result to be set by JavaScript with timeout
                timeout_counter = 0
                max_timeout = 1000  # 100 seconds timeout (1000 * 0.1)
                
                while self.waiting_for_input and self.input_result is None and timeout_counter < max_timeout:
                    time.sleep(0.1)  # Small delay to prevent busy waiting
                    timeout_counter += 1
                
                if timeout_counter >= max_timeout:
                    print("Input timeout - no response from user interface")
                    self.waiting_for_input = False
                    return ""
                
                result = self.input_result or ""
                self.input_result = None
                self.waiting_for_input = False
                
                print(result)  # Echo the input
                return result
            except Exception as e:
                print(f"Input error: {e}")
                self.waiting_for_input = False
                return ""
        else:
            # Fallback
            return ""
    
    def provide_input(self, value):
        """Called from JavaScript to provide the input value"""
        self.input_result = value
        self.waiting_for_input = False

# Create global instance
_interactive_input = InteractiveInput()
builtins.input = _interactive_input
      `);
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
      console.error('Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        windowLoadPyodide: !!(window as any).loadPyodide,
        pyodideInstance: !!this.pyodide
      });
      
      // Provide a more user-friendly error message
      const userError = new Error(
        `Failed to initialize Python interpreter (${(error as Error).message}). Please check your internet connection and try refreshing the page.`
      );
      userError.cause = error;
      throw userError;
    }
  }

  async executeCode(
    code: string, 
    inputHandler: (prompt: string) => Promise<string>
  ): Promise<ExecutionResult> {
    if (!this.pyodide) {
      await this.initialize();
    }

    if (!this.pyodide) {
      return {
        success: false,
        output: '',
        error: 'Failed to initialize Python interpreter'
      };
    }

    try {
      // Set up the input handler through Pyodide globals
      this.pyodide.globals.set("js_prompt_for_input", inputHandler);

      // Set up a simpler synchronous approach using a global variable
      this.pyodide.runPython(`
import sys
import io
from contextlib import redirect_stdout, redirect_stderr

# Simple synchronous input using a polling approach
class SimpleInput:
    def __call__(self, prompt=""):
        if prompt:
            print(prompt, end="", flush=True)
        
        # Set a flag that JavaScript can check
        import js
        js.console.log(f"Python requesting input: {prompt}")
        
        # Start the input process
        js_input_handler(prompt)
        
        # Wait for input to be ready
        import time
        timeout_counter = 0
        max_timeout = 300  # 30 seconds timeout (300 * 0.1)
        
        while not js_check_input_ready() and timeout_counter < max_timeout:
            time.sleep(0.1)
            timeout_counter += 1
        
        if timeout_counter >= max_timeout:
            print("Input timeout - no response from user")
            return ""
        
        # Get the result
        result = js_get_input_result()
        
        print(result)  # Echo the input
        return result

builtins.input = SimpleInput()

_stdout_buffer = io.StringIO()
_stderr_buffer = io.StringIO()
      `);

      // Store the input handler promise for later use
      let currentInputPromise: Promise<string> | null = null;
      let currentInputResult = "";
      
      // Set up a synchronous input handler that uses shared state
      this.pyodide.globals.set("js_input_handler", (prompt: string) => {
        console.log("JavaScript input handler called with prompt:", prompt);
        
        // Start the input process
        currentInputPromise = inputHandler(prompt);
        currentInputResult = "";
        
        currentInputPromise.then((value: string) => {
          currentInputResult = value;
          console.log("Input resolved with value:", value);
        }).catch((error: any) => {
          console.error('Input handler error:', error);
          currentInputResult = "";
        });
        
        // Return a placeholder - the actual waiting will happen in Python
        return "";
      });
      
      // Set up a function to check if input is ready
      this.pyodide.globals.set("js_check_input_ready", () => {
        return currentInputPromise !== null && currentInputResult !== "";
      });
      
      // Set up a function to get the input result
      this.pyodide.globals.set("js_get_input_result", () => {
        const result = currentInputResult;
        currentInputPromise = null;
        currentInputResult = "";
        return result;
      });

      // Execute the user code with output capture
      const result = this.pyodide.runPython(`
result_dict = None
try:
    with redirect_stdout(_stdout_buffer), redirect_stderr(_stderr_buffer):
        exec('''${code.replace(/'/g, "\\'")}''')
    
    stdout_content = _stdout_buffer.getvalue()
    stderr_content = _stderr_buffer.getvalue()
    
    result_dict = {
        'success': True,
        'stdout': stdout_content,
        'stderr': stderr_content
    }
except Exception as e:
    result_dict = {
        'success': False,
        'stdout': _stdout_buffer.getvalue(),
        'stderr': _stderr_buffer.getvalue() + str(e)
    }

result_dict
      `);

      if (!result) {
        return {
          success: false,
          output: '',
          error: 'Python execution returned no result'
        };
      }

      const executionResult = result.toJs({ dict_converter: Object.fromEntries });
      
      if (!executionResult) {
        return {
          success: false,
          output: '',
          error: 'Failed to convert Python result to JavaScript'
        };
      }
      
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
    } finally {
      // Clean up - reset the prompt function
      if (this.pyodide) {
        this.pyodide.runPython(`
if '_interactive_input' in globals():
    _interactive_input.set_prompt_function(None)
        `);
      }
    }
  }

  async executeCodeSync(code: string, inputs: string[] = []): Promise<ExecutionResult> {
    if (!this.pyodide) {
      await this.initialize();
    }

    if (!this.pyodide) {
      return {
        success: false,
        output: '',
        error: 'Failed to initialize Python interpreter'
      };
    }

    try {
      // Set up synchronous input handling with pre-provided inputs
      // const inputIndex = 0; // Reserved for input handling
      this.pyodide.runPython(`
import sys
import io

class SyncInput:
    def __init__(self, inputs):
        self.inputs = inputs
        self.index = 0
    
    def __call__(self, prompt=""):
        if prompt:
            print(prompt, end="", flush=True)
        if self.index < len(self.inputs):
            result = self.inputs[self.index]
            self.index += 1
            print(result)  # Echo the input
            return result
        else:
            raise EOFError("No more inputs available")

# Set up inputs
inputs = ${JSON.stringify(inputs)}
import builtins
builtins.input = SyncInput(inputs)
      `);

      // Execute the code
      const result = this.pyodide.runPython(`
import sys
import io
from contextlib import redirect_stdout, redirect_stderr

_stdout_buffer = io.StringIO()
_stderr_buffer = io.StringIO()

result_dict = None
try:
    with redirect_stdout(_stdout_buffer), redirect_stderr(_stderr_buffer):
        exec('''${code.replace(/'/g, "\\'")}''')
    
    stdout_content = _stdout_buffer.getvalue()
    stderr_content = _stderr_buffer.getvalue()
    
    result_dict = {
        'success': True,
        'stdout': stdout_content,
        'stderr': stderr_content
    }
except Exception as e:
    result_dict = {
        'success': False,
        'stdout': _stdout_buffer.getvalue(),
        'stderr': _stderr_buffer.getvalue() + str(e)
    }

result_dict
      `);

      if (!result) {
        return {
          success: false,
          output: '',
          error: 'Python execution returned no result'
        };
      }

      const executionResult = result.toJs({ dict_converter: Object.fromEntries });
      
      if (!executionResult) {
        return {
          success: false,
          output: '',
          error: 'Failed to convert Python result to JavaScript'
        };
      }
      
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
    return this.pyodide !== null && !this.isLoading;
  }
}

export const PyodideRunner = new PyodideService();