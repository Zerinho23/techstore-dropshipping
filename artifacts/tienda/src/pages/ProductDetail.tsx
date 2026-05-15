import { AppLayout } from "@/components/layout/AppLayout";
import { formatCLP } from "@/lib/currency";
import { useGetProduct, useListProducts, getGetCartQueryKey, useAddCartItem } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCartSession } from "@/hooks/use-cart-session";
import {
  ShoppingCart, ShieldCheck, Truck, ArrowLeft,
  Minus, Plus, Star, RotateCcw, Zap, Package,
  CheckCircle, BadgeCheck,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id, 10);
  const { data: product, isLoading } = useGetProduct(productId);
  const { data: relatedProducts } = useListProducts({ limit: 5 });

  const [quantity, setQuantity] = useState(1);
  const [addedBounce, setAddedBounce] = useState(false);
  const { toast } = useToast();
  const sessionId = useCartSession();
  const queryClient = useQueryClient();
  const addCartItem = useAddCartItem();
  const [, setLocation] = useLocation();

  const handleAddToCart = () => {
    if (!product) return;
    addCartItem.mutate(
      { data: { productId: product.id, quantity, sessionId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
          setAddedBounce(true);
          setTimeout(() => setAddedBounce(false), 600);
          toast({
            title: "¡Añadido al carrito!",
            description: `${quantity}× ${product.name}`,
          });
        },
      }
    );
  };

  const discount =
    product?.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-10">
          <Skeleton className="h-5 w-44 mb-8" />
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="space-y-5">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/productos">Volver al catálogo</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const stockStatus =
    !product.stock || product.stock === 0
      ? { label: "Agotado", color: "text-red-500", bg: "bg-red-50 border-red-200" }
      : product.stock <= 3
      ? { label: `Últimas ${product.stock} unidades`, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" }
      : product.stock <= 10
      ? { label: `${product.stock} disponibles`, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" }
      : { label: "En stock", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-foreground transition-colors">Catálogo</Link>
          <span>/</span>
          <span className="text-foreground font-medium line-clamp-1 max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 mb-20">
          {/* Image panel */}
          <div className="relative">
            {discount > 0 && (
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-flex items-center gap-1 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg">
                  <Zap className="h-3.5 w-3.5" /> -{discount}%
                </span>
              </div>
            )}
            {product.featured && (
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow">
                  <Star className="h-3 w-3 fill-white" /> Destacado
                </span>
              </div>
            )}

            <motion.div
              className="relative aspect-square rounded-3xl overflow-hidden bg-muted border border-border/50 shadow-sm group cursor-zoom-in"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.25 }}
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <Package className="h-16 w-16 opacity-20" />
                  <p className="text-sm">Sin imagen</p>
                </div>
              )}
            </motion.div>

            {/* Trust row below image */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { icon: Truck, label: "Envío a Chile" },
                { icon: ShieldCheck, label: "Compra segura" },
                { icon: RotateCcw, label: "Devoluciones" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-muted/50 border border-border/50 text-center">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info panel */}
          <div className="flex flex-col">
            {/* Category tag */}
            <div className="mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Tecnología</span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold leading-tight mb-5">
              {product.name}
            </h1>

            {/* Rating mock */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cn("h-4 w-4", i <= 4 ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30 fill-muted-foreground/10")}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-medium">4.0 · 32 reseñas</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-5">
              <span className="text-4xl font-bold text-foreground">{formatCLP(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <div className="flex flex-col">
                  <span className="text-base text-muted-foreground line-through mb-0.5">
                    {formatCLP(product.comparePrice)}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    Ahorras {formatCLP(product.comparePrice - product.price)}
                  </span>
                </div>
              )}
            </div>

            {/* Stock indicator */}
            <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border w-fit mb-5", stockStatus.bg, stockStatus.color)}>
              <CheckCircle className="h-3.5 w-3.5" />
              {stockStatus.label}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-4">
                {product.description}
              </p>
            )}

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-7 py-5 border-y border-border">
              <span className="text-sm font-semibold text-foreground min-w-20">Cantidad</span>
              <div className="flex items-center bg-muted rounded-2xl border border-border/50 overflow-hidden">
                <button
                  className="w-10 h-10 flex items-center justify-center hover:bg-background disabled:opacity-40 transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label="Menos"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                <button
                  className="w-10 h-10 flex items-center justify-center hover:bg-background disabled:opacity-40 transition-colors"
                  onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
                  disabled={!product.stock || quantity >= product.stock}
                  aria-label="Más"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <motion.div
                className="flex-1"
                animate={addedBounce ? { scale: [1, 1.04, 0.98, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Button
                  size="lg"
                  className="w-full h-14 text-base rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  onClick={handleAddToCart}
                  disabled={!product.stock || product.stock <= 0 || addCartItem.isPending}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock && product.stock > 0 ? "Añadir al carrito" : "Agotado"}
                </Button>
              </motion.div>

              <Button
                size="lg"
                variant="secondary"
                className="flex-1 h-14 text-base rounded-2xl font-bold"
                disabled={!product.stock || product.stock <= 0}
                onClick={() => {
                  handleAddToCart();
                  setLocation("/checkout");
                }}
              >
                Comprar ahora
              </Button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: BadgeCheck, label: "Producto verificado" },
                { icon: Truck, label: "Envío gratuito" },
                { icon: ShieldCheck, label: "Garantía incluida" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border/50"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.filter((p) => p.id !== product.id).length > 0 && (
          <div className="border-t border-border pt-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1.5">Descubre más</p>
                <h2 className="text-2xl font-display font-bold">También te podría interesar</h2>
              </div>
              <Link href="/productos" className="text-sm font-semibold text-primary hover:underline hidden sm:block">
                Ver catálogo →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {relatedProducts
                .filter((p) => p.id !== product.id)
                .slice(0, 4)
                .map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={(id) => {
                      addCartItem.mutate(
                        { data: { productId: id, quantity: 1, sessionId } },
                        {
                          onSuccess: () => {
                            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
                            toast({ title: "Añadido al carrito" });
                          },
                        }
                      );
                    }}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
