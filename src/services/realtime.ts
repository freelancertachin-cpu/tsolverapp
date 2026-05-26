import { supabase, isFirebaseConfigured } from '../lib/supabase';

export type RealtimeEvent =
  | 'leaderboard:live'
  | 'wallet:update'
  | 'admin:alerts'
  | 'study:progress'
  | 'voice:start'
  | 'voice:chunk'
  | 'voice:end'
  | 'ai:thinking'
  | 'ai:text'
  | 'ai:audio'
  | 'user:interrupt'
  | 'memory:update';

export interface RealtimePayload<T = unknown> {
  event: RealtimeEvent;
  userId?: string;
  data: T;
  timestamp: number;
}

type Handler<T = unknown> = (payload: RealtimePayload<T>) => void;

class RealtimeBus {
  private channel?: BroadcastChannel;
  private handlers = new Map<RealtimeEvent, Set<Handler>>();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('tsolver-realtime');
      this.channel.onmessage = (message) => {
        const payload = message.data as RealtimePayload;
        this.emitLocal(payload);
      };
    }
  }

  publish<T>(event: RealtimeEvent, data: T, userId?: string) {
    const payload: RealtimePayload<T> = { event, data, userId, timestamp: Date.now() };
    this.emitLocal(payload);
    this.channel?.postMessage(payload);
    window.dispatchEvent(new CustomEvent(event, { detail: payload }));
    return payload;
  }

  subscribe<T>(event: RealtimeEvent, handler: Handler<T>) {
    const existing = this.handlers.get(event) || new Set();
    existing.add(handler as Handler);
    this.handlers.set(event, existing);
    const windowHandler = ((e: CustomEvent<RealtimePayload<T>>) => handler(e.detail)) as EventListener;
    window.addEventListener(event, windowHandler);

    return () => {
      existing.delete(handler as Handler);
      window.removeEventListener(event, windowHandler);
    };
  }

  private emitLocal(payload: RealtimePayload) {
    this.handlers.get(payload.event)?.forEach((handler) => handler(payload));
  }

  async connectFirebase(table = 'notifications') {
    if (!isFirebaseConfigured()) return null;
    try {
      const channel = supabase
        .channel('tsolver-live-core')
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          this.publish('admin:alerts', payload);
        })
        .subscribe();
      return channel;
    } catch (error) {
      console.warn('Firebase realtime connection failed:', error);
      return null;
    }
  }
}

export const realtimeBus = new RealtimeBus();
