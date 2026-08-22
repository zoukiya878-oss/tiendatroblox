import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin@123456", 10);
  const customerPassword = await bcrypt.hash("Customer@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@shopanhrobo.local" },
    update: {},
    create: {
      username: "admin",
      email: "admin@shopanhrobo.local",
      passwordHash: adminPassword,
      role: "ADMIN",
      wallet: { create: { balance: 0n } },
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@shopanhrobo.local" },
    update: {},
    create: {
      username: "khachhang",
      email: "customer@shopanhrobo.local",
      passwordHash: customerPassword,
      role: "CUSTOMER",
      wallet: { create: { balance: 500000n } },
    },
  });

  const growGarden = await prisma.category.upsert({
    where: { slug: "grow-a-garden" },
    update: {},
    create: { name: "Grow A Garden", slug: "grow-a-garden", sortOrder: 1 },
  });

  const bloxFruit = await prisma.category.upsert({
    where: { slug: "blox-fruit" },
    update: {},
    create: { name: "Blox Fruit", slug: "blox-fruit", sortOrder: 2 },
  });

  const petSim = await prisma.category.upsert({
    where: { slug: "pet-sim-99" },
    update: {},
    create: { name: "Pet Simulator 99", slug: "pet-sim-99", sortOrder: 3 },
  });

  const products = [
    {
      code: "#111",
      slug: "fruit-notifier",
      name: "Fruit Notifier",
      price: 648000n,
      categoryId: growGarden.id,
      shortDescription: "Thông báo trái cây hiếm tự động, không bỏ lỡ đợt reset.",
      stock: 50,
      featured: true,
    },
    {
      code: "#110",
      slug: "dark-blade",
      name: "Dark Blade",
      price: 288000n,
      categoryId: bloxFruit.id,
      shortDescription: "Vũ khí Dark Blade max stat, giao ngay.",
      stock: 30,
    },
    {
      code: "#109",
      slug: "2x-mastery",
      name: "2x Mastery",
      price: 108000n,
      categoryId: bloxFruit.id,
      shortDescription: "GamePass nhân đôi mastery vĩnh viễn.",
      stock: 100,
    },
    {
      code: "#108",
      slug: "2x-money",
      name: "2x Money",
      price: 108000n,
      categoryId: bloxFruit.id,
      shortDescription: "GamePass nhân đôi tiền vĩnh viễn.",
      stock: 100,
    },
    {
      code: "#107",
      slug: "fast-boats",
      name: "Fast Boats",
      price: 84000n,
      categoryId: bloxFruit.id,
      shortDescription: "Thuyền tốc độ cao, di chuyển nhanh giữa các đảo.",
      stock: 100,
    },
    {
      code: "#106",
      slug: "2x-boss-drops-chance",
      name: "2x Boss Drops Chance",
      price: 84000n,
      categoryId: bloxFruit.id,
      shortDescription: "Tăng gấp đôi tỉ lệ rớt đồ từ boss.",
      stock: 100,
    },
    {
      code: "#95",
      slug: "mega-size-kitsune",
      name: "x1 Mega Size Kitsune",
      price: 2699000n,
      categoryId: petSim.id,
      shortDescription: "Pet Kitsune Mega Size siêu hiếm.",
      stock: 3,
      featured: true,
    },
    {
      code: "#93",
      slug: "big-size-kitsune",
      name: "x1 Big Size Kitsune",
      price: 1199000n,
      categoryId: petSim.id,
      shortDescription: "Pet Kitsune Big Size hiếm.",
      stock: 5,
    },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        code: p.code,
        slug: p.slug,
        name: p.name,
        shortDescription: p.shortDescription,
        description: `${p.name} - giao dịch tự động, uy tín, bảo hành theo chính sách shop.`,
        price: p.price,
        stock: p.stock,
        categoryId: p.categoryId,
        featured: p.featured ?? false,
        deliveryType: "INSTANT",
        images: {
          create: [{ url: "/placeholder-product.svg", alt: p.name, sortOrder: 0 }],
        },
        fields: {
          create: [
            {
              label: "Tên tài khoản game",
              key: "game_username",
              type: "TEXT",
              required: true,
              placeholder: "VD: player123",
              sortOrder: 0,
            },
            {
              label: "Ghi chú",
              key: "note",
              type: "TEXTAREA",
              required: false,
              sortOrder: 1,
            },
          ],
        },
      },
    });
    void product;
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENT",
      value: 10n,
      maximumDiscount: 50000n,
      usagePerUser: 1,
      active: true,
    },
  });

  await prisma.faq.createMany({
    data: [
      { question: "Nạp tiền bao lâu thì nhận được?", answer: "Bank/Momo tự động dưới 5 phút, thẻ cào 5-15 phút.", sortOrder: 1 },
      { question: "Mua xong bao lâu nhận được vật phẩm?", answer: "Đa số vật phẩm giao ngay tự động, một số cần chờ theo Hold Days ghi ở trang sản phẩm.", sortOrder: 2 },
    ],
    skipDuplicates: true,
  });

  await prisma.announcement.upsert({
    where: { id: "seed-announcement" },
    update: {},
    create: {
      id: "seed-announcement",
      title: "Chào mừng đến Shop Anh Robo",
      content: "Giảm giá lên tới 50% cho đơn hàng đầu tiên. Nạp tiền và mua ngay!",
      ctaLabel: "Mua ngay",
      ctaUrl: "/vat-pham",
      active: true,
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "site" },
    update: {},
    create: {
      key: "site",
      value: JSON.stringify({
        siteName: "Shop Anh Robo",
        heroTitle: "Giảm giá cực sốc lên tới 50%",
        heroDescription: "Vật phẩm game giao dịch tự động, uy tín, nhanh chóng.",
        facebookUrl: "https://facebook.com",
        zaloUrl: "https://zalo.me",
        telegramUrl: "",
        supportEmail: "support@shopanhrobo.local",
        supportHours: "8:00 - 23:00 hằng ngày",
        bankName: "MB Bank",
        bankAccountNumber: "0888888888",
        bankAccountName: "SHOP ANH ROBO",
      }),
    },
  });

  console.log("Seed done.");
  console.log(`Admin login: ${admin.email} / Admin@123456`);
  console.log(`Customer login: ${customer.email} / Customer@123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
