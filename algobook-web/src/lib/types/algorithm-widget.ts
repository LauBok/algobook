// TypeScript interfaces for algorithm visualization widgets

export interface AlgorithmStep {
  id: number;
  description: string;
  data: any; // Flexible data structure for different algorithm types
  highlight?: number[]; // Indices to highlight
  compare?: [number, number]; // Indices being compared
  swap?: [number, number]; // Indices being swapped
  sorted?: number[]; // Indices of elements in their final sorted positions
}

export interface AlgorithmState {
  currentStep: number;
  steps: AlgorithmStep[];
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;
  speed: number; // milliseconds between steps
}

export interface WindowWidgetProps {
  title: string;
  algorithm: string;
  initialData: any;
  children: React.ReactNode;
  onStateChange?: (state: AlgorithmState) => void;
}

export interface ListVisualizationProps {
  data: number[];
  highlight?: number[];
  compare?: [number, number];
  swap?: [number, number];
  sorted?: number[]; // Indices of elements in their final sorted positions
  sortedBoundary?: number; // For insertion sort: elements 0 to sortedBoundary-1 are in sorted region
  className?: string;
}

// Algorithm configuration interface
export interface AlgorithmConfig {
  name: string;
  generateSteps: (data: any) => AlgorithmStep[];
  initialData: any;
}

// Bubble sort specific interfaces
export interface BubbleSortStep extends AlgorithmStep {
  data: number[];
  currentI?: number; // outer loop index
  currentJ?: number; // inner loop index
  swapped?: boolean;
}

export interface BubbleSortConfig extends AlgorithmConfig {
  name: 'bubble-sort';
  generateSteps: (data: number[]) => BubbleSortStep[];
  initialData: number[];
}

// Insertion sort specific interfaces
export interface InsertionSortStep extends AlgorithmStep {
  data: number[];
  currentI?: number; // current element being inserted
  currentJ?: number; // position being compared during insertion
  key?: number; // current element value being inserted
  sortedBoundary?: number; // elements 0 to sortedBoundary-1 are sorted
  comparing?: boolean; // true when comparing elements during insertion
  shifting?: boolean; // true when shifting elements to make space
}

export interface InsertionSortConfig extends AlgorithmConfig {
  name: 'insertion-sort';
  generateSteps: (data: number[]) => InsertionSortStep[];
  initialData: number[];
}