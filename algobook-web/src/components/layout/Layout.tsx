'use client';

import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useSettings } from '@/hooks/useSettings';
import { settingsManager } from '@/lib/utils/settings';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(showSidebar);
  const settings = useSettings();

  return (
    <div className={`min-h-screen bg-gray-50 ${(() => {
      try {
        return settingsManager.getFontSizeClass();
      } catch {
        return 'text-base';
      }
    })()}`}>
      <Header />
      
      <div className="flex">
        {showSidebar && (
          <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-30">
            <Sidebar 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)} 
            />
          </div>
        )}
        
        <main className={`flex-1 min-w-0 ${showSidebar ? 'ml-80' : ''}`}>
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}