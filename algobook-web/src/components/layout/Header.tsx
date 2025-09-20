'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProgressManager, addUserSettingsListener } from '@/lib/utils/progress';
import { UserSettings } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';

export default function Header() {
  const pathname = usePathname();
  const [stats, setStats] = useState({
    chaptersCompleted: 0,
    exercisesCompleted: 0,
  });
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [showXpReimbursement, setShowXpReimbursement] = useState(false);
  const [xpReimbursementData, setXpReimbursementData] = useState<{
    totalXpAwarded: number;
    breakdown: { quizzes: number; exercises: number; chapters: number; challenges: number; sections: number; time: number; };
    details: string[];
  } | null>(null);

  useEffect(() => {
    // Check and award retroactive XP for existing progress
    const retroactiveResult = ProgressManager.ensureRetroactiveXpAwarded();
    if (retroactiveResult.wasAwarded && retroactiveResult.result) {
      console.log('🎉 Retroactive XP awarded!', retroactiveResult.result);
      if (retroactiveResult.result.totalXpAwarded > 0) {
        // Show user notification about XP reimbursement
        setXpReimbursementData(retroactiveResult.result);
        setShowXpReimbursement(true);
        console.log(`Total XP reimbursed: ${retroactiveResult.result.totalXpAwarded}`);
        console.log('Breakdown:', retroactiveResult.result.breakdown);
        console.log('Details:', retroactiveResult.result.details);
      }
    }

    setStats(ProgressManager.getProgressStats());
    setUserSettings(ProgressManager.getUserSettings());
  }, []);

  // Listen for user settings changes (XP updates)
  useEffect(() => {
    const unsubscribe = addUserSettingsListener((newSettings) => {
      setUserSettings(newSettings);
      // Also update stats when settings change
      setStats(ProgressManager.getProgressStats());
    });

    return unsubscribe;
  }, []);

  const navItems = [
    { href: '/', label: 'Home', active: pathname === '/' },
    { href: '/chapters', label: 'Chapters', active: pathname.startsWith('/chapter') },
    { href: '/challenge', label: 'Challenges', active: pathname.startsWith('/challenge') },
    { href: '/progress', label: 'Progress', active: pathname === '/progress' },
    { href: '/settings', label: 'Settings', active: pathname === '/settings' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AB</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AlgoBook</h1>
                <p className="text-xs text-gray-500">Interactive Learning</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  item.active
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            {userSettings && (
              <Link href="/settings" className="hidden md:flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Avatar avatarId={userSettings.avatar} size="lg" />
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 mb-1">{userSettings.name}</div>
                  <div className="flex flex-col items-end">
                    <div className="w-24 bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(userSettings.xp / userSettings.xpToNextLevel) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between w-24 mt-1">
                      <span className="text-xs text-blue-600 font-medium">Lv {userSettings.level}</span>
                      <span className="text-xs text-gray-500">
                        {userSettings.xp}/{userSettings.xpToNextLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Mobile User Profile */}
            {userSettings && (
              <Link href="/settings" className="md:hidden flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors">
                <Avatar avatarId={userSettings.avatar} size="md" />
                <div className="text-xs">
                  <div className="font-medium text-gray-900 mb-0.5">{userSettings.name}</div>
                  <div className="flex flex-col">
                    <div className="w-16 bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${(userSettings.xp / userSettings.xpToNextLevel) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between w-16 mt-0.5">
                      <span className="text-xs text-blue-600">Lv {userSettings.level}</span>
                      <span className="text-xs text-gray-500">
                        {userSettings.xp}/{userSettings.xpToNextLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

          </div>
        </div>
      </div>

      {/* XP Reimbursement Notification */}
      {showXpReimbursement && xpReimbursementData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">XP Reimbursement!</h2>
              <p className="text-gray-600 mb-4">
                We've awarded you XP for all your previous progress!
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="text-2xl font-bold text-blue-800 mb-2">
                  +{xpReimbursementData.totalXpAwarded} XP
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  {xpReimbursementData.breakdown.quizzes > 0 && (
                    <div>Quizzes: {xpReimbursementData.breakdown.quizzes} XP</div>
                  )}
                  {xpReimbursementData.breakdown.exercises > 0 && (
                    <div>Exercises: {xpReimbursementData.breakdown.exercises} XP</div>
                  )}
                  {xpReimbursementData.breakdown.sections > 0 && (
                    <div>Sections: {xpReimbursementData.breakdown.sections} XP</div>
                  )}
                  {xpReimbursementData.breakdown.chapters > 0 && (
                    <div>Chapters: {xpReimbursementData.breakdown.chapters} XP</div>
                  )}
                  {xpReimbursementData.breakdown.challenges > 0 && (
                    <div>Challenges: {xpReimbursementData.breakdown.challenges} XP</div>
                  )}
                  {xpReimbursementData.breakdown.time > 0 && (
                    <div>Study Time: {xpReimbursementData.breakdown.time} XP</div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                From now on, you'll earn XP automatically for completing activities and studying!
              </p>

              <button
                onClick={() => setShowXpReimbursement(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Awesome! 
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}