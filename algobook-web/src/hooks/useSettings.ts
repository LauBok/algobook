import { useState, useEffect } from 'react';
import { AlgoBookSettings, DEFAULT_SETTINGS } from '@/lib/utils/settings';

export function useSettings() {
  const [settings, setSettings] = useState<AlgoBookSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const { settingsManager } = await import('@/lib/utils/settings');
        setSettings(settingsManager.getSettings());
        
        const unsubscribe = settingsManager.subscribe((newSettings) => {
          setSettings(newSettings);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Failed to initialize settings hook:', error);
      }
    };

    let cleanup: (() => void) | undefined;
    
    initializeSettings().then((unsubscribe) => {
      cleanup = unsubscribe;
    });
    
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return settings;
}