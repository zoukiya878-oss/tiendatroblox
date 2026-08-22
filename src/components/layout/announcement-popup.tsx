"use client";

import { useState } from "react";
import type { Announcement } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AnnouncementPopup({ announcement }: { announcement: Announcement }) {
  const storageKey = `announcement-seen:${announcement.id}`;
  // ponytail: lazy initializer reads localStorage on the client's first render
  // (re-runs fresh after hydration), avoiding a setState-in-effect flash.
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !localStorage.getItem(storageKey);
    } catch {
      return true;
    }
  });

  function close() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{announcement.title}</DialogTitle>
          <DialogDescription className="whitespace-pre-line text-foreground">
            {announcement.content}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {announcement.ctaUrl && announcement.ctaLabel && (
            <Button variant="secondary" render={<a href={announcement.ctaUrl} />}>
              {announcement.ctaLabel}
            </Button>
          )}
          <Button onClick={close}>Tôi đã hiểu &amp; đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
