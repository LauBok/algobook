'use client';

import React, { useState } from 'react';

interface SpaceEfficientMultiplicationWidgetProps {
  id?: string;
}

interface MultiplicationStep {
  step: number;
  multiplicand: string; // A register (8-bit)
  combined: string;     // Combined B|C register (16-bit)
  rightmostBit: number;
  shouldAdd: boolean;
  afterAdd?: string;    // Combined register after addition (if applicable)
  afterShift: string;   // Combined register after right shift
  description: string;
}

export default function SpaceEfficientMultiplicationWidget({
  id = 'space-efficient-multiplication'
}: SpaceEfficientMultiplicationWidgetProps) {
  const [multiplicandValue, setMultiplicandValue] = useState(11); // A
  const [multiplierValue, setMultiplierValue] = useState(5);     // B
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Convert number to n-bit binary string
  const toBinary = (num: number, bits: number) => {
    return num.toString(2).padStart(bits, '0');
  };

  // Convert binary string to decimal
  const fromBinary = (binary: string) => {
    return parseInt(binary, 2);
  };

  // Generate all multiplication steps
  const generateSteps = (): MultiplicationStep[] => {
    const steps: MultiplicationStep[] = [];
    const multiplicand = multiplicandValue; // A register
    let combined = multiplierValue; // C|B: C starts as 0, B in lower 8 bits

    steps.push({
      step: 0,
      multiplicand: toBinary(multiplicand, 8),
      combined: toBinary(combined, 16),
      rightmostBit: combined & 1,
      shouldAdd: (combined & 1) === 1,
      afterShift: '',
      description: `Initial: A=${multiplicand}, C|B=${toBinary(combined, 16)} (C=00000000, B=${toBinary(multiplierValue, 8)})`
    });

    for (let i = 0; i < 8; i++) {
      const rightmostBit = combined & 1;
      const shouldAdd = rightmostBit === 1;
      let afterAdd = combined;

      if (shouldAdd) {
        // Add multiplicand to upper 8 bits (C part)
        const upperHalf = (combined >>> 8) & 0xFFFF; // Allow for overflow into upper bits
        const lowerHalf = combined & 0xFF;
        const newUpperHalf = upperHalf + multiplicand;
        afterAdd = ((newUpperHalf << 8) | lowerHalf) & 0xFFFF; // Keep within 16 bits
      }

      // Right shift the entire 16-bit register
      const afterShift = afterAdd >>> 1;

      steps.push({
        step: i + 1,
        multiplicand: toBinary(multiplicand, 8),
        combined: toBinary(combined, 16),
        rightmostBit,
        shouldAdd,
        afterAdd: shouldAdd ? toBinary(afterAdd, 16) : undefined,
        afterShift: toBinary(afterShift, 16),
        description: shouldAdd
          ? `Step ${i + 1}: Rightmost bit = ${rightmostBit}, ADD A to upper half, then shift right`
          : `Step ${i + 1}: Rightmost bit = ${rightmostBit}, no addition, shift right`
      });

      combined = afterShift;
    }

    return steps;
  };

  const steps = generateSteps();
  const finalResult = fromBinary(steps[steps.length - 1].afterShift);
  const expectedResult = multiplicandValue * multiplierValue;

  // Animation controls
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const playAnimation = () => {
    setIsPlaying(true);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const currentStepData = steps[currentStep];

  // Component to render individual bit blocks
  const BitBlocks = ({ binary, colorClass, label }: { binary: string, colorClass: string, label?: string }) => {
    return (
      <div className="space-y-1">
        {label && <div className="text-xs text-gray-500">{label}</div>}
        <div className="flex gap-1">
          {binary.split('').map((bit, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded border-2 font-mono text-sm font-bold flex items-center justify-center ${colorClass}`}
            >
              {bit}
            </div>
          ))}
        </div>
        <div className="flex gap-1 text-xs text-gray-400">
          {binary.split('').map((_, index) => (
            <div key={index} className="w-8 text-center">
              {binary.length - 1 - index}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Component to render 16-bit register as one continuous register with color hints
  const CombinedRegisterBlocks = ({ binary, step, isAfterShift }: {
    binary: string,
    step: number,
    isAfterShift?: boolean
  }) => {
    return (
      <div className="space-y-2">
        <div className="text-xs text-gray-500 text-center mb-1">
          16-bit Combined C|B Register
        </div>
        <div className="flex gap-1 justify-center">
          {binary.split('').map((bit, index) => {
            let colorClass = '';

            if (index < 8) {
              // Upper 8 bits - always result (C)
              colorClass = 'bg-blue-100 border-blue-300';
            } else {
              // Lower 8 bits - color changes after shift
              const lowerBitPosition = index - 8; // 0-7 for lower bits
              // Only change color after the shift has happened
              const hasBeenShiftedOut = isAfterShift && (step > lowerBitPosition);

              if (hasBeenShiftedOut) {
                // This B bit has been shifted out and replaced by C
                colorClass = 'bg-blue-100 border-blue-300';
              } else {
                // This bit is still original multiplier
                colorClass = 'bg-orange-100 border-orange-300';
              }
            }

            return (
              <div
                key={index}
                className={`w-8 h-8 rounded border-2 font-mono text-sm font-bold flex items-center justify-center ${colorClass}`}
              >
                {bit}
              </div>
            );
          })}
        </div>

        {/* Bit position numbers */}
        <div className="flex gap-1 text-xs text-gray-400 justify-center">
          {binary.split('').map((_, index) => (
            <div key={index} className="w-8 text-center">
              {15 - index}
            </div>
          ))}
        </div>

        {/* Color legend */}
        <div className="flex gap-2 text-xs justify-center mt-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Result (C)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
            <span>Multiplier (B)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-4">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 mb-1">Space-Efficient 8-bit Multiplication</h3>
        <p className="text-xs text-gray-600">
          Hardware optimization using a combined register and right shift instead of expanding registers
        </p>
      </div>

      {/* Input Controls */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Multiplicand (A):</label>
          <input
            type="number"
            value={multiplicandValue}
            onChange={(e) => setMultiplicandValue(Math.max(1, Math.min(255, parseInt(e.target.value) || 1)))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-center font-mono"
            min={1}
            max={255}
            disabled={isPlaying}
          />
          <div className="text-xs text-gray-500 text-center mt-1">
            {toBinary(multiplicandValue, 8)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Multiplier (B):</label>
          <input
            type="number"
            value={multiplierValue}
            onChange={(e) => setMultiplierValue(Math.max(1, Math.min(255, parseInt(e.target.value) || 1)))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-center font-mono"
            min={1}
            max={255}
            disabled={isPlaying}
          />
          <div className="text-xs text-gray-500 text-center mt-1">
            {toBinary(multiplierValue, 8)}
          </div>
        </div>
      </div>

      {/* Expected Result */}
      <div className="mb-4 text-center p-2 bg-blue-50 rounded border border-blue-200">
        <div className="text-sm text-blue-700">
          Expected Result: {multiplicandValue} × {multiplierValue} = {expectedResult}
        </div>
        <div className="text-xs text-blue-600 font-mono">
          {toBinary(expectedResult, 16)}
        </div>
      </div>

      {/* Current Step Display */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm text-gray-700">
            {currentStepData.step === 0 ? 'Initial State' : `Step ${currentStepData.step}`}
          </h4>
          <div className="text-xs text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-3">{currentStepData.description}</div>

          {/* Register Visualization */}
          <div className="space-y-4">
            {/* A Register (Multiplicand) */}
            <div>
              <BitBlocks
                binary={currentStepData.multiplicand}
                colorClass="bg-green-100 border-green-300"
                label={`A Register (Multiplicand): ${multiplicandValue}`}
              />
            </div>

            {/* Combined C|B Register */}
            <div>
              <CombinedRegisterBlocks
                binary={currentStep === 0 ? currentStepData.combined : currentStepData.afterShift}
                step={currentStepData.step}
                isAfterShift={currentStep > 0}
              />
              <div className="text-center text-xs text-purple-600 mt-2">
                {currentStep === 0 ? (
                  `Starting state: C=00000000, B=${toBinary(multiplierValue, 8)}`
                ) : (
                  <>
                    Rightmost bit was: <span className="font-bold">{currentStepData.rightmostBit}</span>
                    {currentStepData.shouldAdd ? ' → Added A to upper half' : ' → No addition'}
                    → Shifted right
                  </>
                )}
              </div>
            </div>

            {/* Final Result Display */}
            {currentStep === steps.length - 1 && (
              <div className="text-center text-sm text-green-700 font-semibold mt-3">
                Final Result: {fromBinary(currentStepData.afterShift)} ✓
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={prevStep}
          disabled={currentStep === 0 || isPlaying}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Previous
        </button>
        <button
          onClick={nextStep}
          disabled={currentStep === steps.length - 1 || isPlaying}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Next
        </button>
        <button
          onClick={playAnimation}
          disabled={isPlaying || currentStep === steps.length - 1}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Play
        </button>
        <button
          onClick={reset}
          disabled={isPlaying}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Reset
        </button>
      </div>

      {/* Educational Notes */}
      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="text-sm text-yellow-800">
          <strong>💡 Space-Efficient Algorithm:</strong>
          <ul className="mt-2 ml-4 list-disc text-xs space-y-1">
            <li>Uses only one 16-bit register (C|B) instead of expanding A and C separately</li>
            <li>Examines rightmost bit: if 1, add A to upper half (C)</li>
            <li>Always shift right after each step (discards examined bit)</li>
            <li>Right shift is equivalent to left-shifting A, but A stays constant</li>
            <li>After 8 steps, the result is in the combined register</li>
          </ul>
        </div>
      </div>
    </div>
  );
}