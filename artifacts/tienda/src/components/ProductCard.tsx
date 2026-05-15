import { Link, useLocation } from "wouter";
import { formatCLP } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@workspace/api-client-react";
import { ShoppingCart, Eye, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [, setLocation] = useLocation();

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0;

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = !product.stock || product.stock <= 0;

  return (
    <motion.div
      className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 flex flex-col h-full transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      data-testid={`card-product-${product.id}`}
    >
      {/* Image */}
      <Link href={`/productos/${product.id}`} className="block relative overflow-hidden bg-muted" style={{ aspectRatio: "1/1" }}>
        {product.imageUrl ? (
          <motion.img
            src={product.imageUrl}
            alt={product.name}
            className="object-cover w-full h-full"
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            Sin imagen
          </div>
        )}

        {/* Overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={(e) => { e.preventDefault(); setLocation(`/productos/${product.id}`); }}
            className="bg-white text-black rounded-full px-4 py-2 text-xs font-semibold flex items-center gap-1.5 hover:bg-primary hover:text-white transition-colors"
            data-testid={`button-view-${product.id}`}
          >
            <Eye className="h-3.5 w-3.5" />
            Ver producto
          </button>
        </motion.div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.featured && !discount && (
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="h-2.5 w-2.5" /> Destacado
            </span>
          )}
        </div>

        {isLowStock && (
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <div className="bg-orange-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-lg text-center">
              Solo quedan {product.stock} unidades
            </div>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <Link href={`/productos/${product.id}`}>
            <h3
              className="font-semibold text-sm leading-snug line-clamp-2 hover:text-primary transition-colors"
              data-testid={`text-product-name-${product.id}`}
            >
              {product.name}
            </h3>
          </Link>
          {product.sku && (
            <p className="text-xs text-muted-foreground mt-0.5">SKU: {product.sku}</p>
          )}
        </div>

        <div className="mt-auto space-y-3">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span
              className="text-xl font-bold text-foreground"
              data-testid={`text-price-${product.id}`}
            >
              {formatCLP(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCLP(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <button
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              outOfStock
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-sm hover:shadow-md hover:shadow-primary/20"
            }`}
            onClick={() => !outOfStock && onAddToCart?.(product.id)}
            disabled={outOfStock}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <ShoppingCart className="h-4 w-4" />
            {outOfStock ? "Agotado" : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
