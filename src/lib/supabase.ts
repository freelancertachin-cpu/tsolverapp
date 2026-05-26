import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  QueryConstraint,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { auth, db, googleProvider } from './firebase';

type AnyRecord = Record<string, any>;
type FirebaseResponse<T = any> = Promise<{ data: T; error: any }>;

const withError = <T>(data: T, error: any = null) => ({ data, error });

const userToSupabaseShape = (user: User | null) => {
  if (!user) return null;
  return {
    id: user.uid,
    email: user.email,
    user_metadata: {
      name: user.displayName,
      full_name: user.displayName,
      avatar_url: user.photoURL,
      picture: user.photoURL
    }
  };
};

class FirestoreTableQuery implements PromiseLike<{ data: any; error: any }> {
  private filters: Array<{ field: string; value: any }> = [];
  private sortBy?: { field: string; ascending: boolean };
  private max?: number;
  private action: 'select' | 'insert' | 'upsert' | 'update' | 'delete' | null = null;
  private payload: any;
  private singleResult = false;

  constructor(private tableName: string) {}

  select(_columns = '*') {
    this.action = 'select';
    return this;
  }

  insert(payload: any) {
    this.action = 'insert';
    this.payload = payload;
    return this;
  }

  upsert(payload: any) {
    this.action = 'upsert';
    this.payload = payload;
    return this;
  }

  update(payload: any) {
    this.action = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, value });
    return this;
  }

  order(field: string, opts?: { ascending?: boolean }) {
    this.sortBy = { field, ascending: opts?.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this.max = count;
    return this;
  }

  single() {
    this.singleResult = true;
    return this.execute().then(({ data, error }) => {
      if (Array.isArray(data)) return { data: data[0] || null, error };
      return { data, error };
    });
  }

  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private get collectionRef() {
    return collection(db, this.tableName);
  }

  private async execute(): FirebaseResponse {
    try {
      switch (this.action) {
        case 'insert':
          return withError(await this.write(false));
        case 'upsert':
          return withError(await this.write(true));
        case 'update':
          return withError(await this.updateDocs());
        case 'delete':
          return withError(await this.deleteDocs());
        case 'select':
        default:
          return withError(await this.readDocs());
      }
    } catch (error: any) {
      console.warn(`Firebase adapter error on ${this.tableName}:`, error);
      return { data: this.singleResult ? null : [], error };
    }
  }

  private docIdFor(record: AnyRecord) {
    return String(record.id || record.user_id || record.userId || crypto.randomUUID());
  }

  private async write(merge: boolean) {
    const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
    const written: AnyRecord[] = [];

    for (const row of rows) {
      const normalized = { ...row };
      const id = this.docIdFor(normalized);
      normalized.id = normalized.id || id;
      if (merge || normalized.id || normalized.user_id || normalized.userId) {
        await setDoc(doc(db, this.tableName, id), normalized, { merge: true });
      } else {
        const ref = await addDoc(this.collectionRef, normalized);
        normalized.id = ref.id;
      }
      written.push(normalized);
    }

    return Array.isArray(this.payload) ? written : written[0];
  }

  private constraints(): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];
    for (const filter of this.filters) constraints.push(where(filter.field, '==', filter.value));
    if (this.sortBy) constraints.push(orderBy(this.sortBy.field, this.sortBy.ascending ? 'asc' : 'desc'));
    if (this.max) constraints.push(fsLimit(this.max));
    return constraints;
  }

  private snapshotToData(snapshot: Awaited<ReturnType<typeof getDocs>>) {
    return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as AnyRecord) }));
  }

  private async readDocs() {
    const q = this.constraints().length ? query(this.collectionRef, ...this.constraints()) : query(this.collectionRef);
    const snapshot = await getDocs(q);
    const data = this.snapshotToData(snapshot);
    return this.singleResult ? data[0] || null : data;
  }

  private async updateDocs() {
    const rows = await this.readDocs();
    const targets = Array.isArray(rows) ? rows : rows ? [rows] : [];
    await Promise.all(targets.map((row: AnyRecord) => updateDoc(doc(db, this.tableName, row.id), this.payload)));
    return targets.map((row: AnyRecord) => ({ ...row, ...this.payload }));
  }

  private async deleteDocs() {
    const rows = await this.readDocs();
    const targets = Array.isArray(rows) ? rows : rows ? [rows] : [];
    await Promise.all(targets.map((row: AnyRecord) => deleteDoc(doc(db, this.tableName, row.id))));
    return targets;
  }
}

export const firebaseCompat = {
  auth: {
    async signUp(input: { email: string; password: string; options?: { data?: AnyRecord } }) {
      try {
        const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);
        const name = input.options?.data?.name || input.options?.data?.full_name;
        if (name) await updateProfile(credential.user, { displayName: name });
        return withError({ user: userToSupabaseShape(credential.user), session: { user: userToSupabaseShape(credential.user) } });
      } catch (error) {
        return withError({ user: null, session: null }, error);
      }
    },
    async signInWithPassword(input: { email: string; password: string }) {
      try {
        const credential = await signInWithEmailAndPassword(auth, input.email, input.password);
        return withError({ user: userToSupabaseShape(credential.user), session: { user: userToSupabaseShape(credential.user) } });
      } catch (error) {
        return withError({ user: null, session: null }, error);
      }
    },
    async signInWithOAuth(input: { provider: 'google'; options?: AnyRecord }) {
      try {
        const credential = await signInWithPopup(auth, googleProvider);
        return withError({ user: userToSupabaseShape(credential.user), provider: input.provider });
      } catch (error) {
        return withError(null, error);
      }
    },
    async getUser() {
      await auth.authStateReady?.();
      return withError({ user: userToSupabaseShape(auth.currentUser) });
    },
    async getSession() {
      await auth.authStateReady?.();
      const user = userToSupabaseShape(auth.currentUser);
      return withError({ session: user ? { user } : null });
    },
    async signOut() {
      await signOut(auth);
      return withError(null);
    }
  },
  from(table: string) {
    return new FirestoreTableQuery(table);
  },
  channel(_name: string) {
    const handlers: Array<(payload: any) => void> = [];
    let watchTable = 'notifications';
    return {
      on(_event: string, config: AnyRecord, callback: (payload: any) => void) {
        watchTable = config?.table || watchTable;
        handlers.push(callback);
        return this;
      },
      subscribe() {
        const unsubscribe = onSnapshot(
          collection(db, watchTable),
          (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              handlers.forEach((handler) =>
                handler({ eventType: change.type, new: { id: change.doc.id, ...change.doc.data() }, old: null })
              );
            });
          },
          () => undefined
        );
        return { unsubscribe };
      }
    };
  }
};

export const supabase = firebaseCompat;
export const isSupabaseConfigured = () => true;
export const isFirebaseConfigured = () => true;
