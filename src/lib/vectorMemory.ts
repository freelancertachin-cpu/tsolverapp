import { ChatMessage, QuizAttempt } from './storage';

export interface MemoryRecord {
  id: string;
  userId: string;
  type: 'weak-topic' | 'study-habit' | 'motivation' | 'conversation' | 'preference';
  title: string;
  content: string;
  keywords: string[];
  confidence: number;
  createdAt: number;
  updatedAt: number;
}

const MEMORY_KEY = 'tsolver_vector_memory';

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);

const readMemory = (): MemoryRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]') as MemoryRecord[];
  } catch {
    return [];
  }
};

const writeMemory = (items: MemoryRecord[]) => {
  localStorage.setItem(MEMORY_KEY, JSON.stringify(items.slice(0, 500)));
  window.dispatchEvent(new CustomEvent('tsolver-memory-updated'));
};

const scoreMatch = (queryTokens: string[], record: MemoryRecord) => {
  const bag = new Set([...record.keywords, ...tokenize(`${record.title} ${record.content}`)]);
  return queryTokens.reduce((score, token) => score + (bag.has(token) ? 1 : 0), 0) * record.confidence;
};

export const vectorMemory = {
  upsert(record: Omit<MemoryRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
    const now = Date.now();
    const items = readMemory();
    const id = record.id || crypto.randomUUID();
    const next: MemoryRecord = {
      ...record,
      id,
      createdAt: items.find((item) => item.id === id)?.createdAt || now,
      updatedAt: now
    };
    writeMemory([next, ...items.filter((item) => item.id !== id)]);
    return next;
  },

  search(userId: string, query: string, limit = 5) {
    const tokens = tokenize(query);
    return readMemory()
      .filter((item) => item.userId === userId)
      .map((item) => ({ item, score: scoreMatch(tokens, item) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ item }) => item);
  },

  summarizeForPrompt(userId: string, query: string) {
    const memories = this.search(userId, query, 6);
    if (!memories.length) return '';
    return memories.map((memory) => `- ${memory.title}: ${memory.content}`).join('\n');
  },

  learnFromQuizAttempt(userId: string, attempt: QuizAttempt) {
    if (!attempt.weakTopics?.length) return;
    this.upsert({
      id: `${userId}-${attempt.subject}-weak-topics`,
      userId,
      type: 'weak-topic',
      title: `${attempt.subject} weak topics`,
      content: `Student needs revision on: ${attempt.weakTopics.join(', ')}. Last accuracy: ${Math.round(attempt.accuracy)}%.`,
      keywords: tokenize(`${attempt.subject} ${attempt.weakTopics.join(' ')}`),
      confidence: 0.9
    });
  },

  learnFromChat(message: ChatMessage) {
    if (message.sender !== 'user') return;
    const keywords = tokenize(message.text);
    if (keywords.length < 3) return;
    this.upsert({
      userId: message.userId,
      type: 'conversation',
      title: `Recent ${message.category || 'study'} question`,
      content: message.text.slice(0, 240),
      keywords,
      confidence: 0.45
    });
  },

  list(userId: string) {
    return readMemory().filter((item) => item.userId === userId).sort((a, b) => b.updatedAt - a.updatedAt);
  }
};
