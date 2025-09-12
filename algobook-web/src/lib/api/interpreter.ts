// Simple Python interpreter for interactive execution
export interface InterpreterResult {
  success: boolean;
  output: string;
  error?: string;
  waitingForInput?: boolean;
  inputPrompt?: string;
}

export class PythonInterpreter {
  private variables: Map<string, any> = new Map();
  private output: string[] = [];
  private currentLine = 0;
  private lines: string[] = [];
  private waitingForInput = false;
  private inputPrompt = '';
  private inputCallback: ((value: string) => void) | null = null;

  constructor() {
    this.initializeBuiltins();
  }

  private initializeBuiltins() {
    // Initialize built-in functions
    this.variables.set('print', (...args: any[]) => {
      const output = args.map(arg => this.stringify(arg)).join(' ');
      this.output.push(output);
      return undefined;
    });

    this.variables.set('input', (prompt = '') => {
      if (prompt) {
        this.output.push(prompt);
      }
      this.waitingForInput = true;
      this.inputPrompt = prompt;
      throw new InputRequiredException(prompt);
    });

    this.variables.set('len', (obj: any) => {
      if (typeof obj === 'string' || Array.isArray(obj)) {
        return obj.length;
      }
      throw new Error('object has no len()');
    });

    this.variables.set('str', (obj: any) => String(obj));
    this.variables.set('int', (obj: any) => {
      const num = parseInt(obj);
      if (isNaN(num)) throw new Error(`invalid literal for int(): '${obj}'`);
      return num;
    });
    this.variables.set('float', (obj: any) => {
      const num = parseFloat(obj);
      if (isNaN(num)) throw new Error(`could not convert string to float: '${obj}'`);
      return num;
    });
  }

  private stringify(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'boolean') return value ? 'True' : 'False';
    return String(value);
  }

  async executeCode(code: string, inputHandler?: (prompt: string) => Promise<string>): Promise<InterpreterResult> {
    this.lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    this.currentLine = 0;
    this.output = [];
    this.waitingForInput = false;

    try {
      while (this.currentLine < this.lines.length) {
        await this.executeLine(this.lines[this.currentLine], inputHandler);
        this.currentLine++;
      }

      return {
        success: true,
        output: this.output.join('\n'),
      };
    } catch (error) {
      if (error instanceof InputRequiredException) {
        return {
          success: true,
          output: this.output.join('\n'),
          waitingForInput: true,
          inputPrompt: error.prompt,
        };
      }

      return {
        success: false,
        output: this.output.join('\n'),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async continueWithInput(input: string, inputHandler?: (prompt: string) => Promise<string>): Promise<InterpreterResult> {
    if (!this.waitingForInput) {
      throw new Error('Not waiting for input');
    }

    // Echo the input
    this.output.push(input);
    
    // Store the input value and continue execution
    this.waitingForInput = false;
    
    try {
      // Replace the input() call with the actual value and re-execute the line
      const currentLineCode = this.lines[this.currentLine];
      const modifiedLine = this.replaceInputCall(currentLineCode, input);
      
      await this.executeLine(modifiedLine, inputHandler);
      this.currentLine++;

      // Continue with remaining lines
      while (this.currentLine < this.lines.length) {
        await this.executeLine(this.lines[this.currentLine], inputHandler);
        this.currentLine++;
      }

      return {
        success: true,
        output: this.output.join('\n'),
      };
    } catch (error) {
      if (error instanceof InputRequiredException) {
        return {
          success: true,
          output: this.output.join('\n'),
          waitingForInput: true,
          inputPrompt: error.prompt,
        };
      }

      return {
        success: false,
        output: this.output.join('\n'),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private replaceInputCall(line: string, inputValue: string): string {
    // Simple regex to replace input() calls with the actual value
    return line.replace(/input\([^)]*\)/g, `"${inputValue}"`);
  }

  private async executeLine(line: string, inputHandler?: (prompt: string) => Promise<string>): Promise<void> {
    if (!line.trim()) return;

    // Handle assignments
    if (line.includes('=') && !this.isComparison(line)) {
      this.handleAssignment(line);
      return;
    }

    // Handle print statements and other expressions
    if (line.startsWith('print(')) {
      this.handlePrint(line);
      return;
    }

    // Handle input statements
    if (line.includes('input(')) {
      await this.handleInput(line, inputHandler);
      return;
    }

    // Handle other expressions
    try {
      const result = this.evaluateExpression(line);
      if (result !== undefined && result !== null) {
        this.output.push(this.stringify(result));
      }
    } catch (error) {
      throw error;
    }
  }

  private isComparison(line: string): boolean {
    const operators = ['==', '!=', '<', '>', '<=', '>='];
    return operators.some(op => line.includes(op));
  }

  private handleAssignment(line: string): void {
    const parts = line.split('=');
    if (parts.length !== 2) {
      throw new Error(`Invalid assignment: ${line}`);
    }

    const varName = parts[0].trim();
    const expression = parts[1].trim();
    
    try {
      const value = this.evaluateExpression(expression);
      this.variables.set(varName, value);
    } catch (error) {
      // Re-throw with more context
      throw new Error(`Error in assignment "${line}": ${error instanceof Error ? error.message : error}`);
    }
  }

  private handlePrint(line: string): void {
    const match = line.match(/print\((.*)\)/);
    if (!match) throw new Error(`Invalid print statement: ${line}`);
    
    const args = this.parseArguments(match[1]);
    const values = args.map(arg => this.evaluateExpression(arg));
    const output = values.map(val => this.stringify(val)).join(' ');
    this.output.push(output);
  }

  private async handleInput(line: string, inputHandler?: (prompt: string) => Promise<string>): Promise<void> {
    const match = line.match(/(\w+)\s*=\s*input\(([^)]*)\)/);
    if (!match) {
      throw new Error(`Invalid input statement: ${line}`);
    }

    const varName = match[1];
    const promptExpression = match[2].trim();
    const prompt = promptExpression ? this.evaluateExpression(promptExpression) : '';

    if (inputHandler) {
      const inputValue = await inputHandler(prompt);
      this.output.push(prompt + inputValue); // Echo
      this.variables.set(varName, inputValue);
    } else {
      throw new InputRequiredException(prompt);
    }
  }

  private evaluateExpression(expr: string): any {
    expr = expr.trim();

    // Handle string literals
    if ((expr.startsWith('"') && expr.endsWith('"')) || 
        (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.slice(1, -1);
    }

    // Handle number literals
    if (/^\d+$/.test(expr)) {
      return parseInt(expr);
    }
    if (/^\d*\.\d+$/.test(expr)) {
      return parseFloat(expr);
    }

    // Handle function calls - check this BEFORE checking variables
    if (expr.includes('(') && expr.includes(')')) {
      return this.evaluateFunctionCall(expr);
    }

    // Handle variables
    if (this.variables.has(expr)) {
      return this.variables.get(expr);
    }

    // Handle basic arithmetic
    if (/[\+\-\*\/]/.test(expr)) {
      return this.evaluateArithmetic(expr);
    }

    // Handle f-strings (basic support)
    if (expr.startsWith('f"') || expr.startsWith("f'")) {
      return this.evaluateFString(expr);
    }

    // If it's a simple identifier that we don't know, check if it might be a function call
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expr)) {
      throw new Error(`NameError: name '${expr}' is not defined`);
    }

    throw new Error(`Unknown expression: ${expr}`);
  }

  private evaluateFunctionCall(expr: string): any {
    const match = expr.match(/(\w+)\((.*)\)/);
    if (!match) throw new Error(`Invalid function call: ${expr}`);

    const funcName = match[1];
    const argsStr = match[2];
    
    // Debug log
    console.log(`Function call detected: ${funcName}(${argsStr})`);
    console.log(`Available functions:`, Array.from(this.variables.keys()));
    
    if (!this.variables.has(funcName)) {
      throw new Error(`NameError: name '${funcName}' is not defined`);
    }

    const func = this.variables.get(funcName);
    if (typeof func !== 'function') {
      throw new Error(`'${funcName}' object is not callable`);
    }

    const args = argsStr ? this.parseArguments(argsStr) : [];
    const values = args.map(arg => this.evaluateExpression(arg));
    
    return func(...values);
  }

  private evaluateArithmetic(expr: string): number {
    // Very basic arithmetic evaluation
    try {
      // Replace variables with their values
      let processed = expr;
      for (const [name, value] of this.variables) {
        if (typeof value === 'number') {
          processed = processed.replace(new RegExp(`\\b${name}\\b`, 'g'), String(value));
        }
      }
      
      // Use Function constructor for safe evaluation
      return new Function('return ' + processed)();
    } catch {
      throw new Error(`Invalid arithmetic expression: ${expr}`);
    }
  }

  private evaluateFString(expr: string): string {
    // Basic f-string support
    const content = expr.slice(2, -1); // Remove f" and "
    return content.replace(/{([^}]+)}/g, (match, variable) => {
      const value = this.variables.get(variable.trim());
      return this.stringify(value);
    });
  }

  private parseArguments(argsStr: string): string[] {
    if (!argsStr.trim()) return [];
    
    const args: string[] = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let parenLevel = 0;

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];
      
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
        current += char;
      } else if (inString && char === stringChar) {
        inString = false;
        current += char;
      } else if (!inString && char === '(') {
        parenLevel++;
        current += char;
      } else if (!inString && char === ')') {
        parenLevel--;
        current += char;
      } else if (!inString && char === ',' && parenLevel === 0) {
        args.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      args.push(current.trim());
    }
    
    return args;
  }

  reset(): void {
    this.variables.clear();
    this.output = [];
    this.currentLine = 0;
    this.lines = [];
    this.waitingForInput = false;
    
    // Reinitialize built-in functions after clearing
    this.initializeBuiltins();
  }
}

class InputRequiredException extends Error {
  constructor(public prompt: string) {
    super('Input required');
  }
}