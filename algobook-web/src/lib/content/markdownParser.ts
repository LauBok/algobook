import { Quiz, Exercise, QuizQuestion, QuizOption, TestCase, PlotBlock, PlotData, PlotOptions, TableBlock, AlgorithmWidget } from '@/lib/types/content';
import * as yaml from 'js-yaml';

interface RawQuizData {
  id: string;
  question?: string;
  questions?: Array<{
    id: string;
    question: string;
    options: Array<{
      id: string;
      text: string;
      correct?: boolean;
      explanation?: string;
    }>;
    explanation?: string;
  }>;
  options?: Array<{
    id: string;
    text: string;
    correct?: boolean;
    explanation?: string;
  }>;
  explanation?: string;
}

interface RawExerciseData {
  id: string;
  title: string;
  description: string;
  difficulty?: string;
  starterCode: string;
  testCases?: Array<{
    input?: string;
    expectedOutput: string;
    hidden?: boolean;
  }>;
  hints?: string[];
  solution?: string;
  echoInput?: boolean;
  prepend?: string;
  postpend?: string;
}

interface CalloutBlock {
  id: string;
  type: 'note' | 'hint' | 'warning' | 'danger';
  title?: string;
  content: string;
}

interface RawPlotData {
  type: string;
  title?: string;
  data: any[];
  options?: any;
}

interface RawTableData {
  title?: string;
  headers: string[];
  rows: string[][];
  caption?: string;
  sortable?: boolean;
  searchable?: boolean;
}

interface RawAlgorithmWidgetData {
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

export interface ParsedMarkdownContent {
  content: string; // Cleaned markdown without quiz/exercise blocks
  title?: string; // Extracted from first # heading
  quizzes: Quiz[];
  exercises: Exercise[];
  callouts: CalloutBlock[];
  plots: PlotBlock[];
  tables: TableBlock[];
  algorithmWidgets: AlgorithmWidget[];
}

/**
 * Extract callout blocks while properly handling nested code blocks
 */
function extractCalloutBlocks(content: string): Array<{
  fullMatch: string;
  type: string;
  title?: string;
  content: string;
}> {
  const blocks: Array<{
    fullMatch: string;
    type: string;
    title?: string;
    content: string;
  }> = [];

  const calloutTypes = ['note', 'hint', 'warning', 'danger'];
  let searchPos = 0;
  
  while (searchPos < content.length) {
    let earliestMatch = null;
    let earliestType = null;
    let earliestIndex = content.length;
    
    // Find the earliest callout block of any type
    for (const type of calloutTypes) {
      const regex = new RegExp(`\`\`\`${type}(?:\\s+title="([^"]*)")?\\n`);
      const match = content.substring(searchPos).match(regex);
      if (match && match.index !== undefined) {
        const actualIndex = searchPos + match.index;
        if (actualIndex < earliestIndex) {
          earliestIndex = actualIndex;
          earliestMatch = match;
          earliestType = type;
        }
      }
    }
    
    if (!earliestMatch || !earliestType) break;
    
    const title = earliestMatch[1]; // Optional title from title="..."
    const contentStart = earliestIndex + earliestMatch[0].length;
    
    // Find the matching closing ``` by properly counting nested blocks
    let pos = contentStart;
    let nestedDepth = 0;
    let foundClosing = false;
    let contentEnd = contentStart;
    
    while (pos < content.length) {
      const nextTripleBacktick = content.indexOf('```', pos);
      if (nextTripleBacktick === -1) break;
      
      // Get the rest of the line after ```
      const lineEnd = content.indexOf('\n', nextTripleBacktick);
      const restOfLine = content.substring(nextTripleBacktick + 3, lineEnd === -1 ? content.length : lineEnd).trim();
      
      if (restOfLine.length > 0) {
        // This is starting a nested code block (e.g., ```python)
        nestedDepth++;
      } else {
        // This is a closing ``` marker
        if (nestedDepth > 0) {
          nestedDepth--;
        } else {
          // This is our callout block closing
          contentEnd = nextTripleBacktick;
          foundClosing = true;
          break;
        }
      }
      
      pos = nextTripleBacktick + 3;
    }
    
    if (foundClosing) {
      const blockContent = content.substring(contentStart, contentEnd);
      const fullMatch = content.substring(earliestIndex, contentEnd + 3);
      
      blocks.push({
        fullMatch,
        type: earliestType,
        title,
        content: blockContent
      });
      
      searchPos = contentEnd + 3;
    } else {
      // No closing found, skip this block
      searchPos = earliestIndex + earliestMatch[0].length;
    }
  }
  
  return blocks;
}

/**
 * Extract title from markdown content (first # heading) and remove it from content
 */
function extractTitleAndClean(content: string): { title?: string; cleanContent: string } {
  const lines = content.split('\n');
  let title: string | undefined;
  let titleLineIndex = -1;
  
  // Find the first # heading
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('# ') && trimmed.length > 2) {
      title = trimmed.substring(2).trim();
      titleLineIndex = i;
      break;
    }
  }
  
  // Remove the title line from content
  let cleanContent = content;
  if (titleLineIndex >= 0) {
    const contentLines = lines.slice();
    contentLines.splice(titleLineIndex, 1);
    
    // Also remove any immediately following empty lines to avoid extra spacing
    while (titleLineIndex < contentLines.length && contentLines[titleLineIndex].trim() === '') {
      contentLines.splice(titleLineIndex, 1);
    }
    
    cleanContent = contentLines.join('\n');
  }
  
  return { title, cleanContent };
}

/**
 * Parse markdown content to extract quiz and exercise blocks
 * and return clean content along with the interactive elements
 */
export function parseMarkdownContent(content: string): ParsedMarkdownContent {
  const quizzes: Quiz[] = [];
  const exercises: Exercise[] = [];
  const callouts: CalloutBlock[] = [];
  const plots: PlotBlock[] = [];
  const tables: TableBlock[] = [];
  const algorithmWidgets: AlgorithmWidget[] = [];
  
  // Extract title from first # heading and remove it from content
  const { title, cleanContent: contentWithoutTitle } = extractTitleAndClean(content);
  let cleanContent = contentWithoutTitle;

  // Extract quiz blocks and replace with placeholders
  const quizRegex = /```quiz\n([\s\S]*?)\n```/g;
  let quizMatch;
  while ((quizMatch = quizRegex.exec(content)) !== null) {
    try {
      const quizData = yaml.load(quizMatch[1]) as RawQuizData;
      const quiz = parseQuizData(quizData);
      if (quiz) {
        quizzes.push(quiz);
        // Replace with placeholder that includes quiz ID for inline rendering
        const placeholder = `<QUIZ_PLACEHOLDER_${quiz.id}/>`;
        cleanContent = cleanContent.replace(quizMatch[0], placeholder);
      }
    } catch (error) {
      console.error('Error parsing quiz block:', error);
      // Remove the quiz block if parsing fails
      cleanContent = cleanContent.replace(quizMatch[0], '');
    }
  }

  // Extract exercise blocks and replace with placeholders
  const exerciseRegex = /```exercise\n([\s\S]*?)\n```/g;
  let exerciseMatch;
  while ((exerciseMatch = exerciseRegex.exec(content)) !== null) {
    try {
      const exerciseData = yaml.load(exerciseMatch[1]) as RawExerciseData;
      const exercise = parseExerciseData(exerciseData);
      if (exercise) {
        exercises.push(exercise);
        // Replace with placeholder that includes exercise ID for inline rendering
        const placeholder = `<EXERCISE_PLACEHOLDER_${exercise.id}/>`;
        cleanContent = cleanContent.replace(exerciseMatch[0], placeholder);
      }
    } catch (error) {
      console.error('Error parsing exercise block:', error);
      // Remove the exercise block if parsing fails
      cleanContent = cleanContent.replace(exerciseMatch[0], '');
    }
  }

  // Extract callout blocks and replace with placeholders
  // Use a more sophisticated approach to handle nested code blocks
  const calloutBlocks = extractCalloutBlocks(content);
  for (const block of calloutBlocks) {
    const id = `callout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const callout: CalloutBlock = {
      id,
      type: block.type as 'note' | 'hint' | 'warning' | 'danger',
      title: block.title || undefined,
      content: block.content.trim()
    };
    
    callouts.push(callout);
    // Replace with placeholder for inline rendering
    const placeholder = `<CALLOUT_PLACEHOLDER_${id}/>`;
    cleanContent = cleanContent.replace(block.fullMatch, placeholder);
  }

  // Extract plot blocks and replace with placeholders
  const plotRegex = /```plot\n([\s\S]*?)\n```/g;
  let plotMatch;
  while ((plotMatch = plotRegex.exec(content)) !== null) {
    try {
      const plotData = yaml.load(plotMatch[1]) as RawPlotData;
      const plot = parsePlotData(plotData);
      if (plot) {
        plots.push(plot);
        // Replace with placeholder for inline rendering
        const placeholder = `<PLOT_PLACEHOLDER_${plot.id}/>`;
        cleanContent = cleanContent.replace(plotMatch[0], placeholder);
      }
    } catch (error) {
      console.error('Error parsing plot block:', error);
      // Remove the plot block if parsing fails
      cleanContent = cleanContent.replace(plotMatch[0], '');
    }
  }

  // Extract table blocks and replace with placeholders
  const tableRegex = /```table\n([\s\S]*?)\n```/g;
  let tableMatch;
  while ((tableMatch = tableRegex.exec(content)) !== null) {
    try {
      const tableData = yaml.load(tableMatch[1]) as RawTableData;
      const table = parseTableData(tableData);
      if (table) {
        tables.push(table);
        // Replace with placeholder for inline rendering
        const placeholder = `<TABLE_PLACEHOLDER_${table.id}/>`;
        cleanContent = cleanContent.replace(tableMatch[0], placeholder);
      }
    } catch (error) {
      console.error('Error parsing table block:', error);
      // Remove the table block if parsing fails
      cleanContent = cleanContent.replace(tableMatch[0], '');
    }
  }

  // Extract algorithm widget blocks and replace with placeholders
  const algorithmWidgetRegex = /```algorithm-widget\n([\s\S]*?)\n```/g;
  let algorithmWidgetMatch;
  while ((algorithmWidgetMatch = algorithmWidgetRegex.exec(content)) !== null) {
    try {
      const algorithmWidgetData = yaml.load(algorithmWidgetMatch[1]) as RawAlgorithmWidgetData;
      const algorithmWidget = parseAlgorithmWidgetData(algorithmWidgetData);
      if (algorithmWidget) {
        algorithmWidgets.push(algorithmWidget);
        // Replace with placeholder for inline rendering
        const placeholder = `<ALGORITHM_WIDGET_PLACEHOLDER_${algorithmWidget.id}/>`;
        cleanContent = cleanContent.replace(algorithmWidgetMatch[0], placeholder);
      }
    } catch (error) {
      console.error('Error parsing algorithm widget block:', error);
      // Remove the algorithm widget block if parsing fails
      cleanContent = cleanContent.replace(algorithmWidgetMatch[0], '');
    }
  }

  return {
    content: cleanContent.trim(),
    title,
    quizzes,
    exercises,
    callouts,
    plots,
    tables,
    algorithmWidgets
  };
}

function parseQuizData(data: RawQuizData): Quiz | null {
  if (!data.id) {
    console.error('Quiz must have id');
    return null;
  }
  
  // Check if we have either single question format or multiple questions format
  if (!data.question && !data.questions) {
    console.error('Quiz must have either question or questions');
    return null;
  }

  const questions: QuizQuestion[] = [];
  
  // Handle single question format
  if (data.question && data.options) {
    const question = parseQuizQuestion({
      id: data.id + '-question',
      question: data.question,
      options: data.options,
      explanation: data.explanation
    });
    if (question) {
      questions.push(question);
    }
  }
  
  // Handle multiple questions format
  if (Array.isArray(data.questions)) {
    for (const questionData of data.questions) {
      const question = parseQuizQuestion(questionData);
      if (question) {
        questions.push(question);
      }
    }
  }

  if (questions.length === 0) {
    return null;
  }

  return {
    id: data.id,
    questions
  };
}

function parseQuizQuestion(data: {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    correct?: boolean;
    explanation?: string;
  }>;
  explanation?: string;
}): QuizQuestion | null {
  if (!data.id || !data.question || !data.options) {
    console.error('Quiz question must have id, question, and options');
    return null;
  }

  const options: QuizOption[] = [];
  for (const optionData of data.options) {
    if (!optionData.id || !optionData.text) {
      console.error('Quiz option must have id and text');
      continue;
    }
    
    options.push({
      id: optionData.id,
      text: optionData.text,
      correct: Boolean(optionData.correct),
      explanation: optionData.explanation
    });
  }

  if (options.length === 0) {
    return null;
  }

  return {
    id: data.id,
    question: data.question,
    options,
    explanation: data.explanation || ''
  };
}

function parseExerciseData(data: RawExerciseData): Exercise | null {
  if (!data.id || !data.title || !data.description || !data.starterCode) {
    console.error('Exercise must have id, title, description, and starterCode');
    return null;
  }

  const testCases: TestCase[] = [];
  if (data.testCases && Array.isArray(data.testCases)) {
    for (const testCaseData of data.testCases) {
      if (testCaseData.expectedOutput !== undefined) {
        testCases.push({
          input: testCaseData.input || '',
          expectedOutput: testCaseData.expectedOutput,
          hidden: Boolean(testCaseData.hidden)
        });
      }
    }
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    difficulty: (data.difficulty as 'easy' | 'medium' | 'hard') || 'easy',
    starterCode: data.starterCode,
    testCases,
    hints: data.hints || [],
    solution: data.solution,
    echoInput: data.echoInput || false,
    prepend: data.prepend || '',
    postpend: data.postpend || ''
  };
}

/**
 * Convert Quiz object back to markdown format
 */
export function quizToMarkdown(quiz: Quiz): string {
  if (quiz.questions.length === 1) {
    // Single question format
    const question = quiz.questions[0];
    const optionsYaml = question.options.map(opt => ({
      id: opt.id,
      text: opt.text,
      correct: opt.correct,
      ...(opt.explanation && { explanation: opt.explanation })
    }));

    const quizData = {
      id: quiz.id,
      question: question.question,
      options: optionsYaml,
      ...(question.explanation && { explanation: question.explanation })
    };

    return '```quiz\n' + yaml.dump(quizData, { indent: 2 }) + '```';
  } else {
    // Multiple questions format
    const questionsYaml = quiz.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        correct: opt.correct,
        ...(opt.explanation && { explanation: opt.explanation })
      })),
      ...(q.explanation && { explanation: q.explanation })
    }));

    const quizData = {
      id: quiz.id,
      questions: questionsYaml
    };

    return '```quiz\n' + yaml.dump(quizData, { indent: 2 }) + '```';
  }
}

/**
 * Convert Exercise object back to markdown format
 */
export function exerciseToMarkdown(exercise: Exercise): string {
  const exerciseData: RawExerciseData = {
    id: exercise.id,
    title: exercise.title,
    description: exercise.description,
    difficulty: exercise.difficulty,
    starterCode: exercise.starterCode
  };

  if (exercise.testCases.length > 0) {
    exerciseData.testCases = exercise.testCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      ...(tc.hidden && { hidden: tc.hidden })
    }));
  }

  if (exercise.hints && exercise.hints.length > 0) {
    exerciseData.hints = exercise.hints;
  }

  if (exercise.solution) {
    exerciseData.solution = exercise.solution;
  }

  return '```exercise\n' + yaml.dump(exerciseData, { indent: 2 }) + '```';
}

function parsePlotData(data: RawPlotData): PlotBlock | null {
  if (!data.type) {
    console.error('Plot must have type');
    return null;
  }

  if (!data.data || !Array.isArray(data.data)) {
    console.error('Plot must have data array');
    return null;
  }

  const id = `plot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Validate and process plot data
  const plotData: PlotData[] = [];
  for (const series of data.data) {
    if (!series.x || !series.y || !Array.isArray(series.x) || !Array.isArray(series.y)) {
      console.error('Plot data series must have x and y arrays');
      continue;
    }
    
    plotData.push({
      name: series.name || `Series ${plotData.length + 1}`,
      x: series.x,
      y: series.y,
      type: series.type,
      mode: series.mode,
      marker: series.marker
    });
  }

  if (plotData.length === 0) {
    return null;
  }

  const options: PlotOptions = {
    xLabel: data.options?.xLabel || 'X',
    yLabel: data.options?.yLabel || 'Y',
    interactive: data.options?.interactive !== false, // Default to true
    showLegend: data.options?.showLegend !== false, // Default to true
    width: data.options?.width || undefined, // Use responsive width by default
    height: data.options?.height || 400
  };

  return {
    id,
    type: data.type as PlotBlock['type'],
    title: data.title,
    data: plotData,
    options
  };
}

function parseTableData(data: RawTableData): TableBlock | null {
  if (!data.headers || !Array.isArray(data.headers) || data.headers.length === 0) {
    console.error('Table must have headers array');
    return null;
  }

  if (!data.rows || !Array.isArray(data.rows)) {
    console.error('Table must have rows array');
    return null;
  }

  const id = `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Validate that all rows have the same number of columns as headers
  const validRows = data.rows.filter(row => {
    if (!Array.isArray(row)) {
      console.warn('Table row must be an array');
      return false;
    }
    if (row.length !== data.headers.length) {
      console.warn(`Table row has ${row.length} columns, expected ${data.headers.length}`);
      return false;
    }
    return true;
  });

  if (validRows.length === 0) {
    console.error('Table has no valid rows');
    return null;
  }

  return {
    id,
    title: data.title,
    headers: data.headers,
    rows: validRows.map(row => row.map(cell => String(cell))), // Convert all cells to strings
    caption: data.caption,
    sortable: data.sortable === true, // Default to false
    searchable: data.searchable === true // Default to false
  };
}

function parseAlgorithmWidgetData(data: RawAlgorithmWidgetData): AlgorithmWidget | null {
  if (!data.id || !data.algorithm) {
    console.error('Algorithm widget must have id and algorithm');
    return null;
  }

  return {
    id: data.id,
    algorithm: data.algorithm,
    title: data.title,
    initialData: data.initialData,
    options: data.options || {}
  };
}