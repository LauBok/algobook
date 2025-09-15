'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface ComplexityItem {
  id: string;
  letter: string;
  complexity: string;
  latexComplexity: string; // LaTeX version
  color: string;
}

// LaTeX Math Component
const LaTeXMath: React.FC<{ latex: string; inline?: boolean }> = ({ latex, inline = true }) => {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: !inline
  });

  return (
    <span 
      className={inline ? 'inline-math' : 'block-math'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const complexityItems: ComplexityItem[] = [
  { id: 'A', letter: 'A', complexity: 'O(n!)', latexComplexity: 'O(n!)', color: 'bg-white border-gray-300 text-gray-800' },
  { id: 'B', letter: 'B', complexity: 'O(1)', latexComplexity: 'O(1)', color: 'bg-white border-gray-300 text-gray-800' },
  { id: 'C', letter: 'C', complexity: 'O(n²)', latexComplexity: 'O(n^2)', color: 'bg-white border-gray-300 text-gray-800' },
  { id: 'D', letter: 'D', complexity: 'O(n log n)', latexComplexity: 'O(n \\log n)', color: 'bg-white border-gray-300 text-gray-800' },
  { id: 'E', letter: 'E', complexity: 'O(2ⁿ)', latexComplexity: 'O(2^n)', color: 'bg-white border-gray-300 text-gray-800' },
  { id: 'F', letter: 'F', complexity: 'O(n)', latexComplexity: 'O(n)', color: 'bg-white border-gray-300 text-gray-800' },
  { id: 'G', letter: 'G', complexity: 'O(log n)', latexComplexity: 'O(\\log n)', color: 'bg-white border-gray-300 text-gray-800' },
  { id: 'H', letter: 'H', complexity: 'O(n³)', latexComplexity: 'O(n^3)', color: 'bg-white border-gray-300 text-gray-800' },
  { id: 'I', letter: 'I', complexity: 'O(3ⁿ)', latexComplexity: 'O(3^n)', color: 'bg-white border-gray-300 text-gray-800' },
  { id: 'J', letter: 'J', complexity: 'O(√n)', latexComplexity: 'O(\\sqrt{n})', color: 'bg-white border-gray-300 text-gray-800' },
  { id: 'K', letter: 'K', complexity: 'O(n log log n)', latexComplexity: 'O(n \\log \\log n)', color: 'bg-white border-gray-300 text-gray-800' },
  { id: 'L', letter: 'L', complexity: 'O(nⁿ)', latexComplexity: 'O(n^n)', color: 'bg-white border-gray-300 text-gray-800' },
];

const correctOrder = ['B', 'G', 'J', 'F', 'K', 'D', 'C', 'H', 'E', 'I', 'A', 'L'];

interface ComplexityRankingWidgetProps {
  onSubmit?: (result: { correct: boolean; userOrder: string; correctOrder: string }) => void;
}

export default function ComplexityRankingWidget({ onSubmit }: ComplexityRankingWidgetProps) {
  const [items, setItems] = useState<ComplexityItem[]>(() => {
    // Start in alphabetical order (A, B, C, D, ...)
    return [...complexityItems].sort((a, b) => a.letter.localeCompare(b.letter));
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; userOrder: string; correctOrder: string } | null>(null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
  };

  const checkAnswer = () => {
    const userOrder = items.map(item => item.letter).join('');
    const isCorrect = userOrder === correctOrder.join('');
    
    const resultData = {
      correct: isCorrect,
      userOrder,
      correctOrder: correctOrder.join('')
    };
    
    setResult(resultData);
    setHasSubmitted(true);
    
    if (onSubmit) {
      onSubmit(resultData);
    }
  };

  const resetWidget = () => {
    // Reset to alphabetical order
    const alphabetical = [...complexityItems].sort((a, b) => a.letter.localeCompare(b.letter));
    setItems(alphabetical);
    setHasSubmitted(false);
    setResult(null);
  };

  const getItemFeedback = (letter: string, index: number) => {
    if (!hasSubmitted) return '';
    
    const correctIndex = correctOrder.indexOf(letter);
    if (index === correctIndex) {
      return 'border-green-500 bg-green-50';
    } else {
      return 'border-red-500 bg-red-50';
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🎯 Interactive Complexity Ranking Challenge
        </h3>
        <p className="text-gray-700">
          Drag and drop the complexity functions to rank them from <strong>fastest-growing</strong> (top) to <strong>slowest-growing</strong> (bottom).
          Think about how these functions behave as n gets very large!
        </p>
      </div>

      <div className="w-full mx-auto">
        {/* Drag and Drop Area */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Rank from Fastest to Slowest (left to right):</h4>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="complexity-ranking" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`flex justify-between min-h-[100px] p-4 border-2 border-dashed rounded-lg overflow-x-auto ${
                    snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={hasSubmitted}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 border-2 rounded-lg transition-all cursor-move ${
                            snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : ''
                          } ${hasSubmitted ? getItemFeedback(item.letter, index) : item.color} ${
                            hasSubmitted ? 'cursor-default' : ''
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center px-1 py-1">
                            <div className="w-5 h-5 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center mb-1">
                              <span className="text-xs font-bold text-gray-500">
                                {item.letter}
                              </span>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-sm">
                                <LaTeXMath latex={item.latexComplexity} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Results */}
        <div>
          {result && (
            <div className={`p-4 rounded-lg border-2 ${
              result.correct 
                ? 'bg-green-50 border-green-300' 
                : 'bg-red-50 border-red-300'
            }`}>
              <h4 className={`font-bold text-lg ${
                result.correct ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.correct ? '🎉 Correct!' : '❌ Not Quite Right'}
              </h4>
              
              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <strong>Your Order:</strong> <code className="bg-white px-1 rounded">{result.userOrder}</code>
                </div>
                <div>
                  <strong>Correct Order:</strong> <code className="bg-white px-1 rounded">{result.correctOrder}</code>
                </div>
                
                {result.correct ? (
                  <p className="text-green-700 mt-2">
                    Perfect! You've mastered the complexity hierarchy. You can now predict algorithm performance just by looking at their Big O notation.
                  </p>
                ) : (
                  <p className="text-red-700 mt-2">
                    Take another look at the hints above. Pay special attention to how exponential and factorial functions compare to polynomial functions.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3 justify-center">
        {!hasSubmitted ? (
          <button
            onClick={checkAnswer}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Check My Ranking
          </button>
        ) : (
          <button
            onClick={resetWidget}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Try Again
          </button>
        )}
      </div>

      {/* Educational Note */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">🧠 Understanding Growth Rates</h4>
        <p className="text-yellow-700 text-sm">
          The correct ranking represents how these functions grow as n approaches infinity. 
          Functions higher on the list will always eventually be faster than those below them, 
          no matter what constants are involved. This is the essence of Big O analysis!
        </p>
      </div>
    </div>
  );
}