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

interface ChapterStartCTAProps {
  chapterId: string;
  sections: Section[];
}

export default function ChapterStartCTA({ chapterId, sections }: ChapterStartCTAProps) {
  const [nextSection, setNextSection] = useState<Section | null>(null);
  const [allCompleted, setAllCompleted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Find the first incomplete section or determine if all are completed
    let foundIncomplete = false;
    for (const section of sections) {
      const sectionId = `${chapterId}_${section.id}`;
      if (!ProgressManager.isSectionCompleted(sectionId)) {
        setNextSection(section);
        foundIncomplete = true;
        break;
      }
    }
    
    if (!foundIncomplete) {
      setAllCompleted(true);
      setNextSection(null);
    }
  }, [chapterId, sections]);

  if (!isClient) {
    // Fallback to first section while loading
    return (
      <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to Start Learning?</h3>
        <p className="text-gray-600 mb-6">
          Begin with {sections[0]?.title} and work through each section at your own pace.
        </p>
        <Link
          href={`/chapter/${chapterId}/section/${sections[0]?.id}`}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Start {sections[0]?.title}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    );
  }

  if (allCompleted) {
    return (
      <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 mb-8">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-green-900 mb-4">Chapter Completed!</h3>
        <p className="text-green-700 mb-6">
          Congratulations! You've completed all sections in this chapter. 
          You can review any section by clicking on it above.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href={`/chapter/${chapterId}/section/${sections[0]?.id}`}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Review Chapter
          </Link>
          <Link
            href="/chapters"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Next Chapter
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  if (nextSection) {
    return (
      <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {nextSection === sections[0] ? 'Ready to Start Learning?' : 'Continue Learning'}
        </h3>
        <p className="text-gray-600 mb-6">
          {nextSection === sections[0] 
            ? `Begin with ${nextSection.title} and work through each section at your own pace.`
            : `Continue with ${nextSection.title} to keep making progress.`
          }
        </p>
        <Link
          href={`/chapter/${chapterId}/section/${nextSection.id}`}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {nextSection === sections[0] ? 'Start' : 'Continue'} {nextSection.title}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    );
  }

  return null;
}