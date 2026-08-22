import { getActiveAnnouncement } from "@/modules/cms/announcement";

export async function PromoBar() {
  const announcement = await getActiveAnnouncement();
  if (!announcement) return null;

  return (
    <div className="bg-[#151233] px-4 py-3 text-center text-sm font-semibold text-white sm:text-base">
      {announcement.title}
      {announcement.ctaUrl && announcement.ctaLabel && (
        <>
          {" "}
          <a href={announcement.ctaUrl} className="underline underline-offset-2">
            {announcement.ctaLabel.toUpperCase()}
          </a>
        </>
      )}
    </div>
  );
}
