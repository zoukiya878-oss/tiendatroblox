import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL || "https://tiendatroblox.store";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/tai-khoan", "/checkout", "/gio-hang"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
