"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {pending ? "Đang tải..." : "Tôi đã kiểm tra, tải lại trạng thái"}
    </Button>
  );
}
