"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function HeaderSignOutItem() {
  return (
    <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
      <LogOut /> Đăng xuất
    </DropdownMenuItem>
  );
}
