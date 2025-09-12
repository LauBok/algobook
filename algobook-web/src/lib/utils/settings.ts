// Settings management utility

export interface AlgoBookSettings {
  // Appearance
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  animations: boolean;
  
  // Code Editor
  defaultLanguage: 'python' | 'javascript';
  executionMode: 'local' | 'api';
  showLineNumbers: boolean;
  autoRunCode: boolean;
  
  // Learning Experience
  showHints: boolean;
  autoSaveProgress: boolean;
  soundEffects: boolean;
  showProgressToOthers: boolean;
}

export const DEFAULT_SETTINGS: AlgoBookSettings = {
  // Appearance
  fontSize: 'medium',
  compactMode: false,
  animations: true,
  
  // Code Editor
  defaultLanguage: 'python',
  executionMode: 'local',
  showLineNumbers: true,
  autoRunCode: false,
  
  // Learning Experience
  showHints: true,
  autoSaveProgress: true,
  soundEffects: false,
  showProgressToOthers: false,
};

class SettingsManager {
  private static instance: SettingsManager;
  private settings: AlgoBookSettings;
  private listeners: Array<(settings: AlgoBookSettings) => void> = [];

  private constructor() {
    this.settings = this.loadSettings();
  }

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  private loadSettings(): AlgoBookSettings {
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS;
    }

    try {
      const stored = localStorage.getItem('algobook_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new settings
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    
    return DEFAULT_SETTINGS;
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('algobook_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }


  getSettings(): AlgoBookSettings {
    return { ...this.settings };
  }

  updateSetting<K extends keyof AlgoBookSettings>(
    key: K,
    value: AlgoBookSettings[K]
  ): void {
    this.settings[key] = value;
    this.saveSettings();
    this.notifyListeners();
  }

  updateSettings(updates: Partial<AlgoBookSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
    this.notifyListeners();
  }

  resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
    this.notifyListeners();
  }

  subscribe(listener: (settings: AlgoBookSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }

  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  importSettings(settingsJson: string): boolean {
    try {
      const imported = JSON.parse(settingsJson);
      // Validate the imported settings
      const validSettings = { ...DEFAULT_SETTINGS };
      
      Object.keys(DEFAULT_SETTINGS).forEach(key => {
        if (key in imported) {
          (validSettings as any)[key] = imported[key];
        }
      });
      
      this.settings = validSettings;
      this.saveSettings();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }

  // Helper methods for specific settings
  getFontSizeClass(): string {
    switch (this.settings.fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  }

  getEditorFontSize(): number {
    switch (this.settings.fontSize) {
      case 'small': return 12;
      case 'large': return 16;
      default: return 14;
    }
  }

  shouldShowAnimations(): boolean {
    return this.settings.animations;
  }

  getMonacoTheme(): string {
    return 'vs-light';
  }
}

export const settingsManager = SettingsManager.getInstance();