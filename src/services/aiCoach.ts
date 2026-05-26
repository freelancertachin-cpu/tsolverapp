import { vectorMemory } from '../lib/vectorMemory';
import { UserStats } from '../lib/storage';

export const aiCoachEngine = {
  createDailyPlan(userId: string, stats: UserStats, subject = 'Mathematics') {
    const memory = vectorMemory.summarizeForPrompt(userId, subject);
    const weakHint = memory || 'No strong weak-topic memory yet.';
    const level = Math.max(1, stats.level || 1);

    return {
      title: `Level ${level} AI Study Plan`,
      focus: subject,
      steps: [
        `10 minutes warm-up revision for ${subject}`,
        '25 minutes focused problem solving',
        '5 minutes mistake note update',
        '1 short quiz to protect streak'
      ],
      aiInsight: weakHint,
      targetXp: 120
    };
  },

  getWeeklyInsight(studyMinutes: number, accuracy: number) {
    if (studyMinutes < 120) return 'Study consistency is low. Keep a fixed daily timer first.';
    if (accuracy < 60) return 'Time is okay, but accuracy is weak. Focus on mistakes and revision.';
    return 'Good momentum. Increase medium-level practice this week.';
  }
};
