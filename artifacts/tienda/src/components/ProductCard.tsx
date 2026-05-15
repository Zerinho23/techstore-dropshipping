import { Link, useLocation } from "wouter";
import { formatCLP } from "@/lib/currency";
import type { Product } from "@workspace/api-client-react";
import { ShoppingCart, Eye, Star, Zap, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [hovered, setHovered]   = useState(false);
  const [added, setAdded]       = useState(false);
  const [imgError, setImgError] = useState(false);
  const [, setLocation]         = useLocation();

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0;

  const savings =
    product.comparePrice && product.comparePrice > product.price
      ? product.comparePrice - product.price
      : 0;

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = !product.stock || product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    onAddToCart?.(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <motion.article
      className="group relative bg-card rounded-2xl overflow-hidden flex flex-col"
      style={{
        boxShadow: hovered
          ? "0 16px 40px rgba(59,130,246,0.16), 0 4px 12px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
        border: hovered
          ? "1.5px solid hsl(217 91% 60% / 0.5)"
          : "1.5px solid hsl(var(--border))",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease",
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      data-testid={`card-product-${product.id}`}
    >
      {/* ── Image ── */}
      <Link
        href={`/productos/${product.id}`}
        className="block relative overflow-hidden bg-slate-50 dark:bg-slate-900"
        style={{ aspectRatio: "1 / 1" }}
        aria-label={product.name}
      >
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="object-cover w-full h-full"
            style={{
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            <ShoppingCart className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          </div>
        )}

        {/* Gradient scrim — always visible for badge legibility */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 100%)",
          }}
        />

        {/* Quick-view pill — slides up on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="absolute bottom-3 left-0 right-0 flex justify-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
            >
              <button
                onClick={(e) => { e.preventDefault(); setLocation(`/productos/${product.id}`); }}
                className="pointer-events-auto inline-flex items-center gap-1.5 bg-white/95 backdrop-blur text-gray-900 rounded-full px-4 py-1.5 text-xs font-bold shadow-xl hover:bg-primary hover:text-white transition-all duration-150"
                data-testid={`button-view-${product.id}`}
              >
                <Eye className="h-3.5 w-3.5" />
                Ver detalle
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Badges ── */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
          {discount >= 10 && (
            <span className="inline-flex items-center gap-0.5 bg-red-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-xl shadow-lg shadow-red-500/40 tracking-tight">
              <Zap className="h-2.5 w-2.5 fill-white" />
              -{discount}%
            </span>
          )}
          {product.featured && !discount && (
            <span className="inline-flex items-center gap-0.5 bg-amber-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-xl shadow-lg shadow-amber-500/40">
              <Star className="h-2.5 w-2.5 fill-white" />
              Top
            </span>
          )}
        </div>

        {isLowStock && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-orange-500/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
              ¡Solo {product.stock}!
            </span>
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-black/70 text-white text-xs font-bold px-4 py-1.5 rounded-full">
              Sin stock
            </span>
          </div>
        )}
      </Link>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-3.5 gap-2">
        {/* Name — always 2 lines height for grid alignment */}
        <Link href={`/productos/${product.id}`} className="flex-1">
          <h3
            className="font-semibold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200"
            style={{ minHeight: "2.6rem" }}
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h3>
        </Link>

        {/* Price + savings */}
        <div className="flex items-end justify-between gap-1.5 flex-wrap">
          <div>
            <span
              className="text-xl font-extrabold text-primary leading-none"
              data-testid={`text-price-${product.id}`}
            >
              {formatCLP(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="block text-[11px] text-muted-foreground line-through mt-0.5">
                {formatCLP(product.comparePrice)}
              </span>
            )}
          </div>
          {savings > 0 && (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
              Ahorras {formatCLP(savings)}
            </span>
          )}
        </div>

        {/* Add to cart button */}
        <motion.button
          className={`relative w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold overflow-hidden transition-colors duration-200 ${
            outOfStock
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : added
              ? "bg-emerald-500 text-white"
              : "bg-primary text-primary-foreground hover:brightness-110"
          }`}
          style={{
            boxShadow: outOfStock
              ? "none"
              : added
              ? "0 4px 14px rgba(16,185,129,0.35)"
              : hovered
              ? "0 4px 14px hsl(217 91% 60% / 0.4)"
              : "0 2px 6px hsl(217 91% 60% / 0.2)",
          }}
          onClick={handleAddToCart}
          disabled={outOfStock}
          whileTap={!outOfStock ? { scale: 0.96 } : {}}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <AnimatePresence mode="wait">
            {outOfStock ? (
              <motion.span
                key="out"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1.5"
              >
                <ShoppingCart className="h-3.5 w-3.5 opacity-50" />
                Sin stock
              </motion.span>
            ) : added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                ¡Agregado!
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1.5"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Agregar
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.article>
  );
}
