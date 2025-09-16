'use client';

import { useState, useEffect } from 'react';
import { ProgressManager } from '@/lib/utils/progress';
import { UserSettings } from '@/lib/types';

type FontSize = 'small' | 'medium' | 'large';

interface SimpleSettings {
  fontSize: FontSize;
  showLineNumbers: boolean;
  showHints: boolean;
  autoSaveProgress: boolean;
  soundEffects: boolean;
}

const DEFAULT_SETTINGS: SimpleSettings = {
  fontSize: 'medium',
  showLineNumbers: true,
  showHints: true,
  autoSaveProgress: true,
  soundEffects: false,
};

function loadSettings(): SimpleSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const stored = localStorage.getItem('algobook_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: SimpleSettings) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('algobook_settings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings:', error);
  }
}

const AVATAR_OPTIONS = [
  '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👨‍🔬', '👩‍🔬', '🧑‍🔬', '🤖',
  '🐱', '🐶', '🐺', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸',
  '🐰', '🐹', '🐭', '🐷', '🐮', '🐙', '🦄', '🐲', '🐉', '🦋',
  '🐧', '🐦', '🦅', '🦉', '🐢', '🐍', '🦎', '🐳', '🐬', '🦈'
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SimpleSettings>(DEFAULT_SETTINGS);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    
    const userProfile = ProgressManager.getUserSettings();
    setUserSettings(userProfile);
  }, []);

  const updateSetting = <K extends keyof SimpleSettings>(key: K, value: SimpleSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const updateUserSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!userSettings) return;
    
    const newUserSettings = { ...userSettings, [key]: value };
    setUserSettings(newUserSettings);
    ProgressManager.saveUserSettings(newUserSettings);
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
      setSettings(DEFAULT_SETTINGS);
      saveSettings(DEFAULT_SETTINGS);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'algobook-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        const validSettings = { ...DEFAULT_SETTINGS, ...imported };
        setSettings(validSettings);
        saveSettings(validSettings);
        alert('Settings imported successfully!');
      } catch (error) {
        alert('Error importing settings. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

            {/* Profile Settings */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile</h2>
              {userSettings && (
                <div className="space-y-6">
                  {/* Profile Preview */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{userSettings.avatar}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{userSettings.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Level {userSettings.level}
                          </span>
                          <span>{userSettings.totalXp} XP earned</span>
                        </div>
                        <div className="mt-2">
                          <div className="w-48 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(userSettings.xp / userSettings.xpToNextLevel) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {userSettings.xp} / {userSettings.xpToNextLevel} XP to level {userSettings.level + 1}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={userSettings.name}
                      onChange={(e) => updateUserSetting('name', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="Enter your display name"
                    />
                  </div>

                  {/* Avatar Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                    <div className="grid grid-cols-10 gap-2">
                      {AVATAR_OPTIONS.map((avatar) => (
                        <button
                          key={avatar}
                          onClick={() => updateUserSetting('avatar', avatar)}
                          className={`text-2xl p-2 rounded-lg border-2 transition-all hover:scale-110 ${
                            userSettings.avatar === avatar
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Appearance Settings */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', e.target.value as FontSize)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Code Editor Settings */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Code Editor</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="show-line-numbers"
                    type="checkbox"
                    checked={settings.showLineNumbers}
                    onChange={(e) => updateSetting('showLineNumbers', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="show-line-numbers" className="ml-2 block text-sm text-gray-900">
                    Show Line Numbers
                  </label>
                </div>
              </div>
            </div>

            {/* Learning Experience Settings */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Experience</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="show-hints"
                    type="checkbox"
                    checked={settings.showHints}
                    onChange={(e) => updateSetting('showHints', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="show-hints" className="ml-2 block text-sm text-gray-900">
                    Show Hints Button
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="auto-save-progress"
                    type="checkbox"
                    checked={settings.autoSaveProgress}
                    onChange={(e) => updateSetting('autoSaveProgress', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto-save-progress" className="ml-2 block text-sm text-gray-900">
                    Auto-save Progress
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="sound-effects"
                    type="checkbox"
                    checked={settings.soundEffects}
                    onChange={(e) => updateSetting('soundEffects', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sound-effects" className="ml-2 block text-sm text-gray-900">
                    Sound Effects
                  </label>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Management</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={exportSettings}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Export Settings
                  </button>

                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importSettings}
                      className="hidden"
                      id="import-settings"
                    />
                    <label
                      htmlFor="import-settings"
                      className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
                    >
                      Import Settings
                    </label>
                  </div>

                  <button
                    onClick={resetToDefaults}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Reset to Defaults
                  </button>
                </div>

                <p className="text-sm text-gray-600">
                  Your settings are automatically saved in your browser's local storage.
                  Use export/import to backup or transfer settings between devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}