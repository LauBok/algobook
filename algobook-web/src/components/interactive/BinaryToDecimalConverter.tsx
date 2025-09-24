'use client';

import React, { useState } from 'react';

interface BinaryToDecimalConverterProps {
  id?: string;
  maxBits?: number;
}

export default function BinaryToDecimalConverter({
  id = 'binary-to-decimal',
  maxBits = 8
}: BinaryToDecimalConverterProps) {
  const [binary, setBinary] = useState('10110101');

  // Convert binary to decimal
  const decimal = parseInt(binary || '0', 2);

  // Get individual bits for breakdown
  const getBitBreakdown = () => {
    const paddedBinary = binary.padStart(maxBits, '0');
    return paddedBinary.split('').map((bit, index) => ({
      position: maxBits - 1 - index,
      bit: bit === '1',
      value: parseInt(bit) * Math.pow(2, maxBits - 1 - index),
      weight: Math.pow(2, maxBits - 1 - index)
    }));
  };

  const bitBreakdown = getBitBreakdown();

  // Toggle specific bit
  const toggleBit = (position: number) => {
    const paddedBinary = binary.padStart(maxBits, '0');
    const bits = paddedBinary.split('').reverse();
    bits[position] = bits[position] === '1' ? '0' : '1';
    const newBinary = bits.reverse().join('').replace(/^0+/, '') || '0';
    setBinary(newBinary);
  };

  // Handle text input
  const handleBinaryInput = (value: string) => {
    // Only allow 0s and 1s
    const cleanValue = value.replace(/[^01]/g, '');
    if (cleanValue.length <= maxBits) {
      setBinary(cleanValue);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-4">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 mb-1">Binary to Decimal Converter</h3>
        <p className="text-xs text-gray-600">Click bits or type binary to see decimal conversion</p>
      </div>

      {/* Binary Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Binary Input:</label>
        <input
          type="text"
          value={binary}
          onChange={(e) => handleBinaryInput(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-center font-mono text-lg"
          placeholder="Enter binary (e.g., 10110101)"
          maxLength={maxBits}
        />
        <div className="text-xs text-gray-500 mt-1 text-center">
          Only 0s and 1s, up to {maxBits} bits
        </div>
      </div>

      {/* Interactive Bit Visualization */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Interactive Bits</h4>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="grid grid-cols-8 gap-1 mb-3">
            {bitBreakdown.map((bit) => (
              <div key={bit.position} className="text-center">
                <div className="text-xs text-gray-500 mb-1">2^{bit.position}</div>
                <button
                  onClick={() => toggleBit(bit.position)}
                  className={`w-full h-10 rounded border-2 font-mono text-sm font-bold transition-all ${
                    bit.bit
                      ? 'bg-green-500 text-white border-green-600 shadow-md'
                      : 'bg-red-500 text-white border-red-600 shadow-md hover:bg-red-400'
                  }`}
                >
                  {bit.bit ? '1' : '0'}
                </button>
                <div className="text-xs text-gray-500 mt-1">{bit.weight}</div>
              </div>
            ))}
          </div>

          {/* Mathematical Breakdown */}
          <div className="bg-white p-3 rounded border">
            <div className="text-sm font-medium text-gray-700 mb-2">Calculation:</div>
            <div className="font-mono text-sm space-y-1">
              <div className="flex flex-wrap gap-1 items-center">
                {bitBreakdown.map((bit, index) => (
                  <React.Fragment key={bit.position}>
                    <span className={bit.bit ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                      {bit.bit ? '1' : '0'}×2^{bit.position}
                    </span>
                    {index < bitBreakdown.length - 1 && <span className="text-gray-400">+</span>}
                  </React.Fragment>
                ))}
              </div>
              <div className="border-t pt-2">
                <div className="flex flex-wrap gap-1 items-center mb-1">
                  {bitBreakdown.filter(bit => bit.bit).map((bit, index, array) => (
                    <React.Fragment key={bit.position}>
                      <span className="text-green-600 font-semibold">{bit.weight}</span>
                      {index < array.length - 1 && <span className="text-gray-400">+</span>}
                    </React.Fragment>
                  ))}
                </div>
                <div className="text-blue-600 font-bold text-lg">
                  = {decimal}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Display */}
      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-700 mb-1">Decimal Result:</div>
        <div className="text-3xl font-bold text-blue-800">{decimal}</div>
        <div className="text-xs text-blue-600 mt-1">
          Binary {binary} = Decimal {decimal}
        </div>
      </div>

      {/* Educational Note */}
      <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
        <p className="text-xs text-yellow-800">
          <strong>💡 Tip:</strong> Each bit position represents a power of 2. Add up the weights where bits are 1.
        </p>
      </div>
    </div>
  );
}