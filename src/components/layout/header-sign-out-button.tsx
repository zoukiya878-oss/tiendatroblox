"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function HeaderSignOutButton() {
  return (
    <Button
      variant="ghost"
      className="justify-start text-destructive hover:text-destructive"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut /> Đăng xuất
    </Button>
  );
}
