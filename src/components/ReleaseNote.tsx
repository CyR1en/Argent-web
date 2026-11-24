import React from "react";
import { NIGHTLY_DMG_URL } from "@/lib/site";

/** Under a download button: the version it fetches, and the way to the nightly instead. */
export function ReleaseNote({ version, className = "" }: { version: string | null; className?: string }) {
  return (
    <p className={`text-[13px] leading-[1.5] text-muted ${className}`}>
      {version && <>Version {version} · </>}
      <a
        href={NIGHTLY_DMG_URL}
        className="py-2.5 text-ink-soft underline decoration-white/30 underline-offset-[3px] transition-colors duration-150 hover:text-ink hover:decoration-current"
      >
        Download the nightly instead
      </a>
    </p>
  );
}
