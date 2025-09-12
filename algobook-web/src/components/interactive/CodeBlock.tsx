'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface CodeBlockProps {
  children: string;
  language?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  defaultFoldedRanges?: Array<{ startLine: number; endLine: number }>;
}

export default function CodeBlock({ 
  children, 
  language = 'python',
  showLineNumbers = true,
  showCopyButton = true,
  defaultFoldedRanges = []
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Calculate height based on number of lines
  const lines = children.trim().split('\n').length;
  const height = Math.max(40, lines * 19 + 20); // 19px per line + padding

  // Show loading skeleton during SSR
  if (!isMounted) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white my-4">
        <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700 capitalize">{language}</span>
          {showCopyButton && (
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
          )}
        </div>
        <div style={{ height: `${height}px` }} className="bg-gray-50 flex items-center justify-center">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white my-4">
      {/* Header with language and copy button */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700 capitalize">{language}</span>
        {showCopyButton && (
          <button
            onClick={copyToClipboard}
            className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {/* Code content using Monaco editor (read-only) */}
      <div style={{ height: `${height}px` }} className="bg-gray-50">
        <Editor
          height="100%"
          defaultLanguage={language}
          value={children.trim()}
          onMount={(editor) => {
            // Apply default folding after editor mounts
            if (defaultFoldedRanges.length > 0) {
              setTimeout(() => {
                const foldingRanges = defaultFoldedRanges.map(range => ({
                  start: range.startLine,
                  end: range.endLine
                }));
                editor.getAction('editor.foldAll')?.run();
                // Then unfold everything and only fold the specified ranges
                editor.getAction('editor.unfoldAll')?.run();
                foldingRanges.forEach(range => {
                  editor.setSelection({
                    startLineNumber: range.start,
                    startColumn: 1,
                    endLineNumber: range.end,
                    endColumn: 1
                  });
                  editor.getAction('editor.fold')?.run();
                });
              }, 100);
            }
          }}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: showLineNumbers ? 'on' : 'off',
            automaticLayout: true,
            theme: 'vs-light',
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
          }}
        />
      </div>
    </div>
  );
}