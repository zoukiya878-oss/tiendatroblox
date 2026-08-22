"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function OAuthButtons({ callbackUrl }: { callbackUrl: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative py-1 text-center text-xs text-muted-foreground">
        <span className="relative z-10 bg-card px-2">hoặc</span>
        <div className="absolute inset-x-0 top-1/2 border-t border-border" />
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={() => signIn("google", { callbackUrl })}>
        Tiếp tục với Google
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={() => signIn("facebook", { callbackUrl })}>
        Tiếp tục với Facebook
      </Button>
    </div>
  );
}
