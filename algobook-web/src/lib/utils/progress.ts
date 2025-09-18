// Progress tracking utilities using localStorage

import { UserProgress, ExerciseProgress, QuizProgress, UserSettings, XpReward } from '@/lib/types';

// Global toast notification function (will be set by components)
let globalShowXpToast: ((amount: number, type: 'quiz' | 'exercise' | 'section' | 'chapter' | 'challenge' | 'time', message?: string) => void) | null = null;

export const setGlobalXpToastFunction = (fn: typeof globalShowXpToast) => {
  globalShowXpToast = fn;
};

const STORAGE_PREFIX = 'algobook_';

export class ProgressManager {
  private static getKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  // General progress operations
  static getUserProgress(): UserProgress {
    if (typeof window === 'undefined') {
      return this.getDefaultProgress();
    }

    try {
      const stored = localStorage.getItem(this.getKey('user_progress'));
      return stored ? JSON.parse(stored) : this.getDefaultProgress();
    } catch {
      return this.getDefaultProgress();
    }
  }

  static saveUserProgress(progress: UserProgress): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(
      this.getKey('user_progress'),
      JSON.stringify(progress)
    );
  }

  private static getDefaultProgress(): UserProgress {
    return {
      chaptersCompleted: [],
      sectionsCompleted: [],
      exercisesCompleted: {},
      quizzesCompleted: {},
      timeSpent: {},
      challengesCompleted: [],
    };
  }

  // Chapter progress
  static markChapterCompleted(chapterId: string): void {
    const progress = this.getUserProgress();
    if (!progress.chaptersCompleted.includes(chapterId)) {
      progress.chaptersCompleted.push(chapterId);
      this.saveUserProgress(progress);
    }
  }

  static isChapterCompleted(chapterId: string): boolean {
    return this.getUserProgress().chaptersCompleted.includes(chapterId);
  }

  // Section progress with XP
  static markSectionCompleted(sectionId: string): void {
    const progress = this.getUserProgress();
    if (!progress.sectionsCompleted.includes(sectionId)) {
      progress.sectionsCompleted.push(sectionId);
      this.saveUserProgress(progress);
    }
  }

  // Section completion with XP reward
  static completeSectionWithXp(sectionId: string): UserSettings {
    this.markSectionCompleted(sectionId);
    return this.awardXp({
      type: 'time', // Use 'time' type for sections since no 'section' type exists
      amount: this.getSectionXp()
    });
  }

  static isSectionCompleted(sectionId: string): boolean {
    return this.getUserProgress().sectionsCompleted.includes(sectionId);
  }

  // Challenge progress
  static markChallengeCompleted(challengeId: string): void {
    const progress = this.getUserProgress();
    if (!progress.challengesCompleted) {
      progress.challengesCompleted = [];
    }
    if (!progress.challengesCompleted.includes(challengeId)) {
      progress.challengesCompleted.push(challengeId);
      this.saveUserProgress(progress);
    }
  }

  static isChallengeCompleted(challengeId: string): boolean {
    const progress = this.getUserProgress();
    return progress.challengesCompleted?.includes(challengeId) || false;
  }

  // Exercise progress
  static updateExerciseProgress(
    exerciseId: string,
    exerciseProgress: Partial<ExerciseProgress>
  ): void {
    const progress = this.getUserProgress();
    const existing = progress.exercisesCompleted[exerciseId] || {
      completed: false,
      attempts: 0,
      bestScore: 0,
      timeSpent: 0,
      lastAttempt: new Date().toISOString(),
    };

    progress.exercisesCompleted[exerciseId] = {
      ...existing,
      ...exerciseProgress,
      lastAttempt: new Date().toISOString(),
    };

    this.saveUserProgress(progress);
  }

  static getExerciseProgress(exerciseId: string): ExerciseProgress | null {
    return this.getUserProgress().exercisesCompleted[exerciseId] || null;
  }

  // Quiz progress
  static updateQuizProgress(
    quizId: string,
    quizProgress: Partial<QuizProgress>
  ): void {
    const progress = this.getUserProgress();
    const existing = progress.quizzesCompleted[quizId] || {
      completed: false,
      score: 0,
      attempts: 0,
      lastAttempt: new Date().toISOString(),
    };

    progress.quizzesCompleted[quizId] = {
      ...existing,
      ...quizProgress,
      lastAttempt: new Date().toISOString(),
    };

    this.saveUserProgress(progress);
  }

  static getQuizProgress(quizId: string): QuizProgress | null {
    return this.getUserProgress().quizzesCompleted[quizId] || null;
  }

  // Time tracking with XP rewards
  static addTimeSpent(sectionId: string, minutes: number): void {
    const progress = this.getUserProgress();
    progress.timeSpent[sectionId] = (progress.timeSpent[sectionId] || 0) + minutes;
    this.saveUserProgress(progress);
  }

  // Award XP for time spent (separate method that can be called independently)
  static awardTimeXp(minutes: number): UserSettings {
    const xp = Math.round(minutes * this.getXpRewards().time);
    return this.awardXp({
      type: 'time',
      amount: xp
    });
  }

  // Enhanced time tracking that also awards XP
  static addTimeSpentWithXp(sectionId: string, minutes: number): UserSettings {
    // Add time to progress
    this.addTimeSpent(sectionId, minutes);
    
    // Award XP for the time spent (only if significant time > 0.1 minutes)
    if (minutes > 0.1) {
      return this.awardTimeXp(minutes);
    }
    
    return this.getUserSettings();
  }

  // Reset functions for granular control
  static resetChapter(chapterId: string): void {
    const progress = this.getUserProgress();
    
    // Remove chapter from completed
    progress.chaptersCompleted = progress.chaptersCompleted.filter(
      id => id !== chapterId
    );

    // Remove sections from this chapter
    progress.sectionsCompleted = progress.sectionsCompleted.filter(
      sectionId => !sectionId.startsWith(`${chapterId}_`)
    );

    // Remove exercises from this chapter
    Object.keys(progress.exercisesCompleted).forEach(exerciseId => {
      if (exerciseId.startsWith(`${chapterId}_`)) {
        delete progress.exercisesCompleted[exerciseId];
      }
    });

    // Remove quizzes from this chapter
    Object.keys(progress.quizzesCompleted).forEach(quizId => {
      if (quizId.startsWith(`${chapterId}_`)) {
        delete progress.quizzesCompleted[quizId];
      }
    });

    // Remove time tracking for this chapter
    Object.keys(progress.timeSpent).forEach(sectionId => {
      if (sectionId.startsWith(`${chapterId}_`)) {
        delete progress.timeSpent[sectionId];
      }
    });

    this.saveUserProgress(progress);
  }

  static resetSection(sectionId: string): void {
    const progress = this.getUserProgress();
    
    // Remove section from completed
    progress.sectionsCompleted = progress.sectionsCompleted.filter(
      id => id !== sectionId
    );

    // Remove time tracking for this section
    delete progress.timeSpent[sectionId];

    this.saveUserProgress(progress);
  }

  static resetExercises(): void {
    const progress = this.getUserProgress();
    progress.exercisesCompleted = {};
    this.saveUserProgress(progress);
  }

  static resetQuizzes(): void {
    const progress = this.getUserProgress();
    progress.quizzesCompleted = {};
    this.saveUserProgress(progress);
  }

  static resetChallenges(): void {
    const progress = this.getUserProgress();
    progress.challengesCompleted = [];
    this.saveUserProgress(progress);
  }

  static resetAllProgress(): void {
    if (typeof window === 'undefined') return;
    
    // Remove all algobook related items from localStorage
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }

  // Statistics
  static getProgressStats() {
    const progress = this.getUserProgress();
    const totalTimeSpent = Object.values(progress.timeSpent).reduce(
      (sum, time) => sum + time,
      0
    );

    return {
      chaptersCompleted: progress.chaptersCompleted.length,
      sectionsCompleted: progress.sectionsCompleted.length,
      exercisesCompleted: Object.values(progress.exercisesCompleted).filter(
        ex => ex.completed
      ).length,
      quizzesCompleted: Object.values(progress.quizzesCompleted).filter(
        quiz => quiz.completed
      ).length,
      challengesCompleted: progress.challengesCompleted?.length || 0,
      totalTimeSpent: Math.round(totalTimeSpent),
      averageQuizScore: this.calculateAverageQuizScore(),
      totalExerciseAttempts: Object.values(progress.exercisesCompleted).reduce(
        (sum, ex) => sum + ex.attempts,
        0
      ),
    };
  }

  private static calculateAverageQuizScore(): number {
    const progress = this.getUserProgress();
    const completedQuizzes = Object.values(progress.quizzesCompleted).filter(
      quiz => quiz.completed
    );

    if (completedQuizzes.length === 0) return 0;

    const totalScore = completedQuizzes.reduce(
      (sum, quiz) => sum + quiz.score,
      0
    );

    return Math.round(totalScore / completedQuizzes.length);
  }

  // User Settings Management
  static getUserSettings(): UserSettings {
    if (typeof window === 'undefined') {
      return this.getDefaultSettings();
    }

    try {
      const stored = localStorage.getItem(this.getKey('user_settings'));
      return stored ? JSON.parse(stored) : this.getDefaultSettings();
    } catch {
      return this.getDefaultSettings();
    }
  }

  static saveUserSettings(settings: UserSettings): void {
    if (typeof window === 'undefined') return;
    
    settings.lastActive = new Date().toISOString();
    localStorage.setItem(
      this.getKey('user_settings'),
      JSON.stringify(settings)
    );
  }

  private static getDefaultSettings(): UserSettings {
    const now = new Date().toISOString();
    return {
      userId: 'local-user', // For local storage, we use a default ID
      name: 'Algorithm Explorer',
      avatar: 'developer',
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      totalXp: 0,
      createdAt: now,
      lastActive: now,
    };
  }

  // XP and Level System
  static awardXp(reward: XpReward, showToast: boolean = true): UserSettings {
    const settings = this.getUserSettings();
    const baseAmount = reward.amount * (reward.multiplier || 1);
    
    settings.xp += baseAmount;
    settings.totalXp += baseAmount;

    // Level up logic
    let leveledUp = false;
    while (settings.xp >= settings.xpToNextLevel) {
      settings.xp -= settings.xpToNextLevel;
      settings.level++;
      settings.xpToNextLevel = this.calculateXpForNextLevel(settings.level);
      leveledUp = true;
    }

    this.saveUserSettings(settings);
    
    // Show toast notification if enabled and function is available
    if (showToast && globalShowXpToast) {
      if (leveledUp) {
        globalShowXpToast(baseAmount, reward.type, `Level up! Now level ${settings.level}`);
      } else {
        globalShowXpToast(baseAmount, reward.type);
      }
    }
    
    return settings;
  }

  private static calculateXpForNextLevel(currentLevel: number): number {
    // Progressive XP requirement: base 100, increases by 50 per level
    return 100 + (currentLevel - 1) * 50;
  }

  static getXpRewards(): Record<XpReward['type'], number> {
    return {
      exercise: 20, // 20 XP only if all test cases pass
      quiz: 5, // 5 XP for completion, regardless of score
      chapter: 50, // 50 XP for completing all sections in a chapter
      challenge: 150, // Base challenge reward (part1-challenge)
      time: 0.2, // 1 XP per 5 minutes (0.2 XP per minute)
    };
  }

  // Get challenge-specific XP rewards
  static getChallengeXp(challengeId: string): number {
    switch (challengeId) {
      case 'part1-challenge':
        return 150;
      case 'part2-challenge':
        return 250;
      case 'part3-challenge':
        return this.getXpRewards().challenge; // Default to base if more challenges added
      default:
        return this.getXpRewards().challenge;
    }
  }

  // Section completion XP (new reward type)
  static getSectionXp(): number {
    return 10; // 10 XP for completing each section
  }

  // Enhanced progress methods with XP rewards
  static completeExerciseWithXp(
    exerciseId: string,
    exerciseProgress: Partial<ExerciseProgress>,
    difficulty: 'easy' | 'medium' | 'hard' = 'easy'
  ): { progress: ExerciseProgress; settings: UserSettings } {
    this.updateExerciseProgress(exerciseId, exerciseProgress);
    
    // Only award XP if exercise is fully completed (all test cases pass)
    if (exerciseProgress.completed && exerciseProgress.bestScore === 100) {
      const settings = this.awardXp({
        type: 'exercise',
        amount: this.getXpRewards().exercise
      });
      
      return {
        progress: this.getExerciseProgress(exerciseId)!,
        settings
      };
    }

    return {
      progress: this.getExerciseProgress(exerciseId)!,
      settings: this.getUserSettings()
    };
  }

  static completeQuizWithXp(
    quizId: string,
    quizProgress: Partial<QuizProgress>
  ): { progress: QuizProgress; settings: UserSettings } {
    this.updateQuizProgress(quizId, quizProgress);
    
    if (quizProgress.completed) {
      // Award fixed 5 XP regardless of score
      const settings = this.awardXp({
        type: 'quiz',
        amount: this.getXpRewards().quiz
      });
      
      return {
        progress: this.getQuizProgress(quizId)!,
        settings
      };
    }

    return {
      progress: this.getQuizProgress(quizId)!,
      settings: this.getUserSettings()
    };
  }

  static completeChapterWithXp(chapterId: string): UserSettings {
    this.markChapterCompleted(chapterId);
    return this.awardXp({
      type: 'chapter',
      amount: this.getXpRewards().chapter
    });
  }

  static completeChallengeWithXp(challengeId: string): UserSettings {
    this.markChallengeCompleted(challengeId);
    return this.awardXp({
      type: 'challenge',
      amount: this.getChallengeXp(challengeId)
    });
  }

  // XP Reimbursement System - Calculate and award XP for existing progress
  static calculateAndAwardRetroactiveXp(): {
    totalXpAwarded: number;
    breakdown: {
      quizzes: number;
      exercises: number;
      chapters: number;
      challenges: number;
      sections: number;
      time: number;
    };
    details: string[];
  } {
    const progress = this.getUserProgress();
    const settings = this.getUserSettings();
    const rewards = this.getXpRewards();
    let totalXpAwarded = 0;
    const breakdown = { quizzes: 0, exercises: 0, chapters: 0, challenges: 0, sections: 0, time: 0 };
    const details: string[] = [];

    // Award XP for completed quizzes (5 XP each, regardless of score)
    Object.entries(progress.quizzesCompleted).forEach(([quizId, quizProgress]) => {
      if (quizProgress.completed) {
        const xp = rewards.quiz; // Fixed 5 XP
        totalXpAwarded += xp;
        breakdown.quizzes += xp;
        details.push(`Quiz ${quizId}: ${xp} XP (completed)`);
      }
    });

    // Award XP for completed exercises (20 XP only if 100% score)
    Object.entries(progress.exercisesCompleted).forEach(([exerciseId, exerciseProgress]) => {
      if (exerciseProgress.completed && exerciseProgress.bestScore === 100) {
        const xp = rewards.exercise; // Fixed 20 XP for perfect completion
        totalXpAwarded += xp;
        breakdown.exercises += xp;
        details.push(`Exercise ${exerciseId}: ${xp} XP (100% complete)`);
      }
    });

    // Award XP for completed chapters
    progress.chaptersCompleted.forEach(chapterId => {
      const xp = rewards.chapter;
      totalXpAwarded += xp;
      breakdown.chapters += xp;
      details.push(`Chapter ${chapterId}: ${xp} XP`);
    });

    // Award XP for completed sections
    progress.sectionsCompleted.forEach(sectionId => {
      const xp = this.getSectionXp();
      totalXpAwarded += xp;
      breakdown.sections += xp;
      details.push(`Section ${sectionId}: ${xp} XP`);
    });

    // Award XP for completed challenges (challenge-specific amounts)
    (progress.challengesCompleted || []).forEach(challengeId => {
      const xp = this.getChallengeXp(challengeId);
      totalXpAwarded += xp;
      breakdown.challenges += xp;
      details.push(`Challenge ${challengeId}: ${xp} XP`);
    });

    // Award XP for time spent studying
    const totalTimeSpent = Object.values(progress.timeSpent).reduce((sum, time) => sum + time, 0);
    if (totalTimeSpent > 0) {
      const timeXp = Math.round(totalTimeSpent * rewards.time);
      totalXpAwarded += timeXp;
      breakdown.time += timeXp;
      details.push(`Study time: ${timeXp} XP (${Math.round(totalTimeSpent)} minutes)`);
    }

    // Award the total XP (without toasts for bulk retroactive operation)
    if (totalXpAwarded > 0) {
      settings.xp += totalXpAwarded;
      settings.totalXp += totalXpAwarded;

      // Level up logic
      while (settings.xp >= settings.xpToNextLevel) {
        settings.xp -= settings.xpToNextLevel;
        settings.level++;
        settings.xpToNextLevel = this.calculateXpForNextLevel(settings.level);
        details.push(`🎉 Level up! Now level ${settings.level}`);
      }

      this.saveUserSettings(settings);
    }

    return {
      totalXpAwarded,
      breakdown,
      details
    };
  }

  // Check if retroactive XP has been awarded (to prevent double-awarding)
  static hasRetroactiveXpBeenAwarded(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(this.getKey('retroactive_xp_awarded')) === 'true';
  }

  // Mark retroactive XP as awarded
  static markRetroactiveXpAsAwarded(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getKey('retroactive_xp_awarded'), 'true');
  }

  // Reset retroactive XP flag (for testing new XP values)
  static resetRetroactiveXpFlag(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.getKey('retroactive_xp_awarded'));
  }

  // Auto-run retroactive XP calculation if not done yet
  static ensureRetroactiveXpAwarded(): {
    wasAwarded: boolean;
    result?: ReturnType<typeof ProgressManager.calculateAndAwardRetroactiveXp>;
  } {
    if (this.hasRetroactiveXpBeenAwarded()) {
      return { wasAwarded: false };
    }

    const result = this.calculateAndAwardRetroactiveXp();
    this.markRetroactiveXpAsAwarded();
    
    return { wasAwarded: true, result };
  }
}