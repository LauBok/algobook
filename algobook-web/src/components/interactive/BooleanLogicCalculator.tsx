'use client';

import React, { useState } from 'react';

interface BooleanLogicCalculatorProps {
  id?: string;
  initialA?: boolean;
  initialB?: boolean;
}

export default function BooleanLogicCalculator({
  id = 'boolean-logic',
  initialA = false,
  initialB = false
}: BooleanLogicCalculatorProps) {
  const [bitA, setBitA] = useState(initialA);
  const [bitB, setBitB] = useState(initialB);

  const operations = [
    { name: 'AND', symbol: '∧', operation: (a: boolean, b: boolean) => a && b },
    { name: 'OR', symbol: '∨', operation: (a: boolean, b: boolean) => a || b },
    { name: 'XOR', symbol: '⊕', operation: (a: boolean, b: boolean) => a !== b },
    { name: 'NAND', symbol: '↑', operation: (a: boolean, b: boolean) => !(a && b) },
    { name: 'NOR', symbol: '↓', operation: (a: boolean, b: boolean) => !(a || b) },
  ];

  const formatBit = (value: boolean) => value ? '1' : '0';

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-4">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 mb-1">Boolean Logic Calculator</h3>
        <p className="text-xs text-gray-600">Toggle inputs to see logical operation results</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left side: Inputs and Operations - Aligned with truth tables */}
        <div className="space-y-3 lg:col-span-1">
          {/* Input Controls */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 w-8">A:</span>
              <button
                onClick={() => setBitA(!bitA)}
                className={`w-8 h-8 rounded font-bold text-sm transition-all border-2 ${
                  bitA
                    ? 'bg-green-500 text-white border-green-600 shadow-md'
                    : 'bg-red-500 text-white border-red-600 shadow-md'
                }`}
              >
                {formatBit(bitA)}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 w-8">B:</span>
              <button
                onClick={() => setBitB(!bitB)}
                className={`w-8 h-8 rounded font-bold text-sm transition-all border-2 ${
                  bitB
                    ? 'bg-green-500 text-white border-green-600 shadow-md'
                    : 'bg-red-500 text-white border-red-600 shadow-md'
                }`}
              >
                {formatBit(bitB)}
              </button>
            </div>
          </div>

          {/* All Operations - Aligned with truth table order */}
          <div className="space-y-1 text-sm">
            {/* NOT A */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
              <span className="font-mono">¬{formatBit(bitA)}</span>
              <span className="text-gray-400">=</span>
              <span className={`font-bold ${!bitA ? 'text-green-600' : 'text-red-600'}`}>
                {formatBit(!bitA)}
              </span>
              <span className="text-xs text-gray-500 min-w-[40px] text-right">NOT A</span>
            </div>

            {/* NOT B */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
              <span className="font-mono">¬{formatBit(bitB)}</span>
              <span className="text-gray-400">=</span>
              <span className={`font-bold ${!bitB ? 'text-green-600' : 'text-red-600'}`}>
                {formatBit(!bitB)}
              </span>
              <span className="text-xs text-gray-500 min-w-[40px] text-right">NOT B</span>
            </div>

            {/* Binary Operations in same order as truth tables */}
            {operations.map((op) => (
              <div key={op.name} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                <span className="font-mono text-sm">
                  {formatBit(bitA)} {op.symbol} {formatBit(bitB)}
                </span>
                <span className="text-gray-400">=</span>
                <span className={`font-bold ${op.operation(bitA, bitB) ? 'text-green-600' : 'text-red-600'}`}>
                  {formatBit(op.operation(bitA, bitB))}
                </span>
                <span className="text-xs text-gray-500">
                  A {op.name} B
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Truth Tables - Wider with 3 columns */}
        <div className="lg:col-span-2">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Truth Tables</h4>

          {/* All Truth Tables - 7 total aligned in 3 columns */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* NOT A */}
            <div className="bg-gray-50 rounded p-2">
              <div className="font-semibold text-center mb-1">NOT A</div>
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="px-1">A</th>
                    <th className="px-1">¬A</th>
                  </tr>
                </thead>
                <tbody>
                  {[false, true].map(a => (
                    <tr
                      key={`not-a-${a}`}
                      className={`${a === bitA ? 'bg-blue-100 font-bold' : ''}`}
                    >
                      <td className="text-center px-1">{formatBit(a)}</td>
                      <td className={`text-center px-1 ${!a ? 'text-green-600' : 'text-red-600'}`}>
                        {formatBit(!a)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* NOT B */}
            <div className="bg-gray-50 rounded p-2">
              <div className="font-semibold text-center mb-1">NOT B</div>
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="px-1">B</th>
                    <th className="px-1">¬B</th>
                  </tr>
                </thead>
                <tbody>
                  {[false, true].map(b => (
                    <tr
                      key={`not-b-${b}`}
                      className={`${b === bitB ? 'bg-blue-100 font-bold' : ''}`}
                    >
                      <td className="text-center px-1">{formatBit(b)}</td>
                      <td className={`text-center px-1 ${!b ? 'text-green-600' : 'text-red-600'}`}>
                        {formatBit(!b)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Binary Operations - AND, OR, XOR, NAND, NOR */}
            {operations.map((op) => (
              <div key={op.name} className="bg-gray-50 rounded p-2">
                <div className="font-semibold text-center mb-1">{op.name}</div>
                <table className="w-full font-mono text-xs">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="px-1">A</th>
                      <th className="px-1">B</th>
                      <th className="px-1">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[false, true].map(a =>
                      [false, true].map(b => (
                        <tr
                          key={`${op.name}-${a}-${b}`}
                          className={`${a === bitA && b === bitB ? 'bg-blue-100 font-bold' : ''}`}
                        >
                          <td className="text-center px-1">{formatBit(a)}</td>
                          <td className="text-center px-1">{formatBit(b)}</td>
                          <td className={`text-center px-1 ${op.operation(a, b) ? 'text-green-600' : 'text-red-600'}`}>
                            {formatBit(op.operation(a, b))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Educational Note - Compact */}
      <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>💡 Tip:</strong> These operations form the foundation of all digital computation.
        </p>
      </div>
    </div>
  );
}