"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { firebaseEnabled, getDb } from "@/lib/firebase";

const COUNTER_PATH = ["counters", "cv-downloads"] as const;
// One count per browser: stops reloads and repeat clicks inflating the number.
const STORAGE_KEY = "cv-download-counted";

export function DownloadCvButton({ href }: { href: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!firebaseEnabled) return;

    let cancelled = false;

    (async () => {
      try {
        const db = await getDb();
        const { doc, getDoc } = await import("firebase/firestore");
        const snapshot = await getDoc(doc(db, ...COUNTER_PATH));

        if (!cancelled) {
          setCount(snapshot.exists() ? (snapshot.data().count as number) : 0);
        }
      } catch {
        // Offline, blocked by an ad blocker, or rules changed — just show no
        // count rather than an error the visitor can do nothing about.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleClick() {
    // Never block the download itself; the count is best-effort.
    if (!firebaseEnabled) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    localStorage.setItem(STORAGE_KEY, "1");
    setCount((current) => (current === null ? current : current + 1));

    try {
      const db = await getDb();
      const { doc, setDoc, increment } = await import("firebase/firestore");
      await setDoc(doc(db, ...COUNTER_PATH), { count: increment(1) }, { merge: true });
    } catch {
      // Optimistic update stands for this session; the real value reloads next visit.
    }
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <Button href={href} download variant="primary" onClick={handleClick}>
        Download CV
        <Download className="h-4 w-4" aria-hidden="true" />
      </Button>

      {count !== null && (
        <p className="text-sm text-muted" aria-live="polite">
          Downloaded <span className="font-semibold text-primary-400">{count.toLocaleString()}</span>{" "}
          {count === 1 ? "time" : "times"}
        </p>
      )}
    </div>
  );
}
