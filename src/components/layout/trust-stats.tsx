import { Landmark, Zap, CreditCard, ShieldCheck } from "lucide-react";

const STATS = [
  {
    label: "Ngân hàng hỗ trợ",
    value: "9+",
    sub: "ACB, VTB, TCB, MB...",
    icon: Landmark,
    bar: "bg-primary",
    valueClass: "text-primary",
  },
  {
    label: "Tốc độ xử lý",
    value: "< 30s",
    sub: "Cộng tiền tự động",
    icon: Zap,
    bar: "bg-emerald-500",
    valueClass: "text-emerald-500",
  },
  {
    label: "Phương thức",
    value: "2",
    sub: "Ngân hàng, Thẻ cào",
    icon: CreditCard,
    bar: "bg-primary",
    valueClass: "text-primary",
  },
  {
    label: "Bảo mật",
    value: "100%",
    sub: "Mã hóa và idempotency",
    icon: ShieldCheck,
    bar: "bg-accent",
    valueClass: "text-accent",
  },
];

export function TrustStats() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
            <div className={`h-1 w-full ${s.bar}`} />
            <div className="flex items-start justify-between p-4">
              <div>
                <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{s.label}</p>
                <p className={`mt-1 font-heading text-3xl font-extrabold ${s.valueClass}`}>{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
              </div>
              <s.icon className="size-6 shrink-0 text-muted-foreground/50" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
