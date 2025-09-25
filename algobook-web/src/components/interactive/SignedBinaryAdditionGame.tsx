'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SignedBinaryAdditionGameProps {
  id?: string;
  timeLimit?: number;
}

export default function SignedBinaryAdditionGame({
  id = 'signed-binary-addition-game',
  timeLimit = 8
}: SignedBinaryAdditionGameProps) {
  const [targetNumber, setTargetNumber] = useState(0);
  const [selectedBits, setSelectedBits] = useState<boolean[]>(new Array(8).fill(false));
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'correct' | 'timeUp'>('idle');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameHistory, setGameHistory] = useState<Array<{round: number, score: number, target: number, success: boolean}>>([]);
  const [highScore, setHighScore] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const bitWeights = [-128, 64, 32, 16, 8, 4, 2, 1]; // First bit is sign bit (-128)

  // Calculate current sum from selected bits using two's complement
  const currentSum = selectedBits.reduce((sum, isSelected, index) => {
    return sum + (isSelected ? bitWeights[index] : 0);
  }, 0);

  // Generate random number between -128 and 127, excluding 0
  const generateRandomNumber = () => {
    let num;
    do {
      num = Math.floor(Math.random() * 256) - 128; // Range: -128 to 127
    } while (num === 0);
    return num;
  };

  // Start new round
  const startNewRound = () => {
    const newNumber = generateRandomNumber();
    setTargetNumber(newNumber);
    setSelectedBits(new Array(8).fill(false));
    setTimeLeft(timeLimit);
    setGameState('playing');
    setRound(prev => prev + 1);

    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('timeUp');
          if (timerRef.current) clearInterval(timerRef.current);
          // End game when time is up
          setTimeout(() => {
            endGame(false);
          }, 3000); // Show result for 3 seconds
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start the game
  const startGame = () => {
    setScore(0);
    setRound(0);
    setGameStarted(true);
    setGameHistory([]);
    startNewRound();
  };

  // End game and save to history
  const endGame = (success: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Save current game to history
    const finalScore = success ? score + Math.max(1, timeLeft) : score;
    setGameHistory(prev => [...prev, {
      round,
      score: finalScore,
      target: targetNumber,
      success
    }]);

    // Update high score if necessary
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }

    setGameStarted(false);
    setGameState('idle');
    setScore(0);
    setRound(0);
    setSelectedBits(new Array(8).fill(false));
    setTimeLeft(timeLimit);
  };

  // Reset game
  const resetGame = () => {
    endGame(false);
  };

  // Toggle bit selection
  const toggleBit = (index: number) => {
    if (gameState !== 'playing') return;

    const newSelectedBits = [...selectedBits];
    newSelectedBits[index] = !newSelectedBits[index];
    setSelectedBits(newSelectedBits);
  };

  // Check if current sum matches target
  useEffect(() => {
    if (gameState === 'playing' && currentSum === targetNumber) {
      setGameState('correct');
      setScore(prev => prev + Math.max(1, timeLeft)); // Bonus points for speed
      if (timerRef.current) clearInterval(timerRef.current);

      // Auto-start next round after 1.5 seconds
      setTimeout(() => {
        startNewRound();
      }, 1500);
    }
  }, [currentSum, targetNumber, gameState, timeLeft]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Get button color based on state
  const getButtonColor = (index: number) => {
    const isSelected = selectedBits[index];

    if (gameState === 'correct') {
      // Show correct answer in green
      const shouldBeSelected = getCorrectBitPattern(targetNumber)[index];
      if (shouldBeSelected) return 'bg-green-500 text-white border-green-600';
      return 'bg-gray-200 text-gray-600 border-gray-300';
    }

    if (gameState === 'timeUp') {
      // Show correct answer when time is up
      const shouldBeSelected = getCorrectBitPattern(targetNumber)[index];
      if (shouldBeSelected) return 'bg-green-500 text-white border-green-600';
      if (isSelected && !shouldBeSelected) return 'bg-red-500 text-white border-red-600'; // Wrong selection
      return 'bg-gray-200 text-gray-600 border-gray-300';
    }

    // Normal playing state
    if (isSelected) return 'bg-green-500 text-white border-green-600 shadow-md';
    return 'bg-red-500 text-white border-red-600 hover:bg-red-400';
  };

  // Get correct bit pattern for a given number in two's complement
  const getCorrectBitPattern = (num: number): boolean[] => {
    const bits = new Array(8).fill(false);

    if (num >= 0) {
      // Positive number: standard binary
      const binary = num.toString(2).padStart(8, '0');
      for (let i = 0; i < 8; i++) {
        bits[i] = binary[i] === '1';
      }
    } else {
      // Negative number: two's complement
      const positive = Math.abs(num);
      const binary = positive.toString(2).padStart(8, '0');

      // Invert bits (one's complement)
      const inverted = binary.split('').map(bit => bit === '0' ? '1' : '0');

      // Add 1 (two's complement)
      let carry = 1;
      for (let i = 7; i >= 0; i--) {
        if (carry === 0) break;

        if (inverted[i] === '0') {
          inverted[i] = '1';
          carry = 0;
        } else {
          inverted[i] = '0';
          carry = 1;
        }
      }

      for (let i = 0; i < 8; i++) {
        bits[i] = inverted[i] === '1';
      }
    }

    return bits;
  };

  const getTimerColor = () => {
    if (timeLeft <= 2) return 'text-red-600';
    if (timeLeft <= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-4">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 mb-1">Signed Binary Addition Challenge</h3>
        <p className="text-xs text-gray-600">
          Click the two's complement buttons to match the target number within {timeLimit} seconds!
        </p>
      </div>

      {/* Game Stats */}
      {gameStarted && (
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-4 text-sm">
            <div>Round: <span className="font-bold text-blue-600">{round}</span></div>
            <div>Score: <span className="font-bold text-green-600">{score}</span></div>
            <div>High: <span className="font-bold text-yellow-600">{highScore}</span></div>
          </div>
          <div className={`text-2xl font-bold ${getTimerColor()}`}>
            {timeLeft}s
          </div>
        </div>
      )}

      {/* High Score Display when not playing */}
      {!gameStarted && highScore > 0 && (
        <div className="mb-4 text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-700">
            <strong>🏆 Highest Score:</strong>
            <span className="ml-2 text-lg font-bold text-yellow-800">
              {highScore}
            </span>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="mb-4">
        {gameStarted ? (
          <div className="flex items-center gap-3 justify-center flex-wrap">
            {/* Target Number */}
            <div className={`text-4xl font-bold px-4 py-2 rounded-lg border-2 ${
              gameState === 'correct' ? 'bg-green-100 border-green-300 text-green-800' :
              gameState === 'timeUp' ? 'bg-red-100 border-red-300 text-red-800' :
              'bg-blue-100 border-blue-300 text-blue-800'
            }`}>
              {targetNumber}
            </div>

            <div className="text-2xl text-gray-400">=</div>

            {/* Bit Buttons with Weights - Smaller for single row */}
            {bitWeights.map((weight, index) => (
              <React.Fragment key={weight}>
                <button
                  onClick={() => toggleBit(index)}
                  disabled={gameState !== 'playing'}
                  className={`w-12 h-12 rounded-lg border-2 font-bold text-xs transition-all ${
                    getButtonColor(index)
                  } ${gameState === 'playing' ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {weight}
                </button>
                {index < bitWeights.length - 1 && (
                  <span className="text-lg text-gray-400">+</span>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">⚖️</div>
            <p className="text-gray-600 mb-4">
              Ready to test your signed binary skills?
            </p>
          </div>
        )}
      </div>

      {/* Current Sum Display */}
      {gameStarted && (
        <div className="mb-4 text-center">
          <div className="text-sm text-gray-600">Current Sum:</div>
          <div className={`text-2xl font-bold ${
            currentSum === targetNumber ? 'text-green-600' :
            'text-blue-600'
          }`}>
            {currentSum}
          </div>
        </div>
      )}

      {/* Game Status Messages */}
      {gameState === 'correct' && (
        <div className="mb-4 text-center p-3 bg-green-100 rounded-lg border border-green-300">
          <div className="text-green-800 font-bold">🎉 Correct!</div>
          <div className="text-green-700 text-sm">
            +{Math.max(1, timeLeft)} points • Next round starting...
          </div>
        </div>
      )}

      {gameState === 'timeUp' && (
        <div className="mb-4 text-center p-3 bg-red-100 rounded-lg border border-red-300">
          <div className="text-red-800 font-bold">⏰ Time's Up!</div>
          <div className="text-red-700 text-sm">
            The correct answer is shown above
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex justify-center gap-2">
        {!gameStarted ? (
          <button
            onClick={startGame}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors"
          >
            Start New Game
          </button>
        ) : (
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            End Game
          </button>
        )}
      </div>

      {/* Instructions */}
      {!gameStarted && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-800">
            <strong>How to Play (Two's Complement):</strong>
            <ul className="mt-1 ml-4 list-disc text-xs space-y-1">
              <li>Numbers range from -128 to 127 (excluding 0)</li>
              <li>First bit is the sign bit: -128 if selected</li>
              <li>Negative numbers use two's complement representation</li>
              <li>Click buttons to add/subtract their values</li>
              <li>You have {timeLimit} seconds per round</li>
              <li>Green = selected, Red = not selected</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}