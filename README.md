# AlgoBook: Algorithms and Data Structures Tutorial

A comprehensive interactive tutorial book covering fundamental algorithms and data structures with practical examples and exercises.

## Technical Architecture

### Dual Format Strategy
- **Online Version**: Interactive web application with live code execution, quizzes, and progress tracking
- **PDF Version**: Clean static version generated from the same source content

### Technology Stack
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Code Execution**: Judge0 API for running Python code
- **Progress Tracking**: Local storage with granular reset options
- **Content Format**: Markdown with custom interactive elements

### Interactive Features

#### 1. Runnable Code Snippets
- Embedded Monaco Editor for Python code
- Real-time execution via Judge0 API
- Syntax highlighting and error detection
- Multiple example variations per concept

#### 2. Multiple Choice Questions
- Immediate feedback on answers
- Detailed explanations for correct/incorrect choices
- Progress tracking per quiz section
- Randomized question order option

#### 3. Coding Exercises with Judge System
- Built-in code editor with Python support
- Automated test case validation via Judge0
- Hints system for struggling students
- Custom checker programs for complex problems
- Solution walkthroughs after completion

#### 4. Progress Management
- **Granular Reset Options**:
  - Reset individual chapters
  - Reset by exercise type (quizzes vs coding)
  - Reset specific sections within chapters
  - Complete progress wipe with confirmation
- **Progress Visualization**:
  - Chapter completion indicators
  - Exercise attempt history
  - Time spent per section
  - Success rate statistics

### Project Structure
```
AlgoBook/
├── README.md                 # This file
├── algobook-web/            # Next.js web application
├── content/                 # Markdown content source
│   ├── chapters/
│   │   ├── 01-introduction/
│   │   │   ├── content.md
│   │   │   ├── examples/
│   │   │   │   └── python/
│   │   │   └── exercises/
│   │   │       ├── problems.json
│   │   │       └── solutions/
│   │   └── ...
│   └── assets/             # Images, diagrams
└── scripts/                # Build and deployment scripts
```

## Integrated Curriculum Structure

**📚 See detailed curriculum: [INTEGRATED_CURRICULUM.md](./INTEGRATED_CURRICULUM.md)**

### Part I: Programming Foundations & Simple Algorithms
*Basic Python + algorithms you can do with built-in types*
- Chapter 1: Getting Started with Problem Solving
- Chapter 2: Logic and Control Flow
- Chapter 3: Loops and Iteration
- Chapter 4: Lists and Basic Algorithms
- Chapter 5: Functions and Code Organization

### Part II: Efficient Algorithms & Complexity
*Algorithm analysis + advanced Python features*
- Chapter 6: Algorithm Efficiency and Big O
- Chapter 7: Better Sorting and Searching
- Chapter 8: Strings and Text Processing
- Chapter 9: Recursion and Mathematical Thinking

### Part III: Data Structures as Tools
*Learn data structures when you need them to solve problems*
- Chapter 10: Dictionaries and Hash-Based Solutions
- Chapter 11: Stacks: Last In, First Out
- Chapter 12: Queues: First In, First Out
- Chapter 13: Object-Oriented Programming for Data Structures
- Chapter 14: Linked Lists: Dynamic Memory Management

### Part IV: Trees and Hierarchical Thinking
*When flat structures aren't enough*
- Chapter 15: Trees: Hierarchical Data
- Chapter 16: Binary Search Trees: Efficient Searching
- Chapter 17: Heaps and Priority Queues

### Part V: Graph Theory and Network Algorithms
*Modeling complex relationships*
- Chapter 18: Graphs: Modeling Relationships
- Chapter 19: Graph Traversal and Search
- Chapter 20: Shortest Paths and Network Analysis

### Part VI: Advanced Problem-Solving Patterns
*Powerful algorithmic techniques*
- Chapter 21: Dynamic Programming: Optimal Solutions
- Chapter 22: Greedy Algorithms: Local Optimal Choices
- Chapter 23: Backtracking: Systematic Search

### Part VII: Specialized Applications
*Domain-specific algorithms and advanced topics*
- Chapter 24: String Algorithms and Text Processing
- Chapter 25: Computational Geometry
- Chapter 26: Number Theory and Cryptography

## Development Roadmap

### Phase 1: Core Infrastructure
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up basic project structure
- [ ] Configure Judge0 API integration
- [ ] Create chapter template system
- [ ] Implement progress tracking with local storage

### Phase 2: Interactive Components
- [ ] Build code editor component with Monaco
- [ ] Create multiple choice question component
- [ ] Implement coding exercise judge interface
- [ ] Add progress visualization dashboard
- [ ] Create granular reset functionality

### Phase 3: Content Creation
- [ ] Write foundational chapters (1-3)
- [ ] Create interactive examples for basic data structures
- [ ] Develop coding exercises with test cases
- [ ] Add visual diagrams and animations

### Phase 4: Advanced Features
- [ ] Custom checker programs for complex problems
- [ ] Hint system implementation
- [ ] Solution walkthrough videos/explanations
- [ ] Export to PDF functionality

### Phase 5: Polish & Deploy
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] SEO optimization
- [ ] Deployment and hosting setup

## Getting Started
Each chapter will be self-contained and include:
- Theoretical concepts with interactive examples
- Hands-on coding exercises with immediate feedback
- Multiple choice questions for concept reinforcement
- Real-world applications and use cases
- Performance analysis and optimization insights