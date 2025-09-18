'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ProgressManager } from '@/lib/utils/progress';
import { settingsManager } from '@/lib/utils/settings';
import CodeBlock from './CodeBlock';
import 'katex/dist/katex.min.css';

interface Option {
  id: string;
  text: string;
  correct: boolean;
  explanation?: string;
}

interface MultipleChoiceProps {
  id: string;
  question: string;
  options: Option[];
  explanation?: string;
}

export default function MultipleChoice({ 
  id, 
  question, 
  options, 
  explanation 
}: MultipleChoiceProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);

  // Function to render question content with ReactMarkdown (supports KaTeX, code blocks, inline code)
  const renderQuestionContent = (text: string) => {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code: (props: any) => {
              const { inline, className, children } = props;
              // If it has a language className (e.g., language-python), it's a fenced code block
              const match = /language-(\w+)/.exec(className || '');
              const isCodeBlock = match !== null;
              
              if (!isCodeBlock || inline) {
                // Inline code (single backticks)
                return (
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-blue-800" {...props}>
                    {children}
                  </code>
                );
              }
              
              // Block code (triple backticks with language)
              const language = match[1] || 'python';
              const codeContent = String(children).replace(/\n$/, '');
              
              return (
                <CodeBlock language={language} showLineNumbers={true} showCopyButton={false}>
                  {codeContent}
                </CodeBlock>
              );
            },
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  };

  // Load previous progress
  useEffect(() => {
    const progress = ProgressManager.getQuizProgress(id);
    if (progress?.completed) {
      setShowResult(true);
      setAttempts(progress.attempts);
      setIsCorrect(progress.score === 100);
    }
  }, [id]);

  const handleSubmit = () => {
    if (!selectedOption || showResult) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setShowResult(true);

    const correctOption = options.find(opt => opt.correct);
    const selectedCorrect = selectedOption === correctOption?.id;
    setIsCorrect(selectedCorrect);

    ProgressManager.completeQuizWithXp(id, {
      completed: true,
      score: selectedCorrect ? 100 : 0,
      attempts: newAttempts,
    });
  };

  const tryAgain = () => {
    setSelectedOption('');
    setShowResult(false);
  };

  const resetQuiz = () => {
    setSelectedOption('');
    setShowResult(false);
    setAttempts(0);
    setIsCorrect(false);
    
    // Clear progress from storage
    ProgressManager.updateQuizProgress(id, {
      completed: false,
      score: 0,
      attempts: 0,
    });
  };

  const getOptionStyle = (optionId: string) => {
    if (!showResult) {
      return selectedOption === optionId
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300';
    }

    const option = options.find(opt => opt.id === optionId);
    if (option?.correct) {
      return 'border-green-500 bg-green-50';
    }
    if (selectedOption === optionId && !option?.correct) {
      return 'border-red-500 bg-red-50';
    }
    return 'border-gray-200 bg-gray-50';
  };


  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Quiz Question</h3>
        <div className="prose prose-sm max-w-none">
          {renderQuestionContent(question)}
        </div>
      </div>

      <div className="px-6 py-4 space-y-3">
        {options.map((option) => (
          <label
            key={option.id}
            className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${getOptionStyle(option.id)} ${
              showResult ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name={`quiz-${id}`}
                value={option.id}
                checked={selectedOption === option.id}
                onChange={(e) => !showResult && setSelectedOption(e.target.value)}
                disabled={showResult}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="text-gray-800 prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p: ({children}) => <span>{children}</span>,
                      code: (props: any) => {
                        const { inline, className, children } = props;
                        // If it has a language className (e.g., language-python), it's a fenced code block
                        const match = /language-(\w+)/.exec(className || '');
                        const isCodeBlock = match !== null;
                        
                        if (!isCodeBlock || inline) {
                          // Inline code (single backticks)
                          return (
                            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-blue-800" {...props}>
                              {children}
                            </code>
                          );
                        }
                        
                        // Block code (triple backticks with language)
                        const language = match[1] || 'python';
                        const codeContent = String(children).replace(/\n$/, '');
                        
                        return (
                          <CodeBlock language={language} showLineNumbers={false} showCopyButton={false}>
                            {codeContent}
                          </CodeBlock>
                        );
                      },
                    }}
                  >
                    {option.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {attempts > 0 && `Attempts: ${attempts}`}
        </div>
        
        <div className="flex gap-2">
          {/* Reset button - shows if there's any progress */}
          {(attempts > 0 || showResult) && (
            <button
              onClick={resetQuiz}
              className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              title="Reset this quiz completely"
            >
              Reset
            </button>
          )}
          
          {showResult && !isCorrect && (
            <button
              onClick={tryAgain}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
          )}
          
          {!showResult && (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              Submit Answer
            </button>
          )}
        </div>
      </div>

      {/* Results and Explanations */}
      {showResult && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <>
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="font-medium text-green-800">Correct!</span>
                </>
              ) : (
                <>
                  <span className="text-red-600 font-bold">✗</span>
                  <span className="font-medium text-red-800">Incorrect</span>
                </>
              )}
            </div>
            
            {/* Show explanation for selected (wrong) answer */}
            {!isCorrect && selectedOption && (
              <div className="mb-3">
                <div className="text-sm text-red-700 prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p: ({children}) => <span>{children}</span>,
                      code: (props: any) => {
                        const { inline, className, children } = props;
                        // If it has a language className (e.g., language-python), it's a fenced code block
                        const match = /language-(\w+)/.exec(className || '');
                        const isCodeBlock = match !== null;
                        
                        if (!isCodeBlock || inline) {
                          // Inline code (single backticks)
                          return (
                            <code className="bg-red-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-800" {...props}>
                              {children}
                            </code>
                          );
                        }
                        
                        // Block code (triple backticks with language)
                        const language = match[1] || 'python';
                        const codeContent = String(children).replace(/\n$/, '');
                        
                        return (
                          <CodeBlock language={language} showLineNumbers={false} showCopyButton={false}>
                            {codeContent}
                          </CodeBlock>
                        );
                      },
                    }}
                  >
                    {options.find(opt => opt.id === selectedOption)?.explanation || ''}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Show correct answer explanation */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1">Explanation:</p>
              <div className="text-sm text-gray-700 prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <ReactMarkdown 
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    p: ({children}) => <span>{children}</span>,
                    code: (props: any) => {
                      const { inline, className, children } = props;
                      // If it has a language className (e.g., language-python), it's a fenced code block
                      const match = /language-(\w+)/.exec(className || '');
                      const isCodeBlock = match !== null;
                      
                      if (!isCodeBlock || inline) {
                        // Inline code (single backticks)
                        return (
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-blue-800" {...props}>
                            {children}
                          </code>
                        );
                      }
                      
                      // Block code (triple backticks with language)
                      const language = match[1] || 'python';
                      const codeContent = String(children).replace(/\n$/, '');
                      
                      return (
                        <CodeBlock language={language} showLineNumbers={false} showCopyButton={false}>
                          {codeContent}
                        </CodeBlock>
                      );
                    },
                  }}
                >
                  {explanation || options.find(opt => opt.correct)?.explanation || ''}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}