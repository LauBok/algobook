# AlgoBook Content Creation Guide

This guide explains all the tools and features available to content creators when writing educational content for AlgoBook.

## File Structure

Content is organized in the following structure:
```
algobook-web/content/chapters/
├── 01-getting-started/
│   └── sections/
│       ├── 1.1.md
│       ├── 1.2.md
│       └── ...
├── 02-conditionals-logic/
│   └── sections/
│       ├── 2.1.md
│       └── ...
└── ...
```

Each section is a single markdown file that gets rendered as a complete learning page.

## Available Content Tools

### 1. Regular Markdown

Standard markdown syntax is fully supported:

```markdown
# Headers (H1-H6)
**Bold text** and *italic text*
- Bullet points
- Numbered lists

`Inline code` and regular paragraphs.

> Block quotes for emphasis

[Links](https://example.com) and images work normally.
```

### 2. Interactive Code Playgrounds

Use `python-execute` blocks to create interactive code editors that students can modify and run:

````markdown
```python-execute
# Students can edit and run this code
name = "Alice"
age = 25
print(f"Hello, {name}! You are {age} years old.")
```
````

**Features:**
- Live Python code execution
- Editable by students
- Automatic hints generation based on code content
- Shows output when executed
- Syntax highlighting and error reporting

### 3. Inline Quizzes

Add multiple choice questions anywhere in your content using YAML format:

````markdown
```quiz
id: variable-basics
question: What does the equals sign (=) mean in Python?
options:
  - id: a
    text: It checks if two values are equal
    correct: false
    explanation: That's what == does. The single = is for assignment.
  - id: b
    text: It assigns the value on the right to the variable on the left
    correct: true
    explanation: Correct! The = operator assigns values to variables.
  - id: c
    text: It creates a new variable type
    correct: false
    explanation: Python determines variable types automatically.
```
````

**Multiple Questions in One Quiz:**
````markdown
```quiz
id: data-types-quiz
questions:
  - id: q1
    question: Which of these is a string?
    options:
      - id: a
        text: 42
        correct: false
      - id: b
        text: "Hello"
        correct: true
    explanation: Strings are text enclosed in quotes.
  - id: q2
    question: What type is 3.14?
    options:
      - id: a
        text: Integer
        correct: false
      - id: b
        text: Float
        correct: true
    explanation: Numbers with decimals are floats.
```
````

**Quiz Features:**
- Immediate feedback with explanations
- Single or multiple questions per quiz block
- Renders inline exactly where placed in content
- Automatic progress tracking
- Visual feedback for correct/incorrect answers

**Important YAML Guidelines:**
- Always wrap question text in quotes when it contains backticks: `question: "What does `True` mean?"`
- Always wrap option text in quotes when it contains special characters: `text: "`age == 18`"`
- This ensures proper parsing and inline code rendering in quiz components

### 4. Callout Blocks

Create visually distinct boxes to highlight important information:

#### Note (Blue box with 💡 icon)
````markdown
```note title="Understanding Data Types"
Python automatically figures out what type of data you're storing, but it's important to understand the different types to avoid confusion later.
```
````

#### Hint (Green box with 🔍 icon)
````markdown
```hint title="Pro Tip: Meaningful Names"
Always choose variable names that clearly describe what they store. Future you (and your teammates) will thank you! Instead of `x = 85`, use `test_grade = 85`.
```
````

#### Warning (Yellow box with ⚠️ icon)
````markdown
```warning
Don't forget the quotes around text! Without quotes, Python thinks you're referring to a variable name. `name = Sarah` will cause an error, but `name = "Sarah"` works perfectly.
```
````

#### Danger (Red box with 🚨 icon)
````markdown
```danger title="Common Mistake"
If you forget to convert text to a number with `int()`, you might get unexpected results. `"5" + "3"` gives you `"53"` (text joining), not `8` (math)!
```
````

**Callout Features:**
- Optional custom titles (if omitted, uses capitalized type name)
- Supports markdown content inside callouts
- Color-coded for different importance levels
- Can be placed anywhere in content

### 5. Coding Exercises

Create auto-graded programming exercises with test cases:

````markdown
```exercise
id: sum-calculator
title: Calculate Sum
description: Write a function that takes two numbers and returns their sum.
difficulty: easy
starterCode: |
  def calculate_sum(a, b):
      # Your code here
      pass
testCases:
  - input: "3, 5"
    expectedOutput: "8"
  - input: "10, -2"
    expectedOutput: "8"
  - input: "0, 0"
    expectedOutput: "0"
    hidden: true
hints:
  - "Remember to use the + operator"
  - "Make sure to return the result, not print it"
solution: |
  def calculate_sum(a, b):
      return a + b
```
````

**Exercise Features:**
- Auto-graded with test cases
- Hidden test cases for comprehensive validation
- Starter code to guide students
- Progressive hints system
- Complete solution for reference
- Difficulty indicators (easy, medium, hard)
- Input echo control for flexible testing
- Code injection for setup and validation

#### Advanced Exercise Metadata

**Input Echo Control (`echoInput`)**

Control whether user input values are echoed in the output during testing:

````markdown
```exercise
id: my-exercise
title: My Exercise
echoInput: true    # Default: false
# ... rest of exercise
testCases:
  - input: "5\n"
    expectedOutput: "Enter number: 5\nResult: 25"  # Input "5" included
```
````

- `echoInput: true` - Input values appear in output (good for interactive-style exercises)
- `echoInput: false` - Only explicit print statements appear (good for pure logic testing)

**Code Injection (`prepend` and `postpend`)**

Add hidden setup or validation code that students can't see:

````markdown
```exercise
id: validation-exercise
title: Exercise with Hidden Validation
prepend: |
  # Setup code (hidden from students)
  import math
  def validate_result(x):
      return x > 0
postpend: |
  # Validation code (hidden from students)
  if 'result' in locals():
      assert validate_result(result), "Result must be positive"
starterCode: |
  # Student sees only this code
  result = int(input())
  print(f"Result: {result}")
```
````

**Use Cases:**
- `prepend`: Import libraries, define helper functions, set up test data
- `postpend`: Validate student results, check constraints, run additional tests

**Execution Order:**
```
[prepend code]
[student's code]
[postpend code]
```

Students only see and edit the `starterCode`, but the full combined code runs during testing.

### 6. Interactive Plots and Visualizations

Create interactive charts and graphs to help visualize data and concepts:

#### Line Plot
````markdown
```plot
type: line
title: Algorithm Performance Comparison
data:
  - name: "Linear Search"
    x: [10, 100, 1000, 10000]
    y: [0.001, 0.01, 0.1, 1.0]
  - name: "Binary Search" 
    x: [10, 100, 1000, 10000]
    y: [0.0001, 0.0003, 0.0004, 0.0005]
options:
  xLabel: "Input Size"
  yLabel: "Time (seconds)"
  interactive: true
```
````

#### Bar Chart
````markdown
```plot
type: bar
title: Memory Usage by Data Structure
data:
  - name: "Memory Usage"
    x: ["Array", "Linked List", "Hash Table", "Binary Tree"]
    y: [100, 150, 200, 300]
options:
  xLabel: "Data Structure"
  yLabel: "Memory (MB)"
```
````

#### Scatter Plot
````markdown
```plot
type: scatter
title: Performance vs Complexity
data:
  - name: "Algorithms"
    x: [1, 2, 3, 4, 5]
    y: [10, 25, 50, 100, 200]
options:
  xLabel: "Complexity Level"
  yLabel: "Execution Time (ms)"
```
````

**Plot Features:**
- Multiple chart types: line, bar, scatter, histogram, pie, heatmap
- Interactive zoom, pan, and hover tooltips
- Customizable axes labels and titles
- Support for multiple data series
- Responsive design for all screen sizes

### 7. Data Tables

Display structured data with sorting and searching capabilities:

````markdown
```table
title: Programming Languages Comparison
headers: ["Language", "Type System", "Memory Management", "Performance"]
rows:
  - ["Python", "Dynamic", "Garbage Collection", "Medium"]
  - ["C++", "Static", "Manual", "High"]
  - ["Java", "Static", "Garbage Collection", "High"]
  - ["JavaScript", "Dynamic", "Garbage Collection", "Medium"]
caption: Comparison of popular programming languages
sortable: true
searchable: true
```
````

**Table Features:**
- Click column headers to sort data
- Search/filter functionality across all columns
- Responsive design for mobile devices
- Optional captions and titles
- Automatic data type detection for sorting (numbers vs text)

## Content Structure Best Practices

### Section Organization
Each section should follow this general structure:

```markdown
# Section Title

Brief introduction explaining what students will learn.

## Learning Objectives
- Objective 1
- Objective 2
- Objective 3

## Core Concept 1

Explanation with examples...

```python-execute
# Interactive example
example_code = "here"
```

```note
Important information to remember
```

## Core Concept 2

More explanation...

```quiz
id: concept-check
question: Quick understanding check?
# ... quiz options
```

## Practice

```exercise
id: practice-exercise
title: Apply What You Learned
# ... exercise definition
```

## Key Takeaways

- Summary point 1
- Summary point 2
- Summary point 3
```

### Writing Tips

1. **Start with Motivation**: Explain why the concept matters
2. **Use Progressive Disclosure**: Introduce simple concepts before complex ones
3. **Include Interactive Elements**: Mix theory with hands-on practice
4. **Provide Immediate Feedback**: Use quizzes to check understanding
5. **Connect to Real Problems**: Show practical applications
6. **Use Callouts Strategically**: Highlight common pitfalls and pro tips

### Content Guidelines

- **Keep code examples focused**: Each example should illustrate one concept clearly
- **Use meaningful variable names**: Help students develop good habits
- **Include common mistakes**: Use danger callouts to prevent frustration
- **Provide multiple practice opportunities**: Combine playgrounds and exercises
- **Test your content**: Ensure all code examples work and quizzes are clear

## Technical Notes

- All content is processed server-side at build time
- Interactive elements are rendered inline where placed
- Quizzes and exercises support progress tracking
- Code execution uses Judge0 CE API (Python 3.8.1)
- Content supports GitHub Flavored Markdown with math (KaTeX)

## File Naming Convention

- Chapter folders: `01-chapter-name`, `02-chapter-name`, etc.
- Section files: `1.1.md`, `1.2.md`, `2.1.md`, etc.
- Use kebab-case for chapter folder names
- Use decimal notation for section file names

This system provides a rich, interactive learning experience while keeping content creation straightforward with familiar markdown syntax.