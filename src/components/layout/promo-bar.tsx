import { Flame } from "lucide-react";
import { getActiveAnnouncement } from "@/modules/cms/announcement";

export async function PromoBar() {
  const announcement = await getActiveAnnouncement();
  if (!announcement) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent px-4 py-1.5 text-center text-xs font-medium text-primary-foreground">
      <Flame className="size-3.5 shrink-0" />
      <span className="line-clamp-1">{announcement.title}</span>
      {announcement.ctaUrl && announcement.ctaLabel && (
        <a href={announcement.ctaUrl} className="shrink-0 underline underline-offset-2">
          {announcement.ctaLabel}
        </a>
      )}
    </div>
  );
}
