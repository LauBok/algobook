'use client';

import React, { useState, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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

interface DataPoint {
  n: number;
  time: number; // in milliseconds
}

interface AlgorithmPattern {
  id: string;
  name: string;
  latex: string;
  formula: (n: number) => number; // returns time in milliseconds
  description: string;
}

const algorithmPatterns: AlgorithmPattern[] = [
  {
    id: 'constant',
    name: 'Constant',
    latex: 'O(1)',
    formula: (n) => {
      const baseTime = 0.5; // 0.5ms base
      const noise = (Math.random() - 0.5) * 0.2; // ±0.1ms noise
      return Math.max(0.1, baseTime + noise);
    },
    description: 'Same execution time regardless of input size'
  },
  {
    id: 'linear',
    name: 'Linear',
    latex: 'O(n)',
    formula: (n) => {
      const baseTime = 0.001 * n + 0.3; // 0.001ms per element + 0.3ms overhead
      const noise = (Math.random() - 0.5) * 0.1; // ±0.05ms noise
      return Math.max(0.1, baseTime + noise);
    },
    description: 'Execution time grows proportionally with input size'
  },
  {
    id: 'quadratic',
    name: 'Quadratic',
    latex: 'O(n^2)',
    formula: (n) => {
      const baseTime = 0.00001 * n * n + 0.002 * n + 0.2; // quadratic + linear + constant
      const noise = (Math.random() - 0.5) * (0.01 + 0.0001 * n); // proportional noise
      return Math.max(0.1, baseTime + noise);
    },
    description: 'Execution time grows with the square of input size'
  },
  {
    id: 'logarithmic',
    name: 'Logarithmic',
    latex: 'O(\\log n)',
    formula: (n) => {
      const baseTime = 0.05 * Math.log2(Math.max(1, n)) + 0.2; // log₂(n) + constant
      const noise = (Math.random() - 0.5) * 0.05; // ±0.025ms noise
      return Math.max(0.1, baseTime + noise);
    },
    description: 'Execution time grows very slowly with input size'
  },
  {
    id: 'linearithmic',
    name: 'Linearithmic',
    latex: 'O(n \\log n)',
    formula: (n) => {
      const baseTime = 0.0005 * n * Math.log2(Math.max(1, n)) + 0.001 * n + 0.3; // n log n + linear + constant
      const noise = (Math.random() - 0.5) * (0.02 + 0.0001 * Math.log2(Math.max(1, n))); // proportional noise
      return Math.max(0.1, baseTime + noise);
    },
    description: 'Common in efficient sorting algorithms like merge sort'
  },
  {
    id: 'cubic',
    name: 'Cubic',
    latex: 'O(n^3)',
    formula: (n) => {
      const baseTime = 0.000001 * n * n * n + 0.0001 * n * n + 0.001 * n + 0.1; // cubic + quadratic + linear + constant
      const noise = (Math.random() - 0.5) * (0.05 + 0.00001 * n * n); // proportional noise
      return Math.max(0.1, baseTime + noise);
    },
    description: 'Execution time grows with the cube of input size'
  }
];

interface AlgorithmMysteryGameProps {
  algorithmId?: string; // If specified, use specific algorithm, otherwise random
  maxAttempts?: number;
  showHints?: boolean;
}

export default function AlgorithmMysteryGame({ 
  algorithmId, 
  maxAttempts = 3, 
  showHints = true 
}: AlgorithmMysteryGameProps) {
  const [currentAlgorithm, setCurrentAlgorithm] = useState<AlgorithmPattern | null>(null);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [inputN, setInputN] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [selectedGuess, setSelectedGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, [algorithmId]);

  const startNewGame = () => {
    // Select algorithm (specific or random)
    let algorithm: AlgorithmPattern;
    if (algorithmId) {
      algorithm = algorithmPatterns.find(p => p.id === algorithmId) || algorithmPatterns[0];
    } else {
      algorithm = algorithmPatterns[Math.floor(Math.random() * algorithmPatterns.length)];
    }

    setCurrentAlgorithm(algorithm);
    setDataPoints([]);
    setAttempts(0);
    setGameStatus('playing');
    setSelectedGuess('');
    setFeedback('');
    
    // Generate initial data points
    const initialPoints: DataPoint[] = [];
    const testSizes = [1, 2, 4, 8];
    testSizes.forEach(n => {
      initialPoints.push({ n, time: algorithm.formula(n) });
    });
    setDataPoints(initialPoints);
  };

  const testWithN = () => {
    const n = parseInt(inputN);
    if (!n || n < 1 || n > 1000 || !currentAlgorithm) return;

    const time = currentAlgorithm.formula(n);
    const newDataPoint = { n, time };
    
    // Add to data points if not already tested
    if (!dataPoints.find(dp => dp.n === n)) {
      setDataPoints(prev => [...prev, newDataPoint].sort((a, b) => a.n - b.n));
    }
    
    setInputN('');
  };

  const makeGuess = () => {
    if (!selectedGuess || !currentAlgorithm || gameStatus !== 'playing') return;

    setAttempts(prev => prev + 1);

    if (selectedGuess === currentAlgorithm.id) {
      setGameStatus('won');
      setFeedback(`🎉 Correct! This algorithm has ${currentAlgorithm.description.toLowerCase()}.`);
    } else {
      const remainingAttempts = maxAttempts - (attempts + 1);
      if (remainingAttempts <= 0) {
        setGameStatus('lost');
        setFeedback(`❌ Game Over! The correct answer was ${currentAlgorithm.name} (${currentAlgorithm.latex}). ${currentAlgorithm.description}.`);
      } else {
        const guessedPattern = algorithmPatterns.find(p => p.id === selectedGuess);
        setFeedback(`❌ Incorrect! ${guessedPattern?.name} doesn't match this pattern. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`);
      }
    }
    setSelectedGuess('');
  };


  if (!currentAlgorithm) return null;

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🕵️ Algorithm Mystery Challenge
        </h3>
        <p className="text-gray-700">
          A mysterious algorithm is running behind the scenes. Test different input sizes to discover its time complexity!
        </p>
      </div>

      {/* Test Input */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <label className="font-medium text-gray-700">Test with n =</label>
          <input
            type="number"
            value={inputN}
            onChange={(e) => setInputN(e.target.value)}
            min="1"
            max="1000"
            className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={gameStatus !== 'playing'}
          />
          <button
            onClick={testWithN}
            disabled={!inputN || gameStatus !== 'playing'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Run Test
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">📊 Test Results</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-50 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left font-semibold">Input Size (n)</th>
                <th className="px-4 py-2 text-left font-semibold">Execution Time (ms)</th>
              </tr>
            </thead>
            <tbody>
              {dataPoints.map((point, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 font-mono">{point.n}</td>
                  <td className="px-4 py-2 font-mono font-bold text-blue-600">{Number(point.time).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>

      {/* Guess Options */}
      {gameStatus === 'playing' && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">🎯 What's the Time Complexity?</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {algorithmPatterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => setSelectedGuess(pattern.id)}
                className={`p-3 border-2 rounded-lg transition-all ${
                  selectedGuess === pattern.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold text-sm mb-1">
                    <LaTeXMath latex={pattern.latex} />
                  </div>
                  <div className="text-xs text-gray-600">{pattern.name}</div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Attempts: {attempts}/{maxAttempts}
            </div>
            <button
              onClick={makeGuess}
              disabled={!selectedGuess}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Submit Guess
            </button>
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`mb-6 p-4 rounded-lg ${
          gameStatus === 'won' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className="text-sm font-medium">{feedback}</p>
        </div>
      )}

      {/* Game Controls */}
      <div className="flex justify-center">
        <button
          onClick={startNewGame}
          className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          {gameStatus === 'playing' ? '🔄 New Challenge' : '🎮 Play Again'}
        </button>
      </div>

      {/* Educational Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">🧠 How to Analyze</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Look at how operations grow as n increases</li>
          <li>• Compare ratios: if operations double when n doubles → O(n)</li>
          <li>• If operations quadruple when n doubles → O(n²)</li>
          <li>• If operations barely change when n doubles → O(log n)</li>
          <li>• Test edge cases with small and large values</li>
        </ul>
      </div>
    </div>
  );
}