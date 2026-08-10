import { firebaseEnabled, getDb } from "@/lib/firebase";

const COUNTER_PATH = ["counters", "cv-downloads"] as const;
// One count per browser: stops reloads and repeat clicks inflating the number.
const STORAGE_KEY = "cv-download-counted";

/** Lets the About counter re-render when the navbar button does the counting. */
export const CV_DOWNLOAD_EVENT = "cv-download";

export async function readCvDownloadCount(): Promise<number | null> {
  if (!firebaseEnabled) return null;

  try {
    const db = await getDb();
    const { doc, getDoc } = await import("firebase/firestore");
    const snapshot = await getDoc(doc(db, ...COUNTER_PATH));
    return snapshot.exists() ? (snapshot.data().count as number) : 0;
  } catch {
    // Offline or blocked by an ad blocker - show no count rather than an error
    // the visitor can do nothing about.
    return null;
  }
}

/**
 * Records a download. Always resolves and never throws: the file must download
 * whether or not Firestore is reachable.
 */
export async function registerCvDownload(): Promise<void> {
  if (!firebaseEnabled) return;
  if (localStorage.getItem(STORAGE_KEY)) return;

  localStorage.setItem(STORAGE_KEY, "1");
  window.dispatchEvent(new Event(CV_DOWNLOAD_EVENT));

  try {
    const db = await getDb();
    const { doc, setDoc, increment } = await import("firebase/firestore");
    await setDoc(doc(db, ...COUNTER_PATH), { count: increment(1) }, { merge: true });
  } catch {
    // The optimistic bump stands for this session; the real value loads next visit.
  }
}
