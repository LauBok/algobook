export interface ChapterMetadata {
  id: string;
  title: string;
  order: number;
  part: number;
  partTitle: string;
  description: string;
  sections: SectionMetadata[];
  learningObjectives: string[];
}

export interface SectionMetadata {
  id: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  description: string;
}

export const CHAPTER_METADATA: Record<string, ChapterMetadata> = {
  '01-getting-started': {
    id: '01-getting-started',
    title: 'Getting Started with Problem Solving',
    order: 1,
    part: 1,
    partTitle: 'Programming Foundations & Simple Algorithms',
    description: 'Learn to solve problems step by step while mastering Python basics',
    sections: [
      {
        id: '1.1',
        title: 'What is an Algorithm? Pure Problem-Solving Concepts',
        order: 1,
        estimatedMinutes: 15,
        description: 'Learn how to break down problems into step-by-step solutions before writing any code.'
      },
      {
        id: '1.2',
        title: 'Python Basics: Your First Code',
        order: 2,
        estimatedMinutes: 30,
        description: 'Write your first Python program and learn variables, input/output, and basic syntax.'
      },
      {
        id: '1.3',
        title: 'Building Complete Programs',
        order: 3,
        estimatedMinutes: 50,
        description: 'Combine problem-solving techniques with Python skills to create complete, working programs.'
      },
      {
        id: '1.4',
        title: 'Practice and Chapter Review',
        order: 4,
        estimatedMinutes: 60,
        description: 'Apply everything you\'ve learned through hands-on challenges and reinforce key concepts.'
      }
    ],
    learningObjectives: [
      'Write your first Python program to solve a real problem',
      'Understand the basic structure of an algorithm',
      'Use variables and input/output in Python',
      'Test and debug simple solutions',
      'Feel confident approaching programming challenges'
    ]
  },

  '02-logic-control-flow': {
    id: '02-logic-control-flow',
    title: 'Logic and Control Flow',
    order: 2,
    part: 1,
    partTitle: 'Programming Foundations & Simple Algorithms',
    description: 'Master decision-making in programs using Boolean logic and conditional statements',
    sections: [
      {
        id: '2.1',
        title: 'Boolean Logic: True, False, and Comparisons',
        order: 1,
        estimatedMinutes: 40,
        description: 'Learn to work with True/False values and comparison operators to create logical expressions.'
      },
      {
        id: '2.2',
        title: 'Making Decisions with If Statements',
        order: 2,
        estimatedMinutes: 45,
        description: 'Control program flow with if and else statements to make your programs intelligent.'
      },
      {
        id: '2.3',
        title: 'Multiple Choices and Complex Decisions',
        order: 3,
        estimatedMinutes: 50,
        description: 'Master elif chains for multiple choices and avoid messy nested if statements.'
      },
      {
        id: '2.4',
        title: 'Practice and Review: Decision-Based Problem Solving',
        order: 4,
        estimatedMinutes: 60,
        description: 'Apply everything you\'ve learned through hands-on challenges and problem-solving exercises.'
      }
    ],
    learningObjectives: [
      'Create and evaluate Boolean expressions using comparison operators',
      'Combine logical conditions with and, or, and not operators',
      'Control program flow using if, elif, and else statements',
      'Build complex decision-making systems for real-world problems',
      'Validate user input and handle unexpected data gracefully'
    ]
  },

  '03-loops-iteration': {
    id: '03-loops-iteration',
    title: 'Loops and Iteration',
    order: 3,
    part: 1,
    partTitle: 'Programming Foundations & Simple Algorithms',
    description: 'Automate repetitive tasks and process collections of data with for loops, while loops, and iteration patterns',
    sections: [
      {
        id: '3.1',
        title: 'The Power of Repetition',
        order: 1,
        estimatedMinutes: 25,
        description: 'Discover why repetition is essential in programming and see the motivation for loops.'
      },
      {
        id: '3.2',
        title: 'For Loops and Range',
        order: 2,
        estimatedMinutes: 35,
        description: 'Master for loops using the range() function to repeat actions efficiently.'
      },
      {
        id: '3.3',
        title: 'While Loops and Conditions',
        order: 3,
        estimatedMinutes: 30,
        description: 'Learn when to use while loops for condition-based repetition and user input.'
      },
      {
        id: '3.4',
        title: 'Practice and Review: Building with Loops',
        order: 4,
        estimatedMinutes: 35,
        description: 'Combine for loops and while loops to solve complex problems and master iteration.'
      }
    ],
    learningObjectives: [
      'Write for loops with appropriate range() parameters for counting and iteration',
      'Create while loops with proper termination conditions for conditional repetition',
      'Use nested loops to generate patterns and process multi-dimensional data',
      'Apply break and continue for sophisticated loop control flow',
      'Choose the most appropriate loop type for different programming problems',
      'Debug loop logic and avoid common pitfalls like infinite loops'
    ]
  },

  '04-lists-algorithms': {
    id: '04-lists-algorithms',
    title: 'Lists and Basic Algorithms',
    order: 4,
    part: 1,
    partTitle: 'Programming Foundations & Simple Algorithms',
    description: 'Learn to work with collections of data using lists and implement fundamental algorithms for searching and sorting',
    sections: [
      {
        id: '4.1',
        title: 'Introduction to Lists',
        order: 1,
        estimatedMinutes: 45,
        description: 'Discover why lists are essential for managing collections of data and master list basics.'
      },
      {
        id: '4.2',
        title: 'List Operations and Methods',
        order: 2,
        estimatedMinutes: 50,
        description: 'Learn essential list methods for adding, removing, sorting, and organizing data efficiently.'
      },
      {
        id: '4.3',
        title: 'Processing Lists with Loops',
        order: 3,
        estimatedMinutes: 55,
        description: 'Combine lists with loops to filter, transform, and analyze data collections.'
      },
      {
        id: '4.4',
        title: 'Basic Algorithms on Lists',
        order: 4,
        estimatedMinutes: 60,
        description: 'Implement fundamental algorithms like linear search and basic sorting from scratch.'
      },
      {
        id: '4.5',
        title: 'Insertion Sort and Algorithm Correctness',
        order: 5,
        estimatedMinutes: 50,
        description: 'Learn insertion sort and understand how to prove algorithms work correctly using loop invariants.'
      },
      {
        id: '4.6',
        title: 'Practice: List Algorithms and Data Processing',
        order: 6,
        estimatedMinutes: 30,
        description: 'Master list processing and algorithms with comprehensive coding challenges.'
      }
    ],
    learningObjectives: [
      'Create and manipulate lists using various initialization methods and indexing',
      'Apply essential list methods like append(), remove(), sort(), and slicing for data management',
      'Process lists efficiently using loops for filtering, transforming, and analyzing data',
      'Implement fundamental search algorithms like linear search from scratch',
      'Build basic sorting algorithms including bubble sort and insertion sort',
      'Understand why algorithm correctness matters and learn to prove algorithms work',
      'Apply loop invariants to verify that sorting algorithms produce correct results',
      'Compare different sorting algorithms and understand their trade-offs',
      'Combine multiple algorithms to solve complex data processing problems'
    ]
  },

  '05-functions': {
    id: '05-functions',
    title: 'Functions and Code Organization',
    order: 5,
    part: 1,
    partTitle: 'Programming Foundations & Simple Algorithms',
    description: 'Master the art of code organization by learning to create, use, and combine functions for cleaner, more maintainable programs',
    sections: [
      {
        id: '5.1',
        title: 'Introduction to Functions',
        order: 1,
        estimatedMinutes: 40,
        description: 'Discover the power of functions and learn to create reusable code blocks that make programming easier.'
      },
      {
        id: '5.2',
        title: 'Return Values and Function Design',
        order: 2,
        estimatedMinutes: 45,
        description: 'Learn how functions can process data and return results, making them powerful building blocks.'
      },
      {
        id: '5.3',
        title: 'Variable Scope and Function Organization',
        order: 3,
        estimatedMinutes: 40,
        description: 'Understand how variables work inside functions and learn to organize code effectively.'
      },
      {
        id: '5.4',
        title: 'Advanced Function Concepts',
        order: 4,
        estimatedMinutes: 35,
        description: 'Explore recursion and lambda functions - powerful advanced techniques with a preview of Chapter 9.'
      },
      {
        id: '5.5',
        title: 'Chapter 5 Exercises',
        order: 5,
        estimatedMinutes: 30,
        description: 'Apply your function mastery with comprehensive coding challenges and system design.'
      }
    ],
    learningObjectives: [
      'Define and call functions with clear names and appropriate parameters',
      'Use return values effectively to build data processing pipelines',
      'Understand variable scope and manage local vs. global variables properly',
      'Design function hierarchies that break complex problems into manageable pieces',
      'Write functions that handle edge cases and invalid inputs gracefully',
      'Organize code using functions to improve readability and maintainability',
      'Apply function design principles to create reusable, testable code components'
    ]
  },

  '06-recursion-divide-conquer': {
    id: '06-recursion-divide-conquer',
    title: 'Recursion and Divide & Conquer',
    order: 6,
    part: 1,
    partTitle: 'Programming Foundations & Simple Algorithms',
    description: 'Master recursive thinking and divide-and-conquer strategies to solve complex problems elegantly',
    sections: [
      {
        id: '6.1',
        title: 'The Recursive Mindset: Problems Within Problems',
        order: 1,
        estimatedMinutes: 40,
        description: 'Understand recursion as an alternative approach to repetition and recognize recursive patterns.'
      },
      {
        id: '6.2',
        title: 'Your First Recursive Functions',
        order: 2,
        estimatedMinutes: 45,
        description: 'Write basic recursive functions and understand base cases and recursive calls.'
      },
      {
        id: '6.3',
        title: 'Mathematical Recursion: Numbers and Sequences',
        order: 3,
        estimatedMinutes: 40,
        description: 'Apply recursion to mathematical problems and design recursive solutions systematically.'
      },
      {
        id: '6.4',
        title: 'Divide and Conquer: Breaking Problems in Half',
        order: 4,
        estimatedMinutes: 50,
        description: 'Learn the divide-and-conquer pattern and implement basic binary search algorithms.'
      },
      {
        id: '6.5',
        title: 'Practice: Recursive Problem Solving',
        order: 5,
        estimatedMinutes: 40,
        description: 'Apply recursive thinking to comprehensive problems and master recursive algorithm design.'
      }
    ],
    learningObjectives: [
      'Understand recursion as an alternative approach to repetition and problem solving',
      'Write basic recursive functions with proper base cases and recursive calls',
      'Apply recursion to mathematical problems like factorials and Fibonacci sequences',
      'Master the divide-and-conquer strategy for breaking problems into smaller parts',
      'Implement basic binary search using recursive divide-and-conquer approach',
      'Debug recursive functions and avoid common pitfalls like infinite recursion',
      'Choose between iterative and recursive solutions based on problem characteristics'
    ]
  },

  '07-algorithm-efficiency': {
    id: '07-algorithm-efficiency',
    title: 'Algorithm Efficiency and Big O',
    order: 7,
    part: 2,
    partTitle: 'Efficient Algorithms & Complexity',
    description: 'Discover why algorithm efficiency matters and master Big O notation to analyze and optimize algorithm performance',
    sections: [
      {
        id: '7.1',
        title: 'Performance Problems: When Algorithms Matter',
        order: 1,
        estimatedMinutes: 50,
        description: 'Understand the real-world impact of algorithm performance and when efficiency becomes critical.'
      },
      {
        id: '7.2',
        title: 'Measuring Performance: Timing and Counting Operations',
        order: 2,
        estimatedMinutes: 45,
        description: 'Learn to measure and compare algorithm performance scientifically using timing and profiling.'
      },
      {
        id: '7.3',
        title: 'Mathematical Analysis: Big O Notation',
        order: 3,
        estimatedMinutes: 60,
        description: 'Master the mathematical language of algorithm efficiency and common complexity classes.'
      },
      {
        id: '7.4',
        title: 'Analyzing Recursive Algorithms',
        order: 4,
        estimatedMinutes: 50,
        description: 'Apply Big O analysis to recursive algorithms and understand recurrence relations.'
      },
      {
        id: '7.5',
        title: 'Practice: Algorithm Efficiency Analysis',
        order: 5,
        estimatedMinutes: 40,
        description: 'Transform inefficient algorithms into optimized solutions with hands-on challenges.'
      }
    ],
    learningObjectives: [
      'Understand why algorithm efficiency matters in real-world applications',
      'Measure and compare algorithm performance using scientific timing methods',
      'Master Big O notation to analyze and classify algorithm complexity',
      'Identify common complexity patterns: O(1), O(log n), O(n), O(n log n), O(n²)',
      'Analyze the time complexity of recursive algorithms and recurrence relations',
      'Optimize inefficient algorithms by choosing appropriate data structures',
      'Apply optimization techniques to transform O(n²) algorithms into O(n) solutions'
    ]
  },

  '08-binary-search-mastery': {
    id: '08-binary-search-mastery',
    title: 'Binary Search Mastery',
    order: 8,
    part: 2,
    partTitle: 'Efficient Algorithms & Complexity',
    description: 'Master binary search algorithm and its applications for efficient searching in sorted data',
    sections: [
      {
        id: '8.1',
        title: 'Binary Search Revisited: From Basics to Mastery',
        order: 1,
        estimatedMinutes: 45,
        description: 'Solidify understanding of binary search fundamentals and appreciate its logarithmic power.'
      },
      {
        id: '8.2',
        title: 'Binary Search Variations: Beyond Simple Search',
        order: 2,
        estimatedMinutes: 50,
        description: 'Explore advanced binary search variations and boundary-finding techniques.'
      },
      {
        id: '8.3',
        title: 'Binary Search on Answers: Optimization Applications',
        order: 3,
        estimatedMinutes: 55,
        description: 'Apply binary search to optimization problems and answer-finding scenarios.'
      },
      {
        id: '8.4',
        title: 'Advanced Applications: 2D Search and Beyond',
        order: 4,
        estimatedMinutes: 50,
        description: 'Master advanced binary search applications in multi-dimensional and complex scenarios.'
      },
      {
        id: '8.5',
        title: 'Practice: Binary Search Problem Solving',
        order: 5,
        estimatedMinutes: 40,
        description: 'Apply binary search techniques to solve challenging programming problems.'
      }
    ],
    learningObjectives: [
      'Master binary search algorithm and its O(log n) time complexity',
      'Implement various binary search patterns for different problem types',
      'Apply binary search to optimization and answer-finding problems',
      'Solve complex multi-dimensional search problems',
      'Debug and optimize binary search implementations for edge cases'
    ]
  },

  '09-sorting-algorithms': {
    id: '09-sorting-algorithms',
    title: 'Sorting Algorithms',
    order: 9,
    part: 2,
    partTitle: 'Efficient Algorithms & Complexity',
    description: 'Explore fundamental sorting algorithms and understand their performance characteristics',
    sections: [
      {
        id: '9.1',
        title: 'Why Sorting Matters: Foundation of Computer Science',
        order: 1,
        estimatedMinutes: 40,
        description: 'Understand why sorting is crucial for enabling fast data operations and real-world applications.'
      },
      {
        id: '9.2',
        title: 'Merge Sort: Recursive Divide-and-Conquer Sorting',
        order: 2,
        estimatedMinutes: 55,
        description: 'Master merge sort algorithm and understand its guaranteed O(n log n) performance.'
      },
      {
        id: '9.3',
        title: 'Quick Sort: Efficient Recursive Partitioning',
        order: 3,
        estimatedMinutes: 60,
        description: 'Learn quicksort algorithm and understand its average-case efficiency and practical importance.'
      },
      {
        id: '9.4',
        title: 'Sorting Algorithm Analysis and Comparison',
        order: 4,
        estimatedMinutes: 50,
        description: 'Compare different sorting algorithms and understand when to use each approach.'
      },
      {
        id: '9.5',
        title: 'Practice: Advanced Sorting Applications',
        order: 5,
        estimatedMinutes: 45,
        description: 'Apply sorting algorithms to solve complex problems and optimize data processing.'
      }
    ],
    learningObjectives: [
      'Understand why sorting is fundamental to computer science and data processing',
      'Implement merge sort with its guaranteed O(n log n) performance',
      'Master quicksort algorithm and understand its practical advantages',
      'Analyze and compare different sorting algorithms for various use cases',
      'Apply sorting techniques to solve complex data processing problems',
      'Choose optimal sorting algorithms based on data characteristics and constraints'
    ]
  }
};

export const CURRICULUM_STRUCTURE = [
  {
    part: 1,
    title: "Programming Foundations & Simple Algorithms",
    chapters: [
      { id: "01-getting-started", title: "Getting Started with Problem Solving", order: 1 },
      { id: "02-logic-control-flow", title: "Logic and Control Flow", order: 2 },
      { id: "03-loops-iteration", title: "Loops and Iteration", order: 3 },
      { id: "04-lists-algorithms", title: "Lists and Basic Algorithms", order: 4 },
      { id: "05-functions", title: "Functions and Code Organization", order: 5 },
      { id: "06-recursion-divide-conquer", title: "Recursion and Divide & Conquer", order: 6 },
    ],
    challenge: {
      id: "part1-challenge",
      title: "Challenge: Stone Game",
      description: "Test your algorithmic thinking by beating the AI 5 times in a row!"
    }
  },
  {
    part: 2,
    title: "Efficient Algorithms & Complexity",
    chapters: [
      { id: "07-algorithm-efficiency", title: "Algorithm Efficiency and Big O", order: 7 },
      { id: "08-binary-search-mastery", title: "Binary Search Mastery", order: 8 },
      { id: "09-sorting-algorithms", title: "Sorting Algorithms", order: 9 },
    ],
    challenge: {
      id: "part2-challenge",
      title: "Challenge: Mastermind",
      description: "Apply binary search optimization thinking to crack the code!"
    }
  },
  {
    part: 3,
    title: "Data Structures as Tools",
    chapters: [
      { id: "10-dictionaries-hash", title: "Dictionaries and Hash-Based Solutions", order: 10 },
      { id: "11-stacks", title: "Stacks: Last In, First Out", order: 11 },
      { id: "12-queues", title: "Queues: First In, First Out", order: 12 },
      { id: "13-oop-data-structures", title: "Object-Oriented Programming for Data Structures", order: 13 },
      { id: "14-linked-lists", title: "Linked Lists: Dynamic Memory Management", order: 14 },
    ],
    challenge: {
      id: "part3-challenge",
      title: "Challenge: Two-Stacks, One Queue",
      description: "Master stack and queue operations in this strategic token-placing game!"
    }
  },
  {
    part: 4,
    title: "Trees and Hierarchical Thinking",
    chapters: [
      { id: "15-trees", title: "Trees: Hierarchical Data", order: 15 },
      { id: "16-binary-search-trees", title: "Binary Search Trees: Efficient Searching", order: 16 },
      { id: "17-heaps-priority-queues", title: "Heaps and Priority Queues", order: 17 },
      { id: "18-trie-strings", title: "Trie: Prefix Tree for String Operations", order: 18 },
    ]
  },
  {
    part: 5,
    title: "Graph Theory and Network Algorithms",
    chapters: [
      { id: "19-graphs", title: "Graphs: Modeling Relationships", order: 19 },
      { id: "20-graph-traversal", title: "Graph Traversal and Search", order: 20 },
      { id: "21-shortest-paths", title: "Shortest Paths and Network Analysis", order: 21 },
      { id: "22-union-find", title: "Union-Find: Efficient Connectivity Queries", order: 22 },
      { id: "23-topological-sorting", title: "Topological Sorting: Ordering Dependencies", order: 23 },
    ]
  },
  {
    part: 6,
    title: "Advanced Problem-Solving Patterns",
    chapters: [
      { id: "24-dynamic-programming", title: "Dynamic Programming: Optimal Solutions", order: 24 },
      { id: "25-greedy-algorithms", title: "Greedy Algorithms: Local Optimal Choices", order: 25 },
      { id: "26-backtracking", title: "Backtracking: Systematic Search", order: 26 },
    ]
  },
  {
    part: 7,
    title: "Specialized Applications",
    chapters: [
      { id: "27-string-algorithms", title: "String Algorithms and Text Processing", order: 27 },
      { id: "28-computational-geometry", title: "Computational Geometry", order: 28 },
      { id: "29-number-theory", title: "Number Theory and Cryptography", order: 29 },
    ]
  },
  {
    part: 8,
    title: "Contest Problem-Solving Mastery",
    chapters: [
      { id: "30-two-pointers-sliding-window", title: "Two Pointers and Sliding Window Techniques", order: 30 },
      { id: "31-range-queries", title: "Range Query Data Structures", order: 31 },
      { id: "32-contest-math", title: "Contest Math and Number Theory", order: 32 },
      { id: "33-problem-solving-patterns", title: "Problem-Solving Patterns and Contest Strategy", order: 33 },
    ]
  }
];

export function getChapterMetadata(chapterId: string): ChapterMetadata | null {
  return CHAPTER_METADATA[chapterId] || null;
}

export function getSectionCount(chapterId: string): number {
  const chapter = CHAPTER_METADATA[chapterId];
  return chapter ? chapter.sections.length : 0;
}

export function getAllChapterIds(): string[] {
  return Object.keys(CHAPTER_METADATA);
}