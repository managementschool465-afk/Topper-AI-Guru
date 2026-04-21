import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDocFromServer, addDoc, collection } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

/**
 * Topper AI Guru - Firebase Configuration Logic
 * 
 * ✅ WHITE SCREEN FIX:
 * Isme dynamic configuration load hoti hai:
 * 1. AI Studio mein 'firebase-applet-config.json' se values li jati hain.
 * 2. External platforms (GitHub/Cloud Run) par Environment Variables fallback ka kaam karte hain.
 * 3. Casting to 'any' is used to bypass TypeScript compile errors when config is missing.
 */
const firebaseClientConfig = {
  apiKey: firebaseConfig.apiKey || (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: firebaseConfig.authDomain || (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseConfig.projectId || (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: firebaseConfig.storageBucket || (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseConfig.messagingSenderId || (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseConfig.appId || (import.meta as any).env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: firebaseConfig.firestoreDatabaseId || (import.meta as any).env.VITE_FIREBASE_DATABASE_ID || "(default)"
};

// Initialize Firebase SDKs
const app = initializeApp(firebaseClientConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseClientConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

/**
 * -----------------------------------------------------------------------------
 * CORE HELPERS & TYPES
 * -----------------------------------------------------------------------------
 */

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

/**
 * Standard Firestore Error Handler
 * Errors are stringified as JSON to meet specific system requirements.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Error Detailed: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Resilient Data Saving
 * Attempts to save to Firestore, falls back to LocalStorage if offline or failed.
 */
export async function saveDataWithFallback(collectionName: string, data: any) {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef;
  } catch (error) {
    console.warn("Firebase failed, saving to Local Storage...");
    const storageKey = `fallback_${collectionName}`;
    const existing = localStorage.getItem(storageKey);
    const list = existing ? JSON.parse(existing) : [];
    list.push({ 
      ...data, 
      id: `local_${Date.now()}`, 
      _isLocal: true,
      _timestamp: new Date().toISOString()
    });
    localStorage.setItem(storageKey, JSON.stringify(list));
    return { id: `local_${Date.now()}` };
  }
}

/**
 * verifyConnectivity
 * Connectivity check to ensure the API Key and network are working.
 */
async function testConnection() {
  if (typeof window === 'undefined') return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("App is running offline or Firebase configuration is missing.");
    }
  }
}

// Auto-run connection test
testConnection();
