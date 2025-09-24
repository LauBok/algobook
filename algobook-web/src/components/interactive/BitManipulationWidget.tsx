'use client';

import React, { useState } from 'react';

interface BitManipulationWidgetProps {
  id?: string;
  initialValue?: number;
  bitWidth?: number;
}

export default function BitManipulationWidget({
  id = 'bit-manipulation',
  initialValue = 170, // 10101010 in binary
  bitWidth = 8
}: BitManipulationWidgetProps) {
  const [value, setValue] = useState(initialValue);
  const [shiftAmount, setShiftAmount] = useState(1);
  const [selectedOperation, setSelectedOperation] = useState<'and' | 'or' | 'xor' | 'not'>('and');
  const [operandValue, setOperandValue] = useState(240); // 11110000 in binary

  // Convert number to binary string with leading zeros
  const toBinaryString = (num: number) => {
    return (num >>> 0).toString(2).padStart(bitWidth, '0').slice(-bitWidth);
  };

  // Get individual bits as array
  const getBits = (num: number) => {
    return toBinaryString(num).split('').map((bit, index) => ({
      position: bitWidth - 1 - index,
      value: bit === '1',
      weight: Math.pow(2, bitWidth - 1 - index)
    }));
  };

  // Toggle specific bit
  const toggleBit = (position: number) => {
    const newValue = value ^ (1 << position);
    setValue(newValue & ((1 << bitWidth) - 1)); // Mask to keep within bit width
  };

  // Set specific bit
  const setBit = (position: number) => {
    const newValue = value | (1 << position);
    setValue(newValue & ((1 << bitWidth) - 1));
  };

  // Clear specific bit
  const clearBit = (position: number) => {
    const newValue = value & ~(1 << position);
    setValue(newValue);
  };

  // Perform bitwise operations
  const performOperation = (op: string) => {
    let result;
    switch (op) {
      case 'and':
        result = value & operandValue;
        break;
      case 'or':
        result = value | operandValue;
        break;
      case 'xor':
        result = value ^ operandValue;
        break;
      case 'not':
        result = ~value;
        break;
      case 'shiftLeft':
        result = value << shiftAmount;
        break;
      case 'shiftRight':
        result = value >> shiftAmount;
        break;
      default:
        result = value;
    }
    setValue(result & ((1 << bitWidth) - 1));
  };

  const bits = getBits(value);
  const operandBits = getBits(operandValue);

  const BitDisplay = ({
    bits,
    label,
    onBitClick,
    showActions = false,
    color = 'blue'
  }: {
    bits: Array<{position: number, value: boolean, weight: number}>,
    label: string,
    onBitClick?: (position: number) => void,
    showActions?: boolean,
    color?: string
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500 font-mono">
          {parseInt(bits.map(b => b.value ? '1' : '0').join(''), 2)} (decimal)
        </span>
      </div>

      <div className="flex gap-1">
        {bits.map((bit) => (
          <div key={bit.position} className="flex flex-col items-center">
            <div className="text-xs text-gray-400 mb-1">{bit.position}</div>
            <button
              onClick={() => onBitClick?.(bit.position)}
              disabled={!onBitClick}
              className={`w-10 h-10 rounded border-2 font-mono font-bold transition-all ${
                bit.value
                  ? `bg-${color}-500 text-white border-${color}-600 shadow-md`
                  : `bg-white text-gray-400 border-gray-300 ${onBitClick ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'}`
              }`}
            >
              {bit.value ? '1' : '0'}
            </button>
            {showActions && (
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => setBit(bit.position)}
                  className="text-xs px-1 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                  title="Set bit"
                >
                  1
                </button>
                <button
                  onClick={() => clearBit(bit.position)}
                  className="text-xs px-1 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  title="Clear bit"
                >
                  0
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Bit Manipulation Playground</h3>
        <p className="text-sm text-gray-600">
          Explore bitwise operations and bit-level manipulations
        </p>
      </div>

      {/* Main Value Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <BitDisplay
          bits={bits}
          label="Current Value"
          onBitClick={toggleBit}
          showActions={true}
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h4 className="font-semibold text-sm text-gray-700 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => setValue(0)}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Clear All
          </button>
          <button
            onClick={() => setValue((1 << bitWidth) - 1)}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Set All
          </button>
          <button
            onClick={() => setValue(~value & ((1 << bitWidth) - 1))}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Invert All
          </button>
          <button
            onClick={() => setValue(Math.floor(Math.random() * (1 << bitWidth)))}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Random
          </button>
        </div>
      </div>

      {/* Bitwise Operations */}
      <div className="mb-6">
        <h4 className="font-semibold text-sm text-gray-700 mb-3">Bitwise Operations</h4>

        {/* Operand Input */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm font-medium text-gray-700">Second Operand:</label>
            <input
              type="number"
              value={operandValue}
              onChange={(e) => setOperandValue(parseInt(e.target.value) || 0)}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-mono"
              min={0}
              max={(1 << bitWidth) - 1}
            />
          </div>
          <BitDisplay bits={operandBits} label="Operand" color="green" />
        </div>

        {/* Operation Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => performOperation('and')}
            className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            AND (&)
          </button>
          <button
            onClick={() => performOperation('or')}
            className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            OR (|)
          </button>
          <button
            onClick={() => performOperation('xor')}
            className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            XOR (^)
          </button>
          <button
            onClick={() => performOperation('not')}
            className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            NOT (~)
          </button>
        </div>
      </div>

      {/* Bit Shifting */}
      <div className="mb-6">
        <h4 className="font-semibold text-sm text-gray-700 mb-3">Bit Shifting</h4>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm font-medium text-gray-700">Shift Amount:</label>
            <input
              type="number"
              value={shiftAmount}
              onChange={(e) => setShiftAmount(parseInt(e.target.value) || 1)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
              min={1}
              max={bitWidth - 1}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => performOperation('shiftLeft')}
              className="px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
            >
              Shift Left (&lt;&lt;)
            </button>
            <button
              onClick={() => performOperation('shiftRight')}
              className="px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
            >
              Shift Right (&gt;&gt;)
            </button>
          </div>
        </div>
      </div>

      {/* Bit Analysis */}
      <div className="mb-6">
        <h4 className="font-semibold text-sm text-gray-700 mb-3">Bit Analysis</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-blue-50 rounded border">
            <div className="font-medium text-blue-800">Set Bits</div>
            <div className="text-lg font-bold text-blue-600">
              {bits.filter(b => b.value).length}
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded border">
            <div className="font-medium text-green-800">Clear Bits</div>
            <div className="text-lg font-bold text-green-600">
              {bits.filter(b => !b.value).length}
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded border">
            <div className="font-medium text-purple-800">MSB Position</div>
            <div className="text-lg font-bold text-purple-600">
              {Math.floor(Math.log2(value || 1))}
            </div>
          </div>
          <div className="p-3 bg-orange-50 rounded border">
            <div className="font-medium text-orange-800">Is Power of 2</div>
            <div className="text-lg font-bold text-orange-600">
              {value > 0 && (value & (value - 1)) === 0 ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>

      {/* Educational Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-semibold text-sm text-blue-800 mb-2">🔧 Bit Operations</h5>
          <p className="text-sm text-blue-700">
            Click on individual bits to toggle them. Use Set (1) and Clear (0) buttons
            for precise control. These operations are fundamental to computer arithmetic.
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h5 className="font-semibold text-sm text-green-800 mb-2">⚡ Performance Tip</h5>
          <p className="text-sm text-green-700">
            Bitwise operations are among the fastest operations a computer can perform,
            often completing in a single CPU cycle.
          </p>
        </div>
      </div>
    </div>
  );
}