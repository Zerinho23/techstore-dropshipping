import { Link, useLocation } from "wouter";
import { formatCLP } from "@/lib/currency";
import type { Product } from "@workspace/api-client-react";
import { ShoppingCart, Heart, Zap, Star, Check, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [hovered, setHovered]   = useState(false);
  const [added, setAdded]       = useState(false);
  const [wished, setWished]     = useState(false);
  const [imgError, setImgError] = useState(false);
  const [, setLocation]         = useLocation();

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0;

  const savings =
    product.comparePrice && product.comparePrice > product.price
      ? product.comparePrice - product.price : 0;

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = !product.stock || product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    onAddToCart?.(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1700);
  };

  return (
    <motion.article
      className="group relative flex flex-col h-full rounded-2xl overflow-hidden bg-white dark:bg-card"
      style={{
        boxShadow: hovered
          ? "0 20px 48px rgba(59,130,246,0.15), 0 6px 16px rgba(0,0,0,0.1)"
          : "0 2px 8px rgba(0,0,0,0.08)",
        border: hovered
          ? "1.5px solid hsl(217 91% 60% / 0.55)"
          : "1.5px solid rgba(0,0,0,0.07)",
        transform: hovered ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      data-testid={`card-product-${product.id}`}
    >
      {/* ── Image ── */}
      <Link
        href={`/productos/${product.id}`}
        className="relative block overflow-hidden bg-slate-50 dark:bg-slate-900 shrink-0"
        style={{ aspectRatio: "1 / 1" }}
        aria-label={product.name}
      >
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            style={{
              transform: hovered ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)" }}>
            <ShoppingCart className="h-10 w-10 text-slate-300" />
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)" }} />

        {/* Quick view — on hover */}
        <AnimatePresence>
          {hovered && !outOfStock && (
            <motion.button
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-full px-4 py-1.5 shadow-lg pointer-events-auto whitespace-nowrap hover:bg-primary hover:text-white transition-colors"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => { e.preventDefault(); setLocation(`/productos/${product.id}`); }}
              data-testid={`button-view-${product.id}`}
            >
              <Eye className="h-3 w-3" /> Ver detalle
            </motion.button>
          )}
        </AnimatePresence>

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-black/80 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
              AGOTADO
            </span>
          </div>
        )}

        {/* ── Top-left badges ── */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discount >= 10 && (
            <motion.span
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-0.5 text-white text-[11px] font-black px-2 py-0.5 rounded-lg tracking-tight leading-tight"
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                boxShadow: "0 3px 8px rgba(239,68,68,0.5)",
              }}
            >
              <Zap className="h-2.5 w-2.5 fill-white shrink-0" />
              -{discount}%
            </motion.span>
          )}
          {product.featured && (
            <span className="inline-flex items-center gap-0.5 text-white text-[11px] font-black px-2 py-0.5 rounded-lg leading-tight"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                boxShadow: "0 3px 8px rgba(245,158,11,0.5)",
              }}>
              <Star className="h-2.5 w-2.5 fill-white shrink-0" />
              Top
            </span>
          )}
          {isLowStock && (
            <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-lg leading-tight"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
              ¡Solo {product.stock}!
            </span>
          )}
        </div>

        {/* ── Wishlist heart ── */}
        <motion.button
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md"
          onClick={(e) => { e.preventDefault(); setWished(!wished); }}
          whileTap={{ scale: 0.8 }}
          aria-label="Favorito"
        >
          <Heart
            className="h-3.5 w-3.5 transition-colors duration-200"
            style={{ color: wished ? "#ef4444" : "#94a3b8", fill: wished ? "#ef4444" : "none" }}
          />
        </motion.button>
      </Link>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-3 gap-2">

        {/* Name — fixed height for grid alignment */}
        <Link href={`/productos/${product.id}`}>
          <h3
            className="font-semibold text-[13px] leading-[1.35] line-clamp-2 text-slate-800 dark:text-foreground group-hover:text-primary transition-colors duration-200"
            style={{ minHeight: "calc(1.35em * 2)" }}
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h3>
        </Link>

        {/* Prices — all in same vertical stack, always same height */}
        <div className="flex flex-col gap-0.5">
          <span
            className="font-black leading-none"
            style={{ fontSize: "clamp(1rem, 3vw, 1.25rem)", color: "hsl(217 91% 50%)" }}
            data-testid={`text-price-${product.id}`}
          >
            {formatCLP(product.price)}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap min-h-[1.1rem]">
            {product.comparePrice && product.comparePrice > product.price ? (
              <>
                <span className="text-[11px] text-slate-400 line-through leading-none">
                  {formatCLP(product.comparePrice)}
                </span>
                {savings > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                    Ahorras {formatCLP(savings)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[11px] text-transparent select-none leading-none">—</span>
            )}
          </div>
        </div>

        {/* Add to cart — gradient button */}
        <motion.button
          className="mt-auto w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-bold text-white overflow-hidden relative"
          style={{
            background: outOfStock
              ? "#e2e8f0"
              : added
              ? "linear-gradient(135deg, #10b981, #059669)"
              : "linear-gradient(135deg, hsl(217 91% 60%), hsl(217 91% 48%))",
            color: outOfStock ? "#94a3b8" : "white",
            boxShadow: outOfStock
              ? "none"
              : added
              ? "0 4px 12px rgba(16,185,129,0.4)"
              : hovered
              ? "0 6px 20px hsl(217 91% 60% / 0.5)"
              : "0 3px 10px hsl(217 91% 60% / 0.3)",
            transition: "box-shadow 0.25s ease, background 0.25s ease",
          }}
          onClick={handleAddToCart}
          disabled={outOfStock}
          whileTap={!outOfStock ? { scale: 0.96 } : {}}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <AnimatePresence mode="wait">
            {outOfStock ? (
              <motion.span key="out"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5">
                Sin stock
              </motion.span>
            ) : added ? (
              <motion.span key="added"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" /> ¡Agregado!
              </motion.span>
            ) : (
              <motion.span key="add"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5" /> Agregar
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.article>
  );
}
