'use client';

import React, { useState } from 'react';

interface FloatingPointWidgetProps {
  id?: string;
}

export default function FloatingPointWidget({
  id = 'floating-point-widget'
}: FloatingPointWidgetProps) {
  const [inputValue, setInputValue] = useState('3.14');

  // Convert float to IEEE 754 32-bit representation
  const getFloatRepresentation = (value: number) => {
    if (isNaN(value)) {
      return {
        sign: 0,
        exponent: 255,
        mantissa: 0x400000, // NaN pattern
        binary: 'Invalid',
        hex: 'Invalid'
      };
    }

    if (!isFinite(value)) {
      return {
        sign: value < 0 ? 1 : 0,
        exponent: 255,
        mantissa: 0,
        binary: 'Infinity',
        hex: value < 0 ? '0xFF800000' : '0x7F800000'
      };
    }

    if (value === 0) {
      return {
        sign: Object.is(value, -0) ? 1 : 0,
        exponent: 0,
        mantissa: 0,
        binary: Object.is(value, -0) ? '10000000000000000000000000000000' : '00000000000000000000000000000000',
        hex: Object.is(value, -0) ? '0x80000000' : '0x00000000'
      };
    }

    // Use Float32Array for accurate IEEE 754 conversion
    const buffer = new ArrayBuffer(4);
    const floatView = new Float32Array(buffer);
    const intView = new Uint32Array(buffer);

    floatView[0] = value;
    const bits = intView[0];

    const sign = (bits >>> 31) & 0x1;
    const exponent = (bits >>> 23) & 0xFF;
    const mantissa = bits & 0x7FFFFF;

    const binary = bits.toString(2).padStart(32, '0');
    const hex = '0x' + bits.toString(16).toUpperCase().padStart(8, '0');

    return { sign, exponent, mantissa, binary, hex };
  };

  // Parse input and get representation
  const parseInput = () => {
    const value = parseFloat(inputValue);
    return getFloatRepresentation(value);
  };

  const representation = parseInput();
  const inputNumber = parseFloat(inputValue);

  // Calculate human-readable breakdown
  const getHumanBreakdown = () => {
    if (isNaN(inputNumber) || !isFinite(inputNumber) || inputNumber === 0) {
      return null;
    }

    const actualExponent = representation.exponent - 127; // Remove bias
    const mantissaValue = 1 + representation.mantissa / Math.pow(2, 23); // Add implicit 1
    const signValue = representation.sign ? -1 : 1;

    return {
      sign: signValue,
      exponent: actualExponent,
      mantissa: mantissaValue,
      calculation: `${signValue} × ${mantissaValue.toFixed(6)} × 2^${actualExponent}`
    };
  };

  const breakdown = getHumanBreakdown();

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  // Preset values for exploration
  const presetValues = [
    { label: '1.0', value: '1.0' },
    { label: '0.5', value: '0.5' },
    { label: '-2.0', value: '-2.0' },
    { label: '3.14159', value: '3.14159' },
    { label: '0.1', value: '0.1' },
    { label: '100000', value: '100000' },
    { label: '0.000001', value: '0.000001' }
  ];

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-4">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 mb-1">IEEE 754 Floating Point (32-bit)</h3>
        <p className="text-xs text-gray-600">
          Explore how decimal numbers are stored in binary using IEEE 754 standard
        </p>
      </div>

      {/* Input Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Decimal Number:</label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-center font-mono text-lg"
          placeholder="Enter a decimal number"
        />
        <div className="flex gap-1 mt-2 flex-wrap">
          {presetValues.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setInputValue(preset.value)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Binary Representation */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">32-Bit Binary Breakdown</h4>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Sign (1 bit)</div>
              <div className="text-xs text-gray-400">Bit 31</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Exponent (8 bits)</div>
              <div className="text-xs text-gray-400">Bits 30-23</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Mantissa (23 bits)</div>
              <div className="text-xs text-gray-400">Bits 22-0</div>
            </div>
          </div>

          {representation.binary !== 'Invalid' && representation.binary !== 'Infinity' ? (
            <div className="grid grid-cols-3 gap-2">
              {/* Sign bit */}
              <div className="text-center">
                <div className={`w-full h-12 rounded border-2 font-mono text-lg font-bold flex items-center justify-center ${
                  representation.sign
                    ? 'bg-red-500 text-white border-red-600'
                    : 'bg-green-500 text-white border-green-600'
                }`}>
                  {representation.sign}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {representation.sign ? 'Negative' : 'Positive'}
                </div>
              </div>

              {/* Exponent bits */}
              <div className="text-center">
                <div className="w-full h-12 rounded border-2 font-mono text-xs font-bold flex items-center justify-center bg-blue-500 text-white border-blue-600 px-1">
                  {representation.binary.slice(1, 9)}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {representation.exponent} (biased)
                </div>
              </div>

              {/* Mantissa bits */}
              <div className="text-center">
                <div className="w-full h-12 rounded border-2 font-mono text-xs font-bold flex items-center justify-center bg-purple-500 text-white border-purple-600 px-1 overflow-hidden">
                  {representation.binary.slice(9)}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {representation.mantissa.toString(16).toUpperCase()}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-500 font-mono">{representation.binary}</div>
            </div>
          )}
        </div>
      </div>

      {/* Complete Binary and Hex */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Complete Representation</h4>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <div className="text-sm text-blue-700 mb-1">Binary (32 bits):</div>
              <div className="font-mono text-sm text-blue-800 break-all">
                {representation.binary !== 'Invalid' && representation.binary !== 'Infinity'
                  ? representation.binary.replace(/(.{8})/g, '$1 ').trim()
                  : representation.binary
                }
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-700 mb-1">Hexadecimal:</div>
              <div className="font-mono text-sm text-blue-800">{representation.hex}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mathematical Breakdown */}
      {breakdown && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Mathematical Formula</h4>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="font-mono text-sm text-green-800 mb-2">
              Value = Sign × Mantissa × 2^Exponent
            </div>
            <div className="font-mono text-sm text-green-700 mb-2">
              {breakdown.calculation}
            </div>
            <div className="text-sm text-green-600">
              <strong>Components:</strong>
            </div>
            <ul className="text-xs text-green-700 ml-4 list-disc">
              <li>Sign: {breakdown.sign} ({breakdown.sign > 0 ? 'positive' : 'negative'})</li>
              <li>Exponent: {breakdown.exponent} (actual), {representation.exponent} (biased +127)</li>
              <li>Mantissa: {breakdown.mantissa.toFixed(6)} (1.{representation.mantissa.toString(2).padStart(23, '0')} in binary)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Educational Notes */}
      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="text-sm text-yellow-800">
          <strong>💡 Key Concepts:</strong>
          <ul className="mt-2 ml-4 list-disc text-xs space-y-1">
            <li><strong>Sign bit:</strong> 0 = positive, 1 = negative</li>
            <li><strong>Exponent:</strong> 8-bit biased by +127 (range: -126 to +127)</li>
            <li><strong>Mantissa:</strong> 23-bit fraction with implicit leading 1</li>
            <li><strong>Precision:</strong> ~7 decimal digits for 32-bit floats</li>
            <li><strong>Special values:</strong> 0, ±∞, NaN have special bit patterns</li>
          </ul>
        </div>
      </div>
    </div>
  );
}