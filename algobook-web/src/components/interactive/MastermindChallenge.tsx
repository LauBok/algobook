'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Judge0Service } from '@/lib/api/judge0';
import { ProgressManager } from '@/lib/utils/progress';
import Editor from '@monaco-editor/react';

interface GameState {
  secretCode: number[];
  guesses: number[][];
  feedback: number[][];  // [black_pegs, white_pegs]
  gameStatus: 'setup' | 'playing' | 'finished';
  winner: 'algorithm' | 'failed' | null;
  currentGuess: number;
  maxGuesses: number;
}

interface ChallengeState {
  consecutiveOptimalSolves: number;
  isRunning: boolean;
  currentGame: number;
  totalGames: number;
  algorithmCode: string;
  testResults: { 
    game: number; 
    guesses: number; 
    optimal: boolean; 
    reason?: string;
    secretCode: number[];
    guessHistory: number[][];
    feedbackHistory: number[][];
  }[];
}

const COLOR_NAMES = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'];
const COLOR_CLASSES = [
  'bg-red-500',
  'bg-blue-500', 
  'bg-green-500',
  'bg-yellow-400',
  'bg-purple-500',
  'bg-orange-500'
];

export default function MastermindChallenge({
  colors = 6,
  positions = 4,
  showHelpers = true
}: {
  colors?: number;
  positions?: number;
  showHelpers?: boolean;
}) {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    secretCode: [],
    guesses: [],
    feedback: [],
    gameStatus: 'setup',
    winner: null,
    currentGuess: 1,
    maxGuesses: 5
  });

  // Practice vs Challenge modes
  const [gameMode, setGameMode] = useState<'practice' | 'challenge'>('practice');
  
  // Handle mode switching
  const switchToMode = (mode: 'practice' | 'challenge') => {
    setGameMode(mode);
    
    // Clear game board when switching to practice mode
    if (mode === 'practice') {
      setGameState({
        secretCode: [],
        guesses: [],
        feedback: [],
        gameStatus: 'setup',
        winner: null,
        currentGuess: 1,
        maxGuesses: 5
      });
      setCurrentManualGuess(new Array(positions).fill(-1));
      setSelectedPosition(0);
    }
  };
  
  // Manual guess building for practice mode
  const [currentManualGuess, setCurrentManualGuess] = useState<number[]>(new Array(positions).fill(-1));
  const [selectedPosition, setSelectedPosition] = useState<number>(0);
  
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
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isCodeModalOpen]);
  
  // Get the default template code
  const getTemplateCode = () => {
    return `# Global variables automatically available:
# COLORS = 6           # Number of available colors (0-5)
# POSITIONS = 4        # Number of positions
# guesses = []         # Previous guesses: [[1,2,3,4], [0,1,2,3], ...]
# feedback = []        # Previous feedback: [[1,2], [0,3], ...] (black_pegs, white_pegs)
# current_round = 0    # Which guess we're making (0-4)
# calculate_feedback(guess, secret) # Calculate black/white pegs between guess and secret
# evaluate_guess(potential_guess) # Analyze feedback scenarios for any potential guess

def next_guess():
    """
    Return your next guess based on current game state.
    All game state variables and helper functions are available globally.
    
    Available:
        - COLORS, POSITIONS, guesses, feedback, current_round
        - calculate_feedback(guess, secret): returns [black_pegs, white_pegs]
        - evaluate_guess(potential_guess, guess_history=None, feedback_history=None): analyzes feedback scenarios
    
    Returns:
        list: Next guess as [color1, color2, color3, color4] where colors are 0-5
    """
    # Global 'remaining_codes' is automatically maintained for you!
    # It starts with all 1,296 codes and gets filtered after each guess
    # 
    # Example: Check how many codes are left
    # print(f"Remaining possibilities: {len(remaining_codes)}")
    # 
    # Example: Use calculate_feedback to check consistency  
    # for possibility in remaining_codes:  # Much faster than all codes!
    #     expected_feedback = calculate_feedback(guesses[0], possibility)
    #     if expected_feedback == feedback[0]:
    #         # This possibility is consistent with our first guess
    
    # Example: Use evaluate_guess to analyze potential moves
    # analysis = evaluate_guess([0, 0, 1, 1])  # Uses current game history
    # analysis = evaluate_guess([0, 0, 1, 1], custom_guesses, custom_feedback)  # Uses custom history
    # Returns: [[[black, white], [list_of_possibilities]], [[black, white], [list_of_possibilities]], ...]
    # 
    # Example usage:
    # for feedback, possibilities in analysis:
    #     black_pegs, white_pegs = feedback
    #     num_remaining = len(possibilities)
    #     print(f"Feedback {feedback}: {num_remaining} possibilities remain")
    
    # Minimax strategy: choose the guess that minimizes the maximum remaining possibilities
    
    # If only one possibility remains, return it
    if len(remaining_codes) == 1:
        return remaining_codes[0]
    
    # If no guesses yet, use a good starting guess
    if current_round == 0:
        return [0, 0, 1, 1]  # Classic strong opener
    
    best_guess = None
    min_max_remaining = float('inf')
    
    # Consider all possible guesses (including codes not in remaining_codes)
    import itertools
    all_possible_guesses = list(itertools.product(range(COLORS), repeat=POSITIONS))
    
    for potential_guess in all_possible_guesses:
        potential_guess = list(potential_guess)
        
        # Analyze this potential guess using evaluate_guess
        feedback_scenarios = evaluate_guess(potential_guess)
        
        # Find the worst-case scenario (maximum remaining possibilities)
        max_remaining_for_this_guess = 0
        for feedback_list, possibilities in feedback_scenarios:
            num_remaining = len(possibilities)
            max_remaining_for_this_guess = max(max_remaining_for_this_guess, num_remaining)
        
        # If this guess has a better worst-case than our current best
        if max_remaining_for_this_guess < min_max_remaining:
            min_max_remaining = max_remaining_for_this_guess
            best_guess = potential_guess
        
        # Early termination: if we find a guess that leaves at most 1 possibility
        if max_remaining_for_this_guess <= 1:
            break
    
    return best_guess if best_guess is not None else remaining_codes[0]`;
  };

  // Load algorithm code from localStorage or use default template
  const getInitialAlgorithmCode = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('algobook_mastermind_algorithm');
      if (saved) {
        return saved;
      }
    }
    return getTemplateCode();
  };

  // Challenge state
  const [challengeState, setChallengeState] = useState<ChallengeState>({
    consecutiveOptimalSolves: 0,
    isRunning: false,
    currentGame: 1,
    totalGames: 10,
    algorithmCode: getInitialAlgorithmCode(),
    testResults: []
  });

  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const challengeCancelRef = useRef<boolean>(false);

  // Save algorithm code to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('algobook_mastermind_algorithm', challengeState.algorithmCode);
    }
  }, [challengeState.algorithmCode]);

  // Mark challenge as completed when 10 consecutive optimal solves achieved
  useEffect(() => {
    if (challengeState.consecutiveOptimalSolves >= 10) {
      ProgressManager.markChallengeCompleted('part2-mastermind-challenge');
    }
  }, [challengeState.consecutiveOptimalSolves]);

  // Generate random secret code
  const generateSecretCode = (): number[] => {
    return Array.from({ length: positions }, () => Math.floor(Math.random() * colors));
  };

  // Calculate remaining possibilities after guesses
  const calculateRemainingPossibilities = (guesses: number[][], feedback: number[][]): number => {
    // Generate all possible codes
    const allPossibilities: number[][] = [];
    const generatePossibilities = (current: number[], position: number) => {
      if (position === positions) {
        allPossibilities.push([...current]);
        return;
      }
      for (let color = 0; color < colors; color++) {
        current[position] = color;
        generatePossibilities(current, position + 1);
      }
    };
    generatePossibilities([], 0);
    
    // Filter possibilities that match all given feedback
    return allPossibilities.filter(possibility => {
      return guesses.every((guess, index) => {
        const [expectedBlack, expectedWhite] = feedback[index];
        const [actualBlack, actualWhite] = calculateFeedback(guess, possibility);
        return expectedBlack === actualBlack && expectedWhite === actualWhite;
      });
    }).length;
  };

  // Calculate feedback (black pegs, white pegs)
  const calculateFeedback = (guess: number[], secret: number[]): [number, number] => {
    const blackPegs = guess.filter((color, index) => color === secret[index]).length;
    
    const guessCounts = new Array(colors).fill(0);
    const secretCounts = new Array(colors).fill(0);
    
    // Count colors, excluding black peg positions
    for (let i = 0; i < positions; i++) {
      if (guess[i] !== secret[i]) {
        guessCounts[guess[i]]++;
        secretCounts[secret[i]]++;
      }
    }
    
    // White pegs = min of each color count
    const whitePegs = guessCounts.reduce((total, count, color) => {
      return total + Math.min(count, secretCounts[color]);
    }, 0);
    
    return [blackPegs, whitePegs];
  };

  // Check if solve is optimal (≤5 guesses)
  const isOptimalSolve = (guessCount: number): boolean => {
    return guessCount <= 5;
  };

  // Execute student's algorithm function
  const executeAlgorithmFunction = async (
    userCode: string,
    guesses: number[][],
    feedback: number[][],
    currentRound: number
  ): Promise<number[]> => {
    const wrappedCode = `
# Global variables automatically available
COLORS = ${colors}
POSITIONS = ${positions}
guesses = ${JSON.stringify(guesses)}
feedback = ${JSON.stringify(feedback)}
current_round = ${currentRound}

# Global variable to track remaining possible codes
import itertools
remaining_codes = [list(code) for code in itertools.product(range(COLORS), repeat=POSITIONS)]

# Load precomputed lookup table for first-guess optimization
import json
import urllib.request
try:
    with urllib.request.urlopen('/mastermind-lookup.json') as response:
        lookup_data = json.loads(response.read().decode())
        first_guess_lookup = {tuple(json.loads(k)): v for k, v in lookup_data.items()}
except:
    first_guess_lookup = None

# Helper function to calculate feedback between guess and secret
def calculate_feedback(guess, secret):
    """
    Calculate the feedback (black and white pegs) for a guess against a secret code.
    
    Args:
        guess: List of 4 numbers representing the guess [0-5]
        secret: List of 4 numbers representing the secret code [0-5]
    
    Returns:
        List: [black_pegs, white_pegs] where:
        - black_pegs: exact matches (right color in right position)
        - white_pegs: color matches in wrong positions
    """
    black_pegs = sum(1 for j in range(POSITIONS) if guess[j] == secret[j])
    
    # Count colors excluding exact matches
    guess_counts = [0] * COLORS
    secret_counts = [0] * COLORS
    for j in range(POSITIONS):
        if guess[j] != secret[j]:
            guess_counts[guess[j]] += 1
            secret_counts[secret[j]] += 1
    
    white_pegs = sum(min(guess_counts[c], secret_counts[c]) for c in range(COLORS))
    
    return [black_pegs, white_pegs]


# Helper function to evaluate potential guesses
def evaluate_guess(potential_guess, guess_history=None, feedback_history=None):
    """
    Evaluate a potential guess and return all possible feedback scenarios.
    
    Args:
        potential_guess: List of 4 numbers representing colors [0-5]
        guess_history: List of previous guesses (defaults to current game history)
        feedback_history: List of previous feedback (defaults to current game history)
    
    Returns:
        List of lists, each containing:
        - [0]: feedback as [black_pegs, white_pegs]
        - [1]: list of all possibilities that would give this feedback
    """
    global remaining_codes
    
    # Use current game history and pre-filtered remaining_codes
    if guess_history is None and feedback_history is None:
        # For first guess (no history), use precomputed lookup table if available
        if len(guesses) == 0 and first_guess_lookup is not None:
            lookup_key = tuple(potential_guess)
            if lookup_key in first_guess_lookup:
                return first_guess_lookup[lookup_key]
        
        valid_possibilities = remaining_codes
    else:
        # Custom history provided, need to filter manually
        if guess_history is None:
            guess_history = guesses
        if feedback_history is None:
            feedback_history = feedback
            
        # Generate all possible codes and filter based on custom history
        import itertools
        all_possibilities = list(itertools.product(range(COLORS), repeat=POSITIONS))
        
        valid_possibilities = []
        for possibility in all_possibilities:
            valid = True
            for i, (prev_guess, prev_feedback) in enumerate(zip(guess_history, feedback_history)):
                expected_feedback = calculate_feedback(prev_guess, possibility)
                if expected_feedback != prev_feedback:
                    valid = False
                    break
            if valid:
                valid_possibilities.append(list(possibility))
    
    # Optimized feedback calculation: count occurrences directly
    feedback_counts = {}
    for possibility in valid_possibilities:
        # Inline optimized feedback calculation
        black_pegs = 0
        guess_colors = [0] * COLORS
        poss_colors = [0] * COLORS
        
        # Single pass through positions
        for j in range(POSITIONS):
            if potential_guess[j] == possibility[j]:
                black_pegs += 1
            else:
                guess_colors[potential_guess[j]] += 1
                poss_colors[possibility[j]] += 1
        
        # Calculate white pegs efficiently
        white_pegs = sum(min(guess_colors[c], poss_colors[c]) for c in range(COLORS))
        
        feedback_key = (black_pegs, white_pegs)
        feedback_counts[feedback_key] = feedback_counts.get(feedback_key, 0) + 1
    
    # Return just the counts for minimax (we only need sizes, not actual lists)
    results = []
    for (black_pegs, white_pegs), count in feedback_counts.items():
        results.append([
            [black_pegs, white_pegs],  # feedback
            count  # just the count instead of full list
        ])
    
    # Sort by most common feedback first (most cases)
    results.sort(key=lambda x: x[1], reverse=True)
    return results

# Filter remaining_codes to only include codes consistent with game history
if len(guesses) > 0:
    filtered_codes = []
    for code in remaining_codes:
        is_valid = True
        for i in range(len(guesses)):
            actual_feedback = calculate_feedback(guesses[i], code)
            if actual_feedback != feedback[i]:
                is_valid = False
                break
        if is_valid:
            filtered_codes.append(code)
    remaining_codes = filtered_codes

# Student's code
${userCode}

# Call the next_guess function
result = next_guess()
print(result)
`;

    try {
      const response = await Judge0Service.executeCode(wrappedCode, '', undefined, 10000, true);
      
      if (response.status.id !== 3) {
        throw new Error(response.stderr || 'Execution failed');
      }
      
      const output = (response.stdout || '').trim();
      const lastLine = output.split('\n').pop() || '';
      
      // Parse the result as a Python list
      const guess = JSON.parse(lastLine.replace(/'/g, '"'));
      
      // Validate guess
      if (!Array.isArray(guess) || guess.length !== positions) {
        throw new Error(`Invalid guess format. Expected array of length ${positions}, got: ${lastLine}`);
      }
      
      for (const color of guess) {
        if (!Number.isInteger(color) || color < 0 || color >= colors) {
          throw new Error(`Invalid color ${color}. Must be integer between 0 and ${colors-1}`);
        }
      }
      
      return guess;
      
    } catch (error) {
      throw new Error(`Algorithm failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Play a single automatic game
  const playAutomaticGame = async (secret: number[]): Promise<{
    guesses: number, 
    optimal: boolean, 
    reason?: string,
    secretCode: number[],
    guessHistory: number[][],
    feedbackHistory: number[][]
  }> => {
    const gameGuesses: number[][] = [];
    const gameFeedback: number[][] = [];
    let currentRound = 0;
    
    // Initialize the visual game board for this challenge game
    setGameState({
      secretCode: secret,
      guesses: [],
      feedback: [],
      gameStatus: 'playing',
      winner: null,
      currentGuess: 1,
      maxGuesses: 5
    });
    
    while (currentRound < 5) {
      try {
        // Get next guess from algorithm
        const guess = await executeAlgorithmFunction(
          challengeState.algorithmCode,
          gameGuesses,
          gameFeedback,
          currentRound
        );
        
        gameGuesses.push(guess);
        
        // Calculate feedback
        const [blackPegs, whitePegs] = calculateFeedback(guess, secret);
        gameFeedback.push([blackPegs, whitePegs]);
        
        // Update the visual game board
        setGameState(prev => ({
          ...prev,
          guesses: [...gameGuesses],
          feedback: [...gameFeedback],
          currentGuess: currentRound + 1
        }));
        
        // Add a small delay so user can see the progress
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if solved
        if (blackPegs === positions) {
          // Update final game state
          setGameState(prev => ({
            ...prev,
            gameStatus: 'finished',
            winner: 'algorithm'
          }));
          
          const optimal = isOptimalSolve(currentRound + 1);
          return {
            guesses: currentRound + 1,
            optimal,
            reason: optimal ? `Solved in ${currentRound + 1} guesses` : `Too many guesses (${currentRound + 1})`,
            secretCode: secret,
            guessHistory: [...gameGuesses],
            feedbackHistory: [...gameFeedback]
          };
        }
        
        currentRound++;
      } catch (error) {
        return {
          guesses: 5,
          optimal: false,
          reason: `Algorithm error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          secretCode: secret,
          guessHistory: [...gameGuesses],
          feedbackHistory: [...gameFeedback]
        };
      }
    }
    
    // Algorithm failed to solve in 5 guesses
    
    return {
      guesses: 5,
      optimal: false,
      reason: 'Failed to solve in 5 guesses',
      secretCode: secret,
      guessHistory: [...gameGuesses],
      feedbackHistory: [...gameFeedback]
    };
  };

  // Start challenge mode
  const startChallenge = async () => {
    challengeCancelRef.current = false;
    setChallengeState(prev => ({
      ...prev,
      isRunning: true,
      consecutiveOptimalSolves: 0,
      currentGame: 1,
      testResults: []
    }));

    let consecutiveWins = 0;
    const results: typeof challengeState.testResults = [];

    try {
      for (let game = 1; game <= 100; game++) { // Max 100 games, but will exit early on success or failure
        // Check for cancellation
        if (challengeCancelRef.current) {
          break;
        }
        // Generate secret code
        const secret = generateSecretCode();
        
        // Update current game
        setChallengeState(prev => ({ ...prev, currentGame: game }));
        
        // Play the game
        const result = await playAutomaticGame(secret);
        
        if (result.optimal) {
          consecutiveWins++;
        } else {
          consecutiveWins = 0; // Reset on any failure
        }
        
        results.push({
          game,
          guesses: result.guesses,
          optimal: result.optimal,
          reason: result.reason,
          secretCode: result.secretCode,
          guessHistory: result.guessHistory,
          feedbackHistory: result.feedbackHistory
        });
        
        // Update state
        setChallengeState(prev => ({
          ...prev,
          consecutiveOptimalSolves: consecutiveWins,
          testResults: results
        }));
        
        // Check if we completed 10 consecutive optimal solves
        if (consecutiveWins >= 10) {
          break; // Challenge completed successfully!
        }
        
        // Stop immediately if algorithm failed to solve optimally
        if (!result.optimal) {
          break; // Challenge failed - no need to continue
        }
        
        // Add a small delay between games
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Challenge failed:', error);
    } finally {
      setChallengeState(prev => ({ ...prev, isRunning: false }));
    }
  };

  // Stop challenge
  const stopChallenge = () => {
    challengeCancelRef.current = true;
    setChallengeState(prev => ({
      ...prev,
      isRunning: false,
      consecutiveOptimalSolves: 0,
      currentGame: 1,
      testResults: []
    }));
  };

  // Practice mode functions
  const startPracticeGame = () => {
    setGameState({
      secretCode: generateSecretCode(),
      guesses: [],
      feedback: [],
      gameStatus: 'playing',
      winner: null,
      currentGuess: 1,
      maxGuesses: 5
    });
    setCurrentManualGuess(new Array(positions).fill(-1));
    setSelectedPosition(0);
  };

  const makePracticeGuess = (guess: number[]) => {
    if (gameState.gameStatus !== 'playing') return;
    
    const [blackPegs, whitePegs] = calculateFeedback(guess, gameState.secretCode);
    const newGuesses = [...gameState.guesses, guess];
    const newFeedback = [...gameState.feedback, [blackPegs, whitePegs]];
    
    if (blackPegs === positions) {
      setGameState(prev => ({
        ...prev,
        guesses: newGuesses,
        feedback: newFeedback,
        gameStatus: 'finished',
        winner: 'algorithm'
      }));
    } else if (newGuesses.length >= 5) {
      setGameState(prev => ({
        ...prev,
        guesses: newGuesses,
        feedback: newFeedback,
        gameStatus: 'finished',
        winner: 'failed'
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        guesses: newGuesses,
        feedback: newFeedback,
        currentGuess: prev.currentGuess + 1
      }));
    }
  };

  const makeManualGuess = (guess: number[]) => {
    if (gameState.gameStatus !== 'playing' || gameMode !== 'practice') return;
    
    // Calculate feedback
    const [blackPegs, whitePegs] = calculateFeedback(guess, gameState.secretCode);
    
    const newGuesses = [...gameState.guesses, guess];
    const newFeedback = [...gameState.feedback, [blackPegs, whitePegs]];
    
    if (blackPegs === positions) {
      // Won the game
      setGameState(prev => ({
        ...prev,
        guesses: newGuesses,
        feedback: newFeedback,
        gameStatus: 'finished',
        winner: 'human'
      }));
    } else if (newGuesses.length >= 5) {
      // Lost the game
      setGameState(prev => ({
        ...prev,
        guesses: newGuesses,
        feedback: newFeedback,
        gameStatus: 'finished',
        winner: 'failed'
      }));
    } else {
      // Continue game
      setGameState(prev => ({
        ...prev,
        guesses: newGuesses,
        feedback: newFeedback,
        currentGuess: prev.currentGuess + 1
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Part II Challenge: Mastermind
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Crack the code efficiently! Write an algorithm that uses strategic guessing to 
            eliminate possibilities and find the secret pattern in 5 attempts or fewer.
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
                    <span className="font-medium">Colors available:</span>
                    <span className="text-lg font-bold text-blue-600 ml-2">{colors}</span>
                  </div>
                  <div>
                    <span className="font-medium">Positions:</span>
                    <span className="ml-2 font-mono font-bold text-purple-600">{positions}</span>
                  </div>
                  <div>
                    <span className="font-medium">Current guess:</span>
                    <span className="ml-2 font-bold text-green-600">{gameState.currentGuess}/{gameState.maxGuesses}</span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className="ml-2 capitalize">{gameState.gameStatus}</span>
                  </div>
                </div>
                
                {gameState.gameStatus === 'setup' && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                    🎮 <strong>Ready to Code!</strong> Write an algorithm to crack a {positions}-position code using {colors} colors. 
                    Your goal is to solve consistently in ≤5 guesses!
                  </div>
                )}
              </div>
            </div>

            {/* Color Legend */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Available Colors:</h3>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: colors }, (_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full ${COLOR_CLASSES[i]} border-2 border-gray-300`}></div>
                    <span className="text-xs mt-1">{i}</span>
                    <span className="text-xs text-gray-600">{COLOR_NAMES[i]}</span>
                  </div>
                ))}
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
                  ) : gameState.gameStatus === 'playing' ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-700 mb-3">Build Your Guess:</h3>
                        
                        {/* Current guess display */}
                        <div className="flex gap-2 mb-4">
                          {currentManualGuess.map((colorIndex, position) => (
                            <button
                              key={position}
                              onClick={() => setSelectedPosition(position)}
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                selectedPosition === position 
                                  ? 'border-black border-4' 
                                  : 'border-gray-300'
                              } ${
                                colorIndex >= 0 ? COLOR_CLASSES[colorIndex] : 'bg-gray-100'
                              }`}
                            >
                              {colorIndex >= 0 ? '' : '?'}
                            </button>
                          ))}
                        </div>

                        {/* Position selector */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Click on a position above, then click a color below to set it:</p>
                        </div>

                        {/* Color palette */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Available colors (click to set position {selectedPosition + 1}):</p>
                          <div className="flex gap-2">
                            {COLOR_CLASSES.slice(0, colors).map((colorClass, colorIndex) => (
                              <button
                                key={colorIndex}
                                onClick={() => {
                                  const newGuess = [...currentManualGuess];
                                  newGuess[selectedPosition] = colorIndex;
                                  setCurrentManualGuess(newGuess);
                                  // Auto-advance to next position if not at the end
                                  if (selectedPosition < positions - 1) {
                                    setSelectedPosition(selectedPosition + 1);
                                  }
                                }}
                                className={`w-8 h-8 rounded-full ${colorClass} border-2 border-gray-300 hover:border-gray-500 flex items-center justify-center text-xs font-bold transition-all`}
                              >
                              </button>
                            ))}
                          </div>
                        </div>


                        {/* Submit button */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setCurrentManualGuess(new Array(positions).fill(-1));
                              setSelectedPosition(0);
                            }}
                            disabled={!currentManualGuess.some(color => color >= 0)}
                            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                          >
                            Reset Selection
                          </button>
                          <button
                            onClick={() => {
                              if (currentManualGuess.every(color => color >= 0)) {
                                makeManualGuess([...currentManualGuess]);
                                setCurrentManualGuess(new Array(positions).fill(-1));
                                setSelectedPosition(0);
                              } else {
                                alert('Please select a color for all positions');
                              }
                            }}
                            disabled={!currentManualGuess.every(color => color >= 0)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            Submit Guess
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={startPracticeGame}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      🎲 New Practice Game
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Winner Announcement */}
            {gameState.winner && (
              <div className={`mt-4 p-4 rounded-lg text-center ${
                (gameState.winner === 'algorithm' || gameState.winner === 'human')
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <h3 className="font-bold text-lg">
                  {gameState.winner === 'algorithm' && '🎉 Algorithm Won!'}
                  {gameState.winner === 'human' && '🎉 You Won!'}
                  {gameState.winner === 'failed' && '💀 Failed!'}
                </h3>
                <p className="text-sm mt-1">
                  {(gameState.winner === 'algorithm' || gameState.winner === 'human')
                    ? `Cracked the code in ${gameState.guesses.length} guesses!` 
                    : 'Failed to crack the code in 5 guesses.'}
                </p>
                {gameState.secretCode.length > 0 && (
                  <div className="mt-2 flex justify-center gap-1">
                    <span className="text-sm">Secret code: </span>
                    {gameState.secretCode.map((color, idx) => (
                      <div key={idx} className={`w-6 h-6 rounded-full ${COLOR_CLASSES[color]} border-2 border-gray-300`}></div>
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* Game Info */}
            {gameMode === 'practice' && (gameState.gameStatus === 'playing' || gameState.gameStatus === 'setup') && (
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-sm text-blue-800">
                  <strong>Total possible codes:</strong> {Math.pow(colors, positions)} | 
                  <strong> Current possibilities:</strong> {gameState.guesses.length > 0 
                    ? calculateRemainingPossibilities(gameState.guesses, gameState.feedback)
                    : Math.pow(colors, positions)
                  }
                </p>
              </div>
            )}

            {/* Preview of remaining possibilities */}
            {gameMode === 'practice' && currentManualGuess.every(color => color >= 0) && gameState.gameStatus === 'playing' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Preview - Possible Outcomes:</h4>
                <div className="text-sm text-green-800">
                  {(() => {
                    // Get all current valid possibilities
                    const allPossibilities: number[][] = [];
                    const generatePossibilities = (current: number[], position: number) => {
                      if (position === positions) {
                        allPossibilities.push([...current]);
                        return;
                      }
                      for (let color = 0; color < colors; color++) {
                        current[position] = color;
                        generatePossibilities(current, position + 1);
                      }
                    };
                    generatePossibilities([], 0);
                    
                    const validPossibilities = allPossibilities.filter(possibility => {
                      return gameState.guesses.every((guess, index) => {
                        const [expectedBlack, expectedWhite] = gameState.feedback[index];
                        const [actualBlack, actualWhite] = calculateFeedback(guess, possibility);
                        return expectedBlack === actualBlack && expectedWhite === actualWhite;
                      });
                    });
                    
                    // Calculate how many would remain for each possible feedback
                    const feedbackCounts = new Map<string, number>();
                    validPossibilities.forEach(possibility => {
                      const [black, white] = calculateFeedback(currentManualGuess, possibility);
                      const key = `${black},${white}`;
                      feedbackCounts.set(key, (feedbackCounts.get(key) || 0) + 1);
                    });
                    
                    // Group remaining possibilities by feedback
                    const results: Array<{feedback: string, count: number, remaining: number}> = [];
                    feedbackCounts.forEach((count, feedback) => {
                      const newGuesses = [...gameState.guesses, currentManualGuess];
                      const [black, white] = feedback.split(',').map(Number);
                      const newFeedback = [...gameState.feedback, [black, white]];
                      const remaining = calculateRemainingPossibilities(newGuesses, newFeedback);
                      results.push({feedback, count, remaining});
                    });
                    
                    // Sort by most likely outcomes first
                    results.sort((a, b) => b.count - a.count);
                    
                    return (
                      <div className="space-y-1">
                        {results.map(({feedback, count, remaining}) => {
                          const [black, white] = feedback.split(',').map(Number);
                          return (
                            <div key={feedback} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {/* Black pegs */}
                                  {Array.from({ length: black }, (_, i) => (
                                    <div key={`black-${i}`} className="w-2 h-2 bg-black rounded-full" />
                                  ))}
                                  {/* White pegs */}
                                  {Array.from({ length: white }, (_, i) => (
                                    <div key={`white-${i}`} className="w-2 h-2 bg-white border border-gray-400 rounded-full" />
                                  ))}
                                  <span className="ml-1">({black}B, {white}W)</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">{count} cases →</span>
                                <span className="font-bold">{remaining} possibilities</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Guess History */}
            {gameState.guesses.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-700 mb-3">Guess History:</h3>
                <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                  {gameState.guesses.map((guess, index) => {
                    // Calculate remaining possibilities up to this guess (only for practice mode)
                    const remaining = gameMode === 'practice' 
                      ? calculateRemainingPossibilities(
                          gameState.guesses.slice(0, index + 1),
                          gameState.feedback.slice(0, index + 1)
                        )
                      : null;
                    
                    return (
                      <div key={index} className="flex items-center gap-4 p-2 text-sm">
                        <span className="font-medium w-8">#{index + 1}</span>
                        <div className="flex gap-1">
                          {guess.map((color, idx) => (
                            <div key={idx} className={`w-6 h-6 rounded-full ${COLOR_CLASSES[color]} border-2 border-gray-300`}></div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-black rounded-full"></div>
                            <span>{gameState.feedback[index]?.[0] || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-white border border-gray-400 rounded-full"></div>
                            <span>{gameState.feedback[index]?.[1] || 0}</span>
                          </div>
                          {gameMode === 'practice' && remaining !== null && (
                            <div className="ml-2 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded text-xs">
                              <span className="text-yellow-800">
                                {remaining} possibilities left
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-black rounded-full border border-gray-300"></div>
                        <span><strong>Black peg:</strong> Right color in the right spot</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white border-2 border-gray-500 rounded-full"></div>
                        <span><strong>White peg:</strong> Right color but wrong spot</span>
                      </li>
                      <li>• Crack the code in 5 guesses or fewer</li>
                      <li>• Each position can be one of {colors} colors (0-{colors-1})</li>
                      <li>• Use feedback to eliminate possibilities strategically</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-900 mb-2">Strategy Tips:</h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Start with a diverse guess to gather maximum information</li>
                      <li>• Use feedback to eliminate impossible combinations</li>
                      <li>• Watch the "possibilities left" counter - good guesses eliminate many options</li>
                      <li>• Try patterns that help distinguish between remaining possibilities</li>
                      <li>• Think systematically to solve in ≤5 guesses consistently</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-900 mb-2">Practice Goal:</h3>
                    <p className="text-sm text-green-800">
                      Play manually to understand the game mechanics! Try to crack the code in ≤5 guesses.
                      Once you understand the strategy, switch to Challenge Mode to write an algorithm.
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
                        {challengeState.consecutiveOptimalSolves} / 10
                      </span>
                      <div className="w-24 bg-purple-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(challengeState.consecutiveOptimalSolves / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    {challengeState.isRunning && (
                      <p className="text-xs text-purple-700 mt-1">
                        Running game {challengeState.currentGame}...
                      </p>
                    )}
                  </div>
                </div>

                {/* Strategy Tips Above Code */}
                <div className="mb-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-semibold mb-1">💻 Coding Requirements:</div>
                        <ul className="ml-4 space-y-0.5 list-disc text-xs">
                          <li>Function name must be <code>next_guess()</code></li>
                          <li>Return format: <code>[color1, color2, color3, color4]</code> where each color is 0-5</li>
                          <li>All global variables are automatically available in your function</li>
                        </ul>
                      </div>

                      <div>
                        <div className="font-semibold mb-1">🔧 Available Data:</div>
                        <ul className="ml-4 space-y-0.5 list-disc text-xs">
                          <li><code>guesses</code>: List of your previous guesses <code>[[1,2,3,4], [0,1,2,3], ...]</code></li>
                          <li><code>feedback</code>: List of feedback <code>[[1,2], [0,3], ...]</code> (black, white pegs)</li>
                          <li><code>current_round</code>: Current guess number (0, 1, 2, 3, or 4)</li>
                          <li><code>remaining_codes</code>: List of all possible secret codes (auto-updated)</li>
                          <li><code>COLORS</code>: Constant, equals 6. <code>POSITIONS</code>: Constant, equals 4</li>
                        </ul>
                      </div>
                    </div>
                    
                    {/* Helper Functions - Full Width */}
                    <div className="mt-3">
                      <div className="font-semibold mb-1 text-blue-900">🛠️ Helper Functions & Optimizations:</div>
                      <div className="space-y-3 text-xs">
                        <div className="bg-gray-50 p-3 rounded border-l-4 border-purple-400">
                          <div className="font-mono font-bold text-purple-800 mb-1">remaining_codes</div>
                          <div className="mb-1"><strong>Purpose:</strong> Performance optimization - tracks all possible secret codes</div>
                          <div className="mb-1"><strong>Updates:</strong> Automatically filtered after each guess (starts at 1,296, shrinks over time)</div>
                          <div className="mb-1"><strong>Usage:</strong> <code>len(remaining_codes)</code> shows progress, loop over it instead of all codes</div>
                          <div><strong>Example:</strong> <code>if len(remaining_codes) == 1: return remaining_codes[0]</code></div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                          <div className="font-mono font-bold text-blue-800 mb-1">calculate_feedback(guess, secret)</div>
                          <div className="mb-1"><strong>Purpose:</strong> Calculate black/white pegs between any guess and secret code</div>
                          <div className="mb-1"><strong>Input:</strong> Two lists of 4 integers [0-5], e.g. <code>[1,2,3,4]</code>, <code>[0,1,2,3]</code></div>
                          <div className="mb-1"><strong>Returns:</strong> <code>[black_pegs, white_pegs]</code> e.g. <code>[2, 1]</code> means 2 exact matches, 1 color match</div>
                          <div><strong>Example:</strong> <code>calculate_feedback([1,2,3,4], [1,0,3,5]) → [2, 0]</code></div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded border-l-4 border-green-400">
                          <div className="font-mono font-bold text-green-800 mb-1">evaluate_guess(potential_guess, guess_history=None, feedback_history=None)</div>
                          <div className="mb-1"><strong>Purpose:</strong> Analyze how many possibilities remain for each possible feedback</div>
                          <div className="mb-1"><strong>Input:</strong> Guess as list [0-5], optional custom history (defaults to current game)</div>
                          <div className="mb-1"><strong>Returns:</strong> List of lists: <code>[[feedback, possibilities], [feedback, possibilities], ...]</code></div>
                          <div className="mb-1"><strong>Basic:</strong> <code>evaluate_guess([0,1,2,3])</code> uses current game history</div>
                          <div className="mb-1"><strong>Example:</strong> <code>[[[1,0], [[1,2,3,4], [0,1,3,5]]], [[0,2], [[2,3,1,4]]]]</code></div>
                          <div><strong>Custom:</strong> <code>evaluate_guess([0,1,2,3], [[1,2,3,4]], [[1,0]])</code> uses custom history</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Algorithm Code Editor - Full Width */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-700">Your Algorithm:</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsCodeModalOpen(true)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        🔍 Expand Editor
                      </button>
                      <button
                        onClick={() => {
                          setChallengeState(prev => ({ ...prev, algorithmCode: getTemplateCode() }));
                        }}
                        className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        🔄 Reset to Template
                      </button>
                    </div>
                  </div>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <Editor
                      height="400px"
                      defaultLanguage="python"
                      value={challengeState.algorithmCode}
                      onChange={(value) => setChallengeState(prev => ({ ...prev, algorithmCode: value || '' }))}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        insertSpaces: true
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-medium text-orange-900 mb-2">🏆 Challenge Goal:</h3>
                    <p className="text-sm text-orange-800 mb-2">
                      Solve 10 consecutive games optimally (≤5 guesses each) to complete this challenge!
                    </p>
                  </div>

                  {/* Challenge Controls */}
                  <div className="flex gap-3">
                    {!challengeState.isRunning ? (
                      <button
                        onClick={startChallenge}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Start Challenge
                      </button>
                    ) : (
                      <button
                        onClick={stopChallenge}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Stop Challenge
                      </button>
                    )}
                    <button
                      onClick={stopChallenge}
                      disabled={challengeState.isRunning}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Test Results */}
                  {challengeState.testResults.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Complete Game History:</h3>
                      <div className="bg-gray-50 rounded-lg p-3 max-h-96 overflow-y-auto">
                        {challengeState.testResults.map((result, index) => (
                          <div key={index} className={`mb-4 p-3 rounded ${result.optimal ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            {/* Game Header */}
                            <div className={`font-medium text-sm mb-2 ${result.optimal ? 'text-green-700' : 'text-red-700'}`}>
                              Game {result.game}: {result.optimal ? '✅ Optimal' : '❌ Failed'} - {result.guesses} guesses
                              {result.reason && ` (${result.reason})`}
                            </div>
                            
                            {/* Secret Code */}
                            {result.secretCode && (
                              <div className="text-xs text-gray-600 mb-2">
                                Secret Code: 
                                <div className="inline-flex gap-1 ml-2">
                                  {result.secretCode.map((colorIndex, pos) => (
                                    <div
                                      key={pos}
                                      className={`w-4 h-4 rounded-full ${COLOR_CLASSES[colorIndex]} border border-gray-400`}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Guess History */}
                            {result.guessHistory && result.feedbackHistory && (
                              <div className="space-y-1">
                                {result.guessHistory.map((guess, guessIndex) => (
                                  <div key={guessIndex} className="flex items-center gap-2 text-xs">
                                    <span className="text-gray-500 w-8">#{guessIndex + 1}:</span>
                                    
                                    {/* Guess colors */}
                                    <div className="flex gap-1">
                                      {guess && guess.map((colorIndex, pos) => (
                                        <div
                                          key={pos}
                                          className={`w-4 h-4 rounded-full ${COLOR_CLASSES[colorIndex]} border border-gray-400`}
                                        />
                                      ))}
                                    </div>
                                    
                                    {/* Feedback */}
                                    {result.feedbackHistory[guessIndex] && (
                                      <>
                                        <span className="text-gray-600">→</span>
                                        <div className="flex gap-1">
                                          {/* Black pegs (exact matches) */}
                                          {Array.from({ length: result.feedbackHistory[guessIndex][0] || 0 }, (_, i) => (
                                            <div key={`black-${i}`} className="w-2 h-2 bg-black rounded-full" />
                                          ))}
                                          {/* White pegs (color matches) */}
                                          {Array.from({ length: result.feedbackHistory[guessIndex][1] || 0 }, (_, i) => (
                                            <div key={`white-${i}`} className="w-2 h-2 bg-white border border-gray-400 rounded-full" />
                                          ))}
                                        </div>
                                        
                                        <span className="text-gray-500 text-xs">
                                          ({result.feedbackHistory[guessIndex][0] || 0}B, {result.feedbackHistory[guessIndex][1] || 0}W)
                                        </span>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {challengeState.consecutiveOptimalSolves >= 10 && (
                    <div className="p-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg text-center">
                      <h3 className="text-2xl font-bold mb-2">🎉 Congratulations!</h3>
                      <p className="text-lg">
                        You've successfully completed the Part II Challenge! 
                        You solved 10 consecutive games optimally!
                      </p>
                      <p className="text-sm mt-2 opacity-90">
                        You've mastered strategic thinking and optimization!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Educational Content */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🧠 Binary Search Optimization in Mastermind</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Information Theory Connection:</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Each guess provides information to eliminate possibilities</li>
                <li>Optimal strategy maximizes information gain per guess</li>
                <li>Goal: eliminate as much of the search space as possible</li>
                <li>Think worst-case: avoid guesses that could leave too many options</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Implementation Strategy:</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Track all remaining possible codes after each guess</li>
                <li>For each potential next guess, calculate all possible feedback</li>
                <li>Choose guess that minimizes maximum remaining possibilities</li>
                <li>This is the "minimax" strategy from game theory</li>
              </ul>
            </div>
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