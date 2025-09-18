'use client';

import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useSettings } from '@/hooks/useSettings';
import { settingsManager } from '@/lib/utils/settings';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Start open by default
  const settings = useSettings();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${(() => {
      try {
        return settingsManager.getFontSizeClass();
      } catch {
        return 'text-base';
      }
    })()}`}>
      <Header />
      
      <div className="flex relative">
        {/* Toggle button for when sidebar is closed */}
        {showSidebar && !sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="
              fixed left-0 top-1/2 -translate-y-1/2 z-40
              group/btn
              transition-all duration-300 ease-in-out
            "
            aria-label="Show sidebar"
            title="Show sidebar"
          >
            {/* Simple rectangular button with rounded corners */}
            <div className="
              relative h-12 w-8 bg-gradient-to-r from-blue-50 to-blue-100
              border border-blue-200 shadow-lg
              flex items-center justify-center
              text-blue-600 group-hover/btn:text-blue-700
              group-hover/btn:from-blue-100 group-hover/btn:to-blue-200
              group-hover/btn:shadow-xl group-hover/btn:scale-105
              group-hover/btn:border-blue-300
              transition-all duration-200 ease-in-out
              rounded-r-lg animate-pulse
            ">
              {/* Three dots */}
              <div className="
                flex flex-col items-center justify-center space-y-1
              ">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-40 group-hover/btn:opacity-80 transition-opacity duration-200"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60 group-hover/btn:opacity-90 transition-opacity duration-200"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-40 group-hover/btn:opacity-80 transition-opacity duration-200"></div>
              </div>
            </div>
          </button>
        )}

        {showSidebar && sidebarOpen && (
          <div className="group sticky top-16 h-[calc(100vh-4rem)] z-30">
            <Sidebar 
              isOpen={true}
              onClose={() => setSidebarOpen(false)}
            />
            
            {/* Floating Sidebar Toggle Button - positioned relative to sidebar */}
            <button
              onClick={toggleSidebar}
              className="
                absolute top-1/2 -translate-y-1/2 right-0 z-10
                group/btn
                opacity-0 group-hover:opacity-60 hover:!opacity-100
                transition-all duration-300 ease-in-out
              "
              aria-label="Hide sidebar"
              title="Hide sidebar"
            >
              {/* Simple rectangular button with rounded corners */}
              <div className="
                relative h-12 w-8 bg-gradient-to-r from-blue-50 to-blue-100
                border border-blue-200 shadow-lg
                flex items-center justify-center
                text-blue-600 group-hover/btn:text-blue-700
                group-hover/btn:from-blue-100 group-hover/btn:to-blue-200
                group-hover/btn:shadow-xl group-hover/btn:scale-105
                group-hover/btn:border-blue-300
                transition-all duration-200 ease-in-out
                rounded-l-lg
              ">
                {/* Three dots */}
                <div className="
                  flex flex-col items-center justify-center space-y-1
                ">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-40 group-hover/btn:opacity-80 transition-opacity duration-200"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60 group-hover/btn:opacity-90 transition-opacity duration-200"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-40 group-hover/btn:opacity-80 transition-opacity duration-200"></div>
                </div>
              </div>
            </button>
          </div>
        )}
        
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}