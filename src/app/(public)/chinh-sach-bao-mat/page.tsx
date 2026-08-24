export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 font-heading text-2xl font-bold">Chính sách quyền riêng tư</h1>

      <div className="flex flex-col gap-6 text-sm text-muted-foreground">
        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">1. Thông tin chúng tôi thu thập</h2>
          <p>
            Khi bạn đăng ký/đăng nhập (bằng tài khoản thường, Google hoặc Facebook), chúng tôi thu thập tên đăng
            nhập, email, và (nếu đăng nhập qua Google/Facebook) tên hiển thị + email công khai từ tài khoản đó.
            Chúng tôi cũng lưu lịch sử đơn hàng, giao dịch nạp tiền, và số dư ví để vận hành dịch vụ.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">2. Mục đích sử dụng</h2>
          <p>
            Thông tin trên chỉ dùng để xác thực tài khoản, xử lý đơn hàng/giao dịch, liên hệ hỗ trợ khi cần, và cải
            thiện chất lượng dịch vụ. Chúng tôi không bán hoặc chia sẻ thông tin cá nhân cho bên thứ ba ngoài mục
            đích xử lý thanh toán (ngân hàng, cổng thanh toán thẻ cào).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">3. Bảo mật</h2>
          <p>
            Mật khẩu được mã hóa, dữ liệu thanh toán xử lý qua kết nối an toàn (HTTPS). Chúng tôi không lưu trữ
            thông tin thẻ ngân hàng/thẻ cào dưới dạng có thể đọc được sau khi xử lý xong giao dịch.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">4. Quyền của bạn</h2>
          <p>
            Bạn có thể yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu cá nhân bất cứ lúc nào — xem hướng dẫn tại{" "}
            <a href="/xoa-du-lieu" className="text-primary hover:underline">
              trang Xóa dữ liệu người dùng
            </a>
            , hoặc liên hệ trực tiếp qua trang{" "}
            <a href="/lien-he" className="text-primary hover:underline">
              Liên hệ
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">5. Thay đổi chính sách</h2>
          <p>
            Chính sách này có thể được cập nhật theo thời gian. Phiên bản mới nhất luôn được đăng tại trang này.
          </p>
        </section>
      </div>
    </div>
  );
}
