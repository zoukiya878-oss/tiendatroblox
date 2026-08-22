import type { SiteSettings } from "@/modules/cms/site-settings";
import { FacebookIcon, ZaloIcon } from "@/components/icons/brand-icons";

export function FloatingSupport({ settings }: { settings: SiteSettings }) {
  if (!settings.zaloUrl && !settings.facebookUrl) return null;

  return (
    <div className="fixed right-5 bottom-24 z-30 flex flex-col gap-3 md:bottom-5">
      {settings.zaloUrl && (
        <a
          href={settings.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Zalo"
          className="flex size-12 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg shadow-black/25 transition-transform hover:scale-110 animate-bounce"
        >
          <ZaloIcon className="size-7" />
        </a>
      )}
      {settings.facebookUrl && (
        <a
          href={settings.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="flex size-12 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg shadow-black/25 transition-transform hover:scale-110"
        >
          <FacebookIcon className="size-7" />
        </a>
      )}
    </div>
  );
}
