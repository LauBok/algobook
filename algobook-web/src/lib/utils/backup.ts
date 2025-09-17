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

  // Generate QR code for backup code
  static async generateBackupQRCode(backupCode?: string): Promise<string> {
    const code = backupCode || this.generateBackupCode();
    try {
      // Generate QR code as data URL (base64 image)
      const qrDataUrl = await QRCode.toDataURL(code, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937', // Dark gray
          light: '#ffffff' // White
        },
        errorCorrectionLevel: 'M'
      });
      return qrDataUrl;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw error;
    }
  }

  // Download QR code as image
  static async downloadQRCode(backupCode?: string): Promise<void> {
    try {
      const qrDataUrl = await this.generateBackupQRCode(backupCode);
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `algobook-backup-qr-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to download QR code:', error);
      throw error;
    }
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
    // Simple compression by removing whitespace and shortening keys
    const simplified = {
      v: backup.version,
      t: backup.timestamp,
      s: backup.userSettings,
      p: backup.userProgress
    };
    return JSON.stringify(simplified);
  }

  // Decompress backup data
  private static decompressBackupData(compressed: string): BackupData {
    const simplified = JSON.parse(compressed);
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