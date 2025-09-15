'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProgressManager } from '@/lib/utils/progress';

export default function Header() {
  const pathname = usePathname();
  const [stats, setStats] = useState({
    chaptersCompleted: 0,
    exercisesCompleted: 0,
  });

  useEffect(() => {
    setStats(ProgressManager.getProgressStats());
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

          {/* Progress Indicator */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>{stats.chaptersCompleted} chapters</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>{stats.exercisesCompleted} exercises</span>
              </div>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}