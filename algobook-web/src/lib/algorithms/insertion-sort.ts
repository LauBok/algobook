import { AlgorithmStep, AlgorithmConfig } from '@/lib/types/algorithm-widget';

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

export function generateInsertionSortSteps(initialData: number[]): InsertionSortStep[] {
  const steps: InsertionSortStep[] = [];
  const data = [...initialData]; // Work with a copy
  const n = data.length;
  
  // Initial state
  steps.push({
    id: 0,
    description: `Starting insertion sort with array of ${n} elements. First element is trivially sorted.`,
    data: [...data],
    currentI: undefined,
    currentJ: undefined,
    key: undefined,
    sortedBoundary: 1, // First element is considered sorted
    comparing: false,
    shifting: false,
    sorted: [0], // First element is in correct position relative to sorted portion
  });

  let stepId = 1;

  // Main insertion sort loop: start from second element
  for (let i = 1; i < n; i++) {
    const key = data[i];
    
    steps.push({
      id: stepId++,
      description: `Taking element ${key} at position ${i} to insert into sorted portion [0...${i-1}]`,
      data: [...data],
      currentI: i,
      currentJ: undefined,
      key: key,
      sortedBoundary: i,
      highlight: [i], // Highlight the element being inserted
      comparing: false,
      shifting: false,
      sorted: Array.from({ length: i }, (_, idx) => idx), // All previous elements are sorted relative to each other
    });

    // Find the correct insertion position by comparing with each element in sorted region from left to right
    let insertPosition = 0; // Start from the beginning
    
    // Compare with each element in the sorted region from left to right
    for (let compareIdx = 0; compareIdx < i; compareIdx++) {
      steps.push({
        id: stepId++,
        description: `Comparing ${key} with ${data[compareIdx]}: ${key} ${key < data[compareIdx] ? '<' : '>='} ${data[compareIdx]}`,
        data: [...data],
        currentI: i,
        currentJ: compareIdx,
        key: key,
        sortedBoundary: i,
        compare: [compareIdx, i], // Show comparison between sorted element and current element
        comparing: true,
        shifting: false,
        sorted: Array.from({ length: i }, (_, idx) => idx),
      });
      
      if (key < data[compareIdx]) {
        // Found the position - insert immediately
        insertPosition = compareIdx;
        break;
      } else {
        // Key is >= current element, continue searching
        insertPosition = compareIdx + 1;
      }
    }
    

    // Perform all the shifting at once and insert the key
    for (let k = i; k > insertPosition; k--) {
      data[k] = data[k - 1];
    }
    data[insertPosition] = key;
    
    // Special message when element stays in place vs gets moved
    const wasMovedMessage = insertPosition < i 
      ? `Inserted ${key} at position ${insertPosition}. Elements [0...${i}] are now sorted`
      : `${key} is already in correct position. Elements [0...${i}] are now sorted`;
    
    steps.push({
      id: stepId++,
      description: wasMovedMessage,
      data: [...data],
      currentI: i,
      currentJ: insertPosition,
      key: key,
      sortedBoundary: i + 1,
      highlight: [insertPosition], // Highlight the inserted element
      comparing: false,
      shifting: false,
      sorted: Array.from({ length: i + 1 }, (_, idx) => idx), // All elements up to i are now sorted
    });
  }

  // Final state
  steps.push({
    id: stepId++,
    description: `Insertion sort complete! All elements are in ascending order`,
    data: [...data],
    currentI: undefined,
    currentJ: undefined,
    key: undefined,
    sortedBoundary: n,
    highlight: [], // Don't highlight anything - let sorted status show
    comparing: false,
    shifting: false,
    sorted: Array.from({ length: n }, (_, i) => i), // All elements are sorted
  });

  return steps;
}

export const insertionSortConfig: InsertionSortConfig = {
  name: 'insertion-sort',
  generateSteps: generateInsertionSortSteps,
  initialData: [64, 34, 25, 12, 22, 11, 90], // Same as bubble sort for comparison
};

// Utility function to create an insertion sort visualization
export function createInsertionSortVisualization(data?: number[]) {
  const initialData = data || insertionSortConfig.initialData;
  return {
    algorithm: 'insertion-sort',
    title: 'Insertion Sort Visualization',
    initialData,
    steps: generateInsertionSortSteps(initialData),
  };
}