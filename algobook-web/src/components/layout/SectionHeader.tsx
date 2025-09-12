'use client';

import React from 'react';
import Link from 'next/link';
import { Section } from '@/lib/types/content';

interface SectionHeaderProps {
  chapter: {
    id: string;
    title: string;
    sections: Array<{
      id: string;
      title: string;
      completed: boolean;
    }>;
  };
  section: Section;
}

export default function SectionHeader({ chapter, section }: SectionHeaderProps) {
  const currentSectionIndex = chapter.sections.findIndex(s => s.id === section.id);
  const totalSections = chapter.sections.length;
  const progressPercentage = ((currentSectionIndex + 1) / totalSections) * 100;

  // Count actual interactive elements from parsed content
  const interactiveElementsCount = 
    (section.quizzes?.length || 0) +
    (section.exercises?.length || 0) +
    (section.algorithmWidgets?.length || 0) +
    (section.callouts?.length || 0) +
    (section.plots?.length || 0) +
    (section.tables?.length || 0);

  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <Link href="/" className="hover:text-gray-900">
          Home
        </Link>
        <span>›</span>
        <Link href={`/chapter/${chapter.id}`} className="hover:text-gray-900">
          {chapter.title}
        </Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">
          Section {section.id}: {section.title}
        </span>
      </nav>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Section {currentSectionIndex + 1} of {totalSections}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Section Title and Info */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Section {section.id}: {section.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {section.estimatedMinutes} min read
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {interactiveElementsCount} interactive elements
          </span>
          {(section.exercises?.length || 0) > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {section.exercises?.length || 0} exercise{(section.exercises?.length || 0) !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}