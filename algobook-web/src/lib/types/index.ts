// Core types for the AlgoBook application

export interface Chapter {
  id: string;
  title: string;
  part: number;
  partTitle: string;
  order: number;
  description: string;
  sections: Section[];
  prerequisites: string[];
  learningObjectives: string[];
}

export interface Section {
  id: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  content: string; // Markdown content
  interactiveElements: InteractiveElement[];
  quiz?: {
    id: string;
    questions: Array<{
      id: string;
      question: string;
      options: Array<{
        id: string;
        text: string;
        correct: boolean;
        explanation?: string;
      }>;
      explanation: string;
    }>;
  };
  exercises?: Array<{
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    starterCode: string;
    testCases: TestCase[];
    hints?: string[];
  }>;
}

export interface InteractiveElement {
  id: string;
  type: 'code-playground' | 'multiple-choice' | 'coding-exercise' | 'visualization';
  order: number;
  data: CodePlaygroundData | MultipleChoiceData | CodingExerciseData | VisualizationData;
}

export interface CodePlaygroundData {
  initialCode: string;
  language: 'python';
  description: string;
  hints?: string[];
  editable?: boolean;
  showOutput?: boolean;
}

export interface MultipleChoiceData {
  question: string;
  options: {
    id: string;
    text: string;
    correct: boolean;
    explanation?: string;
  }[];
  explanation: string;
}

export interface CodingExerciseData {
  title: string;
  description: string;
  starterCode: string;
  testCases: TestCase[];
  hints?: string[];
  solution?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  echoInput?: boolean; // Whether to echo input values in submission mode (default: false)
  prepend?: string; // Code to prepend before the student's code during execution
  postpend?: string; // Code to append after the student's code during execution
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  hidden?: boolean; // If true, not shown to student
}

export interface VisualizationData {
  type: 'algorithm-animation' | 'data-structure-demo' | 'complexity-chart';
  config: Record<string, any>;
}

// Progress tracking types
export interface UserProgress {
  chaptersCompleted: string[];
  sectionsCompleted: string[];
  exercisesCompleted: Record<string, ExerciseProgress>;
  quizzesCompleted: Record<string, QuizProgress>;
  timeSpent: Record<string, number>; // section id -> minutes
  challengesCompleted: string[];
}

// User authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  createdAt: string;
  lastLoginAt: string;
  isEmailVerified: boolean;
}

export interface UserSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// User settings and profile types
export interface UserSettings {
  userId: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  createdAt: string; // ISO timestamp
  lastActive: string; // ISO timestamp
}

export interface XpReward {
  type: 'exercise' | 'quiz' | 'chapter' | 'challenge' | 'time';
  amount: number;
  multiplier?: number; // Based on difficulty or performance
}

export interface ExerciseProgress {
  completed: boolean;
  attempts: number;
  bestScore: number;
  timeSpent: number;
  lastAttempt: string; // ISO timestamp
}

export interface QuizProgress {
  completed: boolean;
  score: number;
  attempts: number;
  timeSpent?: number; // minutes
  lastAttempt: string; // ISO timestamp
}

// Navigation types
export interface SectionNavigation {
  current: Section;
  previous?: {
    chapterId: string;
    sectionId: string;
    title: string;
  };
  next?: {
    chapterId: string;
    sectionId: string;
    title: string;
  };
  chapter: {
    id: string;
    title: string;
    sections: Array<{
      id: string;
      title: string;
      completed: boolean;
    }>;
  };
}

// Judge0 API types
export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

export interface Judge0Response {
  token: string;
  status: {
    id: number;
    description: string;
  };
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  time?: string;
  memory?: number;
}