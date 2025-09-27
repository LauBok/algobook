'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProgressManager } from '@/lib/utils/progress';
import { CURRICULUM_STRUCTURE, getSectionCount, getChapterMetadata } from '@/lib/data/chapterMetadata';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isClient, setIsClient] = React.useState(false);
  // Start with all chapters collapsed by default
  const [collapsedChapters, setCollapsedChapters] = React.useState<Set<string>>(() => {
    // Initialize with all available chapter IDs collapsed
    const availableChapterIds = [
      '01-getting-started',
      '02-logic-control-flow',
      '03-loops-iteration',
      '04-lists-algorithms',
      '05-functions',
      '06-recursion-divide-conquer',
      '07-algorithm-efficiency',
      '08-binary-search-mastery',
      '09-sorting-algorithms'
    ];
    return new Set(availableChapterIds);
  });

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-expand current chapter sections
  React.useEffect(() => {
    const currentChapterId = pathname.split('/')[2]; // Extract chapter ID from pathname
    if (currentChapterId && pathname.startsWith('/chapter/')) {
      setCollapsedChapters(prev => {
        const newSet = new Set(prev);
        // Remove current chapter from collapsed set (expand it)
        newSet.delete(currentChapterId);
        return newSet;
      });
    }
  }, [pathname]);


  const isChapterCompleted = (chapterId: string) => {
    if (!isClient) return false;
    return ProgressManager.isChapterCompleted(chapterId);
  };

  const getChapterProgress = (chapterId: string) => {
    if (!isClient) {
      return { completed: 0, total: 0 };
    }
    
    const progress = ProgressManager.getUserProgress();
    const sectionsInChapter = progress.sectionsCompleted.filter(
      sectionId => sectionId.startsWith(`${chapterId}_`)
    ).length;
    
    const totalSections = getSectionCount(chapterId)
    
    return { completed: sectionsInChapter, total: totalSections };
  };

  const isChallengeCompleted = (challengeId: string) => {
    if (!isClient) return false;
    return ProgressManager.isChallengeCompleted(challengeId);
  };

  // Define which chapters are currently available (written)
  const availableChapters = new Set([
    '01-getting-started',
    '02-logic-control-flow', 
    '03-loops-iteration',
    '04-lists-algorithms',
    '05-functions',
    '06-recursion-divide-conquer',
    '07-algorithm-efficiency',
    '08-binary-search-mastery',
    '09-sorting-algorithms'
  ]);

  const isChapterAvailable = (chapterId: string) => {
    return availableChapters.has(chapterId);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Table of Contents</h2>
        <p className="text-sm text-gray-800 mt-1">Navigate through the curriculum</p>
      </div>

      {/* Curriculum Navigation */}
      <div className="p-4">
        {CURRICULUM_STRUCTURE.map((part) => (
          <div key={part.part} className="mb-8">
            {/* Part Header */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Part {part.part}
              </h3>
              <p className="text-sm text-gray-800 mt-1">{part.title}</p>
            </div>

            {/* Chapters */}
            <div className="space-y-2">
              {part.chapters.map((chapter) => {
                const isActive = pathname === `/chapter/${chapter.id}`;
                const isCompleted = isChapterCompleted(chapter.id);
                const isAvailable = isChapterAvailable(chapter.id);
                const progress = getChapterProgress(chapter.id);
                const progressPercentage = progress.total > 0 
                  ? (progress.completed / progress.total) * 100 
                  : 0;

                const chapterMetadata = getChapterMetadata(chapter.id);
                const isCollapsed = collapsedChapters.has(chapter.id);
                const currentPath = pathname;
                const isChapterPage = currentPath === `/chapter/${chapter.id}`;
                const isSectionPage = currentPath.startsWith(`/chapter/${chapter.id}/section/`);
                const isAnyPartActive = isChapterPage || isSectionPage;

                return (
                  <div key={chapter.id} className="mb-2">
                    {/* Chapter Header */}
                    <div>
                      {/* Main Chapter Link */}
                      <div>
                        {isAvailable ? (
                          <Link
                            href={`/chapter/${chapter.id}`}
                            className={`block p-3 rounded-lg transition-colors ${
                              isChapterPage
                                ? 'bg-blue-50 border-l-4 border-blue-600'
                                : 'hover:bg-gray-50 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-500">
                                    {chapter.order}.
                                  </span>
                                  <h4 className={`text-sm font-medium ${
                                    isAnyPartActive ? 'text-blue-900' : 'text-gray-900'
                                  }`}>
                                    {chapter.title}
                                  </h4>
                                </div>

                                {/* Progress Bar */}
                                {progress.completed > 0 && (
                                  <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className={`h-1.5 rounded-full ${
                                          isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${progressPercentage}%` }}
                                      ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {progress.completed}/{progress.total} sections
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Completion Status */}
                              <div className="flex items-center ml-2">
                                {isCompleted ? (
                                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                ) : progress.completed > 0 ? (
                                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 bg-gray-100 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div className="block p-3 rounded-lg transition-colors cursor-not-allowed opacity-60">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-500">
                                    {chapter.order}.
                                  </span>
                                  <h4 className="text-sm font-medium text-gray-500">
                                    {chapter.title}
                                    <span className="text-xs ml-2 text-gray-400">(Coming Soon)</span>
                                  </h4>
                                </div>
                              </div>
                              <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Collapsible Sections */}
                    {isAvailable && !isCollapsed && chapterMetadata && chapterMetadata.sections.length > 0 && (
                      <div className="ml-4 mt-2 space-y-1">
                        {chapterMetadata.sections.map((section) => {
                          const sectionPath = `/chapter/${chapter.id}/section/${section.id}`;
                          const isSectionActive = currentPath === sectionPath;
                          const isSectionCompleted = isClient && ProgressManager.isSectionCompleted(`${chapter.id}_${section.id}`);

                          return (
                            <Link
                              key={section.id}
                              href={sectionPath}
                              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                isSectionActive
                                  ? 'bg-blue-100 text-blue-900 border-l-2 border-blue-600'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-400">
                                    {section.id}
                                  </span>
                                  <span className="flex-1">{section.title}</span>
                                </div>
                                {isSectionCompleted && (
                                  <div className="w-3 h-3 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-2 h-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Part Challenge */}
              {part.challenge && (() => {
                const challengeCompleted = isChallengeCompleted(part.challenge.id);
                
                // Map challenge IDs to their specific URLs
                const getChallengeUrl = (challengeId: string) => {
                  switch (challengeId) {
                    case 'part1-challenge':
                      return '/challenge/stone-game';
                    case 'part2-challenge':
                      return '/challenge/mastermind';
                    case 'part3-challenge':
                      return '/challenge/two-stacks';
                    default:
                      return '/challenge';
                  }
                };
                
                const challengeUrl = getChallengeUrl(part.challenge.id);
                const isCurrentChallenge = pathname === challengeUrl;
                
                return (
                  <Link
                    href={challengeUrl}
                    className={`block p-3 rounded-lg transition-colors border-2 ${
                      challengeCompleted 
                        ? 'border-solid border-green-400 bg-green-50' 
                        : 'border-dashed border-purple-300 hover:bg-purple-50 hover:border-purple-400'
                    } ${
                      isCurrentChallenge
                        ? challengeCompleted 
                          ? 'bg-green-100 border-green-600' 
                          : 'bg-purple-50 border-purple-600'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{challengeCompleted ? '🏆' : '🎮'}</span>
                          <h4 className={`text-sm font-bold ${
                            isCurrentChallenge 
                              ? challengeCompleted ? 'text-green-900' : 'text-purple-900'
                              : challengeCompleted ? 'text-green-700' : 'text-purple-700'
                          }`}>
                            {part.challenge.title}
                          </h4>
                          {challengeCompleted && (
                            <span className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full font-medium">
                              COMPLETED
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${
                          challengeCompleted ? 'text-green-600' : 'text-purple-600'
                        }`}>
                          {part.challenge.description}
                        </p>
                      </div>
                      <div className="flex items-center ml-2">
                        {challengeCompleted ? (
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-gray-100 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Your Progress</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-800">Chapters Completed</span>
            <span className="font-medium">{isClient ? ProgressManager.getProgressStats().chaptersCompleted : 0}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-800">Challenges Completed</span>
            <span className="font-medium">{isClient ? ProgressManager.getProgressStats().challengesCompleted : 0}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-800">Exercises Solved</span>
            <span className="font-medium">{isClient ? ProgressManager.getProgressStats().exercisesCompleted : 0}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-800">Time Spent</span>
            <span className="font-medium">{isClient ? ProgressManager.getProgressStats().totalTimeSpent : 0}m</span>
          </div>
        </div>

        <Link
          href="/progress"
          className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View Detailed Progress →
        </Link>
      </div>
    </div>
  );
}