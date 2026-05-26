import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBIX6Wuswdm0mhyoVLc5lq366BG_5cH6FE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 't-solver-95481.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 't-solver-95481',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 't-solver-95481.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '491466871989',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:491466871989:web:4e1bb88dd85807b9915afc',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-68LRL3JJTT'
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storageBucket = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' });

export const appOrigin = import.meta.env.VITE_PUBLIC_APP_URL || 'https://t-solver-95481.web.app';

export const getFirebaseAnalytics = async () => {
  if (typeof window === 'undefined') return null;
  const supported = await isAnalyticsSupported().catch(() => false);
  return supported ? getAnalytics(app) : null;
};

export const getFirebaseMessaging = async () => {
  if (typeof window === 'undefined') return null;
  const supported = await isMessagingSupported().catch(() => false);
  return supported ? getMessaging(app) : null;
};

if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storageBucket, '127.0.0.1', 9199);
  } catch {
    // Emulator connectors throw if called twice during HMR. Safe to ignore.
  }
}


export const ADMIN_EMAILS = ['freelancertachin@gmail.com'];
export const ADMIN_UIDS = ['b6pl0LVKmoWGpfXIkITupYN2tnB3'];

export const isConfiguredAdmin = (user?: { id?: string; uid?: string; email?: string } | null) => {
  if (!user) return false;
  const uid = user.id || user.uid;
  const email = (user.email || '').toLowerCase();
  return Boolean((uid && ADMIN_UIDS.includes(uid)) || (email && ADMIN_EMAILS.includes(email)));
};

export default firebaseConfig;
