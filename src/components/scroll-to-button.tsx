"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

// ponytail: an <a href="#id"> anchor only scrolls when the URL hash actually
// changes — clicking it twice in a row (hash already set from the first
// click) does nothing. scrollIntoView on every click has no such issue.
export function ScrollToButton({ targetId, children, ...props }: { targetId: string; children: ReactNode } & React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" })}
    >
      {children}
    </Button>
  );
}
