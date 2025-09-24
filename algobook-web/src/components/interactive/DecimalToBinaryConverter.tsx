'use client';

import React, { useState } from 'react';

interface DecimalToBinaryConverterProps {
  id?: string;
  maxValue?: number;
}

export default function DecimalToBinaryConverter({
  id = 'decimal-to-binary',
  maxValue = 255
}: DecimalToBinaryConverterProps) {
  const [decimal, setDecimal] = useState(181);

  // Convert decimal to binary
  const binary = decimal.toString(2);
  const paddedBinary = binary.padStart(8, '0');

  // Get division steps for the algorithm
  const getDivisionSteps = () => {
    const steps = [];
    let value = decimal;

    while (value > 0) {
      const quotient = Math.floor(value / 2);
      const remainder = value % 2;
      steps.push({ value, quotient, remainder });
      value = quotient;
    }

    return steps;
  };

  // Get bit breakdown for positional notation
  const getBitBreakdown = () => {
    return paddedBinary.split('').map((bit, index) => ({
      position: 7 - index,
      bit: bit === '1',
      weight: Math.pow(2, 7 - index)
    }));
  };

  const divisionSteps = getDivisionSteps();
  const bitBreakdown = getBitBreakdown();

  // Handle decimal input
  const handleDecimalChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 0 && num <= maxValue) {
      setDecimal(num);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-4">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 mb-1">Decimal to Binary Converter</h3>
        <p className="text-xs text-gray-600">Enter a decimal number to see the binary conversion process</p>
      </div>

      {/* Decimal Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Decimal Input:</label>
        <input
          type="number"
          value={decimal}
          onChange={(e) => handleDecimalChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-center font-mono text-lg"
          min={0}
          max={maxValue}
          placeholder="Enter decimal number"
        />
        <div className="text-xs text-gray-500 mt-1 text-center">
          Range: 0 - {maxValue}
        </div>
      </div>

      {/* Binary Result Display */}
      <div className="mb-4 text-center p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="text-sm text-green-700 mb-1">Binary Result:</div>
        <div className="text-3xl font-bold text-green-800 font-mono">{binary}</div>
        <div className="text-xs text-green-600 mt-1">
          Decimal {decimal} = Binary {binary}
        </div>
      </div>

      {/* Bit Visualization */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">8-Bit Representation</h4>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="grid grid-cols-8 gap-1">
            {bitBreakdown.map((bit) => (
              <div key={bit.position} className="text-center">
                <div className="text-xs text-gray-500 mb-1">2^{bit.position}</div>
                <div
                  className={`w-full h-10 rounded border-2 font-mono text-sm font-bold flex items-center justify-center ${
                    bit.bit
                      ? 'bg-green-500 text-white border-green-600'
                      : 'bg-red-500 text-white border-red-600'
                  }`}
                >
                  {bit.bit ? '1' : '0'}
                </div>
                <div className="text-xs text-gray-500 mt-1">{bit.weight}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Division Algorithm */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Division by 2 Algorithm</h4>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-2">
            Divide by 2, collect remainders from bottom to top:
          </div>

          {divisionSteps.length > 0 ? (
            <div className="space-y-1">
              {divisionSteps.map((step, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border font-mono text-sm">
                  <span>{step.value} ÷ 2</span>
                  <span>=</span>
                  <span>{step.quotient} remainder <span className="font-bold text-blue-600">{step.remainder}</span></span>
                </div>
              ))}

              <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-1">Reading remainders (bottom to top):</div>
                <div className="font-mono text-lg font-bold text-blue-600">
                  {divisionSteps.slice().reverse().map(step => step.remainder).join('')}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 p-4">
              Enter a number greater than 0 to see the division steps
            </div>
          )}
        </div>
      </div>

      {/* Verification */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Verification (Binary to Decimal)</h4>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
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
              <div className="text-blue-600 font-bold">
                = {decimal} ✓
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Note */}
      <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
        <p className="text-xs text-yellow-800">
          <strong>💡 Algorithm:</strong> Keep dividing by 2 and collect remainders. The binary result is the remainders read from bottom to top.
        </p>
      </div>
    </div>
  );
}