// Enhanced content types for section-per-page structure

export interface CalloutBlock {
  id: string;
  type: 'note' | 'hint' | 'warning' | 'danger';
  title?: string;
  content: string;
}

export interface PlotBlock {
  id: string;
  type: 'line' | 'bar' | 'scatter' | 'histogram' | 'pie' | 'heatmap';
  title?: string;
  data: PlotData[];
  options?: PlotOptions;
}

export interface PlotData {
  name?: string;
  x: (number | string)[];
  y: number[];
  type?: string;
  mode?: string;
  marker?: any;
}

export interface PlotOptions {
  xLabel?: string;
  yLabel?: string;
  interactive?: boolean;
  showLegend?: boolean;
  width?: number;
  height?: number;
}

export interface TableBlock {
  id: string;
  title?: string;
  headers: string[];
  rows: string[][];
  caption?: string;
  sortable?: boolean;
  searchable?: boolean;
}

export interface AlgorithmWidget {
  id: string;
  algorithm: string;
  title?: string;
  initialData?: any;
  options?: {
    height?: number;
    showComplexity?: boolean;
    interactive?: boolean;
  };
}

export interface WidgetBlock {
  id: string;
  type: string; // The widget component name
  title?: string;
  description?: string;
  props?: Record<string, any>; // Additional props for the widget
}

export interface Section {
  id: string;
  title: string;
  order: number;
  content: string; // Markdown content
  interactiveElements: InteractiveElement[];
  exercises?: Exercise[];
  quiz?: Quiz; // For backward compatibility - end-of-section quiz
  quizzes?: Quiz[]; // For inline quizzes throughout content
  callouts?: CalloutBlock[]; // For inline callout blocks
  plots?: PlotBlock[]; // For inline plot visualizations
  tables?: TableBlock[]; // For inline data tables
  algorithmWidgets?: AlgorithmWidget[]; // For interactive algorithm visualizations
  widgets?: WidgetBlock[]; // For custom interactive widgets
  estimatedMinutes: number;
}

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

export interface InteractiveElement {
  id: string;
  type: 'code-playground' | 'visualization' | 'concept-check';
  order: number;
  data: CodePlaygroundData | VisualizationData | ConceptCheckData;
}

export interface CodePlaygroundData {
  initialCode: string;
  language: 'python';
  description: string;
  hints?: string[];
  editable?: boolean;
  showOutput?: boolean;
}

export interface VisualizationData {
  type: 'algorithm-animation' | 'data-structure-demo' | 'complexity-chart';
  config: Record<string, any>;
}

export interface ConceptCheckData {
  question: string;
  answer: string;
  explanation: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starterCode: string;
  testCases: TestCase[];
  hints?: string[];
  solution?: string;
  echoInput?: boolean;
  prepend?: string;
  postpend?: string;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string;
}

export interface QuizOption {
  id: string;
  text: string;
  correct: boolean;
  explanation?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  hidden?: boolean;
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