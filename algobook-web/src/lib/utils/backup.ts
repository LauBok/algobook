// Progress backup and restore utilities
import { ProgressManager } from './progress';
import { UserProgress, UserSettings } from '@/lib/types';
import QRCode from 'qrcode';

export interface BackupData {
  version: string;
  timestamp: string;
  userSettings: UserSettings;
  userProgress: UserProgress;
  metadata: {
    deviceInfo: string;
    exportedAt: string;
  };
}

export class BackupManager {
  private static BACKUP_VERSION = '1.0.0';
  private static ENCRYPTION_KEY = 'AlgoBook2024Learning'; // Simple key for obfuscation
  
  // Create a complete backup of user data
  static createBackup(): BackupData {
    const userSettings = ProgressManager.getUserSettings();
    const userProgress = ProgressManager.getUserProgress();
    const timestamp = new Date().toISOString();
    
    return {
      version: this.BACKUP_VERSION,
      timestamp,
      userSettings,
      userProgress,
      metadata: {
        deviceInfo: this.getDeviceInfo(),
        exportedAt: timestamp,
      }
    };
  }

  // Generate a shareable backup code (compressed)
  static generateBackupCode(): string {
    const backup = this.createBackup();
    const compressed = this.compressBackupData(backup);
    return this.encodeToAlphanumeric(compressed);
  }

  // Restore from backup code
  static restoreFromBackupCode(backupCode: string): boolean {
    try {
      const compressed = this.decodeFromAlphanumeric(backupCode);
      const backup = this.decompressBackupData(compressed);
      return this.restoreFromBackup(backup);
    } catch (error) {
      console.error('Failed to restore from backup code:', error);
      return false;
    }
  }

  // Download backup code as text file
  static downloadBackupCode(): string {
    const backupCode = this.generateBackupCode();
    const dataBlob = new Blob([backupCode], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `algobook-backup-code-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    
    URL.revokeObjectURL(url);
    return backupCode;
  }

  // Check if backup code is small enough for QR code
  static isQRCodeCompatible(backupCode?: string): boolean {
    const code = backupCode || this.generateBackupCode();
    // QR codes can handle up to ~2953 characters with error correction level M
    return code.length <= 2500; // Leave some safety margin
  }

  // Generate QR code for backup code (only if size allows)
  static async generateBackupQRCode(backupCode?: string): Promise<string> {
    const code = backupCode || this.generateBackupCode();
    
    if (!this.isQRCodeCompatible(code)) {
      throw new Error('Backup data too large for QR code. Please use text file download instead.');
    }
    
    try {
      // Generate QR code as data URL (base64 image)
      const qrDataUrl = await QRCode.toDataURL(code, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937', // Dark gray
          light: '#ffffff' // White
        },
        errorCorrectionLevel: 'L' // Lower error correction for more data capacity
      });
      return qrDataUrl;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw error;
    }
  }

  // Generate compact backup code (essentials only)
  static generateCompactBackupCode(): string {
    const backup = this.createBackup();
    
    // Create ultra-compressed version for QR codes
    const compact = {
      v: backup.version,
      s: {
        l: backup.userSettings.level,
        x: backup.userSettings.totalXp
      },
      p: {
        c: backup.userProgress.chaptersCompleted,
        ch: backup.userProgress.challengesCompleted || []
      }
    };
    
    const compressed = JSON.stringify(compact);
    return this.encodeToAlphanumeric(compressed);
  }

  // Restore from compact backup (limited data)
  static restoreFromCompactBackup(compactCode: string): boolean {
    try {
      const compressed = this.decodeFromAlphanumeric(compactCode);
      const compact = JSON.parse(compressed);
      
      // Restore essential progress
      const currentProgress = ProgressManager.getUserProgress();
      const currentSettings = ProgressManager.getUserSettings();
      
      // Merge chapters and challenges
      const newChapters = [...new Set([...currentProgress.chaptersCompleted, ...(compact.p.c || [])])];
      const newChallenges = [...new Set([...currentProgress.challengesCompleted, ...(compact.p.ch || [])])];
      
      // Update progress
      ProgressManager.saveUserProgress({
        ...currentProgress,
        chaptersCompleted: newChapters,
        challengesCompleted: newChallenges
      });
      
      // Update settings if higher level/XP
      if (compact.s.l > currentSettings.level || compact.s.x > currentSettings.totalXp) {
        ProgressManager.saveUserSettings({
          ...currentSettings,
          level: Math.max(currentSettings.level, compact.s.l),
          totalXp: Math.max(currentSettings.totalXp, compact.s.x)
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to restore from compact backup:', error);
      return false;
    }
  }

  // Download QR code as image (with fallback options)
  static async downloadQRCode(backupCode?: string): Promise<{ success: boolean; useCompact?: boolean; error?: string }> {
    try {
      const fullCode = backupCode || this.generateBackupCode();
      
      // Try full backup first
      if (this.isQRCodeCompatible(fullCode)) {
        const qrDataUrl = await this.generateBackupQRCode(fullCode);
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = `algobook-backup-qr-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
        return { success: true };
      }
      
      // Fall back to compact backup
      const compactCode = this.generateCompactBackupCode();
      if (this.isQRCodeCompatible(compactCode)) {
        const qrDataUrl = await this.generateBackupQRCode(compactCode);
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = `algobook-compact-backup-qr-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
        return { success: true, useCompact: true };
      }
      
      // Even compact version is too large
      return { 
        success: false, 
        error: 'Progress data too large for QR code. Please use text file download instead.' 
      };
      
    } catch (error) {
      console.error('Failed to download QR code:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate QR code' 
      };
    }
  }

  // Get backup options based on data size
  static getBackupOptions(): {
    canUseFullQR: boolean;
    canUseCompactQR: boolean;
    fullCodeSize: number;
    compactCodeSize: number;
  } {
    const fullCode = this.generateBackupCode();
    const compactCode = this.generateCompactBackupCode();
    
    return {
      canUseFullQR: this.isQRCodeCompatible(fullCode),
      canUseCompactQR: this.isQRCodeCompatible(compactCode),
      fullCodeSize: fullCode.length,
      compactCodeSize: compactCode.length
    };
  }

  // Restore from uploaded backup code file
  static async restoreFromFile(file: File): Promise<boolean> {
    try {
      const backupCode = await file.text();
      return this.restoreFromBackupCode(backupCode.trim());
    } catch (error) {
      console.error('Failed to restore from file:', error);
      return false;
    }
  }

  // Restore from backup data
  private static restoreFromBackup(backup: BackupData): boolean {
    try {
      // Validate backup version
      if (!this.isCompatibleVersion(backup.version)) {
        throw new Error(`Incompatible backup version: ${backup.version}`);
      }

      // Restore user settings
      if (backup.userSettings) {
        ProgressManager.saveUserSettings(backup.userSettings);
      }

      // Restore progress data
      if (backup.userProgress) {
        ProgressManager.saveUserProgress(backup.userProgress);
      }

      return true;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return false;
    }
  }

  // Compress backup data for sharing
  private static compressBackupData(backup: BackupData): string {
    // Aggressive compression by shortening keys and removing unnecessary data
    const simplified = {
      v: backup.version,
      t: backup.timestamp,
      s: {
        // Only essential user settings
        n: backup.userSettings.name,
        a: backup.userSettings.avatar,
        l: backup.userSettings.level,
        x: backup.userSettings.xp,
        tx: backup.userSettings.totalXp,
        xn: backup.userSettings.xpToNextLevel
      },
      p: {
        // Compressed progress data
        c: backup.userProgress.chaptersCompleted,
        s: backup.userProgress.sectionsCompleted,
        e: this.compressExercises(backup.userProgress.exercisesCompleted),
        q: this.compressQuizzes(backup.userProgress.quizzesCompleted),
        ch: backup.userProgress.challengesCompleted || [],
        t: this.compressTimeSpent(backup.userProgress.timeSpent)
      }
    };
    return JSON.stringify(simplified);
  }

  // Compress exercises data (only keep completed ones)
  private static compressExercises(exercises: Record<string, any>): Record<string, any> {
    const compressed: Record<string, any> = {};
    Object.entries(exercises).forEach(([id, data]) => {
      if (data.completed) {
        compressed[id] = {
          c: 1, // completed
          s: data.bestScore || 100, // score
          a: data.attempts || 1 // attempts
        };
      }
    });
    return compressed;
  }

  // Compress quizzes data (only keep completed ones)
  private static compressQuizzes(quizzes: Record<string, any>): Record<string, any> {
    const compressed: Record<string, any> = {};
    Object.entries(quizzes).forEach(([id, data]) => {
      if (data.completed) {
        compressed[id] = {
          c: 1, // completed
          s: data.score || 100, // score
          a: data.attempts || 1 // attempts
        };
      }
    });
    return compressed;
  }

  // Compress time spent (round to minutes)
  private static compressTimeSpent(timeSpent: Record<string, number>): Record<string, number> {
    const compressed: Record<string, number> = {};
    Object.entries(timeSpent).forEach(([id, time]) => {
      if (time > 0.1) {
        compressed[id] = Math.round(time * 10) / 10; // Round to 0.1 minute
      }
    });
    return compressed;
  }

  // Decompress backup data
  private static decompressBackupData(compressed: string): BackupData {
    const simplified = JSON.parse(compressed);
    
    // Handle both old and new format
    if (simplified.s && typeof simplified.s === 'object' && 'n' in simplified.s) {
      // New compressed format
      return {
        version: simplified.v,
        timestamp: simplified.t,
        userSettings: {
          userId: 'local-user',
          name: simplified.s.n,
          avatar: simplified.s.a,
          level: simplified.s.l,
          xp: simplified.s.x,
          totalXp: simplified.s.tx,
          xpToNextLevel: simplified.s.xn,
          createdAt: simplified.t,
          lastActive: simplified.t
        },
        userProgress: {
          chaptersCompleted: simplified.p.c || [],
          sectionsCompleted: simplified.p.s || [],
          exercisesCompleted: this.decompressExercises(simplified.p.e || {}),
          quizzesCompleted: this.decompressQuizzes(simplified.p.q || {}),
          challengesCompleted: simplified.p.ch || [],
          timeSpent: simplified.p.t || {}
        },
        metadata: {
          deviceInfo: 'Restored from backup code',
          exportedAt: simplified.t
        }
      };
    } else {
      // Old format (backwards compatibility)
      return {
        version: simplified.v,
        timestamp: simplified.t,
        userSettings: simplified.s,
        userProgress: simplified.p,
        metadata: {
          deviceInfo: 'Restored from backup code',
          exportedAt: simplified.t
        }
      };
    }
  }

  // Decompress exercises data
  private static decompressExercises(compressed: Record<string, any>): Record<string, any> {
    const exercises: Record<string, any> = {};
    Object.entries(compressed).forEach(([id, data]) => {
      exercises[id] = {
        completed: !!data.c,
        bestScore: data.s || 100,
        attempts: data.a || 1,
        timeSpent: 0,
        lastAttempt: new Date().toISOString()
      };
    });
    return exercises;
  }

  // Decompress quizzes data
  private static decompressQuizzes(compressed: Record<string, any>): Record<string, any> {
    const quizzes: Record<string, any> = {};
    Object.entries(compressed).forEach(([id, data]) => {
      quizzes[id] = {
        completed: !!data.c,
        score: data.s || 100,
        attempts: data.a || 1,
        lastAttempt: new Date().toISOString()
      };
    });
    return quizzes;
  }

  // Encode to alphanumeric string (Base36)
  private static encodeToAlphanumeric(data: string): string {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(data);
    
    // Convert bytes to base36 string
    let result = '';
    for (let i = 0; i < bytes.length; i += 2) {
      const value = bytes[i] + (bytes[i + 1] || 0) * 256;
      result += value.toString(36).padStart(3, '0');
    }
    
    return result.toUpperCase();
  }

  // Decode from alphanumeric string
  private static decodeFromAlphanumeric(encoded: string): string {
    const chunks = encoded.toLowerCase().match(/.{1,3}/g) || [];
    const bytes: number[] = [];
    
    for (const chunk of chunks) {
      const value = parseInt(chunk, 36);
      bytes.push(value % 256);
      if (Math.floor(value / 256) > 0) {
        bytes.push(Math.floor(value / 256));
      }
    }
    
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(bytes));
  }

  // Check if backup version is compatible
  private static isCompatibleVersion(version: string): boolean {
    const [major] = version.split('.');
    const [currentMajor] = this.BACKUP_VERSION.split('.');
    return major === currentMajor;
  }

  // Get device info for metadata
  private static getDeviceInfo(): string {
    return `${navigator.userAgent.split(' ')[0]} - ${new Date().toLocaleString()}`;
  }

  // Validate backup data structure
  static validateBackupData(data: any): data is BackupData {
    return (
      data &&
      typeof data.version === 'string' &&
      typeof data.timestamp === 'string' &&
      data.userSettings &&
      data.userProgress
    );
  }

  // Get backup statistics
  static getBackupStats(backup: BackupData): {
    chaptersCompleted: number;
    exercisesCompleted: number;
    level: number;
    totalXp: number;
    createdAt: string;
  } {
    return {
      chaptersCompleted: backup.userProgress.chaptersCompleted.length,
      exercisesCompleted: Object.keys(backup.userProgress.exercisesCompleted).length,
      level: backup.userSettings.level,
      totalXp: backup.userSettings.totalXp,
      createdAt: backup.userSettings.createdAt,
    };
  }
}