
export interface DesignBackup {
  id: string;
  timestamp: number;
  theme: string;
  layout: string;
  version: string;
  config: any;
}

const STORAGE_KEY = 'tsolver_design_backups';
const VERSION = '1.0.0';

export const designManager = {
  createBackup: (currentTheme: string) => {
    const backups = designManager.getBackups();
    const newBackup: DesignBackup = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      theme: currentTheme,
      layout: 'standard',
      version: VERSION,
      config: {
        animations: true,
        glass: true,
        neon: true
      }
    };
    
    // Keep only last 5 backups
    const updatedBackups = [newBackup, ...backups].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBackups));
    return newBackup;
  },

  getBackups: (): DesignBackup[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  restore: (backupId: string) => {
    const backups = designManager.getBackups();
    const backup = backups.find(b => b.id === backupId);
    if (backup) {
      // In a real app we'd apply state here, for now we set a flag
      localStorage.setItem('tsolver_theme', backup.theme);
      localStorage.setItem('tsolver_design_restored', 'true');
      window.location.reload();
    }
  },

  getLatest: () => {
    const backups = designManager.getBackups();
    return backups[0] || null;
  }
};
