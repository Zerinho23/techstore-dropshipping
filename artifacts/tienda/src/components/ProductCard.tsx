import { Link, useLocation } from "wouter";
import { formatCLP } from "@/lib/currency";
import type { Product } from "@workspace/api-client-react";
import { ShoppingCart, Eye, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [, setLocation] = useLocation();

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0;

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = !product.stock || product.stock <= 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    onAddToCart?.(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <motion.div
      className="group relative bg-card rounded-2xl overflow-hidden flex flex-col h-full"
      style={{
        boxShadow: hovered
          ? "0 8px 30px rgba(59,130,246,0.18), 0 2px 8px rgba(0,0,0,0.08)"
          : "0 1px 4px rgba(0,0,0,0.06)",
        border: hovered ? "1.5px solid hsl(217 91% 60% / 0.45)" : "1.5px solid hsl(var(--border))",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.25s ease",
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      data-testid={`card-product-${product.id}`}
    >
      {/* Image */}
      <Link
        href={`/productos/${product.id}`}
        className="block relative overflow-hidden bg-slate-100"
        style={{ aspectRatio: "1/1" }}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-cover w-full h-full"
            style={{
              transform: hovered ? "scale(1.07)" : "scale(1)",
              transition: "transform 0.4s ease",
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-100">
            <ShoppingCart className="h-10 w-10 opacity-30" />
          </div>
        )}

        {/* Always-visible bottom gradient for legibility */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Quick-view pill */}
        <div
          className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.2s ease",
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              setLocation(`/productos/${product.id}`);
            }}
            className="pointer-events-auto flex items-center gap-1.5 bg-white text-gray-900 rounded-full px-4 py-1.5 text-xs font-bold shadow-lg hover:bg-primary hover:text-white transition-colors"
            data-testid={`button-view-${product.id}`}
          >
            <Eye className="h-3.5 w-3.5" />
            Ver detalle
          </button>
        </div>

        {/* Discount badge */}
        {discount >= 10 && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-0.5 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-lg shadow-red-500/30">
              <Zap className="h-2.5 w-2.5" />
              -{discount}%
            </span>
          </div>
        )}

        {/* Featured badge */}
        {product.featured && !discount && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-0.5 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-lg shadow-amber-500/30">
              <Star className="h-2.5 w-2.5 fill-white" />
              Top
            </span>
          </div>
        )}

        {/* Low stock */}
        {isLowStock && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              ¡Últimas {product.stock}!
            </span>
          </div>
        )}
      </Link>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-3.5 gap-2.5">
        <Link href={`/productos/${product.id}`} className="flex-1">
          <h3
            className="font-semibold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors"
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h3>
        </Link>

        <div className="space-y-2.5">
          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className="text-lg font-extrabold text-primary"
              data-testid={`text-price-${product.id}`}
            >
              {formatCLP(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCLP(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Add to cart */}
          <button
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              outOfStock
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : added
                ? "bg-green-500 text-white shadow-md shadow-green-500/30"
                : "bg-primary text-white hover:brightness-110 shadow-md shadow-primary/30 active:scale-95"
            }`}
            onClick={handleAddToCart}
            disabled={outOfStock}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            {outOfStock ? (
              <>Sin stock</>
            ) : added ? (
              <>✓ Agregado</>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
