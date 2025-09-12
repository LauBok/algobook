'use client';

import Link from 'next/link';
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { CHAPTER_METADATA } from '@/lib/data/chapterMetadata';

export default function ChaptersPage() {
  // Convert metadata to array and group by parts
  const chapters = Object.values(CHAPTER_METADATA).sort((a, b) => a.order - b.order);
  
  const partGroups = chapters.reduce((acc, chapter) => {
    const partKey = `part-${chapter.part}`;
    if (!acc[partKey]) {
      acc[partKey] = {
        partNumber: chapter.part,
        partTitle: chapter.partTitle,
        chapters: []
      };
    }
    acc[partKey].chapters.push(chapter);
    return acc;
  }, {} as Record<string, { partNumber: number; partTitle: string; chapters: typeof chapters }>);

  const parts = Object.values(partGroups).sort((a, b) => a.partNumber - b.partNumber);
  
  // Tab state
  const [activeTab, setActiveTab] = useState(1);

  return (
    <Layout showSidebar={false}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            All Chapters
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the complete AlgoBook curriculum. Master Python, algorithms, and data structures 
            through our carefully designed learning path.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {parts.map((part) => (
                <button
                  key={`tab-${part.partNumber}`}
                  onClick={() => setActiveTab(part.partNumber)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === part.partNumber
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Part {part.partNumber}: {part.partTitle}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {parts.map((part) => (
            <div
              key={`content-${part.partNumber}`}
              className={activeTab === part.partNumber ? 'block' : 'hidden'}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Part {part.partNumber}: {part.partTitle}
                </h2>
                <p className="text-gray-600 mb-4">
                  {part.partNumber === 1 && "Build a solid foundation with Python basics and simple algorithms"}
                  {part.partNumber === 2 && "Learn to analyze and optimize algorithms for better performance"}
                  {part.partNumber === 3 && "Master essential data structures that power efficient programs"}
                  {part.partNumber === 4 && "Explore hierarchical data and tree-based algorithms"}
                  {part.partNumber === 5 && "Understand networks and graph-based problem solving"}
                  {part.partNumber === 6 && "Advanced techniques for complex algorithmic challenges"}
                  {part.partNumber === 7 && "Specialized applications and real-world implementations"}
                </p>
              </div>
              
              <div className="grid gap-4">
                {part.chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/chapter/${chapter.id}`}
                    className="group border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-700 transition-colors">
                            {chapter.order}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {chapter.title}
                          </h3>
                        </div>
                        
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {chapter.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {chapter.sections.length} sections
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {chapter.sections.reduce((total, section) => total + section.estimatedMinutes, 0)} min
                          </span>
                        </div>

                        {chapter.learningObjectives.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Objectives:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {chapter.learningObjectives.slice(0, 2).map((objective, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-blue-600 mt-1">•</span>
                                  <span>{objective}</span>
                                </li>
                              ))}
                              {chapter.learningObjectives.length > 2 && (
                                <li className="text-gray-500 italic">
                                  ...and {chapter.learningObjectives.length - 2} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <svg 
                          className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16 py-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Learning?</h2>
          <p className="text-gray-600 mb-6">
            Begin your algorithmic thinking journey with our first chapter.
          </p>
          <Link
            href="/chapter/01-getting-started"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start with Chapter 1
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </Layout>
  );
}