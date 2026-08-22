import { Landmark, CreditCard, Smartphone, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const PROVIDER_STYLE: Record<string, { icon: typeof Landmark; className: string }> = {
  BANK: { icon: Landmark, className: "bg-emerald-500/15 text-emerald-500" },
  MOMO: { icon: Smartphone, className: "bg-pink-500/15 text-pink-500" },
  THESIEURE: { icon: Zap, className: "bg-sky-500/15 text-sky-500" },
  CARD: { icon: CreditCard, className: "bg-amber-500/15 text-amber-500" },
};

export function ProviderIcon({ provider, className }: { provider: string; className?: string }) {
  const style = PROVIDER_STYLE[provider] ?? PROVIDER_STYLE.CARD;
  const Icon = style.icon;
  return (
    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", style.className, className)}>
      <Icon className="size-4" />
    </span>
  );
}
