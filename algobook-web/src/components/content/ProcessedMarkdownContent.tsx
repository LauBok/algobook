'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { CodePlayground, CodeBlock, MultipleChoice, CodingExercise, PlotRenderer, TableRenderer, CallStackVisualizer, BinarySearchVisualizer, MergeVisualizer, ComplexityRankingWidget, AlgorithmMysteryGame, BinarySearchStepVisualizer, Matrix2DSearchVisualizer, RotatedArraySearchVisualizer, PeakFindingVisualizer, MastermindChallenge, MergeSortVisualizer, QuickSortVisualizer, LomutoPartitionVisualizer, DecisionTreeVisualizer, FunctionMachine, BooleanLogicCalculator, BinaryConverter, BinaryToDecimalConverter, DecimalToBinaryConverter, BinaryAdditionGame, SignedBinaryAdditionGame, BitManipulationWidget, ASCIIEncoder, FloatingPointWidget, SpaceEfficientMultiplicationWidget, ChecklistWidget } from '@/components/interactive';
import BubbleSortWidget from '@/components/interactive/BubbleSortWidget';
import InsertionSortWidget from '@/components/interactive/InsertionSortWidget';
import { Quiz, Exercise, CalloutBlock, PlotBlock, TableBlock, AlgorithmWidget, WidgetBlock } from '@/lib/types/content';
import 'katex/dist/katex.min.css';

interface ProcessedMarkdownContentProps {
  content: string;
  quizzes?: Quiz[];
  exercises?: Exercise[];
  callouts?: CalloutBlock[];
  plots?: PlotBlock[];
  tables?: TableBlock[];
  algorithmWidgets?: AlgorithmWidget[];
  widgets?: WidgetBlock[];
}

interface CodeBlockInfo {
  code: string;
  id: string;
}

interface CallStackVisualizerInfo {
  id: string;
  title?: string;
  description?: string;
  functionName?: string;
  maxValue?: number;
  showCountdown?: boolean;
  showFactorial?: boolean;
  showFibonacci?: boolean;
}

interface BinarySearchVisualizerInfo {
  id: string;
  title?: string;
  description?: string;
  initialArray?: number[];
}

interface MergeVisualizerInfo {
  id: string;
  title?: string;
  description?: string;
  initialLeft?: number[];
  initialRight?: number[];
}


export default function ProcessedMarkdownContent({ content, quizzes = [], exercises = [], callouts = [], plots = [], tables = [], algorithmWidgets = [], widgets = [] }: ProcessedMarkdownContentProps) {
  const codeBlocks: CodeBlockInfo[] = [];
  const callStackVisualizers: CallStackVisualizerInfo[] = [];
  const binarySearchVisualizers: BinarySearchVisualizerInfo[] = [];
  const mergeVisualizers: MergeVisualizerInfo[] = [];
  const calloutBlocks: CalloutBlock[] = callouts;
  const plotBlocks: PlotBlock[] = plots;
  const tableBlocks: TableBlock[] = tables;
  const algorithmWidgetBlocks: AlgorithmWidget[] = algorithmWidgets;
  const widgetBlocks: WidgetBlock[] = widgets;

  // Track heading numbers
  let h2Counter = 0;
  let h3Counter = 0;
  let h4Counter = 0;
  
  // First pass: extract executable code blocks and callstack visualizers, replace with placeholders
  const processedContent = content
    .replace(
      /```python-execute\n([\s\S]*?)\n```/g,
      (match, code) => {
        const id = `executable-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        codeBlocks.push({ code: code.trim(), id });
        return `<EXECUTABLE_CODE_PLACEHOLDER_${id}/>`;
      }
    )
    .replace(
      /```callstack-visualizer\n([\s\S]*?)\n```/g,
      (match, configBlock) => {
        const config: Record<string, string> = {};
        const lines = configBlock.trim().split('\n');
        
        for (const line of lines) {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            config[key.trim()] = value;
          }
        }
        
        const visualizerInfo: CallStackVisualizerInfo = {
          id: config.id || `callstack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: config.title,
          description: config.description,
          functionName: config.functionName,
          maxValue: config.maxValue ? parseInt(config.maxValue) : undefined,
          showCountdown: config.showCountdown !== 'false',
          showFactorial: config.showFactorial !== 'false', 
          showFibonacci: config.showFibonacci === 'true'
        };
        
        callStackVisualizers.push(visualizerInfo);
        return `<CALLSTACK_VISUALIZER_PLACEHOLDER_${visualizerInfo.id}/>`;
      }
    )
    .replace(
      /```binary-search-visualizer\n([\s\S]*?)\n```/g,
      (match, configBlock) => {
        const config: Record<string, string> = {};
        const lines = configBlock.trim().split('\n');
        
        for (const line of lines) {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            config[key.trim()] = value;
          }
        }
        
        const visualizerInfo: BinarySearchVisualizerInfo = {
          id: config.id || `binary-search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: config.title,
          description: config.description,
          initialArray: config.initialArray ? config.initialArray.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)) : undefined
        };
        
        binarySearchVisualizers.push(visualizerInfo);
        return `<BINARY_SEARCH_VISUALIZER_PLACEHOLDER_${visualizerInfo.id}/>`;
      }
    )
    .replace(
      /```merge-visualizer\n([\s\S]*?)\n```/g,
      (match, configBlock) => {
        const config: Record<string, string> = {};
        const lines = configBlock.trim().split('\n');
        
        for (const line of lines) {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            config[key.trim()] = value;
          }
        }
        
        const visualizerInfo: MergeVisualizerInfo = {
          id: config.id || `merge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: config.title,
          description: config.description,
          initialLeft: config.initialLeft ? config.initialLeft.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)) : undefined,
          initialRight: config.initialRight ? config.initialRight.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)) : undefined
        };
        
        mergeVisualizers.push(visualizerInfo);
        return `<MERGE_VISUALIZER_PLACEHOLDER_${visualizerInfo.id}/>`;
      }
    )
    .replace(
      /```function-machine\n([\s\S]*?)\n```/g,
      (match, configBlock) => {
        try {
          // Parse YAML-like config
          const lines = configBlock.trim().split('\n');
          const config: any = {};
          let currentKey = '';
          let currentArray: any[] = [];
          let inArray = false;
          let indent = 0;

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            if (trimmedLine.includes(':') && !trimmedLine.startsWith('-')) {
              if (inArray && currentKey) {
                config[currentKey] = currentArray;
                currentArray = [];
                inArray = false;
              }

              const [key, ...valueParts] = trimmedLine.split(':');
              const value = valueParts.join(':').trim();
              currentKey = key.trim();

              if (value) {
                config[currentKey] = value === 'true' ? true : value === 'false' ? false : value;
              } else {
                inArray = true;
                currentArray = [];
              }
            } else if (inArray && trimmedLine.startsWith('-')) {
              const itemContent = trimmedLine.substring(1).trim();
              if (itemContent.includes(':')) {
                // Object in array
                const item: any = {};
                const [itemKey, ...itemValueParts] = itemContent.split(':');
                item[itemKey.trim()] = itemValueParts.join(':').trim();

                // Look ahead for nested properties
                let nextLineIndex = lines.indexOf(line) + 1;
                while (nextLineIndex < lines.length) {
                  const nextLine = lines[nextLineIndex];
                  if (nextLine.trim().startsWith('-') || !nextLine.trim() || !nextLine.startsWith('      ')) break;

                  if (nextLine.trim().includes(':')) {
                    const [nestedKey, ...nestedValueParts] = nextLine.trim().split(':');
                    const nestedValue = nestedValueParts.join(':').trim();

                    if (nestedKey.trim() === 'inputs') {
                      item.inputs = [];
                      nextLineIndex++;
                      while (nextLineIndex < lines.length) {
                        const inputLine = lines[nextLineIndex];
                        if (!inputLine.startsWith('        -')) break;

                        const inputItem: any = {};
                        const inputContent = inputLine.trim().substring(1).trim();
                        if (inputContent.includes(':')) {
                          const [inputKey, ...inputValueParts] = inputContent.split(':');
                          inputItem[inputKey.trim()] = inputValueParts.join(':').trim().replace(/"/g, '');

                          // Look for value property
                          if (nextLineIndex + 1 < lines.length && lines[nextLineIndex + 1].includes('value:')) {
                            nextLineIndex++;
                            const valueLine = lines[nextLineIndex];
                            const [, ...valueValueParts] = valueLine.trim().split(':');
                            inputItem.value = valueValueParts.join(':').trim().replace(/"/g, '');
                          }
                        }
                        item.inputs.push(inputItem);
                        nextLineIndex++;
                      }
                      continue;
                    } else {
                      item[nestedKey.trim()] = nestedValue.replace(/"/g, '');
                    }
                  }
                  nextLineIndex++;
                }

                currentArray.push(item);
              } else {
                currentArray.push(itemContent);
              }
            }
          }

          if (inArray && currentKey) {
            config[currentKey] = currentArray;
          }

          const id = config.id || `function-machine-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Add to widgets
          widgetBlocks.push({
            id,
            type: 'FunctionMachine',
            title: config.title,
            description: config.description,
            props: {
              machineName: config.machineName,
              description: config.description,
              examples: config.examples,
              interactive: config.interactive
            }
          });

          return `<WIDGET_PLACEHOLDER_${id}/>`;
        } catch (error) {
          console.error('Error parsing function-machine config:', error);
          return `<div class="error">Error parsing function-machine configuration</div>`;
        }
      }
    )
    .replace(
      /```widget\n([\s\S]*?)\n```/g,
      (match, configBlock) => {
        try {
          // Parse YAML-like config
          const lines = configBlock.trim().split('\n');
          const config: any = {};

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) continue;

            if (trimmedLine.includes(':')) {
              const [key, ...valueParts] = trimmedLine.split(':');
              const value = valueParts.join(':').trim();
              config[key.trim()] = value === 'true' ? true : value === 'false' ? false : value;
            }
          }

          const id = config.id || `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Add to widgets
          widgetBlocks.push({
            id,
            type: config.type,
            title: config.title,
            description: config.description,
            props: config.props || {}
          });

          return `<WIDGET_PLACEHOLDER_${id}/>`;
        } catch (error) {
          console.error('Error parsing widget config:', error);
          return `<div class="error">Error parsing widget configuration</div>`;
        }
      }
    )
    .replace(
      /```checklist\n([\s\S]*?)\n```/g,
      (match, configBlock) => {
        try {
          // Parse checklist with support for both items and sections
          const lines = configBlock.trim().split('\n');
          const config: any = {};
          const items: any[] = [];
          const sections: any[] = [];
          let currentSection: any = null;
          let inSectionItems = false;

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            // Handle section headers: ## Section Name
            if (trimmedLine.startsWith('##')) {
              // Finalize previous section
              if (currentSection) {
                sections.push(currentSection);
              }
              // Start new section
              currentSection = {
                title: trimmedLine.substring(2).trim(),
                items: []
              };
              inSectionItems = true;
              continue;
            }

            if (trimmedLine.includes(':') && !trimmedLine.startsWith('-')) {
              const [key, ...valueParts] = trimmedLine.split(':');
              const value = valueParts.join(':').trim();
              config[key.trim()] = value;
            } else if (trimmedLine.startsWith('-')) {
              // Parse item: - id: item1, text: "Learn binary, counting", priority: must-master
              const itemContent = trimmedLine.substring(1).trim();
              const item: any = {};

              // Parse key:value pairs while respecting quoted strings
              const parts: string[] = [];
              let current = '';
              let inQuotes = false;
              let quoteChar = '';

              for (let i = 0; i < itemContent.length; i++) {
                const char = itemContent[i];

                if ((char === '"' || char === "'") && !inQuotes) {
                  inQuotes = true;
                  quoteChar = char;
                  current += char;
                } else if (char === quoteChar && inQuotes) {
                  inQuotes = false;
                  quoteChar = '';
                  current += char;
                } else if (char === ',' && !inQuotes) {
                  parts.push(current.trim());
                  current = '';
                } else {
                  current += char;
                }
              }

              if (current.trim()) {
                parts.push(current.trim());
              }

              for (const part of parts) {
                if (part.includes(':')) {
                  const [k, ...vParts] = part.split(':');
                  const v = vParts.join(':').trim().replace(/^['"]|['"]$/g, '');
                  item[k.trim()] = v;
                }
              }

              if (item.id && item.text) {
                if (currentSection && inSectionItems) {
                  // Add to current section
                  currentSection.items.push(item);
                } else {
                  // Add to global items
                  items.push(item);
                }
              }
            }
          }

          // Finalize last section
          if (currentSection) {
            sections.push(currentSection);
          }

          const id = config.id || `checklist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Use sections if we have them, otherwise use direct items
          const hasValidSections = sections.length > 0 && sections.some((s: any) => s.items && s.items.length > 0);

          // Add to widgets
          widgetBlocks.push({
            id,
            type: 'ChecklistWidget',
            title: config.title || 'Checklist',
            description: config.description,
            props: {
              title: config.title || 'Checklist',
              sections: hasValidSections ? sections : undefined,
              items: hasValidSections ? undefined : items
            }
          });

          return `<WIDGET_PLACEHOLDER_${id}/>`;
        } catch (error) {
          console.error('Error parsing checklist config:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return `<div class="error">Error parsing checklist configuration: ${errorMessage}</div>`;
        }
      }
    );


  // Process placeholders in the content
  
  // Find all placeholders and their positions
  const placeholders: Array<{ type: 'code' | 'quiz' | 'exercise' | 'callout' | 'plot' | 'table' | 'algorithm-widget' | 'callstack-visualizer' | 'binary-search-visualizer' | 'merge-visualizer' | 'widget', id: string, position: number, match: string }> = [];
  
  // Find code placeholders
  let match;
  const codeGlobalRegex = /<EXECUTABLE_CODE_PLACEHOLDER_([^/>]+)\/>/g;
  while ((match = codeGlobalRegex.exec(processedContent)) !== null) {
    placeholders.push({
      type: 'code',
      id: match[1],
      position: match.index,
      match: match[0]
    });
  }
  
  // Find quiz placeholders
  const quizGlobalRegex = /<QUIZ_PLACEHOLDER_([^/>]+)\/>/g;
  while ((match = quizGlobalRegex.exec(processedContent)) !== null) {
    placeholders.push({
      type: 'quiz',
      id: match[1],
      position: match.index,
      match: match[0]
    });
  }
  
  // Find exercise placeholders
  const exerciseGlobalRegex = /<EXERCISE_PLACEHOLDER_([^/>]+)\/>/g;
  while ((match = exerciseGlobalRegex.exec(processedContent)) !== null) {
    placeholders.push({
      type: 'exercise',
      id: match[1],
      position: match.index,
      match: match[0]
    });
  }
  
  // Find callout placeholders
  const calloutGlobalRegex = /<CALLOUT_PLACEHOLDER_([^/>]+)\/>/g;
  while ((match = calloutGlobalRegex.exec(processedContent)) !== null) {
    placeholders.push({
      type: 'callout',
      id: match[1],
      position: match.index,
      match: match[0]
    });
  }
  
  // Find plot placeholders
  const plotGlobalRegex = /<PLOT_PLACEHOLDER_([^/>]+)\/>/g;
  while ((match = plotGlobalRegex.exec(processedContent)) !== null) {
    placeholders.push({
      type: 'plot',
      id: match[1],
      position: match.index,
      match: match[0]
    });
  }
  
  // Find table placeholders
  const tableGlobalRegex = /<TABLE_PLACEHOLDER_([^/>]+)\/>/g;
  while ((match = tableGlobalRegex.exec(processedContent)) !== null) {
    placeholders.push({
      type: 'table',
      id: match[1],
      position: match.index,
      match: match[0]
    });
  }
  
  // Find algorithm widget placeholders
  const algorithmWidgetGlobalRegex = /<ALGORITHM_WIDGET_PLACEHOLDER_([^/>]+)\/>/g;
  while ((match = algorithmWidgetGlobalRegex.exec(processedContent)) !== null) {
    placeholders.push({
      type: 'algorithm-widget',
      id: match[1],
      position: match.index,
      match: match[0]
    });
  }
  
  // Find callstack visualizer placeholders
  const callStackVisualizerGlobalRegex = /<CALLSTACK_VISUALIZER_PLACEHOLDER_([^/>]+)\/>/g;
  while ((match = callStackVisualizerGlobalRegex.exec(processedContent)) !== null) {
    placeholders.push({
      type: 'callstack-visualizer',
      id: match[1],
      position: match.index,
      match: match[0]
    });
  }
  
  // Find binary search visualizer placeholders
  const binarySearchVisualizerGlobalRegex = /<BINARY_SEARCH_VISUALIZER_PLACEHOLDER_([^/>]+)\/>/g;
  while ((match = binarySearchVisualizerGlobalRegex.exec(processedContent)) !== null) {
    placeholders.push({
      type: 'binary-search-visualizer',
      id: match[1],
      position: match.index,
      match: match[0]
    });
  }
  
  // Find merge visualizer placeholders
  const mergeVisualizerGlobalRegex = /<MERGE_VISUALIZER_PLACEHOLDER_([^/>]+)\/>/g;
  while ((match = mergeVisualizerGlobalRegex.exec(processedContent)) !== null) {
    placeholders.push({
      type: 'merge-visualizer',
      id: match[1],
      position: match.index,
      match: match[0]
    });
  }
  
  // Find widget placeholders
  const widgetGlobalRegex = /<WIDGET_PLACEHOLDER_([^/>]+)\/>/g;
  while ((match = widgetGlobalRegex.exec(processedContent)) !== null) {
    placeholders.push({
      type: 'widget',
      id: match[1],
      position: match.index,
      match: match[0]
    });
  }
  
  // Sort placeholders by position
  placeholders.sort((a, b) => a.position - b.position);
  
  // Split content by all placeholders
  let parts: string[] = [];
  let lastIndex = 0;
  
  for (const placeholder of placeholders) {
    // Add text before placeholder
    if (placeholder.position > lastIndex) {
      parts.push(processedContent.slice(lastIndex, placeholder.position));
    }
    // Add placeholder marker
    parts.push(placeholder.match);
    lastIndex = placeholder.position + placeholder.match.length;
  }
  
  // Add remaining content
  if (lastIndex < processedContent.length) {
    parts.push(processedContent.slice(lastIndex));
  }
  
  // Filter out empty parts
  parts = parts.filter(part => part.trim() !== '');
  
  // Generate hints based on code content
  const generateHints = (code: string): string[] => {
    const hints: string[] = [];
    if (code.includes('print(') && code.includes('=')) {
      hints.push('Try changing the variable values to see how the output changes');
    }
    if (code.includes('f"') || code.includes("f'")) {
      hints.push('Experiment with f-string formatting by modifying the variables');
    }
    if (code.includes('.upper()') || code.includes('.lower()')) {
      hints.push('Try different string methods like .title() or .capitalize()');
    }
    if (code.match(/[+\-*/%]/)) {
      hints.push('Modify the numbers to see different calculation results');
    }
    return hints.slice(0, 3);
  };

  // Function to add heading numbers
  const addHeadingNumbers = (text: string): string => {
    return text.replace(/^(#{2,4})\s+(.+)$/gm, (match, hashes, title) => {
      const level = hashes.length;

      if (level === 2) {
        h2Counter++;
        h3Counter = 0; // Reset h3 counter
        h4Counter = 0; // Reset h4 counter
        return `${hashes} §${h2Counter}. ${title}`;
      } else if (level === 3) {
        h3Counter++;
        h4Counter = 0; // Reset h4 counter
        return `${hashes} §${h2Counter}.${h3Counter}. ${title}`;
      } else if (level === 4) {
        h4Counter++;
        return `${hashes} §${h2Counter}.${h3Counter}.${h4Counter}. ${title}`;
      }

      return match;
    });
  };


  return (
    <div className="space-y-0">
      {parts.map((part, index) => {
        // Check if this part is a placeholder
        const codeMatch = part.match(/<EXECUTABLE_CODE_PLACEHOLDER_([^/>]+)\/>/);
        const quizMatch = part.match(/<QUIZ_PLACEHOLDER_([^/>]+)\/>/);
        const exerciseMatch = part.match(/<EXERCISE_PLACEHOLDER_([^/>]+)\/>/);
        const calloutMatch = part.match(/<CALLOUT_PLACEHOLDER_([^/>]+)\/>/);
        const plotMatch = part.match(/<PLOT_PLACEHOLDER_([^/>]+)\/>/);
        const tableMatch = part.match(/<TABLE_PLACEHOLDER_([^/>]+)\/>/);
        const algorithmWidgetMatch = part.match(/<ALGORITHM_WIDGET_PLACEHOLDER_([^/>]+)\/>/);
        const callStackVisualizerMatch = part.match(/<CALLSTACK_VISUALIZER_PLACEHOLDER_([^/>]+)\/>/);
        const binarySearchVisualizerMatch = part.match(/<BINARY_SEARCH_VISUALIZER_PLACEHOLDER_([^/>]+)\/>/);
        const mergeVisualizerMatch = part.match(/<MERGE_VISUALIZER_PLACEHOLDER_([^/>]+)\/>/);
        const widgetMatch = part.match(/<WIDGET_PLACEHOLDER_([^/>]+)\/>/);
        
        // Determine the widget component to render
        const getAlgorithmWidgetComponent = (algorithm: string, props: Record<string, unknown>) => {
          switch (algorithm) {
            case 'bubble-sort':
              return <BubbleSortWidget {...props} />;
            case 'insertion-sort':
              return <InsertionSortWidget {...props} />;
            default:
              console.warn(`Unknown algorithm widget: ${algorithm}`);
              return <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">Unknown algorithm: {algorithm}</div>;
          }
        };
        
        // Determine the custom widget component to render
        const getWidgetComponent = (type: string, props: Record<string, any>) => {
          switch (type) {
            case 'ComplexityRankingWidget':
              return <ComplexityRankingWidget {...props} />;
            case 'AlgorithmMysteryGame':
              return <AlgorithmMysteryGame {...props} />;
            case 'BinarySearchStepVisualizer':
              return <BinarySearchStepVisualizer {...props} />;
            case 'Matrix2DSearchVisualizer':
              return <Matrix2DSearchVisualizer {...props} />;
            case 'RotatedArraySearchVisualizer':
              return <RotatedArraySearchVisualizer {...props} />;
            case 'PeakFindingVisualizer':
              return <PeakFindingVisualizer {...props} />;
            case 'MastermindChallenge':
              return <MastermindChallenge {...props} />;
            case 'MergeSortVisualizer':
              return <MergeSortVisualizer {...props} />;
            case 'QuickSortVisualizer':
              return <QuickSortVisualizer {...props} />;
            case 'LomutoPartitionVisualizer':
              return <LomutoPartitionVisualizer {...props} />;
            case 'DecisionTreeVisualizer':
              return <DecisionTreeVisualizer {...props} />;
            case 'FunctionMachine':
              return <FunctionMachine {...props} />;
            case 'BooleanLogicCalculator':
              return <BooleanLogicCalculator {...props} />;
            case 'BinaryConverter':
              return <BinaryConverter {...props} />;
            case 'BinaryToDecimalConverter':
              return <BinaryToDecimalConverter {...props} />;
            case 'DecimalToBinaryConverter':
              return <DecimalToBinaryConverter {...props} />;
            case 'BinaryAdditionGame':
              return <BinaryAdditionGame {...props} />;
            case 'SignedBinaryAdditionGame':
              return <SignedBinaryAdditionGame {...props} />;
            case 'BitManipulationWidget':
              return <BitManipulationWidget {...props} />;
            case 'ASCIIEncoder':
              return <ASCIIEncoder {...props} />;
            case 'FloatingPointWidget':
              return <FloatingPointWidget {...props} />;
            case 'SpaceEfficientMultiplicationWidget':
              return <SpaceEfficientMultiplicationWidget {...props} />;
            case 'ChecklistWidget':
              return <ChecklistWidget {...props} />;
            default:
              console.warn(`Unknown widget type: ${type}`);
              return <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">Unknown widget: {type}</div>;
          }
        };
        
        if (codeMatch) {
          // Handle code playground
          const codeId = codeMatch[1];
          const codeBlock = codeBlocks.find(block => block.id === codeId);
          if (codeBlock) {
            return (
              <div key={index} className="mb-8">
                <CodePlayground
                  initialCode={codeBlock.code}
                  hints={generateHints(codeBlock.code)}
                  editable={true}
                  showOutput={true}
                />
              </div>
            );
          }
          return null;
        } else if (quizMatch) {
          // Handle inline quiz
          const quizId = quizMatch[1];
          const quiz = quizzes.find(q => q.id === quizId);
          if (quiz) {
            return (
              <div key={index} className="mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">💡 Quick Check</h4>
                  {quiz.questions.map((question) => (
                    <div key={question.id} className="mb-4">
                      <MultipleChoice
                        id={question.id}
                        question={question.question}
                        options={question.options}
                        explanation={question.explanation}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        } else if (exerciseMatch) {
          // Handle inline exercise
          const exerciseId = exerciseMatch[1];
          const exercise = exercises.find(e => e.id === exerciseId);
          if (exercise) {
            return (
              <div key={index} className="mb-8">
                <CodingExercise
                  id={exercise.id}
                  title={exercise.title}
                  description={exercise.description}
                  starterCode={exercise.starterCode}
                  testCases={exercise.testCases}
                  hints={exercise.hints}
                  solution={exercise.solution}
                  difficulty={exercise.difficulty}
                  echoInput={exercise.echoInput}
                  prepend={exercise.prepend}
                  postpend={exercise.postpend}
                />
              </div>
            );
          }
          return null;
        } else if (calloutMatch) {
          // Handle callout blocks
          const calloutId = calloutMatch[1];
          const callout = calloutBlocks.find(block => block.id === calloutId);
          if (callout) {
            const calloutStyles = {
              note: {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                title: 'text-blue-900',
                icon: '💡'
              },
              hint: {
                bg: 'bg-green-50',
                border: 'border-green-200',
                title: 'text-green-900',
                icon: '🔍'
              },
              warning: {
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                title: 'text-yellow-900',
                icon: '⚠️'
              },
              danger: {
                bg: 'bg-red-50',
                border: 'border-red-200',
                title: 'text-red-900',
                icon: '🚨'
              }
            };
            
            const style = calloutStyles[callout.type];
            const title = callout.title || callout.type.charAt(0).toUpperCase() + callout.type.slice(1);
            
            return (
              <div key={index} className="mb-8">
                <div className={`${style.bg} ${style.border} border rounded-lg p-6`}>
                  <h4 className={`text-lg font-semibold ${style.title} mb-4`}>
                    {style.icon} {title}
                  </h4>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        code: (props: any) => {
                          const { inline, className, children } = props;
                          const match = /language-(\w+)/.exec(className || '');
                          const language = match ? match[1] : 'python';
                          const codeContent = String(children).replace(/\n$/, '');
                          
                          // If it's inline code, always render as inline
                          if (inline) {
                            return (
                              <code className="bg-gray-100 px-1 py-0.5 rounded font-mono" {...props}>
                                {children}
                              </code>
                            );
                          }
                          
                          // For block code, check if it has a language class (from ```language)
                          // If no language class, it's likely from single backticks that should be inline
                          if (!className) {
                            return (
                              <code className="bg-gray-100 px-1 py-0.5 rounded font-mono" {...props}>
                                {children}
                              </code>
                            );
                          }
                          
                          // For proper block code with language, render as code blocks
                          return (
                            <CodeBlock language={language} showLineNumbers={true} showCopyButton={true}>
                              {codeContent}
                            </CodeBlock>
                          );
                        },
                      }}
                    >
                      {callout.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        } else if (plotMatch) {
          // Handle plot blocks
          const plotId = plotMatch[1];
          const plot = plotBlocks.find(block => block.id === plotId);
          if (plot) {
            return <PlotRenderer key={index} plot={plot} />;
          }
          return null;
        } else if (tableMatch) {
          // Handle table blocks
          const tableId = tableMatch[1];
          const table = tableBlocks.find(block => block.id === tableId);
          if (table) {
            return <TableRenderer key={index} table={table} />;
          }
          return null;
        } else if (algorithmWidgetMatch) {
          // Handle algorithm widget blocks
          const algorithmWidgetId = algorithmWidgetMatch[1];
          const algorithmWidget = algorithmWidgetBlocks.find(block => block.id === algorithmWidgetId);
          if (algorithmWidget) {
            return (
              <div key={index} className="mb-8">
                {getAlgorithmWidgetComponent(algorithmWidget.algorithm, {
                  initialData: algorithmWidget.initialData,
                  title: algorithmWidget.title,
                  options: algorithmWidget.options
                })}
              </div>
            );
          }
          return null;
        } else if (callStackVisualizerMatch) {
          // Handle callstack visualizer blocks
          const callStackVisualizerId = callStackVisualizerMatch[1];
          const callStackVisualizer = callStackVisualizers.find(block => block.id === callStackVisualizerId);
          if (callStackVisualizer) {
            return (
              <div key={index} className="mb-8">
                <CallStackVisualizer
                  id={callStackVisualizer.id}
                  title={callStackVisualizer.title}
                  description={callStackVisualizer.description}
                  functionName={callStackVisualizer.functionName}
                  maxValue={callStackVisualizer.maxValue}
                  showCountdown={callStackVisualizer.showCountdown}
                  showFactorial={callStackVisualizer.showFactorial}
                  showFibonacci={callStackVisualizer.showFibonacci}
                />
              </div>
            );
          }
          return null;
        } else if (binarySearchVisualizerMatch) {
          // Handle binary search visualizer
          const binarySearchVisualizerId = binarySearchVisualizerMatch[1];
          const binarySearchVisualizer = binarySearchVisualizers.find(block => block.id === binarySearchVisualizerId);
          if (binarySearchVisualizer) {
            return (
              <div key={index} className="mb-8">
                <BinarySearchVisualizer
                  id={binarySearchVisualizer.id}
                  title={binarySearchVisualizer.title}
                  description={binarySearchVisualizer.description}
                  initialArray={binarySearchVisualizer.initialArray}
                />
              </div>
            );
          }
          return null;
        } else if (mergeVisualizerMatch) {
          // Handle merge visualizer
          const mergeVisualizerId = mergeVisualizerMatch[1];
          const mergeVisualizer = mergeVisualizers.find(block => block.id === mergeVisualizerId);
          if (mergeVisualizer) {
            return (
              <div key={index} className="mb-8">
                <MergeVisualizer
                  id={mergeVisualizer.id}
                  title={mergeVisualizer.title}
                  description={mergeVisualizer.description}
                  initialLeft={mergeVisualizer.initialLeft}
                  initialRight={mergeVisualizer.initialRight}
                />
              </div>
            );
          }
          return null;
        } else if (widgetMatch) {
          // Handle custom widget blocks
          const widgetId = widgetMatch[1];
          const widget = widgetBlocks.find(block => block.id === widgetId);
          if (widget) {
            return (
              <div key={index} className="mb-8">
                {getWidgetComponent(widget.type, {
                  ...widget.props,
                  title: widget.title,
                  description: widget.description
                })}
              </div>
            );
          }
          return null;
        } else {
          // Handle regular markdown content with heading numbers
          return part.trim() ? (
            <div key={index} className="prose prose-lg prose-gray max-w-none mb-8">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code: (props: any) => {
                    const { inline, className, children } = props;
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : 'python';
                    const codeContent = String(children).replace(/\n$/, '');

                    // If it's inline code, always render as inline
                    if (inline) {
                      return (
                        <code className="bg-gray-100 px-1 py-0.5 rounded font-mono" {...props}>
                          {children}
                        </code>
                      );
                    }

                    // For block code, check if it's short enough to be treated as inline
                    const isShortCode = !codeContent.includes('\n') && codeContent.length < 50;

                    if (isShortCode) {
                      return (
                        <code className="bg-gray-100 px-1 py-0.5 rounded font-mono" {...props}>
                          {children}
                        </code>
                      );
                    }

                    // For longer code blocks, use the full CodeBlock component
                    return (
                      <CodeBlock language={language} showLineNumbers={true} showCopyButton={true}>
                        {codeContent}
                      </CodeBlock>
                    );
                  },
                }}
              >
                {addHeadingNumbers(part)}
              </ReactMarkdown>
            </div>
          ) : null;
        }
      })}
    </div>
  );
}