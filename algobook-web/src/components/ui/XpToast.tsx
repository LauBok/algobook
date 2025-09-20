'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { setGlobalXpToastFunction } from '@/lib/utils/progress';

interface XpNotification {
  id: string;
  amount: number;
  message: string;
  type: 'quiz' | 'exercise' | 'section' | 'chapter' | 'challenge' | 'time';
}

interface XpToastContextType {
  showXpToast: (amount: number, type: XpNotification['type'], message?: string) => void;
}

const XpToastContext = createContext<XpToastContextType | null>(null);

export const useXpToast = () => {
  const context = useContext(XpToastContext);
  if (!context) {
    throw new Error('useXpToast must be used within XpToastProvider');
  }
  return context;
};

interface XpToastProviderProps {
  children: React.ReactNode;
}

export function XpToastProvider({ children }: XpToastProviderProps) {
  const [notifications, setNotifications] = useState<XpNotification[]>([]);

  const showXpToast = useCallback((amount: number, type: XpNotification['type'], message?: string) => {
    const id = Date.now().toString();
    const defaultMessages = {
      quiz: 'Quiz completed!',
      exercise: 'Exercise solved!',
      section: 'Section completed!',
      chapter: 'Chapter completed!',
      challenge: 'Challenge completed!',
      time: 'Study time rewarded!'
    };

    const notification: XpNotification = {
      id,
      amount,
      type,
      message: message || defaultMessages[type]
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // Set up the global toast function
  useEffect(() => {
    setGlobalXpToastFunction(showXpToast);
    return () => setGlobalXpToastFunction(null);
  }, [showXpToast]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <XpToastContext.Provider value={{ showXpToast }}>
      {children}
      <XpToastContainer notifications={notifications} onRemove={removeNotification} />
    </XpToastContext.Provider>
  );
}

interface XpToastContainerProps {
  notifications: XpNotification[];
  onRemove: (id: string) => void;
}

function XpToastContainer({ notifications, onRemove }: XpToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <XpToastItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

interface XpToastItemProps {
  notification: XpNotification;
  onRemove: (id: string) => void;
}

function XpToastItem({ notification, onRemove }: XpToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Start exit animation before removal
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onRemove(notification.id), 300);
    }, 2700); // Start exit 300ms before removal

    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  const getIcon = () => {
    switch (notification.type) {
      case 'quiz':
        return '📝';
      case 'exercise':
        return '💻';
      case 'section':
        return '📖';
      case 'chapter':
        return '🎓';
      case 'challenge':
        return '🏆';
      case 'time':
        return '⏰';
      default:
        return '⭐';
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'quiz':
        return 'bg-blue-500 border-blue-400';
      case 'exercise':
        return 'bg-green-500 border-green-400';
      case 'section':
        return 'bg-purple-500 border-purple-400';
      case 'chapter':
        return 'bg-orange-500 border-orange-400';
      case 'challenge':
        return 'bg-yellow-500 border-yellow-400';
      case 'time':
        return 'bg-gray-500 border-gray-400';
      default:
        return 'bg-blue-500 border-blue-400';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'scale-95' : 'scale-100'}
        border-2 rounded-lg shadow-lg p-4 min-w-[280px] max-w-[320px]
        ${getColorClasses()}
      `}
      onClick={() => onRemove(notification.id)}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{getIcon()}</div>
        <div className="flex-1">
          <div className="text-white font-semibold text-sm">
            {notification.message}
          </div>
          <div className="text-white/90 text-xs mt-1">
            +{notification.amount} XP earned
          </div>
        </div>
        <div className="text-white font-bold text-lg">
          +{notification.amount}
        </div>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white/60 rounded-full transition-all duration-[2700ms] ease-linear"
          style={{ 
            width: isVisible && !isLeaving ? '0%' : '100%',
            transitionDelay: isVisible ? '0ms' : '0ms'
          }}
        />
      </div>
    </div>
  );
}