import type { Firestore } from "firebase/firestore";

/**
 * Firebase web config is public by design - it identifies the project, it does
 * not authorise anything. Access is controlled by Firestore security rules,
 * which permit nothing here beyond incrementing counters/cv-downloads by one.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseEnabled = Boolean(config.apiKey && config.projectId && config.appId);

let dbPromise: Promise<Firestore> | null = null;

/**
 * Loads the SDK on first use rather than at import time, so the ~100KB of
 * Firebase stays out of the initial page bundle.
 */
export function getDb(): Promise<Firestore> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const [{ initializeApp, getApps, getApp }, { getFirestore }] = await Promise.all([
        import("firebase/app"),
        import("firebase/firestore"),
      ]);

      const app = getApps().length ? getApp() : initializeApp(config);
      return getFirestore(app);
    })();
  }

  return dbPromise;
}
