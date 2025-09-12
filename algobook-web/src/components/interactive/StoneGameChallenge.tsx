'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CodeBlock } from '@/components/interactive';
import { Judge0Service } from '@/lib/api/judge0';
import { ProgressManager } from '@/lib/utils/progress';
import Editor from '@monaco-editor/react';

interface GameState {
  stones: number;
  allowedMoves: number[];
  currentPlayer: 'human' | 'ai' | 'algorithm';
  gameStatus: 'setup' | 'playing' | 'finished';
  winner: 'human' | 'ai' | 'algorithm' | null;
  moveHistory: { player: string; move: number; stonesLeft: number }[];
  initialStones: number; // Store the original stone count
}

interface ChallengeState {
  consecutiveWins: number;
  isRunning: boolean;
  currentGame: number;
  totalGames: number;
  algorithmCode: string;
  testResults: { game: number; won: boolean; reason?: string }[];
}

export default function StoneGameChallenge() {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    stones: 15,
    allowedMoves: [1, 2, 4],
    currentPlayer: 'human',
    gameStatus: 'setup',
    winner: null,
    moveHistory: [],
    initialStones: 15
  });

  // Practice vs Challenge modes
  const [gameMode, setGameMode] = useState<'practice' | 'challenge'>('practice');
  
  // Load algorithm code from localStorage or use default template
  const getInitialAlgorithmCode = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('algobook_stone_game_algorithm');
      if (saved) {
        return saved;
      }
    }
    return `# Define global variables here
# your_list = []

def init():
    # If you want your_list to be accessible in other functions, write global your_list
    # global your_list
    # your_list = []
    pass

def choose_first_player(initial_stones):
    # Return True to go first, False to go second
    return True

def make_move(remaining_stones):
    # Return a number from allowed_moves
    return allowed_moves[0]`;
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

  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const gameTimerRef = useRef<NodeJS.Timeout>();

  // Save algorithm code to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('algobook_stone_game_algorithm', challengeState.algorithmCode);
    }
  }, [challengeState.algorithmCode]);

  // Mark challenge as completed when 5 consecutive wins achieved
  useEffect(() => {
    if (challengeState.consecutiveWins === 5) {
      ProgressManager.markChallengeCompleted('part1-challenge');
    }
  }, [challengeState.consecutiveWins]);

  // AI strategy (optimal play using game theory)
  const calculateOptimalMove = (stones: number, moves: number[]): number => {
    console.log(`AI calculating move for ${stones} stones with moves [${moves.join(', ')}]`);
    
    const availableMoves = moves.filter(move => move <= stones);
    
    if (availableMoves.length === 0) {
      console.log('No available moves!');
      return moves[0];
    }

    // Use memoized Grundy numbers for optimal play
    const grundyMemo = new Map<number, number>();
    
    const grundyNumber = (n: number): number => {
      if (n === 0) return 0;
      if (grundyMemo.has(n)) return grundyMemo.get(n)!;
      
      const reachable = new Set<number>();
      for (const move of moves) {
        if (n >= move) {
          reachable.add(grundyNumber(n - move));
        }
      }
      
      // Find minimum excludant (mex)
      let mex = 0;
      while (reachable.has(mex)) {
        mex++;
      }
      
      grundyMemo.set(n, mex);
      return mex;
    };

    // Find all moves that lead to a losing position (Grundy number 0)
    const winningMoves = availableMoves.filter(move => {
      const remaining = stones - move;
      return grundyNumber(remaining) === 0;
    });
    
    if (winningMoves.length > 0) {
      // Multiple winning moves available - choose the largest to end game faster
      const move = Math.max(...winningMoves);
      console.log(`AI choosing optimal move ${move}, leaving ${stones - move} stones (losing position for opponent, fastest win)`);
      return move;
    }
    
    // No winning moves found (we're in a losing position) - take largest move to end game faster
    const move = Math.max(...availableMoves);
    console.log(`AI choosing fallback move ${move}, leaving ${stones - move} stones (no winning move available, ending faster)`);
    return move;
  };

  const generateRandomGameSettings = () => {
    // Random initial stones: 20-100
    const stones = 20 + Math.floor(Math.random() * 81);
    
    // Generate random allowed moves
    const allPossibleMoves = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const numMoves = 3 + Math.floor(Math.random() * 3); // 3-5 different moves
    
    // Always include 1 to ensure game can always end
    const moves = [1];
    
    // Add random moves from the remaining options
    const remainingMoves = allPossibleMoves.filter(m => m !== 1);
    while (moves.length < numMoves && remainingMoves.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingMoves.length);
      const selectedMove = remainingMoves.splice(randomIndex, 1)[0];
      moves.push(selectedMove);
    }
    
    // Sort moves for consistent display
    moves.sort((a, b) => a - b);
    
    return { stones, moves };
  };

  const generateNewGame = () => {
    const settings = generateRandomGameSettings();
    console.log(`New random game: ${settings.stones} stones, moves [${settings.moves.join(', ')}]`);
    
    setGameState({
      stones: settings.stones,
      allowedMoves: settings.moves,
      currentPlayer: 'human', // Will be set when player chooses
      gameStatus: 'setup',
      winner: null,
      moveHistory: [],
      initialStones: settings.stones
    });
  };

  const startGame = (humanFirst: boolean) => {
    setGameState(prev => ({
      ...prev,
      currentPlayer: humanFirst ? 'human' : 'ai',
      gameStatus: 'playing',
      moveHistory: [], // Clear move history from previous game
      winner: null
    }));
  };

  const retryGame = () => {
    setGameState(prev => ({
      ...prev,
      currentPlayer: 'human', // Reset to setup state
      gameStatus: 'setup',
      winner: null,
      moveHistory: []
      // Keep stones and allowedMoves unchanged
    }));
  };

  // Generate initial random game on mount
  useEffect(() => {
    generateNewGame();
  }, []);

  // Trigger AI move when it's AI's turn at game start
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.currentPlayer === 'ai' && gameState.moveHistory.length === 0) {
      console.log('AI goes first - making initial move');
      setTimeout(() => {
        const aiMove = calculateOptimalMove(gameState.stones, gameState.allowedMoves);
        makeMove('ai', aiMove);
      }, animationSpeed);
    }
  }, [gameState.currentPlayer, gameState.gameStatus, gameState.moveHistory.length]);

  const makeMove = async (player: 'human' | 'ai' | 'algorithm', move: number, currentStones?: number) => {
    const stonesBeforeMove = currentStones ?? gameState.stones;
    
    if (gameState.gameStatus !== 'playing') {
      return;
    }

    // Validate move
    if (!gameState.allowedMoves.includes(move)) {
      console.error(`Invalid move: ${move} is not in allowed moves [${gameState.allowedMoves.join(', ')}]`);
      if (player === 'human') {
        alert(`Invalid move: ${move}. You can only take [${gameState.allowedMoves.join(', ')}] stones.`);
      }
      return;
    }

    if (move > stonesBeforeMove) {
      console.error(`Invalid move: ${move} stones requested but only ${stonesBeforeMove} available`);
      if (player === 'human') {
        alert(`Invalid move: Only ${stonesBeforeMove} stones remaining, cannot take ${move}.`);
      }
      return;
    }

    if (move <= 0) {
      console.error(`Invalid move: ${move} is not a positive number`);
      if (player === 'human') {
        alert(`Invalid move: Must take a positive number of stones.`);
      }
      return;
    }

    const newStones = stonesBeforeMove - move;
    
    // Early return if game ended
    if (newStones === 0) {
      setGameState(prev => ({
        ...prev,
        stones: newStones,
        moveHistory: [...prev.moveHistory, {
          player: player,
          move,
          stonesLeft: newStones
        }],
        gameStatus: 'finished',
        winner: player
      }));
      return;
    }

    // Determine next player
    const nextPlayer = gameMode === 'practice' 
      ? (player === 'human' ? 'ai' : 'human')
      : (player === 'algorithm' ? 'ai' : 'algorithm');

    // Update game state for continuing game
    setGameState(prev => ({
      ...prev,
      stones: newStones,
      moveHistory: [...prev.moveHistory, {
        player: player,
        move,
        stonesLeft: newStones
      }],
      currentPlayer: nextPlayer
    }));

    // If next player is AI, make AI move after delay
    if (nextPlayer === 'ai') {
      setTimeout(() => {
        const aiMove = calculateOptimalMove(newStones, gameState.allowedMoves);
        makeMove('ai', aiMove, newStones);
      }, animationSpeed);
    }
  };

  const handleHumanMove = (move: number) => {
    if (gameState.currentPlayer === 'human' && gameState.stones >= move) {
      makeMove('human', move);
    }
  };

  const startChallenge = async () => {
    try {
      setChallengeState(prev => ({
        ...prev,
        isRunning: true,
        consecutiveWins: 0,
        currentGame: 1,
        testResults: []
      }));

      // Run 50 games with fresh execution each time
      for (let game = 1; game <= challengeState.totalGames; game++) {
        setChallengeState(prev => ({ ...prev, currentGame: game }));
        
        const gameSettings = generateRandomGameSettings();
        
        // Call choose_first_player function with fresh execution
        const humanFirst = await executeStudentFunction(
          challengeState.algorithmCode, 
          'choose_first_player', 
          [gameSettings.stones], 
          gameSettings.stones, 
          gameSettings.moves
        );
        
        console.log(`Challenge Game ${game}: ${gameSettings.stones} stones, moves [${gameSettings.moves.join(', ')}], human first: ${humanFirst}`);
        
        // Reset game for algorithm mode
        setGameState({
          stones: gameSettings.stones,
          allowedMoves: gameSettings.moves,
          currentPlayer: humanFirst ? 'algorithm' : 'ai',
          gameStatus: 'playing',
          winner: null,
          moveHistory: [],
          initialStones: gameSettings.stones
        });

        // Play the game with fresh execution for each move
        const result = await playAutomaticGameWithFreshExecution(
          challengeState.algorithmCode,
          gameSettings.stones, 
          humanFirst, 
          gameSettings.moves
        );
        
        setChallengeState(prev => ({
          ...prev,
          testResults: [...prev.testResults, { 
            game, 
            won: result.won, 
            reason: result.reason,
            moveHistory: result.moveHistory,
            initialStones: gameSettings.stones,
            allowedMoves: gameSettings.moves,
            humanFirst: humanFirst
          }],
          consecutiveWins: result.won ? prev.consecutiveWins + 1 : 0
        }));

        // If lost, stop the challenge
        if (!result.won) {
          setChallengeState(prev => ({ ...prev, isRunning: false }));
          return;
        }

        // Add delay between games
        await new Promise(resolve => setTimeout(resolve, animationSpeed / 2));
      }

      // All 50 games won!
      setChallengeState(prev => ({ ...prev, isRunning: false }));
      
    } catch (error) {
      console.error('Challenge error:', error);
      setChallengeState(prev => ({ 
        ...prev, 
        isRunning: false,
        testResults: [...prev.testResults, { game: prev.currentGame, won: false, reason: `Error: ${error.message}` }]
      }));
    }
  };

  // Execute student function with fresh context and auto-init
  const executeStudentFunction = async (
    userCode: string, 
    functionName: string, 
    args: any[], 
    initialStones: number, 
    allowedMoves: number[]
  ): Promise<any> => {
    // Wrap student code with global variables and auto-init call
    const wrappedCode = `
# Global variables automatically available
initial_stones = ${initialStones}
allowed_moves = ${allowedMoves}

# Student's code
${userCode}

# Auto-call init if it exists
try:
    if 'init' in globals():
        init()
except Exception as e:
    print(f"Error in init(): {e}")

# Call the requested function
result = ${functionName}(${args.map(arg => typeof arg === 'string' ? `"${arg}"` : String(arg)).join(', ')})
print(result)
`;

    try {
      const response = await Judge0Service.executeCode(wrappedCode, '', undefined, 10000, true);
      
      if (response.status.id !== 3) {
        throw new Error(response.stderr || 'Execution failed');
      }
      
      const output = response.stdout.trim();
      const lastLine = output.split('\n').pop() || '';
      
      // Parse result - handle different return types
      if (lastLine === 'True') return true;
      if (lastLine === 'False') return false;
      if (!isNaN(Number(lastLine))) return Number(lastLine);
      return lastLine;
      
    } catch (error) {
      throw new Error(`Function ${functionName} failed: ${error.message}`);
    }
  };

  const parseAlgorithmCode = (code: string, allowedMoves: number[]) => {
    // This is a simplified parser - in a real implementation you'd use a proper sandbox
    // For now, we'll simulate the parsing and the global variable system
    
    // Simulate shared storage that both functions can access
    // allowed_moves is automatically available as a global variable
    let sharedStorage = {
      allowed_moves: allowedMoves,
      // Students can define any other global variables in their setup function
    };
    
    return {
      setup: (moves: number[]) => {
        // This would call the student's setup function
        console.log(`Setup called with moves: [${moves.join(', ')}]`);
        
        // Make allowed_moves available globally
        sharedStorage.allowed_moves = moves;
        
        // In a real implementation, this would:
        // 1. Set allowed_moves as a global variable
        // 2. Execute the student's setup function
        // 3. Allow them to populate their own global variables
        // For simulation, we'll just store the moves
      },
      chooseFirstPlayer: (stones: number) => {
        // Simple heuristic strategy for simulation
        // In reality, this would execute the student's function with access to:
        // - Their global variables from setup
        // - allowed_moves as a global variable
        return stones % 2 === 1; // Simple strategy: go first on odd numbers
      },
      makeMove: (stones: number, moves: number[]) => {
        const availableMoves = moves.filter(move => move <= stones);
        
        // Simple strategy for simulation
        // In reality, this would execute the student's function with access to:
        // - Their global variables from setup
        // - allowed_moves as a global variable (same as the parameter)
        
        // Try to take a move that leaves a "nice" number
        for (const move of availableMoves) {
          const remaining = stones - move;
          if (remaining % 3 === 0 && remaining > 0) {
            return move;
          }
        }
        
        // Fallback: take the largest available move
        return Math.max(...availableMoves);
      }
    };
  };

  const playAutomaticGame = async (algorithmFunctions: any, initialStones: number, humanFirst: boolean): Promise<{won: boolean, reason?: string}> => {
    let stones = initialStones;
    let currentPlayer = humanFirst ? 'algorithm' : 'ai';
    const moveHistory: any[] = [];

    while (stones > 0) {
      let move: number;
      
      if (currentPlayer === 'algorithm') {
        try {
          move = algorithmFunctions.makeMove(stones, gameState.allowedMoves);
          if (!gameState.allowedMoves.includes(move) || move > stones) {
            return { won: false, reason: `Invalid move: ${move}` };
          }
        } catch (error) {
          return { won: false, reason: `Algorithm error: ${error.message}` };
        }
      } else {
        move = calculateOptimalMove(stones, gameState.allowedMoves);
      }

      stones -= move;
      moveHistory.push({ player: currentPlayer, move, stonesLeft: stones });

      // Update UI
      setGameState(prev => ({
        ...prev,
        stones,
        moveHistory,
        currentPlayer: currentPlayer === 'algorithm' ? 'ai' : 'algorithm'
      }));

      if (stones === 0) {
        const winner = currentPlayer;
        setGameState(prev => ({
          ...prev,
          gameStatus: 'finished',
          winner: winner as any
        }));
        
        return { won: winner === 'algorithm' };
      }

      currentPlayer = currentPlayer === 'algorithm' ? 'ai' : 'algorithm';
      
      // Add small delay for visualization
      await new Promise(resolve => setTimeout(resolve, animationSpeed / 4));
    }

    return { won: false, reason: 'Unexpected end of game' };
  };

  // Version using fresh execution with auto-init for each move
  const playAutomaticGameWithFreshExecution = async (
    userCode: string,
    initialStones: number, 
    humanFirst: boolean, 
    allowedMoves: number[]
  ): Promise<{won: boolean, reason?: string, moveHistory?: any[]}> => {
    let stones = initialStones;
    let currentPlayer = humanFirst ? 'algorithm' : 'ai';
    const moveHistory: any[] = [];

    // Update game state to show the challenge game in progress
    setGameState({
      stones: initialStones,
      allowedMoves: allowedMoves,
      currentPlayer: currentPlayer as any,
      gameStatus: 'playing',
      winner: null,
      moveHistory: [],
      initialStones: initialStones
    });

    while (stones > 0) {
      let move: number;
      
      if (currentPlayer === 'algorithm') {
        try {
          // Call the student's make_move function with fresh execution and auto-init
          move = await executeStudentFunction(
            userCode, 
            'make_move', 
            [stones], 
            initialStones, 
            allowedMoves
          );
          
          if (!allowedMoves.includes(move) || move > stones) {
            return { won: false, reason: `Invalid move: ${move}. Must be from [${allowedMoves.join(', ')}] and <= ${stones}`, moveHistory };
          }
        } catch (error) {
          return { won: false, reason: `Algorithm error: ${error.message}`, moveHistory };
        }
      } else {
        // AI plays optimally
        move = calculateOptimalMove(stones, allowedMoves);
      }
      
      stones -= move;
      const moveRecord = { player: currentPlayer, move, stonesLeft: stones };
      moveHistory.push(moveRecord);
      
      // Update game state to show current move
      setGameState(prev => ({
        ...prev,
        stones: stones,
        currentPlayer: stones === 0 ? prev.currentPlayer : (currentPlayer === 'algorithm' ? 'ai' : 'algorithm') as any,
        moveHistory: [...prev.moveHistory, moveRecord],
        winner: stones === 0 ? currentPlayer as any : null,
        gameStatus: stones === 0 ? 'finished' : 'playing'
      }));
      
      console.log(`${currentPlayer} takes ${move}, ${stones} stones left`);
      
      if (stones === 0) {
        const winner = currentPlayer;
        console.log(`Game over! Winner: ${winner}`);
        return { won: winner === 'algorithm', moveHistory };
      }

      currentPlayer = currentPlayer === 'algorithm' ? 'ai' : 'algorithm';
      
      // Add delay for visualization
      await new Promise(resolve => setTimeout(resolve, Math.max(animationSpeed / 2, 500)));
    }

    return { won: false, reason: 'Unexpected end of game', moveHistory };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎮 Part I Challenge: Stone Game
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Test your algorithmic thinking! This strategic game has you take turns removing stones. 
            The player who takes the last stone wins. Can you write an algorithm to beat the AI 5 times in a row?
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
              onClick={() => setGameMode('practice')}
            >
              🎯 Practice Mode
            </button>
            <button
              className={`px-6 py-2 rounded-md transition-colors ${
                gameMode === 'challenge' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setGameMode('challenge')}
            >
              🏆 Challenge Mode
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Game Board */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Game Board</h2>
                <div className="flex gap-2">
                  <span className="text-sm text-gray-600">Speed:</span>
                  <select 
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value={2000}>Slow</option>
                    <option value={1000}>Normal</option>
                    <option value={500}>Fast</option>
                  </select>
                </div>
              </div>
              
              {/* Game Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Stones remaining:</span>
                    <span className="text-2xl font-bold text-blue-600 ml-2">{gameState.stones}</span>
                  </div>
                  <div>
                    <span className="font-medium">Allowed moves:</span>
                    <span className="ml-2 font-mono font-bold text-purple-600">[{gameState.allowedMoves.join(', ')}]</span>
                  </div>
                  <div>
                    <span className="font-medium">Current player:</span>
                    <span className={`ml-2 font-bold ${
                      gameState.currentPlayer === 'human' ? 'text-green-600' :
                      gameState.currentPlayer === 'ai' ? 'text-red-600' : 'text-purple-600'
                    }`}>
                      {gameState.currentPlayer.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className="ml-2 capitalize">{gameState.gameStatus}</span>
                  </div>
                </div>
                
                {gameState.gameStatus === 'setup' && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                    🎮 <strong>Ready to Play!</strong> This game has <strong>{gameState.stones} stones</strong> and allows moves <strong>[{gameState.allowedMoves.join(', ')}]</strong>. 
                    Choose whether you want to go first or let the AI start!
                  </div>
                )}
              </div>
            </div>

            {/* Stone Visualization */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Stones:</h3>
              <div className="grid grid-cols-10 gap-1">
                {(() => {
                  // Use the stored initial stones count
                  const originalStones = gameState.initialStones;
                  const displayStones = Math.max(20, originalStones);
                  
                  return Array.from({ length: displayStones }, (_, i) => {
                    if (i >= originalStones) {
                      // This is an empty slot (beyond the original game stones)
                      return (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 opacity-20"
                        />
                      );
                    }
                    
                    // This stone is part of the original game
                    let takenByPlayer = null;
                    let isRemaining = true;
                    
                    // Check if this stone was taken - stones are taken from the LEFT
                    let stonesAccountedFor = 0;
                    
                    for (const move of gameState.moveHistory) {
                      if (i >= stonesAccountedFor && i < stonesAccountedFor + move.move) {
                        takenByPlayer = move.player;
                        isRemaining = false;
                        break;
                      }
                      stonesAccountedFor += move.move;
                    }
                    
                    let circleClass = '';
                    let emoji = null;
                    
                    if (isRemaining) {
                      circleClass = 'bg-white border-2 border-gray-400';
                      emoji = '🪨';
                    } else if (takenByPlayer === 'human' || takenByPlayer === 'algorithm') {
                      circleClass = 'bg-blue-200 border-2 border-blue-400 opacity-70';
                      emoji = '👤';
                    } else if (takenByPlayer === 'ai') {
                      circleClass = 'bg-red-200 border-2 border-red-400 opacity-70';
                      emoji = '🤖';
                    }
                    
                    return (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full transition-all duration-300 ${circleClass} flex items-center justify-center text-sm`}
                        title={
                          isRemaining 
                            ? 'Remaining stone' 
                            : `Taken by ${takenByPlayer === 'human' || takenByPlayer === 'algorithm' ? 'You' : 'AI'}`
                        }
                      >
                        {emoji}
                      </div>
                    );
                  });
                })()}
              </div>
              
              {/* Legend */}
              <div className="mt-2 text-xs text-gray-600 flex gap-4">
                <span className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-white border border-gray-400 flex items-center justify-center text-xs">🪨</div>
                  Remaining
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-blue-200 border border-blue-400 opacity-70 flex items-center justify-center text-xs">👤</div>
                  Your moves
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-red-200 border border-red-400 opacity-70 flex items-center justify-center text-xs">🤖</div>
                  AI moves
                </span>
              </div>
            </div>

            {/* Game Controls */}
            {gameMode === 'practice' && gameState.gameStatus === 'playing' && gameState.currentPlayer === 'human' && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Your Move:</h3>
                <div className="flex gap-2">
                  {gameState.allowedMoves.map(move => (
                    <button
                      key={move}
                      onClick={() => handleHumanMove(move)}
                      disabled={gameState.stones < move}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        gameState.stones >= move
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Take {move}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Game Controls */}
            <div className="flex gap-3 flex-wrap">
              {gameMode === 'practice' && (
                <>
                  {gameState.gameStatus === 'setup' ? (
                    // Show choice buttons when game is in setup
                    <>
                      <button
                        onClick={() => startGame(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        I'll Go First
                      </button>
                      <button
                        onClick={() => startGame(false)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        AI Goes First
                      </button>
                    </>
                  ) : (
                    // Show control buttons when game is playing/finished
                    <>
                      <button
                        onClick={retryGame}
                        disabled={gameState.gameStatus === 'playing' && gameState.currentPlayer === 'ai'}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-yellow-400 transition-colors"
                      >
                        🔄 Retry Same Game
                      </button>
                      <button
                        onClick={generateNewGame}
                        disabled={gameState.gameStatus === 'playing' && gameState.currentPlayer === 'ai'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                      >
                        🎲 New Random Game
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Winner Announcement */}
            {gameState.winner && (
              <div className={`mt-4 p-4 rounded-lg text-center ${
                gameState.winner === 'human' || gameState.winner === 'algorithm' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <h3 className="font-bold text-lg">
                  {gameState.winner === 'human' && '🎉 You Won!'}
                  {gameState.winner === 'algorithm' && '🎉 Your Algorithm Won!'}
                  {gameState.winner === 'ai' && '🤖 AI Won!'}
                </h3>
                <p className="text-sm mt-1">
                  {gameState.winner === 'human' || gameState.winner === 'algorithm' 
                    ? 'Great job! You took the last stone.' 
                    : 'Better luck next time!'}
                </p>
              </div>
            )}

            {/* Move History */}
            {gameState.moveHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-700 mb-3">Move History:</h3>
                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {gameState.moveHistory.map((move, index) => (
                    <div key={index} className="text-sm py-1">
                      <span className={`font-medium ${
                        move.player === 'HUMAN' ? 'text-green-600' :
                        move.player === 'AI' ? 'text-red-600' : 'text-purple-600'
                      }`}>
                        {move.player}
                      </span>
                      {' took '}
                      <span className="font-bold">{move.move}</span>
                      {' stones → '}
                      <span className="font-bold">{move.stonesLeft}</span>
                      {' remaining'}
                    </div>
                  ))}
                </div>
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
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Start with a random number of stones (20-100)</li>
                      <li>• Players take turns removing stones</li>
                      <li>• You can take any number from the allowed moves list (3-5 different moves from 1-9)</li>
                      <li>• The player who takes the last stone wins</li>
                      <li>• Choose whether to go first or second</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-900 mb-2">Strategy Tips:</h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Think about what positions are "winning" vs "losing"</li>
                      <li>• If you leave your opponent in a losing position, you win!</li>
                      <li>• Look for patterns in the numbers</li>
                      <li>• Sometimes going second is better than going first</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-900 mb-2">Practice Goal:</h3>
                    <p className="text-sm text-green-800">
                      Try to win several games against the AI. Once you understand the strategy, 
                      switch to Challenge Mode and implement your algorithm!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Header with Progress */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">🏆 Challenge Mode</h2>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-purple-900">Progress:</span>
                      <span className="text-lg font-bold text-purple-600">
                        {challengeState.consecutiveWins} / 5
                      </span>
                      <div className="w-24 bg-purple-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(challengeState.consecutiveWins / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                    {challengeState.isRunning && (
                      <p className="text-xs text-purple-700 mt-1">
                        Running game {challengeState.currentGame} of 5...
                      </p>
                    )}
                  </div>
                </div>

                {/* Strategy Tips Above Code */}
                <div className="mb-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-semibold mb-1">💡 Quick Tips:</div>
                        <ul className="ml-4 space-y-0.5 list-disc text-xs">
                          <li>Define global variables at top</li>
                          <li>Use <code>global</code> in <code>init()</code></li>
                          <li><code>init()</code> automatically runs before the other functions</li>
                        </ul>
                      </div>

                      <div>
                        <div className="font-semibold mb-1">🔧 Available global variables:</div>
                        <ul className="ml-4 space-y-0.5 list-disc text-xs">
                          <li><code>initial_stones</code>: stones at game start</li>
                          <li><code>allowed_moves</code>: list of valid moves</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Algorithm Code Editor - Full Width */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3">Your Algorithm:</h3>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <Editor
                      height="400px"
                      language="python"
                      value={challengeState.algorithmCode}
                      onChange={(value) => setChallengeState(prev => ({ ...prev, algorithmCode: value || '' }))}
                      theme="vs-light"
                      options={{
                        readOnly: challengeState.isRunning,
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        insertSpaces: true,
                        wordWrap: 'on',
                        fontSize: 14,
                        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                        renderWhitespace: 'selection',
                        guides: {
                          indentation: true
                        },
                        bracketPairColorization: {
                          enabled: true
                        },
                        suggest: {
                          showKeywords: true,
                          showSnippets: true
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Challenge Controls */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={startChallenge}
                    disabled={challengeState.isRunning}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
                  >
                    {challengeState.isRunning ? 'Running Challenge...' : 'Start Challenge'}
                  </button>
                  <button
                    onClick={() => setChallengeState(prev => ({ 
                      ...prev, 
                      consecutiveWins: 0, 
                      testResults: [],
                      currentGame: 1 
                    }))}
                    disabled={challengeState.isRunning}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
                  >
                    Reset
                  </button>
                </div>

                {/* Test Results */}
                {challengeState.testResults.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Results:</h3>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                      {challengeState.testResults.map((result, index) => (
                        <div key={index} className={`text-sm mb-2 p-2 rounded ${result.won ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className={`font-medium ${result.won ? 'text-green-700' : 'text-red-700'}`}>
                            Game {result.game}: {result.won ? '✅ Won' : '❌ Lost'}
                            {result.reason && ` - ${result.reason}`}
                          </div>
                          
                          {result.initialStones && (
                            <div className="text-xs text-gray-600 mt-1">
                              Setup: {result.initialStones} stones, moves [{result.allowedMoves?.join(', ')}], 
                              {result.humanFirst ? ' you went first' : ' AI went first'}
                            </div>
                          )}
                          
                          {result.moveHistory && result.moveHistory.length > 0 && (
                            <div className="text-xs text-gray-600 mt-1">
                              Moves: {result.moveHistory.map((move: any, i: number) => 
                                `${move.player === 'algorithm' ? 'You' : 'AI'} took ${move.move} (${move.stonesLeft} left)`
                              ).join(' → ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {challengeState.consecutiveWins === 5 && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg text-center">
                    <h3 className="text-2xl font-bold mb-2">🎉 Congratulations!</h3>
                    <p className="text-lg">
                      You've successfully completed the Part I Challenge! 
                      Your algorithm won 5 consecutive games against the AI!
                    </p>
                    <p className="text-sm mt-2 opacity-90">
                      You've demonstrated mastery of algorithmic thinking, game theory, and strategic problem-solving!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Game Theory Explanation */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Understanding the Game</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Mathematical Insight:</h3>
              <p className="text-sm text-gray-600 mb-3">
                This game has a mathematical solution! It's related to the concept of "winning" and "losing" positions:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>A position is "losing" if all moves lead to "winning" positions for your opponent</li>
                <li>A position is "winning" if there exists at least one move that leads to a "losing" position for your opponent</li>
                <li>The key is finding the pattern in these positions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Algorithm Design:</h3>
              <p className="text-sm text-gray-600 mb-3">
                Your challenge functions should implement:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li><code>choose_first_player()</code>: Analyze if the initial position favors first or second player</li>
                <li><code>make_move()</code>: Choose the optimal move that puts opponent in a losing position</li>
                <li>Consider using modular arithmetic or game theory concepts</li>
                <li>Test your logic with small examples first</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}