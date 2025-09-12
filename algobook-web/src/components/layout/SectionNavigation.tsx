'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { SectionNavigation as SectionNavigationProps } from '@/lib/types/content';
import { ProgressManager } from '@/lib/utils/progress';

interface Props {
  navigation: SectionNavigationProps;
}

export default function SectionNavigation({ navigation }: Props) {
  const { current, previous, next, chapter } = navigation;
  const startTimeRef = useRef<number>(Date.now());
  const isVisibleRef = useRef<boolean>(true);
  const totalTimeRef = useRef<number>(0);
  const hasSavedRef = useRef<boolean>(false);

  // Save time when section changes
  const saveCurrentTime = useCallback(() => {
    // Prevent multiple saves for the same session
    if (hasSavedRef.current) {
      console.log(`🚫 Already saved for this session, skipping`);
      return;
    }

    const now = Date.now();
    const timeOnPage = now - startTimeRef.current;
    
    console.log(`⏱️ Debug: timeOnPage=${timeOnPage}ms, isVisible=${isVisibleRef.current}, totalTime=${totalTimeRef.current}ms`);
    
    if (isVisibleRef.current) {
      totalTimeRef.current += timeOnPage;
    }
    
    const sectionId = `${chapter.id}_${current.id}`;
    const totalMinutes = Math.round(totalTimeRef.current / (1000 * 60) * 10) / 10; // Convert ms to minutes, round to 0.1
    
    console.log(`💾 Debug: sectionId=${sectionId}, totalMinutes=${totalMinutes}, threshold=0.1`);
    
    if (totalMinutes > 0.1) { // Only save if > 6 seconds
      ProgressManager.addTimeSpent(sectionId, totalMinutes);
      
      console.log(`📊 Saved ${totalMinutes} minutes for section ${sectionId}`);
      
      // Store in sessionStorage so we can see it persisted
      const timestamp = new Date().toLocaleTimeString();
      sessionStorage.setItem('lastTimeSave', `${timestamp}: Saved ${totalMinutes}min for ${sectionId}`);
      
      // Mark as saved to prevent double-saving
      hasSavedRef.current = true;
    } else {
      console.log(`⏭️ Skipped save: ${totalMinutes} minutes < 0.1 minute threshold`);
    }
  }, [chapter.id, current.id]);

  // Save time immediately when navigating (before page unload)
  useEffect(() => {
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('a[href^="/chapter/"]')) {
        console.log('🔄 Navigation detected, saving time...');
        saveCurrentTime();
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, [saveCurrentTime]);

  // Track section start time and handle page visibility
  useEffect(() => {
    startTimeRef.current = Date.now();
    isVisibleRef.current = true;
    totalTimeRef.current = 0;
    hasSavedRef.current = false; // Reset save flag for new section

    // Show last time save info for verification
    const lastSave = sessionStorage.getItem('lastTimeSave');
    if (lastSave) {
      console.log(`📋 Last time save: ${lastSave}`);
    }

    // Track when page becomes visible/hidden
    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.hidden) {
        // Page became hidden - add time spent
        if (isVisibleRef.current) {
          totalTimeRef.current += now - startTimeRef.current;
        }
        isVisibleRef.current = false;
      } else {
        // Page became visible - restart timer
        startTimeRef.current = now;
        isVisibleRef.current = true;
      }
    };

    // Track when user navigates away
    const handleBeforeUnload = () => {
      const now = Date.now();
      if (isVisibleRef.current) {
        totalTimeRef.current += now - startTimeRef.current;
      }
      
      // Save the accumulated time
      const sectionId = `${chapter.id}_${current.id}`;
      const totalMinutes = Math.round(totalTimeRef.current / (1000 * 60 * 10)) / 10;
      if (totalMinutes > 0) {
        ProgressManager.addTimeSpent(sectionId, totalMinutes);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Cleanup and save time when component unmounts
      saveCurrentTime();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [current.id, chapter.id, saveCurrentTime]);

  // Save time when navigating to a different section
  useEffect(() => {
    return () => {
      // This cleanup runs when current.id changes, saving time for the previous section
      saveCurrentTime();
    };
  }, [current.id, saveCurrentTime]);

  const markSectionCompleted = () => {
    const sectionId = `${chapter.id}_${current.id}`;
    
    // Save accumulated time
    saveCurrentTime();
    
    // Mark section as completed
    ProgressManager.markSectionCompleted(sectionId);
    
    // Check if all sections in chapter are completed
    const allSectionsCompleted = chapter.sections.every(section => 
      ProgressManager.isSectionCompleted(`${chapter.id}_${section.id}`)
    );
    
    // If all sections are completed, mark chapter as completed
    if (allSectionsCompleted) {
      ProgressManager.markChapterCompleted(chapter.id);
    }
    
    // Trigger page refresh to update UI
    window.location.reload();
  };

  return (
    <div className="border-t border-gray-200 pt-8 mt-8">
      {/* Mark as Complete Button */}
      <div className="text-center mb-8">
        <button
          onClick={markSectionCompleted}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Mark Section Complete
        </button>
      </div>

      {/* Navigation Arrows */}
      <div className="flex justify-between items-center">
        <div className="flex-1">
          {previous && (
            <Link
              href={`/chapter/${previous.chapterId}/section/${previous.sectionId}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="text-left">
                <div className="text-sm text-gray-500">Previous</div>
                <div className="truncate max-w-xs">{previous.title}</div>
              </div>
            </Link>
          )}
        </div>

        {/* Chapter Overview */}
        <div className="text-center px-4">
          <Link
            href={`/chapter/${chapter.id}`}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            ← Back to Chapter Overview
          </Link>
        </div>

        <div className="flex-1 text-right">
          {next && (
            <Link
              href={`/chapter/${next.chapterId}/section/${next.sectionId}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium group"
            >
              <div className="text-right">
                <div className="text-sm text-gray-500">Next</div>
                <div className="truncate max-w-xs">{next.title}</div>
              </div>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Progress through chapter */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Chapter Progress</h4>
        <div className="grid gap-2">
          {chapter.sections.map((section) => {
            const isCompleted = ProgressManager.isSectionCompleted(`${chapter.id}_${section.id}`);
            const isCurrent = section.id === current.id;
            
            return (
              <Link
                key={section.id}
                href={`/chapter/${chapter.id}/section/${section.id}`}
                className={`flex items-center gap-3 p-2 rounded text-sm transition-colors ${
                  isCurrent
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : isCompleted
                    ? 'text-green-700 hover:bg-green-50'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCurrent
                    ? 'bg-blue-600 text-white'
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {isCompleted ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    section.id
                  )}
                </div>
                <span className={isCurrent ? 'font-medium' : ''}>
                  {section.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}