import { openDB, IDBPDatabase } from 'idb';
import { supabase, isFirebaseConfigured } from './supabase';

const DB_NAME = 't_solver_db';
const VERSION = 4; // Incremented for reliability and store consistency

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string; // Cleartext for local UI, Firebase handles hashing
  level: string;
  avatar?: string;
  thumbnail?: string;
  bio?: string;
  institution?: string;
  language?: string;
  isPremium?: boolean;
  preferences: {
    lang: string;
    darkMode: boolean;
  };
  joinDate: number;
  session?: {
    id: string;
    lastLogin: number;
    device: string;
    active: boolean;
    rememberMe: boolean;
  };
}

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  category: string;
  imageUrl?: string;
  imageBase64?: string;
}

export interface Assignment {
  id: string;
  userId: string;
  topic: string;
  content: string;
  timestamp: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  subject: string;
  score: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  mistakes: string[]; // question titles or ids
  timestamp: number;
  weakTopics: string[];
  accuracy: number;
}

export interface UserStats {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  lastActive: number;
  badges: string[];
  totalQuestionsSolved: number;
  coins: number;
  gameHighscores: Record<string, number>;
}

export interface GameSession {
  id: string;
  userId: string;
  gameId: string;
  score: number;
  xpEarned: number;
  duration: number; // in seconds
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timestamp: number;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  type: 'study' | 'exam' | 'revision' | 'assignment';
  time: number;
  status: 'pending' | 'completed' | 'missed';
  recurrence?: 'daily' | 'weekly';
}

export interface SmartNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  timestamp: number;
  summary?: string;
  keywords?: string[];
  extractedFormulas?: string[];
  category: string;
}

class StorageManager {
  private db: Promise<IDBPDatabase> | null = null;

  private async getDB() {
    if (this.db) return this.db;
    this.db = openDB(DB_NAME, VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('chats')) {
          const s = db.createObjectStore('chats', { keyPath: 'id' });
          s.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('assignments')) {
          const s = db.createObjectStore('assignments', { keyPath: 'id' });
          s.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('notes')) {
          const s = db.createObjectStore('notes', { keyPath: 'id' });
          s.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('scans')) {
          const s = db.createObjectStore('scans', { keyPath: 'id' });
          s.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('graphs')) {
          const s = db.createObjectStore('graphs', { keyPath: 'id' });
          s.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('quiz_attempts')) {
          const s = db.createObjectStore('quiz_attempts', { keyPath: 'id' });
          s.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('reminders')) {
          const s = db.createObjectStore('reminders', { keyPath: 'id' });
          s.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('user_stats')) {
          db.createObjectStore('user_stats', { keyPath: 'userId' });
        }
        if (!db.objectStoreNames.contains('smart_notes')) {
          const s = db.createObjectStore('smart_notes', { keyPath: 'id' });
          s.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('game_sessions')) {
          const s = db.createObjectStore('game_sessions', { keyPath: 'id' });
          s.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('payments')) {
          const s = db.createObjectStore('payments', { keyPath: 'id' });
          s.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('study_sessions')) {
           const s = db.createObjectStore('study_sessions', { keyPath: 'id' });
           s.createIndex('userId', 'userId', { unique: false });
        }
      },
    });
    return this.db;
  }

  // --- USER AUTH ---
  async signup(user: UserProfile, rememberMe: boolean = false) {
    const db = await this.getDB();
    
    // 1. Local Setup
    const session = {
      id: crypto.randomUUID(),
      lastLogin: Date.now(),
      device: this.getDeviceInfo(),
      active: true,
      rememberMe
    };
    const userWithSession = { ...user, session };
    await db.put('users', userWithSession);
    localStorage.setItem('tsolver_current_user', user.id);
    if (!rememberMe) {
      sessionStorage.setItem('tsolver_session_active', 'true');
    }

    // 2. Firebase Setup (Optional background sync)
    if (isFirebaseConfigured()) {
      try {
        if (user.email && user.password) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              name: user.name,
              level: user.level
            }
          }
        });

        if (!authError && authData.user) {
          // Sync profile to database
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            local_id: user.id,
            name: user.name,
            email: user.email,
            level: user.level,
            avatar: user.avatar,
            thumbnail: user.thumbnail,
            preferences: user.preferences,
            join_date: user.joinDate
          });
        }
      }
    } catch (err) {
      console.warn('Firebase signup sync failed:', err);
    }
    }
  }

  async login(email: string, passwordString: string, rememberMe: boolean = false) {
    // 1. Try Firebase Auth first
    if (isFirebaseConfigured()) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password: passwordString,
        });

        if (!authError && authData.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profile) {
            const user: UserProfile = {
              id: profile.local_id || profile.id,
              name: profile.name,
              email: profile.email,
              level: profile.level,
              avatar: profile.avatar,
              thumbnail: profile.thumbnail,
              preferences: profile.preferences || { lang: 'en', darkMode: true },
              joinDate: profile.join_date || Date.now(),
              bio: profile.bio,
              institution: profile.institution,
              language: profile.language,
              session: {
                id: crypto.randomUUID(),
                lastLogin: Date.now(),
                device: this.getDeviceInfo(),
                active: true,
                rememberMe
              }
            };
            
            const db = await this.getDB();
            await db.put('users', user);
            localStorage.setItem('tsolver_current_user', user.id);
            if (!rememberMe) {
              sessionStorage.setItem('tsolver_session_active', 'true');
            }

            // Sync back other data in background
            this.syncBackFromFirebase(authData.user.id, user.id);

            return user;
          }
        }
      } catch (err) {
        console.warn('Firebase login failed, trying local fallback.');
      }
    }

    // 2. Local Fallback
    const db = await this.getDB();
    const allUsers = await db.getAll('users');
    const user = allUsers.find(u => u.email === email && u.password === passwordString);
    if (user) {
      const session = {
        id: crypto.randomUUID(),
        lastLogin: Date.now(),
        device: this.getDeviceInfo(),
        active: true,
        rememberMe
      };
      const updatedUser = { ...user, session };
      await db.put('users', updatedUser);
      localStorage.setItem('tsolver_current_user', user.id);
      if (!rememberMe) {
        sessionStorage.setItem('tsolver_session_active', 'true');
      }
      return updatedUser;
    }
    return null;
  }

  async loginWithGoogle(): Promise<UserProfile> {
    if (!isFirebaseConfigured()) throw new Error('Firebase is not configured');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;

    const firebaseUser = data?.user;
    if (!firebaseUser) throw new Error('Google authentication did not return a user');

    const db = await this.getDB();
    const existing = await db.get('users', firebaseUser.id);
    const session = {
      id: crypto.randomUUID(),
      lastLogin: Date.now(),
      device: this.getDeviceInfo(),
      active: true,
      rememberMe: true
    };

    const user: UserProfile = {
      id: firebaseUser.id,
      name: existing?.name || firebaseUser.user_metadata?.full_name || firebaseUser.user_metadata?.name || 'T-Solver Student',
      email: existing?.email || firebaseUser.email || '',
      level: existing?.level || 'School',
      avatar: existing?.avatar || firebaseUser.user_metadata?.avatar_url || firebaseUser.user_metadata?.picture || undefined,
      thumbnail: existing?.thumbnail,
      bio: existing?.bio,
      institution: existing?.institution,
      language: existing?.language,
      isPremium: existing?.isPremium || false,
      preferences: existing?.preferences || { lang: localStorage.getItem('tsolver_lang') || 'bn', darkMode: true },
      joinDate: existing?.joinDate || Date.now(),
      session
    };

    await db.put('users', user);
    localStorage.setItem('tsolver_current_user', user.id);
    sessionStorage.setItem('tsolver_session_active', 'true');

    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        local_id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
        avatar: user.avatar,
        thumbnail: user.thumbnail,
        preferences: user.preferences,
        join_date: user.joinDate,
        bio: user.bio,
        institution: user.institution,
        language: user.language
      });
    } catch (syncError) {
      console.warn('Google profile sync failed:', syncError);
    }

    return user;
  }

  private getDeviceInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('Macintosh')) return 'Macbook';
    return 'Web Browser';
  }

  async getAllUsers(): Promise<UserProfile[]> {
    const db = await this.getDB();
    const localUsers = await db.getAll('users');
    let allUsers = [...localUsers];

    if (isFirebaseConfigured()) {
      try {
        const { data } = await supabase.from('profiles').select('*').order('join_date', { ascending: false });
        if (data && data.length > 0) {
           const sbUsers = data.map((p: any) => ({
              id: p.local_id || p.id,
              name: p.name,
              email: p.email,
              level: p.level,
              avatar: p.avatar,
              preferences: p.preferences || { lang: 'en', darkMode: true },
              joinDate: p.join_date ? new Date(p.join_date).getTime() : Date.now()
           })) as UserProfile[];
           
           const existingIds = new Set(allUsers.map(u => u.id));
           sbUsers.forEach(su => {
             if (!existingIds.has(su.id)) {
               allUsers.push(su);
             }
           });
        }
      } catch (e) {
        console.warn("Could not fetch from Firebase in getAllUsers", e);
      }
    }
    return allUsers.sort((a, b) => b.joinDate - a.joinDate);
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    let id: string | null = localStorage.getItem('tsolver_current_user');
    
    // If no local user, check Firebase session (e.g. after OAuth redirect)
    if (!id && isFirebaseConfigured()) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const sbUser = session?.user;
        
        if (sbUser) {
          // Try to get profile, but handle potential missing table error
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sbUser.id)
            .single();

          if (profile && !profileError) {
            const finalId = profile.local_id || profile.id;
            id = finalId;
            localStorage.setItem('tsolver_current_user', finalId);
            
            // Re-sync profile to IDB if needed
            const db = await this.getDB();
            const existing = await db.get('users', finalId);
            if (!existing) {
              const newUser: UserProfile = {
                id: finalId,
                name: profile.name || sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || 'Student',
                email: profile.email || sbUser.email || '',
                level: profile.level || 'School',
                avatar: profile.avatar || sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture,
                thumbnail: profile.thumbnail,
                preferences: profile.preferences || { lang: 'en', darkMode: true },
                joinDate: profile.join_date || Date.now(),
                session: {
                  id: crypto.randomUUID(),
                  lastLogin: Date.now(),
                  device: this.getDeviceInfo(),
                  active: true,
                  rememberMe: true
                }
              };
              await db.put('users', newUser);
            }
          } else {
            // Create new profile from OAuth data or fallback
            const finalId = sbUser.id;
            id = finalId;
            const newUser: UserProfile = {
              id: finalId,
              name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || 'Student',
              email: sbUser.email || '',
              level: 'School',
              avatar: sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || undefined,
              preferences: { lang: 'en', darkMode: true },
              joinDate: Date.now(),
              session: {
                id: crypto.randomUUID(),
                lastLogin: Date.now(),
                device: this.getDeviceInfo(),
                active: true,
                rememberMe: true
              }
            };
            const db = await this.getDB();
            await db.put('users', newUser);
            localStorage.setItem('tsolver_current_user', finalId);
            
            // Sync to Firebase profile table (ignore error if table doesn't exist)
            try {
              await supabase.from('profiles').insert({
                id: finalId,
                local_id: finalId,
                name: newUser.name,
                email: newUser.email,
                level: newUser.level,
                avatar: newUser.avatar,
                preferences: newUser.preferences,
                join_date: newUser.joinDate
              });
            } catch (e) {
              console.warn('Could not sync to profiles table:', e);
            }
          }
        }
      } catch (err) {
        console.warn('Firebase session retrieval failed:', err);
      }
    }

    if (!id) return null;
    
    // Check session active state if not remember me
    try {
      const db = await this.getDB();
      const user = await db.get('users', id as string);
      
      if (user && user.session) {
        if (!user.session.rememberMe && !sessionStorage.getItem('tsolver_session_active')) {
          return null;
        }
      }
      return user || null;
    } catch (e) {
      console.error('IDB retrieval failed:', e);
      return null;
    }
  }

  async logout() {
    const id = localStorage.getItem('tsolver_current_user');
    if (id) {
      const db = await this.getDB();
      const user = await db.get('users', id);
      if (user) {
        user.session = { ...user.session, active: false, rememberMe: false };
        await db.put('users', user);
      }
    }

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Firebase signout failed');
    }

    localStorage.removeItem('tsolver_current_user');
    sessionStorage.clear();
  }

  private async syncBackFromFirebase(sbUserId: string, localUserId: string) {
    if (!isFirebaseConfigured()) return;
    try {
      const db = await this.getDB();

      // Sync user_stats
      const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', sbUserId).single();
      if (stats) {
        await db.put('user_stats', {
          userId: localUserId,
          xp: stats.xp,
          level: stats.level,
          streak: stats.streak,
          lastActive: new Date(stats.last_active).getTime(),
          badges: stats.badges,
          totalQuestionsSolved: stats.total_questions_solved,
          coins: stats.coins,
          gameHighscores: stats.game_highscores
        });
      }

      // Sync other tables (simple bulk load for now)
      const tables = [
        { sb: 'chats', idb: 'chats' },
        { sb: 'assignments', idb: 'assignments' },
        { sb: 'smart_notes', idb: 'smart_notes' },
        { sb: 'quiz_attempts', idb: 'quiz_attempts' },
        { sb: 'reminders', idb: 'reminders' },
        { sb: 'game_sessions', idb: 'game_sessions' }
      ];

      for (const table of tables) {
        const { data } = await supabase.from(table.sb).select('*').eq('user_id', sbUserId);
        if (data) {
          const tx = db.transaction(table.idb, 'readwrite');
          for (const item of data) {
            // Map keys if needed or use as is
            const mappedItem = { ...item };
            if (mappedItem.user_id) delete mappedItem.user_id;
            if (mappedItem.local_user_id) {
              mappedItem.userId = mappedItem.local_user_id;
              delete mappedItem.local_user_id;
            }
            // Map snake_case to camelCase
            if (mappedItem.image_url) { mappedItem.imageUrl = mappedItem.image_url; delete mappedItem.image_url; }
            if (mappedItem.is_favorite) { mappedItem.isFavorite = mappedItem.is_favorite; delete mappedItem.is_favorite; }
            if (mappedItem.extracted_formulas) { mappedItem.extractedFormulas = mappedItem.extracted_formulas; delete mappedItem.extracted_formulas; }
            if (mappedItem.total_questions) { mappedItem.totalQuestions = mappedItem.total_questions; delete mappedItem.total_questions; }
            if (mappedItem.time_spent) { mappedItem.timeSpent = mappedItem.time_spent; delete mappedItem.time_spent; }
            if (mappedItem.weak_topics) { mappedItem.weakTopics = mappedItem.weak_topics; delete mappedItem.weak_topics; }
            if (mappedItem.xp_earned) { mappedItem.xpEarned = mappedItem.xp_earned; delete mappedItem.xp_earned; }
            if (mappedItem.game_id) { mappedItem.gameId = mappedItem.game_id; delete mappedItem.game_id; }
            
            // Map dates back to numbers
            if (mappedItem.timestamp && typeof mappedItem.timestamp === 'string') {
               mappedItem.timestamp = new Date(mappedItem.timestamp).getTime();
            }
            if (mappedItem.time && typeof mappedItem.time === 'string') {
               mappedItem.time = new Date(mappedItem.time).getTime();
            }
            
            await tx.store.put(mappedItem);
          }
          await tx.done;
        }
      }
    } catch (err) {
      console.warn('Sync back failed:', err);
    }
  }

  async saveUser(user: UserProfile) {
    const db = await this.getDB();
    await db.put('users', user);

    // Sync to Firebase
    if (isFirebaseConfigured()) {
      try {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          await supabase.from('profiles').upsert({
            id: sbUser.id,
            local_id: user.id,
            name: user.name,
            email: user.email,
            level: user.level,
            avatar: user.avatar,
            thumbnail: user.thumbnail,
            preferences: user.preferences,
            bio: user.bio,
            institution: user.institution,
            language: user.language
          });
        }
      } catch (err) {
        console.warn('Firebase profile sync failed:', err);
      }
    }
  }

  // --- DATA ---
  async saveChat(message: ChatMessage) {
    const db = await this.getDB();
    await db.put('chats', message);

    // Sync to Firebase
    if (isFirebaseConfigured()) {
      try {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          await supabase.from('chats').insert({
            id: message.id,
            user_id: sbUser.id,
            local_user_id: message.userId,
            text: message.text,
            sender: message.sender,
            timestamp: new Date(message.timestamp).toISOString(),
            category: message.category,
            image_url: message.imageUrl
          });
        }
      } catch (err) {
        console.warn('Firebase chat sync failed:', err);
      }
    }
  }

  async getChats(userId: string) {
    const db = await this.getDB();
    const index = db.transaction('chats').store.index('userId');
    return index.getAll(userId);
  }

  async saveAssignment(assignment: Assignment) {
    const db = await this.getDB();
    await db.put('assignments', assignment);

    // Sync to Firebase
    if (isFirebaseConfigured()) {
      try {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          await supabase.from('assignments').insert({
            id: assignment.id,
            user_id: sbUser.id,
            local_user_id: assignment.userId,
            topic: assignment.topic,
            content: assignment.content,
            timestamp: new Date(assignment.timestamp).toISOString()
          });
        }
      } catch (err) {
        console.warn('Firebase assignment sync failed:', err);
      }
    }
  }

  async getAssignments(userId: string) {
    const db = await this.getDB();
    const index = db.transaction('assignments').store.index('userId');
    return index.getAll(userId);
  }

  async deleteData(storeName: string, id: string) {
    const db = await this.getDB();
    await db.delete(storeName, id);
  }

  // --- STATS & GAMIFICATION ---
  async getStats(userId: string): Promise<UserStats> {
    const db = await this.getDB();
    let stats = await db.get('user_stats', userId);
    if (!stats) {
      stats = {
        userId,
        xp: 0,
        level: 1,
        streak: 0,
        lastActive: Date.now(),
        badges: [],
        totalQuestionsSolved: 0,
        coins: 0,
        gameHighscores: {}
      };
      await db.put('user_stats', stats);
    }
    return stats;
  }

  async updateStats(stats: UserStats) {
    const db = await this.getDB();
    await db.put('user_stats', stats);

    // Sync to Firebase
    if (isFirebaseConfigured()) {
      try {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          await supabase.from('user_stats').upsert({
            user_id: sbUser.id,
            local_user_id: stats.userId,
            xp: stats.xp,
            level: stats.level,
            streak: stats.streak,
            last_active: new Date(stats.lastActive).toISOString(),
            badges: stats.badges,
            total_questions_solved: stats.totalQuestionsSolved,
            coins: stats.coins,
            game_highscores: stats.gameHighscores
          });
        }
      } catch (err) {
        console.warn('Firebase stats sync failed:', err);
      }
    }
  }

  // --- QUIZ & ANALYTICS ---
  async saveQuizAttempt(attempt: QuizAttempt) {
    const db = await this.getDB();
    await db.put('quiz_attempts', attempt);

    // Sync to Firebase
    if (isFirebaseConfigured()) {
      try {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          await supabase.from('quiz_attempts').insert({
            id: attempt.id,
            user_id: sbUser.id,
            local_user_id: attempt.userId,
            subject: attempt.subject,
            score: attempt.score,
            total_questions: attempt.totalQuestions,
            time_spent: attempt.timeSpent,
            mistakes: attempt.mistakes,
            timestamp: new Date(attempt.timestamp).toISOString(),
            weak_topics: attempt.weakTopics,
            accuracy: attempt.accuracy
          });
        }
      } catch (err) {
        console.warn('Firebase quiz sync failed:', err);
      }
    }
  }

  async getQuizAttempts(userId: string) {
    const db = await this.getDB();
    const index = db.transaction('quiz_attempts').store.index('userId');
    return index.getAll(userId);
  }

  // --- REMINDERS ---
  async saveReminder(reminder: Reminder) {
    const db = await this.getDB();
    await db.put('reminders', reminder);

    // Sync to Firebase
    if (isFirebaseConfigured()) {
      try {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          await supabase.from('reminders').upsert({
            id: reminder.id,
            user_id: sbUser.id,
            local_user_id: reminder.userId,
            title: reminder.title,
            type: reminder.type,
            time: new Date(reminder.time).toISOString(),
            status: reminder.status,
            recurrence: reminder.recurrence
          });
        }
      } catch (err) {
        console.warn('Firebase reminder sync failed:', err);
      }
    }
  }

  async getReminders(userId: string) {
    const db = await this.getDB();
    const index = db.transaction('reminders').store.index('userId');
    return index.getAll(userId);
  }

  // --- SMART NOTES ---
  async saveNote(note: SmartNote) {
    const db = await this.getDB();
    await db.put('smart_notes', note);

    // Sync to Firebase
    if (isFirebaseConfigured()) {
      try {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          await supabase.from('smart_notes').upsert({
            id: note.id,
            user_id: sbUser.id,
            local_user_id: note.userId,
            title: note.title,
            content: note.content,
            tags: note.tags,
            is_favorite: note.isFavorite,
            timestamp: new Date(note.timestamp).toISOString(),
            summary: note.summary,
            keywords: note.keywords,
            extracted_formulas: note.extractedFormulas,
            category: note.category
          });
        }
      } catch (err) {
        console.warn('Firebase note sync failed:', err);
      }
    }
  }

  async getNotes(userId: string) {
    const db = await this.getDB();
    const index = db.transaction('smart_notes').store.index('userId');
    return index.getAll(userId);
  }

  // --- GAMES ---
  async saveGameSession(session: GameSession) {
    const db = await this.getDB();
    await db.put('game_sessions', session);
    
    // Sync to Firebase
    if (isFirebaseConfigured()) {
      try {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          await supabase.from('game_sessions').insert({
            id: session.id,
            user_id: sbUser.id,
            local_user_id: session.userId,
            game_id: session.gameId,
            score: session.score,
            xp_earned: session.xpEarned,
            duration: session.duration,
            difficulty: session.difficulty,
            timestamp: new Date(session.timestamp).toISOString()
          });
        }
      } catch (err) {
        console.warn('Firebase game session sync failed:', err);
      }
    }

    // Update highscore
    const stats = await this.getStats(session.userId);
    const currentHigh = stats.gameHighscores[session.gameId] || 0;
    if (session.score > currentHigh) {
      stats.gameHighscores[session.gameId] = session.score;
      await this.updateStats(stats);
    }
  }

  async getGameSessions(userId: string) {
    const db = await this.getDB();
    const index = db.transaction('game_sessions').store.index('userId');
    return index.getAll(userId);
  }

  // --- PAYMENTS & PREMIUM ---
  async savePaymentRequest(payment: any) {
    const db = await this.getDB();
    const paymentWithId = { ...payment, id: payment.id || crypto.randomUUID() };
    await db.put('payments', paymentWithId);
    
    if (isFirebaseConfigured()) {
      try {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
           await supabase.from('payments').insert({
             id: paymentWithId.id,
             user_id: sbUser.id,
             local_user_id: paymentWithId.userId,
             plan_id: paymentWithId.planId,
             amount: paymentWithId.amount,
             txid: paymentWithId.txid,
             status: paymentWithId.status,
             timestamp: new Date(paymentWithId.timestamp).toISOString()
           });
        }
      } catch (err) {
        console.warn('Firebase payment sync failed, using local only');
      }
    }
  }

  async getAllPayments() {
    const db = await this.getDB();
    const localPayments = await db.getAll('payments');
    let allPayments = [...localPayments];

    if (isFirebaseConfigured()) {
      try {
        const { data } = await supabase.from('payments').select('*').order('timestamp', { ascending: false });
        if (data && data.length > 0) {
           const sbPayments = data.map((p: any) => ({
             id: p.id,
             userId: p.local_user_id || p.user_id,
             planId: p.plan_id,
             amount: p.amount,
             txid: p.txid,
             status: p.status,
             timestamp: new Date(p.timestamp).getTime()
           }));
           
           const existingIds = new Set(allPayments.map(p => p.id));
           sbPayments.forEach((sp: any) => {
             if (!existingIds.has(sp.id)) {
               allPayments.push(sp);
             }
           });
        }
      } catch (err) {
        console.warn('Could not fetch payments from Firebase');
      }
    }
    return allPayments.sort((a, b) => b.timestamp - a.timestamp);
  }

  async updatePaymentStatus(paymentId: string, newStatus: 'approved' | 'rejected', userId: string) {
    const db = await this.getDB();
    const payment = await db.get('payments', paymentId);
    if (payment) {
      payment.status = newStatus;
      await db.put('payments', payment);
    } else {
      // If payment only exists in Firebase but not locally, we should create a local stub or fetch it
      // For simplicity, we just put a stub if missing
      await db.put('payments', { id: paymentId, status: newStatus, userId });
    }

    if (isFirebaseConfigured()) {
      try {
        // Update payment status
        await supabase.from('payments').update({ status: newStatus }).eq('id', paymentId);
        
        // If approved, add to premium_users
        if (newStatus === 'approved') {
           // We need the Firebase user_id. We'll try to get it by joining profiles or just inserting with local_id
           // Assuming premium_users can take local_id for simplicity or we fetch the profile
           const { data: profile } = await supabase.from('profiles').select('id').eq('local_id', userId).single();
           if (profile) {
              await supabase.from('premium_users').upsert({
                user_id: profile.id,
                plan_id: payment?.planId || 'premium',
                activated_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
              });
           }
        }
      } catch (err) {
        console.warn('Failed to update payment status in Firebase', err);
      }
    }
  }

  async isPremium(userId: string): Promise<boolean> {
    if (isFirebaseConfigured()) {
      try {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
           const { data: premium } = await supabase
             .from('premium_users')
             .select('*')
             .eq('user_id', sbUser.id)
             .single();
           return !!premium;
        }
      } catch (err) {
        console.warn('Premium check failed, using local fallback');
      }
    }
    
    // Local fallback: any approved payment in IndexedDB or localStorage flag
    const db = await this.getDB();
    const payments = await db.getAll('payments');
    return payments.some(p => p.userId === userId && p.status === 'approved');
  }

  async recordStudySession(session: { userId: string; duration: number; subject: string; topic?: string; focusScore: number }) {
    const db = await this.getDB();
    const sessionWithId = { 
      ...session, 
      id: crypto.randomUUID(), 
      timestamp: Date.now() 
    };
    await db.put('study_sessions', sessionWithId);

    if (isFirebaseConfigured()) {
       try {
         const { data: { user: sbUser } } = await supabase.auth.getUser();
         if (sbUser) {
            await supabase.from('study_sessions').insert({
              id: sessionWithId.id,
              user_id: sbUser.id,
              local_user_id: sessionWithId.userId,
              duration: sessionWithId.duration,
              subject: sessionWithId.subject,
              topic: sessionWithId.topic,
              focus_score: sessionWithId.focusScore,
              timestamp: new Date(sessionWithId.timestamp).toISOString()
            });
         }
       } catch (err) {
         console.warn('Firebase study session sync failed');
       }
    }

    // Update stats XP
    const stats = await this.getStats(session.userId);
    const xpEarned = Math.floor(session.duration / 60) * 10; // 10 XP per minute
    stats.xp += xpEarned;
    await this.updateStats(stats);

    return sessionWithId;
  }

  async getStudySessions(userId: string) {
    const db = await this.getDB();
    const index = db.transaction('study_sessions').store.index('userId');
    return index.getAll(userId);
  }
}

export const storage = new StorageManager();
