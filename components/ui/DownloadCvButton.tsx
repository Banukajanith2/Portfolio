"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CV_DOWNLOAD_EVENT, readCvDownloadCount, registerCvDownload } from "@/lib/cvDownloads";

export function DownloadCvButton({ href }: { href: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    readCvDownloadCount().then((value) => {
      if (!cancelled) setCount(value);
    });

    // The navbar button counts too; keep this display in step with it.
    const onCounted = () => setCount((current) => (current === null ? current : current + 1));
    window.addEventListener(CV_DOWNLOAD_EVENT, onCounted);

    return () => {
      cancelled = true;
      window.removeEventListener(CV_DOWNLOAD_EVENT, onCounted);
    };
  }, []);

  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <Button href={href} download variant="primary" onClick={registerCvDownload}>
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
