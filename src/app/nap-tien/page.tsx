import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { ProviderIcon } from "@/components/payment/provider-icon";

const METHODS = [
  {
    href: "/nap-tien/ngan-hang",
    name: "Ngân hàng",
    desc: "Chuyển khoản qua ứng dụng ngân hàng, tự động cộng tiền trong vài phút.",
    provider: "BANK",
  },
  {
    href: "/nap-tien/the-cao",
    name: "Thẻ cào",
    desc: "Nạp bằng thẻ cào Viettel, Vinaphone, Mobifone.",
    provider: "CARD",
  },
];

export default async function NapTienPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/dang-nhap?callbackUrl=/nap-tien");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-2xl font-extrabold">Nạp tiền vào ví</h1>
        <p className="mt-1 text-sm text-muted-foreground">Chọn phương thức nạp tiền phù hợp với bạn</p>
      </div>

      <div className="flex flex-col gap-4">
        {METHODS.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group flex items-center gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:ring-primary/50"
          >
            <ProviderIcon provider={m.provider} className="size-14 shrink-0 rounded-2xl" iconClassName="size-6" />
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-lg font-bold">{m.name}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{m.desc}</p>
            </div>
            <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}
