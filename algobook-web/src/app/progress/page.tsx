'use client';

import { useState, useEffect } from 'react';
import { ProgressManager } from '@/lib/utils/progress';
import { UserProgress } from '@/lib/types';
import { CHAPTER_METADATA } from '@/lib/data/chapterMetadata';

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  
  const [stats, setStats] = useState<{
    chaptersCompleted: number;
    sectionsCompleted: number;
    exercisesCompleted: number;
    quizzesCompleted: number;
    challengesCompleted: number;
    totalTimeSpent: number;
    averageQuizScore: number;
    totalExerciseAttempts: number;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState<string | null>(null);

  // Helper function to get chapter title from metadata
  const getChapterTitle = (chapterId: string): string => {
    const chapter = CHAPTER_METADATA[chapterId];
    if (chapter) {
      return `Chapter ${chapter.order}: ${chapter.title}`;
    }
    // Fallback for chapters not in metadata
    return `Chapter ${chapterId}`;
  };

  useEffect(() => {
    // Load progress data and clean up duplicate/old challenge IDs
    const userProgress = ProgressManager.getUserProgress();
    
    // Clean up old challenge IDs and duplicates
    if (userProgress.challengesCompleted.length > 0) {
      const cleanedChallenges = Array.from(new Set(
        userProgress.challengesCompleted
          .filter(id => id !== 'part2-mastermind-challenge') // Remove old ID
          .map(id => {
            // Normalize any other old IDs that might exist
            if (id === 'part2-mastermind-challenge') return 'part2-challenge';
            return id;
          })
      ));
      
      if (cleanedChallenges.length !== userProgress.challengesCompleted.length) {
        // Update progress if we found duplicates or old IDs
        const cleanedProgress = { ...userProgress, challengesCompleted: cleanedChallenges };
        ProgressManager.saveUserProgress(cleanedProgress);
        setProgress(cleanedProgress);
      } else {
        setProgress(userProgress);
      }
    } else {
      setProgress(userProgress);
    }
    
    const progressStats = ProgressManager.getProgressStats();
    setStats(progressStats);
  }, []);

  const handleReset = (type: string) => {
    if (confirmReset !== type) {
      setConfirmReset(type);
      return;
    }

    switch (type) {
      case 'all':
        ProgressManager.resetAllProgress();
        break;
      case 'exercises':
        ProgressManager.resetExercises();
        break;
      case 'quizzes':
        ProgressManager.resetQuizzes();
        break;
      case 'challenges':
        ProgressManager.resetChallenges();
        break;
    }

    // Reload progress data
    const userProgress = ProgressManager.getUserProgress();
    const progressStats = ProgressManager.getProgressStats();
    setProgress(userProgress);
    setStats(progressStats);
    setConfirmReset(null);
  };

  const resetChapter = (chapterId: string) => {
    ProgressManager.resetChapter(chapterId);
    // Reload progress data
    const userProgress = ProgressManager.getUserProgress();
    const progressStats = ProgressManager.getProgressStats();
    setProgress(userProgress);
    setStats(progressStats);
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (!progress || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading progress...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Learning Progress</h1>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.chaptersCompleted}</div>
                <div className="text-sm text-blue-600">Chapters Completed</div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.sectionsCompleted}</div>
                <div className="text-sm text-green-600">Sections Completed</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.exercisesCompleted}</div>
                <div className="text-sm text-purple-600">Exercises Completed</div>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.quizzesCompleted}</div>
                <div className="text-sm text-orange-600">Quizzes Completed</div>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.challengesCompleted}</div>
                <div className="text-sm text-yellow-600">Challenges Completed</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-xl font-bold text-gray-900">{formatTime(stats.totalTimeSpent)}</div>
                <div className="text-sm text-gray-600">Total Time Spent</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-xl font-bold text-gray-900">{stats.averageQuizScore}%</div>
                <div className="text-sm text-gray-600">Average Quiz Score</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-xl font-bold text-gray-900">{stats.totalExerciseAttempts}</div>
                <div className="text-sm text-gray-600">Total Exercise Attempts</div>
              </div>
            </div>

            {/* Completed Chapters */}
            {progress.chaptersCompleted.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Chapters</h2>
                <div className="space-y-2">
                  {progress.chaptersCompleted
                    .sort((a, b) => {
                      // Extract chapter numbers and sort numerically
                      const getChapterNum = (id: string) => {
                        const match = id.match(/^(\d+)-/);
                        return match ? parseInt(match[1], 10) : 999;
                      };
                      return getChapterNum(a) - getChapterNum(b);
                    })
                    .map((chapterId) => (
                    <div key={chapterId} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                      <span className="text-green-800">{getChapterTitle(chapterId)}</span>
                      <button
                        onClick={() => resetChapter(chapterId)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Reset Chapter
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Challenges */}
            {progress.challengesCompleted && progress.challengesCompleted.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Challenges</h2>
                <div className="space-y-2">
                  {progress.challengesCompleted.map((challengeId) => (
                    <div key={challengeId} className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏆</span>
                        <span className="text-yellow-800">
                          {challengeId === 'part1-challenge' 
                            ? 'Part I Challenge: Stone Game' 
                            : challengeId === 'part2-challenge'
                            ? 'Part II Challenge: Mastermind'
                            : challengeId}
                        </span>
                      </div>
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-medium">
                        MASTERED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reset Options */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reset Progress</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Reset All Progress</div>
                    <div className="text-sm text-gray-600">
                      This will permanently delete all your progress, including chapters, sections, exercises, quizzes, and challenges.
                    </div>
                  </div>
                  <button
                    onClick={() => handleReset('all')}
                    className={`px-4 py-2 rounded transition-colors ${
                      confirmReset === 'all'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {confirmReset === 'all' ? 'Confirm Reset All' : 'Reset All'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Reset Exercise Progress</div>
                    <div className="text-sm text-gray-600">
                      This will reset all coding exercise progress and scores.
                    </div>
                  </div>
                  <button
                    onClick={() => handleReset('exercises')}
                    className={`px-4 py-2 rounded transition-colors ${
                      confirmReset === 'exercises'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {confirmReset === 'exercises' ? 'Confirm Reset Exercises' : 'Reset Exercises'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Reset Quiz Progress</div>
                    <div className="text-sm text-gray-600">
                      This will reset all quiz progress and scores.
                    </div>
                  </div>
                  <button
                    onClick={() => handleReset('quizzes')}
                    className={`px-4 py-2 rounded transition-colors ${
                      confirmReset === 'quizzes'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {confirmReset === 'quizzes' ? 'Confirm Reset Quizzes' : 'Reset Quizzes'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Reset Challenge Progress</div>
                    <div className="text-sm text-gray-600">
                      This will reset all completed challenges, allowing you to re-attempt them.
                    </div>
                  </div>
                  <button
                    onClick={() => handleReset('challenges')}
                    className={`px-4 py-2 rounded transition-colors ${
                      confirmReset === 'challenges'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {confirmReset === 'challenges' ? 'Confirm Reset Challenges' : 'Reset Challenges'}
                  </button>
                </div>
              </div>

              {confirmReset && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Click the button again to confirm this action. This cannot be undone.
                  </p>
                  <button
                    onClick={() => setConfirmReset(null)}
                    className="mt-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}