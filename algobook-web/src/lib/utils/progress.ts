// Progress tracking utilities using localStorage

import { UserProgress, ExerciseProgress, QuizProgress, UserSettings, XpReward } from '@/lib/types';

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

  // Section progress
  static markSectionCompleted(sectionId: string): void {
    const progress = this.getUserProgress();
    if (!progress.sectionsCompleted.includes(sectionId)) {
      progress.sectionsCompleted.push(sectionId);
      this.saveUserProgress(progress);
    }
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

  // Time tracking
  static addTimeSpent(sectionId: string, minutes: number): void {
    const progress = this.getUserProgress();
    progress.timeSpent[sectionId] = (progress.timeSpent[sectionId] || 0) + minutes;
    this.saveUserProgress(progress);
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
      name: 'Algorithm Explorer',
      avatar: '👨‍💻',
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      totalXp: 0,
      createdAt: now,
      lastActive: now,
    };
  }

  // XP and Level System
  static awardXp(reward: XpReward): UserSettings {
    const settings = this.getUserSettings();
    const baseAmount = reward.amount * (reward.multiplier || 1);
    
    settings.xp += baseAmount;
    settings.totalXp += baseAmount;

    // Level up logic
    while (settings.xp >= settings.xpToNextLevel) {
      settings.xp -= settings.xpToNextLevel;
      settings.level++;
      settings.xpToNextLevel = this.calculateXpForNextLevel(settings.level);
    }

    this.saveUserSettings(settings);
    return settings;
  }

  private static calculateXpForNextLevel(currentLevel: number): number {
    // Progressive XP requirement: base 100, increases by 50 per level
    return 100 + (currentLevel - 1) * 50;
  }

  static getXpRewards(): Record<XpReward['type'], number> {
    return {
      exercise: 25,
      quiz: 15,
      chapter: 100,
      challenge: 200,
    };
  }

  // Enhanced progress methods with XP rewards
  static completeExerciseWithXp(
    exerciseId: string,
    exerciseProgress: Partial<ExerciseProgress>,
    difficulty: 'easy' | 'medium' | 'hard' = 'easy'
  ): { progress: ExerciseProgress; settings: UserSettings } {
    this.updateExerciseProgress(exerciseId, exerciseProgress);
    
    if (exerciseProgress.completed) {
      const multiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
      const settings = this.awardXp({
        type: 'exercise',
        amount: this.getXpRewards().exercise,
        multiplier
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
      const multiplier = (quizProgress.score || 0) / 100; // Scale by score percentage
      const settings = this.awardXp({
        type: 'quiz',
        amount: this.getXpRewards().quiz,
        multiplier
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
      amount: this.getXpRewards().challenge
    });
  }
}