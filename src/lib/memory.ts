export type MemoryType = 'study' | 'business' | 'chat';

export interface MemoryData {
  type: MemoryType;
  data: any;
  timestamp: number;
}

export const saveUserMemory = (type: MemoryType, data: any) => {
  try {
    const memoryStr = localStorage.getItem('tsolver-ai-memory') || '{}';
    const memory = JSON.parse(memoryStr);
    
    if (!memory[type]) memory[type] = [];
    
    memory[type].push({
      data,
      timestamp: Date.now()
    });
    
    // Keep only last 20 entries per type to save space
    if (memory[type].length > 20) {
      memory[type] = memory[type].slice(-20);
    }
    
    localStorage.setItem('tsolver-ai-memory', JSON.stringify(memory));
  } catch (error) {
    console.error('Failed to save memory:', error);
  }
};

export const getUserMemory = () => {
  try {
    const memoryStr = localStorage.getItem('tsolver-ai-memory') || '{}';
    return JSON.parse(memoryStr);
  } catch (error) {
    console.error('Failed to get memory:', error);
    return {};
  }
};
