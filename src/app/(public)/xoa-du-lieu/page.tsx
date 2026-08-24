export default function DataDeletionPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 font-heading text-2xl font-bold">Yêu cầu xóa dữ liệu người dùng</h1>

      <div className="flex flex-col gap-6 text-sm text-muted-foreground">
        <section>
          <p>
            Nếu bạn muốn xóa toàn bộ dữ liệu cá nhân (tài khoản, lịch sử đơn hàng, lịch sử giao dịch) khỏi hệ thống
            Tiendatroblox — kể cả dữ liệu liên kết từ đăng nhập Google/Facebook — làm theo 1 trong 2 cách sau:
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">Cách 1 — Gửi yêu cầu qua trang Liên hệ</h2>
          <p>
            Vào trang{" "}
            <a href="/lien-he" className="text-primary hover:underline">
              Liên hệ
            </a>{" "}
            → gửi yêu cầu qua Email hoặc Zalo/Facebook với nội dung: <strong>&quot;Yêu cầu xóa dữ liệu tài khoản&quot;</strong> kèm
            tên đăng nhập/email đã đăng ký. Chúng tôi xử lý và xác nhận trong vòng 7 ngày làm việc.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">Cách 2 — Gửi email trực tiếp</h2>
          <p>
            Gửi email tới địa chỉ hỗ trợ (xem tại trang Liên hệ) từ đúng email đã dùng để đăng ký, tiêu đề{" "}
            <strong>&quot;Xóa dữ liệu&quot;</strong>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">Lưu ý</h2>
          <p>
            Nếu tài khoản còn số dư ví hoặc đơn hàng đang xử lý, vui lòng hoàn tất/rút trước khi yêu cầu xóa — dữ
            liệu giao dịch tài chính có thể cần lưu giữ theo quy định pháp luật trong một thời gian nhất định trước
            khi xóa hoàn toàn.
          </p>
        </section>
      </div>
    </div>
  );
}
