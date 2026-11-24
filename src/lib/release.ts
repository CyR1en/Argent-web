import { RELEASES_URL } from "./site";

/** The Sparkle feed Argent's own updater reads. Its release workflow rebuilds it, newest build first. */
const APPCAST_URL = "https://cyr1en.github.io/Argent/appcast.xml";
const REVALIDATE_SECONDS = 3600;

export type StableRelease = {
  /** The disk image itself, or the latest release's page when the feed could not be read. */
  href: string;
  version: string | null;
};

const FALLBACK: StableRelease = { href: `${RELEASES_URL}/latest`, version: null };

/**
 * The newest stable release. A stable image is named for its version (Argent-0.1.0.dmg), so no
 * fixed URL reaches it; the feed names it. Nightlies and pre-releases carry a <sparkle:channel>,
 * stable items none.
 */
export async function latestStableRelease(): Promise<StableRelease> {
  try {
    const response = await fetch(APPCAST_URL, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!response.ok) return FALLBACK;

    const items = (await response.text()).split("<item>").slice(1);
    const stable = items.find((item) => !item.includes("<sparkle:channel>"));
    const href = stable?.match(/<enclosure\b[^>]*\burl="([^"]+)"/)?.[1];
    // Only ever a disk image from Argent's own releases.
    if (!href?.startsWith(`${RELEASES_URL}/download/`) || !href.endsWith(".dmg")) return FALLBACK;

    return { href, version: stable?.match(/<sparkle:shortVersionString>([^<]+)</)?.[1] ?? null };
  } catch {
    return FALLBACK;
  }
}
