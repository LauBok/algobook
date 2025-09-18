'use client';

import { useState, useEffect } from 'react';
import { ProgressManager } from '@/lib/utils/progress';
import { UserSettings } from '@/lib/types';
import Avatar, { AVATAR_OPTIONS } from '@/components/ui/Avatar';
import { BackupManager } from '@/lib/utils/backup';
import ImageCropper from '@/components/ui/ImageCropper';

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


export default function SettingsPage() {
  const [settings, setSettings] = useState<SimpleSettings>(DEFAULT_SETTINGS);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [backupCode, setBackupCode] = useState<string>('');
  const [restoreCode, setRestoreCode] = useState<string>('');
  const [backupStatus, setBackupStatus] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showImageCropper, setShowImageCropper] = useState<boolean>(false);

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

  const generateBackupCode = async () => {
    try {
      const code = BackupManager.generateBackupCode();
      setBackupCode(code);
      
      // Also generate QR code
      const qrUrl = await BackupManager.generateBackupQRCode(code);
      setQrCodeUrl(qrUrl);
      
      setBackupStatus('Backup code and QR code generated successfully!');
    } catch (error) {
      setBackupStatus('Failed to generate backup code.');
    }
  };

  const copyBackupCode = async () => {
    if (!backupCode) return;
    
    try {
      await navigator.clipboard.writeText(backupCode);
      setBackupStatus('Backup code copied to clipboard! 📋');
      setTimeout(() => setBackupStatus(''), 3000); // Clear message after 3 seconds
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = backupCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setBackupStatus('Backup code copied to clipboard! 📋');
      setTimeout(() => setBackupStatus(''), 3000);
    }
  };

  const downloadBackup = () => {
    try {
      const code = BackupManager.downloadBackupCode();
      setBackupCode(code); // Also show the code on screen
      setBackupStatus('Backup code file downloaded successfully!');
    } catch (error) {
      setBackupStatus('Failed to download backup code.');
    }
  };

  const downloadQRCode = async () => {
    if (!backupCode) return;
    
    try {
      await BackupManager.downloadQRCode(backupCode);
      setBackupStatus('QR code downloaded successfully! 📱');
      setTimeout(() => setBackupStatus(''), 3000);
    } catch (error) {
      setBackupStatus('Failed to download QR code.');
    }
  };

  const restoreFromCode = () => {
    if (!restoreCode.trim()) {
      setBackupStatus('Please enter a backup code.');
      return;
    }

    try {
      const success = BackupManager.restoreFromBackupCode(restoreCode.trim());
      if (success) {
        // Reload user settings and progress
        const userProfile = ProgressManager.getUserSettings();
        setUserSettings(userProfile);
        setBackupStatus('Progress restored successfully!');
        setRestoreCode('');
      } else {
        setBackupStatus('Failed to restore progress. Invalid backup code.');
      }
    } catch (error) {
      setBackupStatus('Failed to restore progress. Invalid backup code.');
    }
  };

  const handleFileRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const success = await BackupManager.restoreFromFile(file);
      if (success) {
        // Reload user settings and progress
        const userProfile = ProgressManager.getUserSettings();
        setUserSettings(userProfile);
        setBackupStatus('Progress restored from file successfully!');
      } else {
        setBackupStatus('Failed to restore from file. Invalid backup file.');
      }
    } catch (error) {
      setBackupStatus('Failed to restore from file. Invalid backup file.');
    }
    
    // Reset file input
    event.target.value = '';
  };

  const handleCustomAvatarComplete = (croppedImageDataUrl: string) => {
    updateUserSetting('avatar', croppedImageDataUrl);
    setShowImageCropper(false);
  };

  const handleCustomAvatarCancel = () => {
    setShowImageCropper(false);
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
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-start gap-6">
                      <Avatar avatarId={userSettings.avatar} size="xl" />
                      <div className="flex-1 space-y-4">
                        {/* Name */}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{userSettings.name}</h3>
                        </div>
                        
                        {/* Level and Total XP */}
                        <div className="flex items-center gap-4">
                          <span className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                            Level {userSettings.level}
                          </span>
                          <span className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                            {userSettings.totalXp} XP earned
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress to Level {userSettings.level + 1}</span>
                            <span className="text-sm text-gray-600">
                              {userSettings.xp} / {userSettings.xpToNextLevel} XP
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${(userSettings.xp / userSettings.xpToNextLevel) * 100}%` }}
                            ></div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-4">Avatar</label>
                    
                    {/* Custom Avatar Option */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Custom</h4>
                      <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                        {/* Current custom avatar if set */}
                        {userSettings.avatar.startsWith('data:image/') && (
                          <button
                            onClick={() => setShowImageCropper(true)}
                            className="p-2 rounded-xl border-2 border-blue-500 bg-blue-50 shadow-md transition-all hover:scale-105"
                            title="Current custom avatar (click to change)"
                          >
                            <Avatar avatarId={userSettings.avatar} size="lg" className="mx-auto" />
                          </button>
                        )}
                        
                        {/* Upload new custom avatar button */}
                        <button
                          onClick={() => setShowImageCropper(true)}
                          className="p-2 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all hover:scale-105 flex items-center justify-center"
                          title="Upload custom avatar"
                        >
                          <div className="w-12 h-12 flex items-center justify-center text-gray-400 text-2xl">
                            📸
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Categories */}
                    {['people', 'animals', 'fantasy', 'objects'].map((category) => (
                      <div key={category} className="mb-6">
                        <h4 className="text-sm font-medium text-gray-600 mb-3 capitalize">{category}</h4>
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                          {AVATAR_OPTIONS
                            .filter(avatar => avatar.category === category)
                            .map((avatar) => (
                            <button
                              key={avatar.id}
                              onClick={() => updateUserSetting('avatar', avatar.id)}
                              className={`p-2 rounded-xl border-2 transition-all hover:scale-105 ${
                                userSettings.avatar === avatar.id
                                  ? 'border-blue-500 bg-blue-50 shadow-md'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              title={avatar.name}
                            >
                              <Avatar avatarId={avatar.id} size="lg" className="mx-auto" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
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

            {/* Progress Backup & Restore */}
            <div className="border-t pt-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🔒 Backup & Restore Progress</h2>
              <p className="text-sm text-gray-600 mb-6">
                Save your learning progress so you can recover it if you clear your browser cache or switch devices.
              </p>

              {/* Backup Section */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📤 Create Backup</h3>
                <div className="space-y-4">
                  {/* Generate Backup Code */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Generate Backup Code</div>
                      <div className="text-sm text-gray-600">
                        Create a backup code you can copy or download as a file.
                      </div>
                    </div>
                    <button
                      onClick={generateBackupCode}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      🔑 Generate Code
                    </button>
                  </div>


                  {/* Display Backup Code */}
                  {backupCode && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">Your Backup Code:</div>
                        <div className="flex gap-2">
                          <button
                            onClick={copyBackupCode}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            📋 Copy
                          </button>
                          <button
                            onClick={downloadBackup}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            📁 Download
                          </button>
                          <button
                            onClick={downloadQRCode}
                            className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                          >
                            📱 QR Code
                          </button>
                        </div>
                      </div>
                      <div 
                        className="bg-gray-100 p-3 rounded font-mono text-sm cursor-pointer hover:bg-gray-200 transition-colors max-h-20 overflow-y-auto"
                        onClick={copyBackupCode}
                        title="Click to copy to clipboard"
                        style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#9ca3af #e5e7eb'
                        }}
                      >
                        {backupCode}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        💾 Save this code somewhere safe! Click the code or copy button to copy to clipboard.
                      </div>
                      
                      {/* QR Code Display */}
                      {qrCodeUrl && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <img 
                                src={qrCodeUrl} 
                                alt="Backup QR Code" 
                                className="w-32 h-32 border border-gray-300 rounded-lg bg-white p-2"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 mb-1">📱 QR Code for Mobile</div>
                              <div className="text-sm text-gray-600 mb-3">
                                Scan this QR code with your phone or tablet to quickly transfer your backup code to another device.
                              </div>
                              <button
                                onClick={downloadQRCode}
                                className="px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                              >
                                💾 Save QR Code Image
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Restore Section */}
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📥 Restore Progress</h3>
                <div className="space-y-4">
                  {/* Restore from Code */}
                  <div>
                    <div className="font-medium text-gray-900 mb-2">Restore from Backup Code</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={restoreCode}
                        onChange={(e) => setRestoreCode(e.target.value)}
                        placeholder="Enter your backup code here..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-mono text-sm"
                      />
                      <input
                        type="file"
                        accept=".txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            file.text().then(content => {
                              setRestoreCode(content.trim());
                            });
                          }
                        }}
                        className="hidden"
                        id="upload-code-file"
                      />
                      <label
                        htmlFor="upload-code-file"
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                        title="Upload backup code file"
                      >
                        📁
                      </label>
                      <button
                        onClick={restoreFromCode}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        🔄 Restore
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Status Messages */}
              {backupStatus && (
                <div className={`p-4 rounded-lg ${
                  backupStatus.includes('successfully') || backupStatus.includes('generated')
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {backupStatus}
                </div>
              )}
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
      
      {/* Image Cropper Modal */}
      {showImageCropper && (
        <ImageCropper
          onCropComplete={handleCustomAvatarComplete}
          onCancel={handleCustomAvatarCancel}
        />
      )}
    </div>
  );
}