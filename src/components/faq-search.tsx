"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqSearch({ faqs }: { faqs: { id: string; question: string; answer: string }[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return faqs;
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(needle) || f.answer.toLowerCase().includes(needle)
    );
  }, [faqs, q]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm câu hỏi..."
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Không tìm thấy câu hỏi phù hợp.</p>
      ) : (
        <Accordion className="rounded-xl bg-card px-4 ring-1 ring-foreground/10">
          {filtered.map((f) => (
            <AccordionItem key={f.id} value={f.id}>
              <AccordionTrigger>{f.question}</AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {f.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
