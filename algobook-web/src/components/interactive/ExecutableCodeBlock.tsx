'use client';

import React from 'react';
import CodePlayground from './CodePlayground';

interface ExecutableCodeBlockProps {
  code: string;
  language?: string;
  description?: string;
  hints?: string[];
  compact?: boolean;
  showOutput?: boolean;
}

export default function ExecutableCodeBlock({ 
  code, 
  language = 'python',
  description,
  hints = [],
  compact = false,
  showOutput = true
}: ExecutableCodeBlockProps) {
  // Only make Python code executable
  if (language !== 'python') {
    return (
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    );
  }

  // Use compact version for inline examples
  if (compact) {
    return (
      <div className="my-4">
        <CodePlayground
          initialCode={code}
          description={description}
          hints={hints}
          editable={true}
          showOutput={showOutput}
        />
      </div>
    );
  }

  // Full interactive playground
  return (
    <div className="my-6">
      <CodePlayground
        initialCode={code}
        description={description || "Interactive Python Example"}
        hints={hints}
        editable={true}
        showOutput={showOutput}
      />
    </div>
  );
}