'use client';

import React, { useState } from 'react';

interface TreeNode {
  id: string;
  type: 'comparison' | 'result';
  content: string;
  left?: TreeNode;
  right?: TreeNode;
  leftLabel?: string;
  rightLabel?: string;
  arrangement?: string;
  path?: string[];
}

interface DecisionTreeVisualizerProps {
  elements?: number;
}

export default function DecisionTreeVisualizer({ elements = 3 }: DecisionTreeVisualizerProps) {
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [currentResult, setCurrentResult] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Create a simpler decision tree showing the full structure at once
  const createDecisionTree = (): TreeNode => {
    return {
      id: 'root',
      type: 'comparison',
      content: 'a ≤ b?',
      leftLabel: 'YES',
      rightLabel: 'NO',
      left: {
        id: 'left',
        type: 'comparison', 
        content: 'a ≤ c?',
        leftLabel: 'YES',
        rightLabel: 'NO',
        left: {
          id: 'left-left',
          type: 'comparison',
          content: 'b ≤ c?',
          leftLabel: 'YES',
          rightLabel: 'NO',
          left: {
            id: 'abc',
            type: 'result',
            content: '[a,b,c]',
            arrangement: 'abc',
            path: ['a ≤ b (✓)', 'a ≤ c (✓)', 'b ≤ c (✓)']
          },
          right: {
            id: 'acb',
            type: 'result',
            content: '[a,c,b]',
            arrangement: 'acb', 
            path: ['a ≤ b (✓)', 'a ≤ c (✓)', 'b ≤ c (✗)']
          }
        },
        right: {
          id: 'left-right',
          type: 'comparison',
          content: 'b ≤ c?',
          leftLabel: 'YES',
          rightLabel: 'NO',
          left: {
            id: 'bac',
            type: 'result',
            content: '[b,a,c]',
            arrangement: 'bac',
            path: ['a ≤ b (✓)', 'a ≤ c (✗)', 'b ≤ c (✓)']
          },
          right: {
            id: 'bca',
            type: 'result',
            content: '[b,c,a]',
            arrangement: 'bca',
            path: ['a ≤ b (✓)', 'a ≤ c (✗)', 'b ≤ c (✗)']
          }
        }
      },
      right: {
        id: 'right',
        type: 'comparison',
        content: 'b ≤ c?',
        leftLabel: 'YES', 
        rightLabel: 'NO',
        left: {
          id: 'right-left',
          type: 'comparison',
          content: 'a ≤ c?',
          leftLabel: 'YES',
          rightLabel: 'NO',
          left: {
            id: 'bac2',
            type: 'result',
            content: '[b,a,c]',
            arrangement: 'bac',
            path: ['a ≤ b (✗)', 'b ≤ c (✓)', 'a ≤ c (✓)']
          },
          right: {
            id: 'bca2',
            type: 'result',
            content: '[b,c,a]',
            arrangement: 'bca',
            path: ['a ≤ b (✗)', 'b ≤ c (✓)', 'a ≤ c (✗)']
          }
        },
        right: {
          id: 'right-right',
          type: 'comparison',
          content: 'a ≤ c?',
          leftLabel: 'YES',
          rightLabel: 'NO',
          left: {
            id: 'cab',
            type: 'result',
            content: '[c,a,b]',
            arrangement: 'cab',
            path: ['a ≤ b (✗)', 'b ≤ c (✗)', 'a ≤ c (✓)']
          },
          right: {
            id: 'cba',
            type: 'result',
            content: '[c,b,a]',
            arrangement: 'cba',
            path: ['a ≤ b (✗)', 'b ≤ c (✗)', 'a ≤ c (✗)']
          }
        }
      }
    };
  };

  const tree = createDecisionTree();

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const selectResult = (node: TreeNode) => {
    if (node.arrangement && node.path) {
      setCurrentResult(node.arrangement);
      setSelectedPath(node.path);
    }
  };

  const resetTree = () => {
    setExpandedNodes(new Set());
    setCurrentResult('');
    setSelectedPath([]);
  };

  const renderNode = (node: TreeNode, level: number = 0): JSX.Element => {
    const isSelected = currentResult === node.arrangement;

    if (node.type === 'result') {
      return (
        <div key={node.id} className="flex flex-col items-center">
          <button
            onClick={() => selectResult(node)}
            className={`px-1 py-0.5 rounded text-xs font-mono transition-all ${
              isSelected
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-amber-300 text-gray-800 hover:bg-amber-400'
            }`}
          >
            {node.content}
          </button>
        </div>
      );
    }

    // Calculate positions based on level
    const getLayout = (level: number) => {
      switch (level) {
        case 0: return { 
          lineHeight: 60,
          leftX: -200,    // Left child position
          rightX: 200,    // Right child position
          containerWidth: 450
        }; 
        case 1: return { 
          lineHeight: 50,
          leftX: -90,
          rightX: 90,
          containerWidth: 200
        }; 
        case 2: return { 
          lineHeight: 40,
          leftX: -45,
          rightX: 45,
          containerWidth: 110
        };  
        default: return { 
          lineHeight: 40,
          leftX: -45,
          rightX: 45,
          containerWidth: 110
        };
      }
    };

    const layout = getLayout(level);
    const containerWidth = layout.containerWidth;
    const containerHeight = layout.lineHeight + 250; // Extra space for children

    return (
      <div key={node.id} className="relative flex flex-col items-center">
        {/* Current node */}
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            level === 0
              ? 'bg-blue-500 text-white'
              : level === 1
              ? 'bg-purple-500 text-white'
              : 'bg-indigo-500 text-white'
          } shadow-sm z-10 relative`}
        >
          {node.content}
        </div>

        {(node.left || node.right) && (
          <div 
            className="relative"
            style={{ 
              width: `${containerWidth}px`, 
              height: `${containerHeight}px` 
            }}
          >
            {/* SVG for connecting lines */}
            <svg 
              className="absolute top-0 left-1/2 transform -translate-x-1/2" 
              width={containerWidth} 
              height={layout.lineHeight}
              viewBox={`0 0 ${containerWidth} ${layout.lineHeight}`}
            >
              {node.left && (
                <line 
                  x1={containerWidth / 2} 
                  y1={4} 
                  x2={(containerWidth / 2) + layout.leftX} 
                  y2={layout.lineHeight - 4} 
                  stroke="#9CA3AF" 
                  strokeWidth="1.5"
                />
              )}
              {node.right && (
                <line 
                  x1={containerWidth / 2} 
                  y1={4} 
                  x2={(containerWidth / 2) + layout.rightX} 
                  y2={layout.lineHeight - 4} 
                  stroke="#9CA3AF" 
                  strokeWidth="1.5"
                />
              )}
            </svg>

            {/* Children positioned absolutely */}
            {node.left && (
              <div 
                className="absolute top-12 transform -translate-x-1/2"
                style={{ left: `${(containerWidth / 2) + layout.leftX}px` }}
              >
                <div className="text-green-600 font-bold text-xs mb-1 text-center">
                  ✓ {node.leftLabel}
                </div>
                {renderNode(node.left, level + 1)}
              </div>
            )}
            
            {node.right && (
              <div 
                className="absolute top-12 transform -translate-x-1/2"
                style={{ left: `${(containerWidth / 2) + layout.rightX}px` }}
              >
                <div className="text-red-600 font-bold text-xs mb-1 text-center">
                  ✗ {node.rightLabel}
                </div>
                {renderNode(node.right, level + 1)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            🌳 Decision Tree for Sorting 3 Elements
          </h3>
          <button
            onClick={resetTree}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
          >
            🔄 Reset Selection
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800 text-sm">
            <strong>How to use:</strong> Click on any result node (yellow boxes) to see the decision path that leads to that sorted arrangement.
          </p>
        </div>

        <div className="flex justify-center mb-6 overflow-hidden">
          <div className="min-w-max scale-90">
            {renderNode(tree)}
          </div>
        </div>

        {currentResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h4 className="font-bold text-green-800 mb-2">
              🎯 Selected: [{currentResult.split('').join(', ')}]
            </h4>
            
            <div className="space-y-2">
              <div>
                <span className="font-semibold text-green-700 text-sm">Decision Path:</span>
                <div className="mt-1 font-mono text-xs bg-white p-2 rounded border">
                  {selectedPath.map((step, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-gray-400 mr-1">{index + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-xs text-green-700">
                <strong>Comparisons:</strong> {selectedPath.length} | <strong>Tree Depth:</strong> {selectedPath.length}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
          <h4 className="font-bold text-gray-800 mb-3">📚 Key Insights</h4>
          <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-700">
            <div>
              <h5 className="font-semibold mb-1">Tree Structure:</h5>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>6 leaves (one per permutation)</li>
                <li>Every leaf is reachable</li>
                <li>Maximum depth = worst-case comparisons</li>
                <li>Binary tree models any comparison algorithm</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-1">Information Theory:</h5>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Each comparison provides 1 bit of information</li>
                <li>Need log(3!) = log(6) ≈ 2.58 bits minimum</li>
                <li>Therefore need ⌈2.58⌉ = 3 comparisons</li>
                <li>This tree achieves the theoretical minimum!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}