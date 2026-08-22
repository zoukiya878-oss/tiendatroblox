import Link from "next/link";
import Image from "next/image";
import { PackageX } from "lucide-react";
import { formatVnd } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ProductCardProps {
  slug: string;
  name: string;
  price: bigint;
  compareAtPrice: bigint | null;
  stock: number;
  imageUrl?: string | null;
}

export function ProductCard({ slug, name, price, compareAtPrice, stock, imageUrl }: ProductCardProps) {
  const discount =
    compareAtPrice && compareAtPrice > price
      ? Math.round((1 - Number(price) / Number(compareAtPrice)) * 100)
      : null;

  return (
    <Link href={`/vat-pham/${slug}`} className="block">
    <Card
      size="sm"
      className="group overflow-hidden transition-shadow hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <PackageX className="size-8" />
          </div>
        )}
        {discount && (
          <Badge className="absolute left-2 top-2 bg-accent text-accent-foreground">
            🔥 -{discount}%
          </Badge>
        )}
        {stock <= 0 && (
          <Badge variant="destructive" className="absolute right-2 top-2">
            Hết hàng
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-1 px-3 pb-3 pt-2">
        <span className="line-clamp-2 text-sm font-medium">{name}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading text-sm font-bold text-primary">{formatVnd(price)}</span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-xs text-muted-foreground line-through">{formatVnd(compareAtPrice)}</span>
          )}
        </div>
      </div>
    </Card>
    </Link>
  );
}
