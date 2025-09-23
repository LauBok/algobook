'use client';

import React, { useState } from 'react';

interface FunctionInput {
  name: string;
  value: string;
}

interface FunctionExample {
  inputs: FunctionInput[];
  output: string;
}

interface FunctionMachineProps {
  machineName?: string;
  description?: string;
  examples?: FunctionExample[];
  interactive?: boolean;
}

export default function FunctionMachine({
  machineName = "FUNCTION MACHINE",
  description = "Takes inputs, processes them, and produces outputs",
  examples = [],
  interactive = false
}: FunctionMachineProps) {
  const [currentExample, setCurrentExample] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleExampleChange = (index: number) => {
    if (index === currentExample) return;

    setIsAnimating(true);
    setTimeout(() => {
      setCurrentExample(index);
      setIsAnimating(false);
    }, 300);
  };

  const currentInputs = examples[currentExample]?.inputs || [];
  const currentOutput = examples[currentExample]?.output || "";

  return (
    <div className="function-machine-widget bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl border-2 border-blue-200 shadow-lg mb-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          🔧 Function Machine Concept
        </h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>

      <div className="function-flow flex items-center justify-center space-x-4 flex-wrap">
        {/* Input Section */}
        <div className={`input-section bg-green-100 border-2 border-green-300 rounded-lg p-3 w-48 text-center transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="text-xl mb-1">📥</div>
          <div className="font-bold text-green-800 text-sm mb-2">INPUTS</div>
          {currentInputs.map((input, index) => (
            <div key={index} className="text-xs text-green-700 bg-white rounded px-2 py-1 mb-1">
              <span className="font-medium">{input.name}:</span> {input.value}
            </div>
          ))}
        </div>

        {/* Arrow Right */}
        <div className="text-2xl text-blue-600">➡️</div>

        {/* Machine Section */}
        <div className="machine-section bg-blue-100 border-2 border-blue-400 rounded-xl p-4 w-56 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-blue-300 opacity-30"></div>
          <div className="relative z-10">
            <div className="text-2xl mb-1">⚙️</div>
            <div className="font-bold text-blue-800 text-sm mb-2">{machineName}</div>
            <div className="text-xs text-blue-700 bg-white bg-opacity-80 rounded px-2 py-1">
              Processing...
            </div>
            <div className="mt-2 flex justify-center space-x-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>

        {/* Arrow Right */}
        <div className="text-2xl text-blue-600">➡️</div>

        {/* Output Section */}
        <div className={`output-section bg-purple-100 border-2 border-purple-300 rounded-lg p-3 w-48 text-center transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="text-xl mb-1">📤</div>
          <div className="font-bold text-purple-800 text-sm mb-2">OUTPUT</div>
          <div className="text-xs text-purple-700 bg-white rounded px-2 py-2 font-mono">
            {currentOutput}
          </div>
        </div>
      </div>

      {/* Example Controls */}
      {interactive && examples.length > 1 && (
        <div className="example-controls mt-8 text-center">
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-700">Try different examples:</span>
          </div>
          <div className="flex justify-center space-x-2">
            {examples.map((_, index) => (
              <button
                key={index}
                onClick={() => handleExampleChange(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentExample === index
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                }`}
              >
                Example {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Key Concept */}
      <div className="key-concept mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex items-start">
          <div className="text-2xl mr-3">💡</div>
          <div>
            <div className="font-bold text-yellow-800 mb-1">Key Concept</div>
            <div className="text-sm text-yellow-700">
              Same machine, different inputs → different outputs.
              Build once, use many times!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}