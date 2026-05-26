import Dexie, { Table } from 'dexie';

export interface UserProgress {
  id?: number;
  userId: string;
  subjectId: string;
  topicId: string;
  score: number;
  xp: number;
  completedAt: number;
}

export interface Note {
  id?: number;
  userId: string;
  subjectId: string;
  title: string;
  content: string;
  updatedAt: number;
  isFavorite: boolean;
}

export interface Achievement {
  id?: number;
  userId: string;
  badgeId: string;
  unlockedAt: number;
}

export class TSolverDB extends Dexie {
  progress!: Table<UserProgress>;
  notes!: Table<Note>;
  achievements!: Table<Achievement>;

  constructor() {
    super('TSolverDB');
    this.version(1).stores({
      progress: '++id, userId, subjectId, topicId',
      notes: '++id, userId, subjectId, title, isFavorite',
      achievements: '++id, userId, badgeId'
    });
  }
}

export const db = new TSolverDB();
