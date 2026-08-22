import { MessageCircle, Globe } from "lucide-react";
import type { SiteSettings } from "@/modules/cms/site-settings";

export function FloatingSupport({ settings }: { settings: SiteSettings }) {
  if (!settings.zaloUrl && !settings.facebookUrl) return null;

  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col gap-2">
      {settings.zaloUrl && (
        <a
          href={settings.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Zalo"
          className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-110"
        >
          <MessageCircle className="size-6" />
        </a>
      )}
      {settings.facebookUrl && (
        <a
          href={settings.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="flex size-12 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg shadow-black/20 transition-transform hover:scale-110"
        >
          <Globe className="size-6" />
        </a>
      )}
    </div>
  );
}
