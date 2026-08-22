import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AccountNav } from "./nav";

export default async function TaiKhoanLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/dang-nhap?callbackUrl=/tai-khoan/thong-tin");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 md:flex-row">
      <aside className="w-full shrink-0 md:w-56">
        <AccountNav />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
