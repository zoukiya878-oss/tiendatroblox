"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Đang lưu..." : "Lưu danh sách"}
    </Button>
  );
}

export function CayThueForm({
  action,
  services: initial,
}: {
  action: (formData: FormData) => void;
  services: string[];
}) {
  const [services, setServices] = useState<string[]>(initial);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = JSON.stringify(services);
  }, [services]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="servicesJson" ref={inputRef} />

      {services.length === 0 && (
        <p className="text-sm text-muted-foreground">Chưa có dịch vụ nào. Bấm &quot;+ Thêm dịch vụ&quot;.</p>
      )}

      {services.map((s, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <Input
            placeholder="Tên dịch vụ (VD: Cày level 1-50)"
            value={s}
            onChange={(e) => setServices((prev) => prev.map((r, i) => (i === idx ? e.target.value : r)))}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setServices((prev) => prev.filter((_, i) => i !== idx))}
          >
            Xoá
          </Button>
        </div>
      ))}

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setServices((prev) => [...prev, ""])}>
          + Thêm dịch vụ
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}
