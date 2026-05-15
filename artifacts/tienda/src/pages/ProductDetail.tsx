import { AppLayout } from "@/components/layout/AppLayout";
import { formatCLP } from "@/lib/currency";
import { useGetProduct, useListProducts, getGetCartQueryKey, useAddCartItem } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCartSession } from "@/hooks/use-cart-session";
import {
  ShoppingCart, ShieldCheck, Truck, ArrowLeft,
  Minus, Plus, Star, RotateCcw, Zap, Package,
  Check, Heart, Share2, ZoomIn, BadgeCheck, Lock, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ProductCard } from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "desc",     label: "Descripción" },
  { id: "specs",    label: "Características" },
  { id: "shipping", label: "Envío" },
] as const;
type TabId = typeof TABS[number]["id"];

export default function ProductDetail({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id, 10);
  const { data: product, isLoading } = useGetProduct(productId);
  const { data: relatedProducts } = useListProducts({ limit: 5 });

  const [quantity, setQuantity]   = useState(1);
  const [added, setAdded]         = useState(false);
  const [wished, setWished]       = useState(false);
  const [tab, setTab]             = useState<TabId>("desc");
  const { toast } = useToast();
  const sessionId = useCartSession();
  const queryClient = useQueryClient();
  const addCartItem = useAddCartItem();
  const [, setLocation] = useLocation();

  const handleAddToCart = (goCheckout = false) => {
    if (!product) return;
    addCartItem.mutate(
      { data: { productId: product.id, quantity, sessionId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
          if (goCheckout) { setLocation("/checkout"); return; }
          setAdded(true);
          setTimeout(() => setAdded(false), 1800);
          toast({ title: "¡Añadido!", description: `${quantity}× ${product.name}` });
        },
      }
    );
  };

  const discount = product?.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const savings = product?.comparePrice && product.comparePrice > product.price
    ? product.comparePrice - product.price : 0;

  /* ── Loading ── */
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <Skeleton className="h-5 w-44 mb-8 rounded-xl" />
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square w-full rounded-3xl" />
            <div className="space-y-5">
              <Skeleton className="h-8 w-2/3 rounded-xl" />
              <Skeleton className="h-12 w-1/3 rounded-xl" />
              <Skeleton className="h-5 w-1/2 rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
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
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/productos">Volver al catálogo</Link>
            </Button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  const outOfStock = !product.stock || product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <AppLayout>
      {/* ── Breadcrumb ── */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground py-3 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link href="/productos" className="hover:text-foreground transition-colors">Catálogo</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-foreground font-medium truncate max-w-[180px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-14 mb-16">

          {/* ── Image panel ── */}
          <div className="space-y-3">
            <motion.div
              className="relative aspect-square rounded-3xl overflow-hidden group cursor-zoom-in"
              style={{ background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)" }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                  <Package className="h-16 w-16 opacity-20" />
                  <p className="text-sm">Sin imagen</p>
                </div>
              )}

              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 backdrop-blur-sm text-white rounded-xl px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
                  <ZoomIn className="h-3.5 w-3.5" /> Ampliar
                </div>
              </div>

              {/* Discount badge */}
              {discount >= 10 && (
                <div className="absolute top-4 left-4">
                  <motion.span
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
                    className="inline-flex items-center gap-1 text-white text-sm font-black px-3 py-1.5 rounded-2xl shadow-xl"
                    style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 14px rgba(239,68,68,0.5)" }}
                  >
                    <Zap className="h-3.5 w-3.5 fill-white" /> -{discount}%
                  </motion.span>
                </div>
              )}
              {product.featured && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-lg"
                    style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                    <Star className="h-3 w-3 fill-white" /> Destacado
                  </span>
                </div>
              )}
            </motion.div>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Truck,      label: "Envío a Chile",   color: "#3b82f6", bg: "rgba(59,130,246,0.08)"  },
                { icon: ShieldCheck,label: "Compra segura",   color: "#10b981", bg: "rgba(16,185,129,0.08)"  },
                { icon: RotateCcw,  label: "Devoluciones",    color: "#8b5cf6", bg: "rgba(139,92,246,0.08)"  },
              ].map(({ icon: Icon, label, color, bg }) => (
                <div key={label}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center border"
                  style={{ background: bg, borderColor: color + "20" }}>
                  <div className="p-1.5 rounded-lg" style={{ background: color + "18" }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Info panel (sticky on desktop) ── */}
          <motion.div
            className="flex flex-col md:sticky md:top-24 md:self-start"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            {/* Category */}
            <div className="mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary bg-primary/8 px-2.5 py-1 rounded-full">
                <Zap className="h-3 w-3" /> Tecnología
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-display font-bold leading-tight mb-4 text-slate-900">
              {product.name}
            </h1>

            {/* Stars */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className={cn("h-4 w-4", i <= 4 ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200")} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">4.0 · <span className="underline cursor-pointer hover:text-foreground">32 reseñas</span></span>
            </div>

            {/* Price block */}
            <div
              className="rounded-2xl p-5 mb-5 border"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(139,92,246,0.05) 100%)",
                borderColor: "rgba(59,130,246,0.15)",
              }}
            >
              <div className="flex items-end gap-3 flex-wrap">
                <span
                  className="text-4xl font-black leading-none"
                  style={{
                    background: "linear-gradient(135deg, hsl(217 91% 50%), hsl(262 83% 58%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {formatCLP(product.price)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-base text-muted-foreground line-through mb-0.5">
                    {formatCLP(product.comparePrice)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
                    <Check className="h-3 w-3" />
                    Ahorras {formatCLP(savings)} ({discount}% OFF)
                  </span>
                </div>
              )}
            </div>

            {/* Stock */}
            {outOfStock ? (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold mb-5 w-fit">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Agotado
              </div>
            ) : isLowStock ? (
              <div className="mb-5">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 text-sm font-semibold mb-2 w-fit">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  ¡Solo {product.stock} unidades!
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <motion.div
                    className="h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(10, (product.stock / 10) * 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold mb-5 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                En stock · Envío inmediato
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-3">
                {product.description}
              </p>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 py-4 mb-5 border-y border-border">
              <span className="text-sm font-semibold text-foreground w-20 shrink-0">Cantidad</span>
              <div className="flex items-center gap-1">
                <motion.button
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-muted hover:bg-background disabled:opacity-40 transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Menos"
                >
                  <Minus className="h-3.5 w-3.5" />
                </motion.button>
                <span className="w-12 text-center text-base font-bold">{quantity}</span>
                <motion.button
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-muted hover:bg-background disabled:opacity-40 transition-colors"
                  onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
                  disabled={!product.stock || quantity >= product.stock}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Más"
                >
                  <Plus className="h-3.5 w-3.5" />
                </motion.button>
              </div>
              {product.stock && product.stock > 5 && (
                <span className="text-xs text-muted-foreground">{product.stock} disponibles</span>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 mb-5">
              <motion.button
                className="relative w-full h-14 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 overflow-hidden"
                style={{
                  background: outOfStock ? "#e2e8f0" : "linear-gradient(135deg, hsl(217 91% 58%), hsl(217 91% 45%))",
                  color: outOfStock ? "#94a3b8" : "white",
                  boxShadow: outOfStock ? "none" : "0 8px 24px hsl(217 91% 60% / 0.4)",
                }}
                onClick={() => handleAddToCart(false)}
                disabled={outOfStock || addCartItem.isPending}
                whileHover={!outOfStock ? { scale: 1.01 } : {}}
                whileTap={!outOfStock ? { scale: 0.98 } : {}}
                data-testid="button-add-to-cart"
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span key="added" className="flex items-center gap-2"
                      initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                      <Check className="h-5 w-5" /> ¡Añadido al carrito!
                    </motion.span>
                  ) : (
                    <motion.span key="add" className="flex items-center gap-2"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ShoppingCart className="h-5 w-5" />
                      {outOfStock ? "Agotado" : `Añadir${quantity > 1 ? ` (${quantity})` : ""} al carrito`}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-2xl font-bold border-2 hover:border-primary hover:text-primary"
                disabled={outOfStock}
                onClick={() => handleAddToCart(true)}
              >
                Comprar ahora →
              </Button>
            </div>

            {/* Action row */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setWished(!wished)}
                className="flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded-xl border hover:bg-muted"
                style={{ color: wished ? "#ef4444" : undefined, borderColor: wished ? "#fca5a5" : undefined }}
              >
                <Heart className="h-4 w-4" style={{ fill: wished ? "#ef4444" : "none", color: wished ? "#ef4444" : "currentColor" }} />
                {wished ? "Guardado" : "Guardar"}
              </button>
              <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl border hover:bg-muted transition-colors">
                <Share2 className="h-4 w-4" /> Compartir
              </button>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: BadgeCheck,  label: "Producto verificado", color: "#3b82f6" },
                { icon: Truck,       label: "Envío gratuito",      color: "#10b981" },
                { icon: Lock,        label: "Pago 100% seguro",    color: "#8b5cf6" },
              ].map(({ icon: Icon, label, color }) => (
                <span key={label}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border"
                  style={{ color, borderColor: color + "30", background: color + "08" }}>
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Tabs ── */}
        <div className="border border-border rounded-3xl overflow-hidden mb-16 shadow-sm">
          {/* Tab header */}
          <div className="flex border-b border-border bg-muted/30">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative flex-1 py-4 text-sm font-semibold transition-colors",
                  tab === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
                {tab === t.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-6 lg:p-8"
            >
              {tab === "desc" && (
                <div>
                  <h3 className="font-bold text-lg mb-3">Descripción del producto</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {product.description || "Este producto no tiene descripción disponible por el momento."}
                  </p>
                </div>
              )}
              {tab === "specs" && (
                <div>
                  <h3 className="font-bold text-lg mb-4">Características técnicas</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      ["Categoría", "Tecnología"],
                      ["Estado", product.stock && product.stock > 0 ? "Disponible" : "Agotado"],
                      ["Stock", product.stock ? `${product.stock} unidades` : "Sin stock"],
                      ["Garantía", "12 meses"],
                      ["Envío", "A todo Chile"],
                      ["Origen", "Importado"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-muted/40 border border-border/60 text-sm">
                        <span className="text-muted-foreground font-medium">{k}</span>
                        <span className="font-semibold text-foreground">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tab === "shipping" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg mb-4">Información de envío</h3>
                  {[
                    { icon: Truck,      title: "Envío a todo Chile", desc: "Despacho desde Santiago con cobertura nacional. Tiempo estimado: 3-7 días hábiles.", color: "#3b82f6" },
                    { icon: ShieldCheck,title: "Compra protegida",   desc: "Tus pagos están asegurados. Si el producto no llega o no es el esperado, te devolvemos el dinero.", color: "#10b981" },
                    { icon: RotateCcw,  title: "Devoluciones fáciles", desc: "Tienes hasta 30 días para devolver el producto sin costo adicional. Proceso 100% online.", color: "#8b5cf6" },
                  ].map(({ icon: Icon, title, desc, color }) => (
                    <div key={title} className="flex gap-4 p-4 rounded-2xl border" style={{ borderColor: color + "25", background: color + "06" }}>
                      <div className="p-2.5 rounded-xl shrink-0" style={{ background: color + "15" }}>
                        <Icon className="h-5 w-5" style={{ color }} />
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-0.5">{title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Related Products ── */}
        {relatedProducts && relatedProducts.filter((p) => p.id !== product.id).length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1.5">Descubre más</p>
                <h2 className="text-2xl font-display font-bold">También te podría interesar</h2>
              </div>
              <Link href="/productos" className="text-sm font-semibold text-primary hover:underline hidden sm:flex items-center gap-1">
                Ver catálogo <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {relatedProducts
                .filter((p) => p.id !== product.id)
                .slice(0, 4)
                .map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="h-full"
                  >
                    <ProductCard product={p}
                      onAddToCart={(id) => {
                        addCartItem.mutate(
                          { data: { productId: id, quantity: 1, sessionId } },
                          { onSuccess: () => {
                            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
                            toast({ title: "Añadido al carrito" });
                          }},
                        );
                      }}
                    />
                  </motion.div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      {!outOfStock && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-4 border-t border-border"
          style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)" }}>
          <div className="flex gap-3">
            <div className="flex items-center gap-1 bg-muted rounded-xl px-2 border border-border">
              <button className="w-8 h-10 flex items-center justify-center" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-sm">{quantity}</span>
              <button className="w-8 h-10 flex items-center justify-center" onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}>
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              className="flex-1 h-12 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, hsl(217 91% 58%), hsl(217 91% 45%))", boxShadow: "0 4px 16px hsl(217 91% 60% / 0.4)" }}
              onClick={() => handleAddToCart(false)}
            >
              <ShoppingCart className="h-5 w-5" />
              Añadir al carrito
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
