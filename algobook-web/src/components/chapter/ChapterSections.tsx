'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProgressManager } from '@/lib/utils/progress';

interface Section {
  id: string;
  title: string;
  estimatedMinutes: number;
  description: string;
}

interface ChapterSectionsProps {
  chapterId: string;
  sections: Section[];
}

export default function ChapterSections({ chapterId, sections }: ChapterSectionsProps) {
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check completion status for each section
    const completed = new Set<string>();
    sections.forEach(section => {
      const sectionId = `${chapterId}_${section.id}`;
      if (ProgressManager.isSectionCompleted(sectionId)) {
        completed.add(section.id);
      }
    });
    setCompletedSections(completed);
  }, [chapterId, sections]);

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const isCompleted = isClient && completedSections.has(section.id);
        
        return (
          <Link
            key={section.id}
            href={`/chapter/${chapterId}/section/${section.id}`}
            className={`
              block p-6 border rounded-lg transition-all duration-200
              ${isCompleted 
                ? 'bg-green-50 border-green-200 hover:border-green-300 hover:shadow-md' 
                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
              }
            `}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`
                    text-sm font-medium px-2 py-1 rounded
                    ${isCompleted 
                      ? 'text-green-700 bg-green-100' 
                      : 'text-blue-600 bg-blue-100'
                    }
                  `}>
                    Section {section.id}
                  </span>
                  <span className="text-sm text-gray-500">
                    {section.estimatedMinutes} min
                  </span>
                  {isCompleted && (
                    <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Completed
                    </span>
                  )}
                </div>
                <h3 className={`
                  text-lg font-semibold mb-2
                  ${isCompleted ? 'text-green-900' : 'text-gray-900'}
                `}>
                  {section.title}
                </h3>
                <p className={`
                  ${isCompleted ? 'text-green-700' : 'text-gray-600'}
                `}>
                  {section.description}
                </p>
              </div>
              
              {/* Progress indicator and arrow */}
              <div className="ml-4 flex items-center gap-3 flex-shrink-0">
                {isCompleted && (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <svg className={`
                  w-5 h-5 
                  ${isCompleted ? 'text-green-400' : 'text-gray-400'}
                `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}