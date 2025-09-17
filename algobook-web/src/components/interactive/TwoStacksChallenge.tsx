'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Judge0Service } from '@/lib/api/judge0';
import { ProgressManager } from '@/lib/utils/progress';
import Editor from '@monaco-editor/react';

interface GameState {
  sequence: string[];
  leftStack: string[];
  rightStack: string[];
  playerTurn: 'human' | 'ai';
  gameStatus: 'setup' | 'playing' | 'finished';
  scores: { human: number; ai: number };
  lastMove: {
    player: 'human' | 'ai';
    token: string;
    stack: 'left' | 'right';
    pointsScored: number;
  } | null;
}

interface ChallengeState {
  consecutiveWins: number;
  isRunning: boolean;
  currentGame: number;
  totalGames: number;
  algorithmCode: string;
  testResults: { 
    game: number; 
    won: boolean; 
    humanScore: number;
    aiScore: number;
    reason?: string;
    moves: Array<{
      player: 'human' | 'ai';
      token: string;
      stack: 'left' | 'right';
      pointsScored: number;
    }>;
  }[];
}

const TOKEN_COLORS: Record<string, string> = {
  'R': 'bg-red-500',
  'G': 'bg-green-500',
  'B': 'bg-blue-500',
  'Y': 'bg-yellow-400',
  'P': 'bg-purple-500',
  'O': 'bg-orange-500'
};

const TOKEN_NAMES: Record<string, string> = {
  'R': 'Red',
  'G': 'Green', 
  'B': 'Blue',
  'Y': 'Yellow',
  'P': 'Purple',
  'O': 'Orange'
};

export default function TwoStacksChallenge() {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    sequence: [],
    leftStack: [],
    rightStack: [],
    playerTurn: 'human',
    gameStatus: 'setup',
    scores: { human: 0, ai: 0 },
    lastMove: null
  });

  // Optimal score difference tracking
  const [optimalDifference, setOptimalDifference] = useState<number | null>(null);
  const [isComputingOptimal, setIsComputingOptimal] = useState(false);

  // Practice vs Challenge modes
  const [gameMode, setGameMode] = useState<'practice' | 'challenge'>('practice');
  
  // Modal state for expanded code editor
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  
  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isCodeModalOpen) {
        setIsCodeModalOpen(false);
      }
    };
    
    if (isCodeModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isCodeModalOpen]);
  
  // Get the default template code
  const getTemplateCode = () => {
    return `# Global variables automatically available:
# sequence = ['R', 'G', 'B', ...]     # Current token sequence (queue)
# left_stack = ['R', 'G', ...]        # Left stack (top = last element)
# right_stack = ['B', 'R', ...]       # Right stack (top = last element)
# human_score = 5                     # Current human score
# ai_score = 3                        # Current AI score

def next_move():
    """
    Choose which stack to place the next token on.
    
    The next token is always sequence[0] (front of queue).
    
    Available functions:
        - calculate_points(stack, token): Returns points scored if token placed on stack
        - simulate_move(stack, token): Returns (new_stack, points_scored) after placement
    
    Returns:
        str: Either 'left' or 'right' to indicate which stack to place the token
    """
    
    if not sequence:
        return 'left'  # No tokens left
    
    next_token = sequence[0]  # Token we must place
    
    # Calculate points for each option
    left_points = calculate_points(left_stack, next_token)
    right_points = calculate_points(right_stack, next_token)
    
    # Simple strategy: choose the stack that gives more points
    if left_points >= right_points:
        return 'left'
    else:
        return 'right'`;
  };

  // Load algorithm code from localStorage or use default template
  const getInitialAlgorithmCode = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('algobook_twostacks_algorithm');
      if (saved) {
        return saved;
      }
    }
    return getTemplateCode();
  };

  // Challenge state
  const [challengeState, setChallengeState] = useState<ChallengeState>({
    consecutiveWins: 0,
    isRunning: false,
    currentGame: 1,
    totalGames: 5,
    algorithmCode: getInitialAlgorithmCode(),
    testResults: []
  });

  const challengeCancelRef = useRef<boolean>(false);

  // Save algorithm code to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('algobook_twostacks_algorithm', challengeState.algorithmCode);
    }
  }, [challengeState.algorithmCode]);

  // Mark challenge as completed when 5 consecutive wins achieved
  useEffect(() => {
    if (challengeState.consecutiveWins >= 5) {
      ProgressManager.completeChallengeWithXp('part3-challenge');
    }
  }, [challengeState.consecutiveWins]);

  // Generate random sequence
  const generateSequence = (length: number = 12): string[] => {
    const tokens = ['R', 'G', 'B', 'Y'];
    return Array.from({ length }, () => tokens[Math.floor(Math.random() * tokens.length)]);
  };

  // Calculate points scored when placing token on stack
  const calculatePoints = (stack: string[], token: string): number => {
    if (stack.length === 0) return 0;
    
    const newStack = [...stack, token];
    let points = 0;
    
    // Keep removing matching pairs from top
    while (newStack.length >= 2) {
      const top = newStack[newStack.length - 1];
      const second = newStack[newStack.length - 2];
      
      if (top === second) {
        newStack.pop();
        newStack.pop();
        points++;
      } else {
        break;
      }
    }
    
    return points;
  };

  // Precompute maximum possible score difference (human - AI) using minimax
  const computeMaxScoreDifference = (sequence: string[]): number => {
    if (sequence.length === 0) return 0;
    
    // Memoization for optimal play
    const memo = new Map<string, number>();
    
    const minimax = (
      seq: string[], 
      leftStack: string[], 
      rightStack: string[], 
      isHumanTurn: boolean,
      humanScore: number,
      aiScore: number
    ): number => {
      // Base case: no tokens left
      if (seq.length === 0) {
        return humanScore - aiScore;  // Return score difference
      }
      
      // Create state key for memoization
      const stateKey = `${seq.join('')}_${leftStack.join('')}_${rightStack.join('')}_${isHumanTurn}_${humanScore}_${aiScore}`;
      if (memo.has(stateKey)) {
        return memo.get(stateKey)!;
      }
      
      const token = seq[0];
      const remainingSeq = seq.slice(1);
      
      // Try placing on left stack
      const leftResult = simulateMove(leftStack, token);
      const leftDifference = isHumanTurn 
        ? minimax(remainingSeq, leftResult.newStack, rightStack, false, humanScore + leftResult.points, aiScore)
        : minimax(remainingSeq, leftResult.newStack, rightStack, true, humanScore, aiScore + leftResult.points);
      
      // Try placing on right stack  
      const rightResult = simulateMove(rightStack, token);
      const rightDifference = isHumanTurn
        ? minimax(remainingSeq, leftStack, rightResult.newStack, false, humanScore + rightResult.points, aiScore)
        : minimax(remainingSeq, leftStack, rightResult.newStack, true, humanScore, aiScore + rightResult.points);
      
      // Human maximizes score difference, AI minimizes score difference
      const result = isHumanTurn 
        ? Math.max(leftDifference, rightDifference)
        : Math.min(leftDifference, rightDifference);
      
      memo.set(stateKey, result);
      return result;
    };
    
    return minimax(sequence, [], [], true, 0, 0);
  };

  // Simulate placing token on stack and return new state
  const simulateMove = (stack: string[], token: string): { newStack: string[]; points: number } => {
    const newStack = [...stack, token];
    let points = 0;
    
    // Keep removing matching pairs from top
    while (newStack.length >= 2) {
      const top = newStack[newStack.length - 1];
      const second = newStack[newStack.length - 2];
      
      if (top === second) {
        newStack.pop();
        newStack.pop();
        points++;
      } else {
        break;
      }
    }
    
    return { newStack, points };
  };

  // Switch game modes
  const switchToMode = (mode: 'practice' | 'challenge') => {
    setGameMode(mode);
    
    if (mode === 'practice') {
      setGameState({
        sequence: [],
        leftStack: [],
        rightStack: [],
        playerTurn: 'human',
        gameStatus: 'setup',
        scores: { human: 0, ai: 0 },
        lastMove: null
      });
    }
  };

  // Start practice game
  const startPracticeGame = async () => {
    const sequence = generateSequence(12);
    
    setGameState({
      sequence,
      leftStack: [],
      rightStack: [],
      playerTurn: 'human',
      gameStatus: 'playing',
      scores: { human: 0, ai: 0 },
      lastMove: null
    });

    // Compute optimal score difference in background
    setIsComputingOptimal(true);
    setOptimalDifference(null);
    
    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
      const optimal = computeMaxScoreDifference(sequence);
      setOptimalDifference(optimal);
      setIsComputingOptimal(false);
    }, 100);
  };

  // Make human move
  const makeHumanMove = (stackChoice: 'left' | 'right') => {
    if (gameState.gameStatus !== 'playing' || gameState.playerTurn !== 'human' || gameState.sequence.length === 0) return;
    
    const token = gameState.sequence[0];
    const stack = stackChoice === 'left' ? gameState.leftStack : gameState.rightStack;
    const { newStack, points } = simulateMove(stack, token);
    
    const newSequence = gameState.sequence.slice(1);
    const newScores = { ...gameState.scores, human: gameState.scores.human + points };
    
    const move = {
      player: 'human' as const,
      token,
      stack: stackChoice,
      pointsScored: points
    };
    
    const newGameState = {
      ...gameState,
      sequence: newSequence,
      [stackChoice === 'left' ? 'leftStack' : 'rightStack']: newStack,
      scores: newScores,
      lastMove: move,
      playerTurn: newSequence.length > 0 ? 'ai' as const : 'human' as const,
      gameStatus: newSequence.length === 0 ? 'finished' as const : 'playing' as const
    };
    
    setGameState(newGameState);
    
    // If game not finished and AI turn, make AI move after delay
    if (newSequence.length > 0) {
      setTimeout(() => makeAIMove(newGameState), 1000);
    }
  };

  // Simple AI for practice mode
  const makeAIMove = (currentState: GameState) => {
    if (currentState.sequence.length === 0) return;
    
    const token = currentState.sequence[0];
    const leftPoints = calculatePoints(currentState.leftStack, token);
    const rightPoints = calculatePoints(currentState.rightStack, token);
    
    // AI chooses stack with more points, ties go to left
    const stackChoice = leftPoints >= rightPoints ? 'left' : 'right';
    const stack = stackChoice === 'left' ? currentState.leftStack : currentState.rightStack;
    const { newStack, points } = simulateMove(stack, token);
    
    const newSequence = currentState.sequence.slice(1);
    const newScores = { ...currentState.scores, ai: currentState.scores.ai + points };
    
    const move = {
      player: 'ai' as const,
      token,
      stack: stackChoice,
      pointsScored: points
    };
    
    setGameState({
      ...currentState,
      sequence: newSequence,
      [stackChoice === 'left' ? 'leftStack' : 'rightStack']: newStack,
      scores: newScores,
      lastMove: move,
      playerTurn: 'human',
      gameStatus: newSequence.length === 0 ? 'finished' : 'playing'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Part III Challenge: Two-Stacks, One Queue
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Master stack and queue operations! Dequeue tokens from the sequence and strategically 
            place them on stacks to score points through matching pairs.
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-2 shadow-sm border">
            <button
              className={`px-6 py-2 rounded-md transition-colors ${
                gameMode === 'practice' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => switchToMode('practice')}
            >
              🎯 Practice Mode
            </button>
            <button
              className={`px-6 py-2 rounded-md transition-colors ${
                gameMode === 'challenge' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => switchToMode('challenge')}
            >
              🏆 Challenge Mode
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Game Board */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Board</h2>
              
              {/* Game Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Human Score:</span>
                    <span className="ml-2 font-bold text-blue-600">{gameState.scores.human}</span>
                  </div>
                  <div>
                    <span className="font-medium">AI Score:</span>
                    <span className="ml-2 font-bold text-red-600">{gameState.scores.ai}</span>
                  </div>
                  <div>
                    <span className="font-medium">Score Difference:</span>
                    <span className={`ml-2 font-bold ${
                      gameState.scores.human - gameState.scores.ai > 0 ? 'text-green-600' : 
                      gameState.scores.human - gameState.scores.ai < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {gameState.scores.human - gameState.scores.ai > 0 ? '+' : ''}{gameState.scores.human - gameState.scores.ai}
                      {optimalDifference !== null && (
                        <span className="ml-1 text-xs text-gray-500">
                          / {optimalDifference > 0 ? '+' : ''}{optimalDifference} max
                        </span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Tokens Left:</span>
                    <span className="ml-2 font-bold text-purple-600">{gameState.sequence.length}</span>
                  </div>
                </div>
                
                {/* Optimal Score Analysis */}
                {gameState.gameStatus === 'playing' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {isComputingOptimal ? (
                      <div className="text-xs text-gray-500 italic">
                        🧠 Computing optimal strategy...
                      </div>
                    ) : optimalDifference !== null ? (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Perfect Play:</span> Human can{' '}
                        {optimalDifference > 0 ? (
                          <>win by at most <span className="font-bold text-green-600">+{optimalDifference} points</span></>
                        ) : optimalDifference < 0 ? (
                          <>lose by at least <span className="font-bold text-red-600">{optimalDifference} points</span></>
                        ) : (
                          <span className="font-bold text-gray-600">tie (0 difference)</span>
                        )} with optimal strategy
                      </div>
                    ) : null}
                  </div>
                )}
                
                {/* Perfect Play Achievement */}
                {gameState.gameStatus === 'finished' && optimalDifference !== null && 
                 (gameState.scores.human - gameState.scores.ai) === optimalDifference && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-green-600 font-bold">
                      🎯 PERFECT PLAY! You achieved the optimal score difference!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Token Sequence (Queue) */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Token Sequence (Queue):</h3>
              <div className="flex flex-wrap gap-2 p-4 bg-gray-100 rounded-lg min-h-[60px]">
                {gameState.sequence.map((token, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full ${TOKEN_COLORS[token]} border-2 border-gray-300 flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'ring-2 ring-yellow-400 ring-offset-1' : ''
                    }`}
                    title={`${TOKEN_NAMES[token]} ${index === 0 ? '(Next)' : ''}`}
                  >
                    {token}
                  </div>
                ))}
                {gameState.sequence.length === 0 && (
                  <div className="text-gray-500 italic">No tokens remaining</div>
                )}
              </div>
            </div>

            {/* Stacks */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Left Stack */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3 text-center">Left Stack</h3>
                <div className="flex flex-col-reverse gap-1 min-h-[120px] items-center">
                  {gameState.leftStack.map((token, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full ${TOKEN_COLORS[token]} border-2 border-gray-300 flex items-center justify-center text-white font-bold text-sm`}
                      title={TOKEN_NAMES[token]}
                    >
                      {token}
                    </div>
                  ))}
                  {gameState.leftStack.length === 0 && (
                    <div className="text-blue-400 italic text-sm">Empty</div>
                  )}
                </div>
                {gameMode === 'practice' && gameState.gameStatus === 'playing' && gameState.playerTurn === 'human' && gameState.sequence.length > 0 && (
                  <button
                    onClick={() => makeHumanMove('left')}
                    className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Place {gameState.sequence[0]} Here
                    {calculatePoints(gameState.leftStack, gameState.sequence[0]) > 0 && (
                      <span className="ml-1 font-bold">
                        (+{calculatePoints(gameState.leftStack, gameState.sequence[0])})
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Right Stack */}
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-3 text-center">Right Stack</h3>
                <div className="flex flex-col-reverse gap-1 min-h-[120px] items-center">
                  {gameState.rightStack.map((token, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full ${TOKEN_COLORS[token]} border-2 border-gray-300 flex items-center justify-center text-white font-bold text-sm`}
                      title={TOKEN_NAMES[token]}
                    >
                      {token}
                    </div>
                  ))}
                  {gameState.rightStack.length === 0 && (
                    <div className="text-red-400 italic text-sm">Empty</div>
                  )}
                </div>
                {gameMode === 'practice' && gameState.gameStatus === 'playing' && gameState.playerTurn === 'human' && gameState.sequence.length > 0 && (
                  <button
                    onClick={() => makeHumanMove('right')}
                    className="w-full mt-3 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Place {gameState.sequence[0]} Here
                    {calculatePoints(gameState.rightStack, gameState.sequence[0]) > 0 && (
                      <span className="ml-1 font-bold">
                        (+{calculatePoints(gameState.rightStack, gameState.sequence[0])})
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Game Controls */}
            <div className="flex gap-3 flex-wrap">
              {gameMode === 'practice' && (
                <>
                  {gameState.gameStatus === 'setup' ? (
                    <button
                      onClick={startPracticeGame}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      🎲 Start Practice Game
                    </button>
                  ) : gameState.gameStatus === 'finished' ? (
                    <button
                      onClick={startPracticeGame}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      🎲 New Practice Game
                    </button>
                  ) : null}
                </>
              )}
            </div>

            {/* Game Result */}
            {gameState.gameStatus === 'finished' && (
              <div className="mt-4 p-4 rounded-lg text-center">
                {gameState.scores.human > gameState.scores.ai ? (
                  <div className="bg-green-100 text-green-800">
                    <h3 className="font-bold text-lg">🎉 You Won!</h3>
                    <p className="text-sm mt-1">
                      Final Score: You {gameState.scores.human} - {gameState.scores.ai} AI
                    </p>
                  </div>
                ) : gameState.scores.human < gameState.scores.ai ? (
                  <div className="bg-red-100 text-red-800">
                    <h3 className="font-bold text-lg">💀 AI Won!</h3>
                    <p className="text-sm mt-1">
                      Final Score: You {gameState.scores.human} - {gameState.scores.ai} AI
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-100 text-yellow-800">
                    <h3 className="font-bold text-lg">🤝 Tie Game!</h3>
                    <p className="text-sm mt-1">
                      Final Score: {gameState.scores.human} - {gameState.scores.ai}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Last Move Display */}
            {gameState.lastMove && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
                <strong>Last Move:</strong> {gameState.lastMove.player === 'human' ? 'You' : 'AI'} placed{' '}
                <span className={`inline-block w-4 h-4 rounded-full ${TOKEN_COLORS[gameState.lastMove.token]} text-center text-white text-xs leading-4 mx-1`}>
                  {gameState.lastMove.token}
                </span>
                on the {gameState.lastMove.stack} stack
                {gameState.lastMove.pointsScored > 0 && (
                  <span className="font-bold text-green-600 ml-1">
                    (+{gameState.lastMove.pointsScored} points!)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Algorithm Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {gameMode === 'practice' ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Practice Mode</h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Game Rules:</h3>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li>• <strong>Take turns</strong> removing the leftmost token from the sequence</li>
                      <li>• <strong>Place tokens</strong> on either the Left or Right stack</li>
                      <li>• <strong>Score points</strong> when top two tokens match (they disappear)</li>
                      <li>• <strong>Chain combos</strong> for multiple points in one turn</li>
                      <li>• <strong>Win</strong> by having more points when sequence is empty</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-900 mb-2">Strategy Tips:</h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Look ahead to see what tokens are coming next</li>
                      <li>• Sometimes blocking your opponent is better than scoring</li>
                      <li>• Set up combos by placing tokens strategically</li>
                      <li>• Consider what your opponent might do on their turn</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-900 mb-2">Practice Goal:</h3>
                    <p className="text-sm text-green-800">
                      Learn the game mechanics and develop winning strategies! 
                      Once you understand the game, switch to Challenge Mode to code an AI.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Challenge Mode Content - Will implement this next */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Challenge Mode</h2>
                <p className="text-gray-600">Challenge mode coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Code Editor Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-4/5 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">🔍 Expanded Code Editor</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setChallengeState(prev => ({ ...prev, algorithmCode: getTemplateCode() }));
                  }}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  🔄 Reset to Template
                </button>
                <button
                  onClick={() => setIsCodeModalOpen(false)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <Editor
                height="100%"
                defaultLanguage="python"
                value={challengeState.algorithmCode}
                onChange={(value) => setChallengeState(prev => ({ ...prev, algorithmCode: value || '' }))}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  insertSpaces: true,
                  wordWrap: 'on'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}