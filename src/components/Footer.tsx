import React from "react";
import { REPO_URL, RELEASES_URL } from "@/lib/site";
import { ArgentMark } from "./ArgentMark";

const LINKS = [
  { label: "All releases", href: RELEASES_URL },
  { label: "Inside the film model", href: `${REPO_URL}/blob/main/bake/README.md` },
  { label: "Notices & licences", href: `${REPO_URL}/blob/main/NOTICE` },
];

export function Footer() {
  return (
    <footer className="relative border-t border-hairline bg-ground py-12 text-[13px] leading-[1.65] text-muted">
      <div className="mx-auto max-w-[1220px] px-4 sm:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <ArgentMark size={22} />
            <span className="text-[16px] font-semibold text-ink">Argent</span>
            <span>Apache License 2.0</span>
          </div>

          <nav aria-label="Project" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-150 hover:text-ink hover:underline"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <p className="mt-7 max-w-[100ch] text-[12px] leading-[1.7]">
          Built with DINOv3. Subject, Background, and Sky use optional models
          under their own non-commercial terms. Kodak, Portra, Ektar, Gold,
          ColorPlus, UltraMax, and Vision3 are trademarks of Eastman Kodak
          Company. Fujifilm, Fujicolor, Pro 400H, C200, and Superia are
          trademarks of FUJIFILM Corporation. CineStill is a trademark of
          CineStill Film. Sony and a7 IV are trademarks of Sony Group
          Corporation. Argent is not affiliated with or endorsed by any of them;
          a stock&apos;s name identifies which film&apos;s published datasheets
          its model follows.
        </p>
      </div>
    </footer>
  );
}
