import * as tf from '@tensorflow/tfjs';
import * as math from 'mathjs';
import { storage, QuizAttempt, UserStats, SmartNote, Reminder } from './storage';

class LocalEngine {
  private model: tf.LayersModel | null = null;

  async init() {
    // For local pattern recognition, we can use a simple model or heuristic logic
    // Request specifically mentioned TensorFlow.js
    try {
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ units: 16, activation: 'relu', inputShape: [5] }),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 3, activation: 'softmax' })
        ]
      });
      this.model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy' });
    } catch (e) {
      console.warn("TF.js Model Init Failed, using Heuristic Engine", e);
    }
  }

  // --- QUIZ ANALYTICS ---
  async analyzeQuizPerformance(userId: string) {
    const attempts = await storage.getQuizAttempts(userId);
    const sessions = await storage.getGameSessions(userId);
    
    if (attempts.length === 0 && sessions.length === 0) return null;

    const subjectStats: Record<string, { total: number, score: number, time: number, mistakes: number }> = {};
    let totalScore = 0;
    let totalQuestions = 0;
    let totalTime = 0;

    attempts.forEach(a => {
      if (!subjectStats[a.subject]) {
        subjectStats[a.subject] = { total: 0, score: 0, time: 0, mistakes: 0 };
      }
      subjectStats[a.subject].total++;
      subjectStats[a.subject].score += a.score;
      subjectStats[a.subject].time += a.timeSpent;
      subjectStats[a.subject].mistakes += a.mistakes.length;
      totalScore += a.score;
      totalQuestions += a.totalQuestions;
      totalTime += a.timeSpent;
    });

    const heatmap = await this.getPerformanceHeatmap(userId);

    const weakSubjects = Object.entries(subjectStats)
      .sort((a, b) => (a[1].score / a[1].total) - (b[1].score / b[1].total))
      .map(entry => entry[0]);

    const slowSubjects = Object.entries(subjectStats)
      .sort((a, b) => (b[1].time / b[1].total) - (a[1].time / a[1].total))
      .map(entry => entry[0]);

    return {
      weakSubjects: weakSubjects.slice(0, 2),
      strongSubjects: weakSubjects.slice(-2).reverse(),
      slowSubjects: slowSubjects.slice(0, 2),
      overallAccuracy: totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0,
      totalAttempts: attempts.length + sessions.length,
      history: attempts.slice(-10),
      heatmap
    };
  }

  // --- GAMIFICATION ---
  async awardXP(userId: string, amount: number, reason: string) {
    const stats = await storage.getStats(userId);
    stats.xp += amount;
    
    // Check level up
    const nextLevelXP = stats.level * 1000;
    if (stats.xp >= nextLevelXP) {
      stats.level++;
      // Could trigger a level up event or return it
    }

    // Check streak
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    if (now - stats.lastActive < dayInMs * 2 && now - stats.lastActive > dayInMs) {
      stats.streak++;
    } else if (now - stats.lastActive > dayInMs * 2) {
      stats.streak = 1;
    }
    stats.lastActive = now;
    
    await storage.updateStats(stats);
    return stats;
  }

  // --- ANALYTICS & HEATMAPS ---
  async getPerformanceHeatmap(userId: string) {
    const attempts = await storage.getQuizAttempts(userId);
    const sessions = await storage.getGameSessions(userId);
    
    const heatmap: Record<string, number> = {};
    const oneDay = 24 * 60 * 60 * 1000;
    
    [...attempts, ...sessions].forEach(item => {
      const day = new Date(item.timestamp).toISOString().split('T')[0];
      heatmap[day] = (heatmap[day] || 0) + 1;
    });

    return heatmap;
  }

  // --- RECOMMENDATIONS ---
  async getStudyRecommendations(userId: string) {
    const analytics = await this.analyzeQuizPerformance(userId);
    if (!analytics) return ["Start taking quizzes to see personalized recommendations!"];

    const recommendations: string[] = [];
    if (analytics.weakSubjects.length > 0) {
      recommendations.push(`Focus on ${analytics.weakSubjects[0]} - your accuracy is lower here.`);
    }
    if (analytics.slowSubjects.length > 0) {
      recommendations.push(`Practice speed in ${analytics.slowSubjects[0]} - you spent a lot of time on these.`);
    }
    
    recommendations.push("Revise your recent mistakes in your saved notes.");
    return recommendations;
  }

  // --- SMART NOTES NLP (Local) ---
  extractKeywords(content: string): string[] {
    // Simple heuristic keyword extraction
    const words = content.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'it', 'this', 'that']);
    const frequency: Record<string, number> = {};
    
    words.forEach(w => {
      if (w.length > 3 && !stopWords.has(w)) {
        frequency[w] = (frequency[w] || 0) + 1;
      }
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(e => e[0]);
  }

  summarize(content: string): string {
    // Heuristic summarization: take first 2-3 sentences
    const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
    return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '...' : '');
  }
}

export const localEngine = new LocalEngine();
