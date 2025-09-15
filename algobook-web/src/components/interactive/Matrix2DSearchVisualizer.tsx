'use client';

import React, { useState, useEffect } from 'react';

interface VisualizationStep {
  step: number;
  approach: string;
  currentPos?: { row: number; col: number };
  searchRange?: { 
    left?: number; 
    right?: number; 
    currentRow?: number;
    eliminatedRows?: Set<number>;
    eliminatedCols?: Set<number>;
  };
  oneDIndex?: number;
  comparison: string;
  action: string;
  found: boolean;
  eliminated?: string[];
}

interface MatrixSearchVisualizerProps {
  defaultMatrix?: number[][];
  defaultTarget?: number;
  showComparison?: boolean;
}

const MATRIX_TYPES = {
  GLOBALLY_SORTED: 'globally-sorted',
  ROW_COL_SORTED: 'row-col-sorted',
  ROW_ONLY_SORTED: 'row-only-sorted'
};

const SEARCH_APPROACHES = {
  ONE_D: '1d-treatment',
  STAIRCASE: 'staircase',
  ROW_WISE: 'row-wise'
};

const SAMPLE_MATRICES = {
  [MATRIX_TYPES.GLOBALLY_SORTED]: [
    [1, 3, 5, 7, 9, 11],
    [12, 14, 16, 18, 20, 22],
    [23, 25, 27, 29, 31, 33],
    [34, 36, 38, 40, 42, 44],
    [45, 47, 49, 51, 53, 55]
  ],
  [MATRIX_TYPES.ROW_COL_SORTED]: [
    [1, 4, 7, 11, 15, 20],
    [2, 5, 8, 12, 16, 21],
    [3, 6, 9, 13, 17, 22],
    [10, 14, 18, 24, 28, 32],
    [19, 23, 26, 30, 35, 40]
  ],
  [MATRIX_TYPES.ROW_ONLY_SORTED]: [
    [2, 5, 8, 12, 16, 20],
    [1, 3, 7, 14, 18, 25],
    [9, 11, 15, 19, 22, 28],
    [4, 6, 10, 13, 17, 24],
    [21, 23, 26, 30, 33, 36]
  ]
};

export default function Matrix2DSearchVisualizer({ 
  defaultMatrix = SAMPLE_MATRICES[MATRIX_TYPES.ROW_COL_SORTED],
  defaultTarget = 5,
  showComparison = true
}: MatrixSearchVisualizerProps) {
  const [matrix, setMatrix] = useState<number[][]>(defaultMatrix);
  const [target, setTarget] = useState<number>(defaultTarget);
  const [inputTarget, setInputTarget] = useState<string>(defaultTarget.toString());
  const [matrixType, setMatrixType] = useState<string>(MATRIX_TYPES.ROW_COL_SORTED);
  const [selectedApproach, setSelectedApproach] = useState<string>(SEARCH_APPROACHES.STAIRCASE);
  
  const [steps, setSteps] = useState<VisualizationStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Generate steps for 1D array treatment
  const generate1DSteps = (matrix: number[][], target: number): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const rows = matrix.length;
    const cols = matrix[0].length;
    let left = 0;
    let right = rows * cols - 1;
    let stepNum = 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const row = Math.floor(mid / cols);
      const col = mid % cols;
      const midValue = matrix[row][col];

      let comparison: string;
      let action: string;
      let found = false;

      if (midValue === target) {
        comparison = `matrix[${row}][${col}] = ${midValue} equals ${target}`;
        action = `Found target at position (${row}, ${col})!`;
        found = true;
      } else if (midValue < target) {
        comparison = `matrix[${row}][${col}] = ${midValue} < ${target}`;
        action = `Search right half (1D index ${mid + 1} to ${right})`;
      } else {
        comparison = `matrix[${row}][${col}] = ${midValue} > ${target}`;
        action = `Search left half (1D index ${left} to ${mid - 1})`;
      }

      steps.push({
        step: stepNum,
        approach: '1D Array Treatment',
        currentPos: { row, col },
        searchRange: { left, right },
        oneDIndex: mid,
        comparison,
        action,
        found
      });

      if (found) break;

      if (midValue < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }

      stepNum++;
    }

    // If not found
    if (steps.length === 0 || !steps[steps.length - 1].found) {
      steps.push({
        step: stepNum,
        approach: '1D Array Treatment',
        searchRange: { left, right },
        comparison: `Search space exhausted (left=${left} > right=${right})`,
        action: `Target ${target} not found in matrix`,
        found: false
      });
    }

    return steps;
  };

  // Generate steps for staircase search
  const generateStaircaseSteps = (matrix: number[][], target: number): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const rows = matrix.length;
    const cols = matrix[0].length;
    let row = 0;
    let col = cols - 1; // Start from top-right
    let stepNum = 1;
    const eliminatedRows = new Set<number>();
    const eliminatedCols = new Set<number>();

    while (row < rows && col >= 0) {
      const current = matrix[row][col];
      let comparison: string;
      let action: string;
      let found = false;

      if (current === target) {
        comparison = `matrix[${row}][${col}] = ${current} equals ${target}`;
        action = `Found target at position (${row}, ${col})!`;
        found = true;
      } else if (current > target) {
        comparison = `matrix[${row}][${col}] = ${current} > ${target}`;
        action = `Move left - eliminate column ${col}`;
        eliminatedCols.add(col);
      } else {
        comparison = `matrix[${row}][${col}] = ${current} < ${target}`;
        action = `Move down - eliminate row ${row}`;
        eliminatedRows.add(row);
      }

      steps.push({
        step: stepNum,
        approach: 'Staircase Search',
        currentPos: { row, col },
        searchRange: { 
          eliminatedRows: new Set(eliminatedRows),
          eliminatedCols: new Set(eliminatedCols)
        },
        comparison,
        action,
        found
      });

      if (found) break;

      if (current > target) {
        col--;
      } else {
        row++;
      }

      stepNum++;
    }

    // If not found
    if (steps.length === 0 || !steps[steps.length - 1].found) {
      steps.push({
        step: stepNum,
        approach: 'Staircase Search',
        currentPos: { row: -1, col: -1 },
        searchRange: { 
          eliminatedRows: new Set(eliminatedRows),
          eliminatedCols: new Set(eliminatedCols)
        },
        comparison: `Moved out of bounds (row=${row}, col=${col})`,
        action: `Target ${target} not found in matrix`,
        found: false
      });
    }

    return steps;
  };

  // Generate steps for row-wise binary search
  const generateRowWiseSteps = (matrix: number[][], target: number): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    let stepNum = 1;
    let found = false;

    for (let i = 0; i < matrix.length; i++) {
      const row = matrix[i];
      
      // Check if target could be in this row
      if (row[0] <= target && target <= row[row.length - 1]) {
        steps.push({
          step: stepNum++,
          approach: 'Row-wise Binary Search',
          currentPos: { row: i, col: -1 },
          searchRange: { currentRow: i },
          comparison: `Row ${i}: [${row[0]}...${row[row.length - 1]}] contains range for ${target}`,
          action: `Starting binary search in row ${i}`,
          found: false
        });

        // Binary search in this row
        let left = 0;
        let right = row.length - 1;

        while (left <= right) {
          const mid = Math.floor((left + right) / 2);
          const midValue = row[mid];

          let comparison: string;
          let action: string;

          if (midValue === target) {
            comparison = `row[${mid}] = ${midValue} equals ${target}`;
            action = `Found target at position (${i}, ${mid})!`;
            found = true;
          } else if (midValue < target) {
            comparison = `row[${mid}] = ${midValue} < ${target}`;
            action = `Search right half of row ${i}`;
          } else {
            comparison = `row[${mid}] = ${midValue} > ${target}`;
            action = `Search left half of row ${i}`;
          }

          steps.push({
            step: stepNum++,
            approach: 'Row-wise Binary Search',
            currentPos: { row: i, col: mid },
            searchRange: { left, right, currentRow: i },
            comparison,
            action,
            found
          });

          if (found) break;

          if (midValue < target) {
            left = mid + 1;
          } else {
            right = mid - 1;
          }
        }

        if (found) break;

        steps.push({
          step: stepNum++,
          approach: 'Row-wise Binary Search',
          currentPos: { row: i, col: -1 },
          searchRange: { currentRow: i },
          comparison: `Completed search in row ${i}`,
          action: `Target not found in row ${i}, checking next row`,
          found: false
        });
      } else {
        steps.push({
          step: stepNum++,
          approach: 'Row-wise Binary Search',
          currentPos: { row: i, col: -1 },
          searchRange: { currentRow: i },
          comparison: `Row ${i}: [${row[0]}...${row[row.length - 1]}] doesn't contain ${target}`,
          action: `Skipping row ${i}`,
          found: false
        });
      }
    }

    // If not found in any row
    if (!found) {
      steps.push({
        step: stepNum,
        approach: 'Row-wise Binary Search',
        currentPos: { row: -1, col: -1 },
        comparison: `Searched all applicable rows`,
        action: `Target ${target} not found in matrix`,
        found: false
      });
    }

    return steps;
  };

  // Generate steps based on selected approach
  const generateSteps = (matrix: number[][], target: number, approach: string): VisualizationStep[] => {
    switch (approach) {
      case SEARCH_APPROACHES.ONE_D:
        return generate1DSteps(matrix, target);
      case SEARCH_APPROACHES.STAIRCASE:
        return generateStaircaseSteps(matrix, target);
      case SEARCH_APPROACHES.ROW_WISE:
        return generateRowWiseSteps(matrix, target);
      default:
        return [];
    }
  };

  // Initialize steps when parameters change
  useEffect(() => {
    const newSteps = generateSteps(matrix, target, selectedApproach);
    setSteps(newSteps);
    setCurrentStep(-1);
    setIsCompleted(false);
    setIsPlaying(false);
  }, [matrix, target, selectedApproach]);

  // Update matrix when type changes
  useEffect(() => {
    setMatrix(SAMPLE_MATRICES[matrixType as keyof typeof SAMPLE_MATRICES]);
  }, [matrixType]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setIsCompleted(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length]);

  const handleTargetChange = () => {
    const newTarget = parseInt(inputTarget);
    if (!isNaN(newTarget)) {
      setTarget(newTarget);
    }
  };

  const handleStart = () => {
    setCurrentStep(-1);
    setIsCompleted(false);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > -1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(-1);
    setIsCompleted(false);
    setIsPlaying(false);
  };

  const currentStepData = currentStep >= 0 ? steps[currentStep] : null;

  const getCellClass = (rowIndex: number, colIndex: number) => {
    if (!currentStepData) return 'bg-gray-100 border-gray-300';

    const { currentPos, searchRange, found, approach } = currentStepData;

    // Current position highlighting
    if (currentPos && currentPos.row === rowIndex && currentPos.col === colIndex) {
      if (found) {
        return 'bg-green-200 border-green-500 animate-pulse font-bold';
      }
      return 'bg-yellow-200 border-yellow-500 font-bold';
    }

    // Approach-specific highlighting
    if (approach === 'Staircase Search' && searchRange) {
      if (searchRange.eliminatedRows?.has(rowIndex)) {
        return 'bg-red-100 border-red-300 opacity-60 line-through';
      }
      if (searchRange.eliminatedCols?.has(colIndex)) {
        return 'bg-red-100 border-red-300 opacity-60 line-through';
      }
    }

    if (approach === '1D Array Treatment' && searchRange) {
      const cols = matrix[0].length;
      const oneDIndex = rowIndex * cols + colIndex;
      const { left = 0, right = 0 } = searchRange;
      
      if (left > right) {
        return 'bg-gray-100 border-gray-300 opacity-50';
      }
      if (oneDIndex >= left && oneDIndex <= right) {
        return 'bg-blue-100 border-blue-300';
      }
      return 'bg-gray-100 border-gray-300 opacity-50';
    }

    if (approach === 'Row-wise Binary Search' && searchRange) {
      if (searchRange.currentRow === rowIndex) {
        if (searchRange.left !== undefined && searchRange.right !== undefined) {
          if (colIndex >= searchRange.left && colIndex <= searchRange.right) {
            return 'bg-blue-100 border-blue-300';
          }
          return 'bg-gray-100 border-gray-300 opacity-50';
        }
        return 'bg-blue-50 border-blue-200';
      }
      return 'bg-gray-100 border-gray-300 opacity-50';
    }

    return 'bg-gray-100 border-gray-300';
  };

  const getApproachInfo = (approach: string, matrixType: string) => {
    const isOptimal = (approach: string, matrixType: string) => {
      if (matrixType === MATRIX_TYPES.GLOBALLY_SORTED && approach === SEARCH_APPROACHES.ONE_D) return true;
      if (matrixType === MATRIX_TYPES.ROW_COL_SORTED && approach === SEARCH_APPROACHES.STAIRCASE) return true;
      if (matrixType === MATRIX_TYPES.ROW_ONLY_SORTED && approach === SEARCH_APPROACHES.ROW_WISE) return true;
      return false;
    };

    const getStatus = (approach: string, matrixType: string) => {
      if (isOptimal(approach, matrixType)) return "✅ OPTIMAL";
      
      // Check if approach works but isn't optimal
      if (approach === SEARCH_APPROACHES.ONE_D && matrixType !== MATRIX_TYPES.GLOBALLY_SORTED) {
        return "❌ WON'T WORK";
      }
      if (approach === SEARCH_APPROACHES.STAIRCASE && matrixType === MATRIX_TYPES.ROW_ONLY_SORTED) {
        return "❌ WON'T WORK";
      }
      
      return "⚠️ WORKS";
    };

    const getDescription = (approach: string, matrixType: string) => {
      const status = getStatus(approach, matrixType);
      
      switch (approach) {
        case SEARCH_APPROACHES.ONE_D:
          if (matrixType === MATRIX_TYPES.GLOBALLY_SORTED) {
            return 'Perfect! Treat as flattened sorted array';
          } else {
            return 'Cannot use - matrix not globally sorted';
          }
        
        case SEARCH_APPROACHES.STAIRCASE:
          if (matrixType === MATRIX_TYPES.ROW_COL_SORTED) {
            return 'Perfect! Start from corner, eliminate rows/columns';
          } else if (matrixType === MATRIX_TYPES.GLOBALLY_SORTED) {
            return 'Works but 1D treatment is more efficient';
          } else {
            return 'Cannot use - columns not sorted';
          }
        
        case SEARCH_APPROACHES.ROW_WISE:
          if (matrixType === MATRIX_TYPES.ROW_ONLY_SORTED) {
            return 'Perfect! Only option for row-only sorted matrices';
          } else if (matrixType === MATRIX_TYPES.GLOBALLY_SORTED) {
            return 'Works but 1D treatment is much more efficient';
          } else {
            return 'Works but staircase search is more efficient';
          }
        
        default:
          return '';
      }
    };

    switch (approach) {
      case SEARCH_APPROACHES.ONE_D:
        return {
          name: '1D Array Treatment',
          description: getDescription(approach, matrixType),
          complexity: 'O(log(m×n))',
          requirement: 'Globally sorted matrix',
          status: getStatus(approach, matrixType)
        };
      case SEARCH_APPROACHES.STAIRCASE:
        return {
          name: 'Staircase Search',
          description: getDescription(approach, matrixType),
          complexity: 'O(m + n)',
          requirement: 'Row & column sorted',
          status: getStatus(approach, matrixType)
        };
      case SEARCH_APPROACHES.ROW_WISE:
        return {
          name: 'Row-wise Binary Search',
          description: getDescription(approach, matrixType),
          complexity: 'O(m × log n)',
          requirement: 'Each row sorted',
          status: getStatus(approach, matrixType)
        };
      default:
        return { name: '', description: '', complexity: '', requirement: '', status: '' };
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🔍 2D Matrix Search Visualization
        </h3>
        <p className="text-gray-700">
          Explore different approaches to searching in 2D sorted matrices!
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matrix Type:
            </label>
            <select
              value={matrixType}
              onChange={(e) => setMatrixType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={MATRIX_TYPES.GLOBALLY_SORTED}>Globally Sorted</option>
              <option value={MATRIX_TYPES.ROW_COL_SORTED}>Row & Column Sorted</option>
              <option value={MATRIX_TYPES.ROW_ONLY_SORTED}>Row-only Sorted</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Approach:
            </label>
            <select
              value={selectedApproach}
              onChange={(e) => setSelectedApproach(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={SEARCH_APPROACHES.ONE_D}>1D Array Treatment</option>
              <option value={SEARCH_APPROACHES.STAIRCASE}>Staircase Search</option>
              <option value={SEARCH_APPROACHES.ROW_WISE}>Row-wise Binary Search</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Value:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputTarget}
                onChange={(e) => setInputTarget(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleTargetChange}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Approach Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold text-blue-800">{getApproachInfo(selectedApproach, matrixType).name}</span>
              <span className="ml-2 px-2 py-1 text-xs rounded font-bold"
                    style={{
                      backgroundColor: getApproachInfo(selectedApproach, matrixType).status.includes('OPTIMAL') ? '#dcfce7' : 
                                     getApproachInfo(selectedApproach, matrixType).status.includes("WON'T WORK") ? '#fef2f2' : '#fef3c7',
                      color: getApproachInfo(selectedApproach, matrixType).status.includes('OPTIMAL') ? '#166534' :
                             getApproachInfo(selectedApproach, matrixType).status.includes("WON'T WORK") ? '#dc2626' : '#d97706'
                    }}>
                {getApproachInfo(selectedApproach, matrixType).status}
              </span>
              <div className="text-blue-600 mt-1">{getApproachInfo(selectedApproach, matrixType).description}</div>
            </div>
            <div className="text-right text-sm">
              <div className="text-blue-700 font-mono">{getApproachInfo(selectedApproach, matrixType).complexity}</div>
              <div className="text-blue-600">{getApproachInfo(selectedApproach, matrixType).requirement}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Matrix Visualization */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Matrix:</h4>
        <div className="flex justify-center mb-4">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${matrix[0]?.length || 1}, minmax(0, 1fr))` }}>
            {matrix.map((row, rowIndex) =>
              row.map((value, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-14 h-14 border-2 rounded flex items-center justify-center font-bold text-sm transition-all duration-300 ${getCellClass(rowIndex, colIndex)}`}
                >
                  {value}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* 1D Index labels for 1D approach */}
        {selectedApproach === SEARCH_APPROACHES.ONE_D && (
          <div className="flex justify-center">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${matrix[0]?.length || 1}, minmax(0, 1fr))` }}>
              {matrix.map((row, rowIndex) =>
                row.map((_, colIndex) => (
                  <div key={`${rowIndex}-${colIndex}`} className="w-14 text-center text-xs text-gray-500">
                    {rowIndex * matrix[0].length + colIndex}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Step Information */}
      {currentStepData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">
            Step {currentStepData.step}: {currentStepData.approach}
          </h4>
          <div className="space-y-2 text-sm">
            <div><strong>Comparison:</strong> {currentStepData.comparison}</div>
            <div><strong>Action:</strong> {currentStepData.action}</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex justify-center gap-3 flex-wrap">
        <button
          onClick={handleStart}
          disabled={isPlaying}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {isPlaying ? '▶️ Playing...' : '▶️ Play'}
        </button>
        <button
          onClick={handlePrevious}
          disabled={currentStep <= -1 || isPlaying}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          ⬅️ Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep >= steps.length - 1 || isPlaying}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Next ➡️
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          🔄 Reset
        </button>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">Legend:</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-500 rounded"></div>
            <span>Current Position</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 border-2 border-green-500 rounded"></div>
            <span>Target Found!</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
            <span>Search Range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded opacity-60"></div>
            <span>Eliminated</span>
          </div>
        </div>
      </div>

      {/* Educational Notes */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Key Insights:</h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• <strong>Matrix Type</strong> determines which approach works best</li>
          <li>• <strong>1D Treatment</strong> is fastest but requires global sorting</li>
          <li>• <strong>Staircase Search</strong> elegantly eliminates entire rows/columns</li>
          <li>• <strong>Row-wise Search</strong> is most flexible but potentially slower</li>
          <li>• Choose your approach based on the matrix's sorting properties!</li>
        </ul>
      </div>
    </div>
  );
}