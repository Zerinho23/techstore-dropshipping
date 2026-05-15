import { Link, useLocation } from "wouter";
import { formatCLP } from "@/lib/currency";
import type { Product } from "@workspace/api-client-react";
import { ShoppingCart, Eye, Zap, Star } from "lucide-react";
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
      className="group relative bg-card rounded-2xl overflow-hidden border border-border/60 flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:shadow-black/8 hover:border-primary/25 hover:-translate-y-1"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      data-testid={`card-product-${product.id}`}
    >
      {/* Image area */}
      <Link
        href={`/productos/${product.id}`}
        className="block relative overflow-hidden bg-muted/50"
        style={{ aspectRatio: "1/1" }}
      >
        {product.imageUrl ? (
          <motion.img
            src={product.imageUrl}
            alt={product.name}
            className="object-cover w-full h-full"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ShoppingCart className="h-10 w-10 opacity-20" />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        />

        {/* Quick-view button — slides up on hover */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 flex justify-center pb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 12 }}
          transition={{ duration: 0.22 }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              setLocation(`/productos/${product.id}`);
            }}
            className="flex items-center gap-1.5 bg-white text-gray-900 rounded-full px-4 py-1.5 text-xs font-bold shadow-lg hover:bg-primary hover:text-white transition-colors"
            data-testid={`button-view-${product.id}`}
          >
            <Eye className="h-3.5 w-3.5" />
            Ver detalle
          </button>
        </motion.div>

        {/* Badges — top left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {discount >= 10 && (
            <span className="inline-flex items-center bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
              -{discount}%
            </span>
          )}
          {product.featured && !discount && (
            <span className="inline-flex items-center gap-0.5 bg-primary text-primary-foreground text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
              <Star className="h-2.5 w-2.5 fill-current" /> Top
            </span>
          )}
        </div>

        {/* Low stock pill — bottom left */}
        {isLowStock && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              ¡Últimas {product.stock}!
            </span>
          </div>
        )}
      </Link>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <Link href={`/productos/${product.id}`} className="flex-1">
          <h3
            className="font-semibold text-sm leading-snug line-clamp-2 hover:text-primary transition-colors group-hover:text-primary/80"
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto space-y-3">
          {/* Price row */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className="text-lg font-bold text-foreground"
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

          {/* Add to cart button */}
          <motion.button
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              outOfStock
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : added
                ? "bg-green-500 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md hover:shadow-primary/25"
            }`}
            whileTap={outOfStock ? {} : { scale: 0.97 }}
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
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
