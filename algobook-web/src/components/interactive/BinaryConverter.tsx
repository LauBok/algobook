'use client';

import React, { useState } from 'react';

interface BinaryConverterProps {
  id?: string;
  maxBits?: number;
}

export default function BinaryConverter({
  id = 'binary-converter',
  maxBits = 16
}: BinaryConverterProps) {
  const [decimal, setDecimal] = useState(181);
  const [binary, setBinary] = useState('10110101');
  const [hexadecimal, setHexadecimal] = useState('B5');
  const [activeInput, setActiveInput] = useState<'decimal' | 'binary' | 'hex'>('decimal');

  // Convert decimal to other formats
  const convertFromDecimal = (value: number) => {
    if (value < 0 || value >= Math.pow(2, maxBits)) {
      return null;
    }
    const binaryStr = value.toString(2).padStart(8, '0');
    const hexStr = value.toString(16).toUpperCase();
    return { binary: binaryStr, hex: hexStr };
  };

  // Convert binary to other formats
  const convertFromBinary = (binaryStr: string) => {
    if (!/^[01]+$/.test(binaryStr) || binaryStr.length > maxBits) {
      return null;
    }
    const decimalValue = parseInt(binaryStr, 2);
    const hexStr = decimalValue.toString(16).toUpperCase();
    return { decimal: decimalValue, hex: hexStr };
  };

  // Convert hex to other formats
  const convertFromHex = (hexStr: string) => {
    if (!/^[0-9A-Fa-f]+$/.test(hexStr)) {
      return null;
    }
    const decimalValue = parseInt(hexStr, 16);
    if (decimalValue >= Math.pow(2, maxBits)) {
      return null;
    }
    const binaryStr = decimalValue.toString(2).padStart(8, '0');
    return { decimal: decimalValue, binary: binaryStr };
  };

  // Handle decimal input change
  const handleDecimalChange = (value: string) => {
    const num = parseInt(value) || 0;
    setDecimal(num);
    setActiveInput('decimal');

    const converted = convertFromDecimal(num);
    if (converted) {
      setBinary(converted.binary);
      setHexadecimal(converted.hex);
    }
  };

  // Handle binary input change
  const handleBinaryChange = (value: string) => {
    setBinary(value);
    setActiveInput('binary');

    const converted = convertFromBinary(value);
    if (converted) {
      setDecimal(converted.decimal);
      setHexadecimal(converted.hex);
    }
  };

  // Handle hex input change
  const handleHexChange = (value: string) => {
    setHexadecimal(value);
    setActiveInput('hex');

    const converted = convertFromHex(value);
    if (converted) {
      setDecimal(converted.decimal);
      setBinary(converted.binary);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Number System Converter</h3>
        <p className="text-sm text-gray-600">
          Convert between decimal, binary, and hexadecimal number systems
        </p>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Decimal Input */}
        <div className={`p-4 border-2 rounded-lg ${activeInput === 'decimal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Decimal (Base 10)
          </label>
          <input
            type="number"
            value={decimal}
            onChange={(e) => handleDecimalChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-center font-mono text-lg"
            min={0}
            max={Math.pow(2, maxBits) - 1}
          />
          <div className="text-xs text-gray-500 mt-1 text-center">
            Range: 0 - {Math.pow(2, maxBits) - 1}
          </div>
        </div>

        {/* Binary Input */}
        <div className={`p-4 border-2 rounded-lg ${activeInput === 'binary' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Binary (Base 2)
          </label>
          <input
            type="text"
            value={binary}
            onChange={(e) => handleBinaryChange(e.target.value.replace(/[^01]/g, ''))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-center font-mono text-lg"
            placeholder="10110101"
            maxLength={maxBits}
          />
          <div className="text-xs text-gray-500 mt-1 text-center">
            Only 0s and 1s
          </div>
        </div>

        {/* Hexadecimal Input */}
        <div className={`p-4 border-2 rounded-lg ${activeInput === 'hex' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hexadecimal (Base 16)
          </label>
          <input
            type="text"
            value={hexadecimal}
            onChange={(e) => handleHexChange(e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-center font-mono text-lg"
            placeholder="B5"
          />
          <div className="text-xs text-gray-500 mt-1 text-center">
            0-9, A-F
          </div>
        </div>
      </div>

      {/* Educational Note */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 Learning Tip:</strong> Each number system uses different bases - decimal (10), binary (2), and hexadecimal (16).
          The same quantity can be represented in any base.
        </p>
      </div>
    </div>
  );
}