import { getFirestore, doc, collection, setDoc, getDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { app } from "./config";

export const db = getFirestore(app);

// Strict Types
export interface User {
  uid: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  createdAt: Timestamp;
}

export interface App {
  id: string;
  title: string;
  publisherId: string;
  appUrl: string;
  status: "draft" | "published";
  views: number;
  likes?: number;
  category?: string;
  thumbnailUrl?: string | null;
  createdAt: Timestamp;
}

export interface Analytics {
  appId: string;
  date: string; // YYYY-MM-DD
  views: number;
  countries: Record<string, number>;
}

// User Helpers
export const getUser = async (uid: string): Promise<User | null> => {
  const docSnap = await getDoc(doc(db, "users", uid));
  return docSnap.exists() ? (docSnap.data() as User) : null;
};

export const createUser = async (user: User): Promise<void> => {
  await setDoc(doc(db, "users", user.uid), user);
};

// App Helpers
export const getAppDoc = async (appId: string): Promise<App | null> => {
  const docSnap = await getDoc(doc(db, "apps", appId));
  return docSnap.exists() ? (docSnap.data() as App) : null;
};

export const createAppDoc = async (appData: App): Promise<void> => {
  await setDoc(doc(db, "apps", appData.id), appData);
};

export const getAppsByPublisher = async (publisherId: string): Promise<App[]> => {
  const q = query(collection(db, "apps"), where("publisherId", "==", publisherId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data() as App);
};

// Analytics Helpers
export const getAnalytics = async (appId: string, date: string): Promise<Analytics | null> => {
  const docId = `${appId}_${date}`;
  const docSnap = await getDoc(doc(db, "analytics", docId));
  return docSnap.exists() ? (docSnap.data() as Analytics) : null;
};
