'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProgressManager } from '@/lib/utils/progress';
import { UserSettings } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';

export default function Header() {
  const pathname = usePathname();
  const [stats, setStats] = useState({
    chaptersCompleted: 0,
    exercisesCompleted: 0,
  });
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    setStats(ProgressManager.getProgressStats());
    setUserSettings(ProgressManager.getUserSettings());
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
                  <div className="text-sm font-medium text-gray-900">{userSettings.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 font-medium">Level {userSettings.level}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${(userSettings.xp / userSettings.xpToNextLevel) * 100}%` }}
                      ></div>
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
                  <div className="font-medium text-gray-900">{userSettings.name}</div>
                  <div className="text-blue-600">Lv {userSettings.level}</div>
                </div>
              </Link>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}