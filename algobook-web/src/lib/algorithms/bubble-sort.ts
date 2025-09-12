import { BubbleSortStep, BubbleSortConfig } from '@/lib/types/algorithm-widget';

export function generateBubbleSortSteps(initialData: number[]): BubbleSortStep[] {
  const steps: BubbleSortStep[] = [];
  const data = [...initialData]; // Work with a copy
  const n = data.length;
  const sortedPositions: number[] = []; // Track positions that are in their final sorted place
  
  // Initial state
  steps.push({
    id: 0,
    description: `Starting bubble sort with array of ${n} elements`,
    data: [...data],
    currentI: undefined,
    currentJ: undefined,
    swapped: false,
    sorted: [...sortedPositions],
  });

  let stepId = 1;

  // Outer loop: i from 0 to n-2
  for (let i = 0; i < n - 1; i++) {
    steps.push({
      id: stepId++,
      description: `Pass ${i + 1}: Looking for the ${i + 1}${getOrdinalSuffix(i + 1)} largest element`,
      data: [...data],
      currentI: i,
      currentJ: undefined,
      highlight: [0], // Always start from the first element
      swapped: false,
      sorted: [...sortedPositions],
    });

    let swappedInThisPass = false;

    // Inner loop: j from 0 to n-i-2
    for (let j = 0; j < n - i - 1; j++) {
      // Show comparison
      steps.push({
        id: stepId++,
        description: `Comparing elements at positions ${j} and ${j + 1}: ${data[j]} vs ${data[j + 1]}`,
        data: [...data],
        currentI: i,
        currentJ: j,
        compare: [j, j + 1],
        swapped: false,
        sorted: [...sortedPositions],
      });

      // Check if swap is needed
      if (data[j] > data[j + 1]) {
        // Show swap
        steps.push({
          id: stepId++,
          description: `${data[j]} > ${data[j + 1]}, so we swap them`,
          data: [...data],
          currentI: i,
          currentJ: j,
          swap: [j, j + 1],
          swapped: true,
          sorted: [...sortedPositions],
        });

        // Perform the actual swap
        [data[j], data[j + 1]] = [data[j + 1], data[j]];
        swappedInThisPass = true;

        // Show result after swap
        steps.push({
          id: stepId++,
          description: `After swap: elements are now in correct order`,
          data: [...data],
          currentI: i,
          currentJ: j,
          highlight: [j + 1], // Only highlight the element that moved to the right
          swapped: true,
          sorted: [...sortedPositions],
        });
      } else {
        // No swap needed
        steps.push({
          id: stepId++,
          description: `${data[j]} ≤ ${data[j + 1]}, no swap needed`,
          data: [...data],
          currentI: i,
          currentJ: j,
          highlight: [j, j + 1],
          swapped: false,
          sorted: [...sortedPositions],
        });
      }
    }

    // End of pass - add the newly sorted position and highlight the sorted element
    sortedPositions.push(n - i - 1);
    steps.push({
      id: stepId++,
      description: `Pass ${i + 1} complete. Element ${data[n - i - 1]} is now in its final position`,
      data: [...data],
      currentI: i,
      currentJ: undefined,
      highlight: [], // No highlight at end of pass, the sorted element will be shown in green
      swapped: swappedInThisPass,
      sorted: [...sortedPositions],
    });

    // If no swaps were made in this pass, array is sorted
    if (!swappedInThisPass) {
      // All remaining positions are also sorted
      for (let k = 0; k < n - i - 1; k++) {
        if (!sortedPositions.includes(k)) {
          sortedPositions.push(k);
        }
      }
      steps.push({
        id: stepId++,
        description: `No swaps in this pass - array is already sorted!`,
        data: [...data],
        currentI: undefined,
        currentJ: undefined,
        highlight: Array.from({ length: n }, (_, i) => i),
        swapped: false,
        sorted: [...sortedPositions],
      });
      break;
    }
  }

  // Final state - make sure all positions are marked as sorted
  for (let k = 0; k < n; k++) {
    if (!sortedPositions.includes(k)) {
      sortedPositions.push(k);
    }
  }
  steps.push({
    id: stepId++,
    description: `Bubble sort complete! All elements are in ascending order`,
    data: [...data],
    currentI: undefined,
    currentJ: undefined,
    highlight: Array.from({ length: n }, (_, i) => i),
    swapped: false,
    sorted: [...sortedPositions],
  });

  return steps;
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';  
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

export const bubbleSortConfig: BubbleSortConfig = {
  name: 'bubble-sort',
  generateSteps: generateBubbleSortSteps,
  initialData: [64, 34, 25, 12, 22, 11, 90], // Default example data
};

// Utility function to create a bubble sort visualization
export function createBubbleSortVisualization(data?: number[]) {
  const initialData = data || bubbleSortConfig.initialData;
  return {
    algorithm: 'bubble-sort',
    title: 'Bubble Sort Visualization',
    initialData,
    steps: generateBubbleSortSteps(initialData),
  };
}