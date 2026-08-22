import { getActiveFaqs } from "@/modules/cms/faq";
import { FaqSearch } from "@/components/faq-search";

export default async function FaqPage() {
  const faqs = await getActiveFaqs();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 font-heading text-2xl font-bold">Câu hỏi thường gặp</h1>
      <p className="mb-6 text-muted-foreground">Giải đáp nhanh các thắc mắc phổ biến khi mua hàng tại {`Shop Anh Robo`}.</p>
      <FaqSearch faqs={faqs} />
    </div>
  );
}
