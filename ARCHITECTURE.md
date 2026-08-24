# Tiendatroblox — kiến trúc dự án

Shop bán vật phẩm game (Roblox) + nạp tiền (chuyển khoản, thẻ cào). Next.js App Router, deploy trên Vercel, domain thật `https://tiendatroblox.store`.

## Stack

- Next.js 16 (App Router, Server Components/Actions), Turbopack
- Prisma 6 ORM + PostgreSQL (Neon, region **us-east-1** — xem "Vị trí hạ tầng" bên dưới)
- NextAuth v5 (Credentials + Google/Facebook OAuth)
- Tailwind v4 + shadcn/ui (base-ui primitives — `@base-ui-components/react`)
- Cloudinary (ảnh sản phẩm/danh mục) — **bắt buộc** khai báo domain trong `next.config.ts` → `images.remotePatterns`, thiếu là next/image chặn cứng, ảnh không hiện dù URL sống (đã từng bug thật).

## Vị trí hạ tầng

- Vercel project: `tiendat-roblox` (org `yooo23`), function region: **mặc định (US, iad1)**.
- Neon DB region: **us-east-1**. ĐỪNG đổi Vercel function region sang nơi khác (VD Singapore) mà không đổi cả DB theo — mismatch làm mọi query chậm hẳn (đã từng bug thật, tự phát hiện qua "trang chậm 1s mỗi lần bấm nút").
- GitHub repo: `zoukiya878-oss/tiendatroblox`, remote SSH dùng deploy key riêng (`~/.ssh/id_tiendatroblox`, alias `github-tiendatroblox` trong `~/.ssh/config`) — tài khoản Vercel CLI + tài khoản GitHub push là 2 tài khoản khác nhau.
- Auto-deploy: mỗi lần `git push` lên `main` → Vercel tự build & deploy production.
- Domain `tiendatroblox.store` mua ngoài (không phải qua Vercel), trỏ DNS thẳng vào Vercel.

## Money-safety patterns (bắt buộc tuân theo khi sửa payment/wallet)

- Tiền luôn dùng `BigInt` (VNĐ nguyên, không thập phân).
- Trừ kho/trừ ví dùng conditional `updateMany` (điều kiện `stock >= qty` / `balance >= amount` ngay trong WHERE) — tránh race condition, không dùng read-then-write.
- Webhook idempotent qua unique constraint `(provider, externalEventId)` trên bảng `PaymentEvent` — gọi trùng tự nhiên bị chặn ở DB, không cần check thủ công.
- `Topup.amount` = mệnh giá khách khai báo, `Topup.netAmount` = số tiền **thực cộng vào ví** (có thể thấp hơn `amount` nếu có chiết khấu thẻ cào), `Topup.fee` = phần chênh lệch. `creditWallet` luôn dùng `netAmount`, không dùng `amount`.
- `processTopupWebhook()` (`src/modules/topups/process-topup.ts`) là **điểm vào duy nhất** để đổi trạng thái topup — nhận `actualAmount` optional để tự đối chiếu lệch giá trị (đánh `WRONG_VALUE`, không tự cộng ví nếu lệch). Mọi webhook/action mới (kể cả duyệt tay) phải gọi qua hàm này, không tự ý update `Topup.status` trực tiếp.
- Trạng thái topup đã khác `PENDING` → mọi lần gọi `processTopupWebhook` sau đó tự động no-op (`alreadyProcessed: true`) — an toàn để duyệt tay rồi callback thật vẫn tới sau, không cộng đè.

## Payment integrations

### Casso.vn (chuyển khoản ngân hàng) — `src/app/api/webhooks/casso/route.ts`
- Header `X-Casso-Signature: t=<timestamp>,v1=<hex>`. `v1` = `HMAC-SHA512(checksumKey, "<t>.<JSON.stringify(sortedBody)>")` — **không phải so sánh key trực tiếp** (bug thật đã gặp, xem `computeSign`/`verifyCassoSignature` trong route).
- `checksumKey` = Security Key tạo trong Casso dashboard, lưu ở `SiteSetting.key = "payment_integrations"` → field `bankAutoWebhookToken`.
- Mã đơn nhận qua regex `/ROBO[A-Z0-9]{6}/i` trong nội dung chuyển khoản.

### gachthefast.com (thẻ cào) — `src/app/api/webhooks/gachthefast/route.ts` + `src/providers/gachthefast/charging.ts`
- Request charging: `GET https://gachthefast.com/chargingws/v2?partner_id=...&telco=...&code=...&serial=...&amount=...&request_id=...&sign=...&command=charging`. `sign = md5(partnerKey + code + serial)`.
- Response `status`: `1`=đúng thẻ, `2`=đúng thẻ sai mệnh giá (dùng field `value` làm `actualAmount` — tự đánh `WRONG_VALUE` nếu lệch `topup.amount`), `3`/`4`/`100`=lỗi, `99`=đang chờ duyệt (kết quả cuối tới qua callback).
- **Callback hỗ trợ cả GET (query params) lẫn POST (JSON body)** — cấu hình "Kiểu" trong tài khoản gachthefast chọn cái nào họ dùng để gọi về (tài khoản hiện tại dùng GET). Route xử lý chung qua `handleCallback()`. Bỏ sót 1 trong 2 method từng gây bug 404 thật (route chỉ có POST trong khi tài khoản cấu hình GET → mọi callback thật đều rớt, không log được ở Vercel).
- `callback_sign = md5(partnerKey + code + serial)` — công thức giống hệt sign lúc gửi request.
- **Có API check trạng thái riêng**: cùng endpoint `/chargingws/v2`, đổi `command=charging` → `command=check` (giữ nguyên telco/code/serial/amount/request_id/sign) — trả về `status`/`message` hiện tại, không bị lẫn với lỗi "đã gửi trước" như gọi lại `command=charging`. Dùng cái này để tự poll khi nghi callback lỗi, thay vì chỉ chờ hoặc duyệt tay.
- Nếu callback lỗi hạ tầng phía gachthefast (network/TLS cũ), dùng nút **Duyệt tay** ở `/admin/topups` (chỉ hiện cho `provider = CARD`, chặn cả UI lẫn server action).
- `request_id` lưu trong `Topup.meta.gachthefastRequestId` lúc tạo đơn — dùng để khớp lại callback (gachthefast không gửi kèm mã đơn của mình).
- **Danh sách `telco` hợp lệ (xác nhận qua tài liệu Postman chính thức của platform)**: `VIETTEL`, `VINAPHONE`, `MOBIFONE`, `GATE`, `ZING` — đúng 5 giá trị, không hơn không kém. **Không có Garena** (không phải "telco" trong API này). Doc gốc: tài liệu Postman do support gachthefast cung cấp, mục "ĐỔI THẺ" — endpoint `/chargingws/price?partner_id=...` (chưa xác nhận có tồn tại thật trên gachthefast, gọi thử trả 404, có thể chỉ đúng với 1 số site khác cùng platform).

### Chiết khấu thẻ cào — `/admin/card-discounts`
- `SiteSetting.key = "card_discount_rates"`, % theo từng nhà mạng (`VIETTEL`/`VINAPHONE`/`MOBIFONE`/`VNMOBILE`/`GATE`). 100 = không chiết khấu (default).
- Áp dụng lúc **tạo** đơn CARD (`createCardTopupAction`), tính `fee`/`netAmount` ngay, không phải lúc webhook — sửa rate không ảnh hưởng đơn cũ.

## Cấu trúc chính

```
src/
  app/
    (public)/          trang khách xem (trang chủ, /vat-pham, /blog, /lien-he...)
    admin/              trang quản trị (mỗi feature 1 thư mục: page.tsx + actions.ts)
    api/webhooks/       webhook nhận từ Casso/gachthefast
    nap-tien/           luồng nạp tiền (ngân-hàng, thẻ-cào)
  components/
    ui/                 shadcn/ui wrapper quanh base-ui
    products/           ProductCard, AddToCartButton, ProductPurchaseForm
    layout/             Header, Footer, AdminSidebar/AdminMobileNav
  modules/               business logic thuần (không JSX) — products, topups, cart, orders, cms, wallets, audit
  providers/             adapter theo interface — payment/ (Bank/Card/Momo/TheSieuRe mock), gachthefast/, storage/ (Local vs Cloudinary)
```

- **Category**: self-relation 2 tầng (`parentId`/`children`), không bảng riêng.
- **Product fields động** (`ProductField`): mỗi sản phẩm tự định nghĩa field khách phải điền lúc mua (VD "Tên nhân vật Roblox", "Tài khoản/Mật khẩu"). Form admin có 2 nút quick-add (Username Ingame / Tài khoản+Mật khẩu) — **không có nút thêm field tự do** (đã ẩn theo yêu cầu, tránh gõ tay sai key/label).
- **Audit log**: `writeAuditLog()` (`src/modules/audit/log.ts`), action là union type cố định trong `AuditAction` — thêm action mới phải thêm vào union đó trước.

## Gotcha đã gặp thật (đừng lặp lại)

1. **next/image + Cloudinary**: thiếu `images.remotePatterns` trong `next.config.ts` → ảnh 404 âm thầm, next/image chặn domain lạ mặc định.
2. **Server Actions body size**: mặc định Next.js giới hạn 1MB, upload ảnh điện thoại (2-5MB) auto-fail. Set `experimental.serverActions.bodySizeLimit` trong `next.config.ts`.
3. **Slug sản phẩm**: phải chạy qua `slugify()` (bỏ dấu, thay khoảng trắng bằng `-`) cả ở client (product-form.tsx) **lẫn server** (`admin-product-service.ts`) — từng có 31 sản phẩm slug = tên gốc y nguyên (dấu cách/dấu tiếng Việt) do import tắt qua client, gây 404 khi bấm vào.
4. **Base UI `DropdownMenuLabel`**: bắt buộc bọc trong `<DropdownMenuGroup>`, dùng trực tiếp trong `DropdownMenuContent` throw `MenuGroupContext is missing` — crash toàn trang ("This page couldn't load"), không phải warning.
5. **Card sản phẩm nhiều nút**: đừng dùng `w-full` cho 2+ nút chung 1 hàng flex — tràn ra ngoài card ở màn hẹp. Dùng `flex-1 min-w-0`.

## Test UI thật (không chỉ tsc)

Playwright có sẵn qua CLI global (`playwright` command) + browser cache tại `~/.cache/ms-playwright/`. Không có package `playwright`/`playwright-core` trong node_modules dự án — cài tạm ở thư mục scratchpad (`npm install playwright-core`) rồi trỏ `executablePath` vào chromium đã cache sẵn để chạy test thật (login, click, screenshot) khi cần verify UI thay vì chỉ đoán qua code.

## Testing checklist trước khi push thay đổi liên quan tiền

`npx tsc --noEmit` KHÔNG đủ để tin cậy các thay đổi payment — luôn viết script test trực tiếp trên DB thật (Neon, qua `DATABASE_URL_UNPOOLED` trong `.env.local`) gọi thẳng `createTopup`/`processTopupWebhook` hoặc POST thẳng vào route webhook với chữ ký hợp lệ, kiểm tra `Wallet.balance` trước/sau khớp đúng số kỳ vọng.
