import { AppLayout } from "@/components/layout/AppLayout";
import { formatCLP } from "@/lib/currency";
import { useGetCart, useUpdateCartItem, useRemoveCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartSession } from "@/hooks/use-cart-session";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Trash2, ShoppingBag, ArrowRight, Minus, Plus,
  Truck, ShieldCheck, RotateCcw, Lock, Tag, Package, ChevronRight, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const sessionId = useCartSession();
  const { data: cart, isLoading } = useGetCart(
    { sessionId },
    { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } }
  );
  const queryClient = useQueryClient();
  const updateItem  = useUpdateCartItem();
  const removeItem  = useRemoveCartItem();

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItem.mutate({ id: itemId, data: { quantity: newQuantity } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) }),
    });
  };

  const handleRemove = (itemId: number) => {
    removeItem.mutate({ id: itemId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) }),
    });
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <Skeleton className="h-9 w-40 mb-8 rounded-xl" />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {[1,2,3].map((i) => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)}
            </div>
            <div className="w-full lg:w-96">
              <Skeleton className="h-80 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  /* ── Empty ── */
  if (!cart || cart.items.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center max-w-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div
              className="relative mx-auto w-28 h-28 mb-8"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <div className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))" }}>
                <ShoppingBag className="h-12 w-12 text-primary/50" />
              </div>
            </motion.div>
            <h1 className="text-2xl font-display font-bold mb-3">Tu carrito está vacío</h1>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
              Explora nuestro catálogo y añade los productos que te interesen.
            </p>
            <Button asChild size="lg" className="w-full rounded-2xl font-bold h-12"
              style={{ boxShadow: "0 6px 20px hsl(217 91% 60% / 0.35)" }}>
              <Link href="/productos">
                Explorar productos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-primary" /> Envío gratis</span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Compra segura</span>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  const totalSavings = cart.items.reduce((sum, item) => {
    const comp = item.product.comparePrice;
    if (comp && comp > item.price) return sum + (comp - item.price) * item.quantity;
    return sum;
  }, 0);

  return (
    <AppLayout>
      {/* ── Page Header ── */}
      <div className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 max-w-5xl py-3">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Carrito</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Tu Carrito</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {cart.itemCount} producto{cart.itemCount !== 1 ? "s" : ""} seleccionado{cart.itemCount !== 1 ? "s" : ""}
            </p>
          </div>
          {totalSavings > 0 && (
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold px-4 py-2 rounded-xl">
              <Zap className="h-4 w-4 fill-emerald-500 text-emerald-500" />
              Ahorras {formatCLP(totalSavings)}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Cart Items ── */}
          <div className="flex-1 space-y-3 min-w-0">
            <AnimatePresence initial={false}>
              {cart.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0, scale: 0.95 }}
                  transition={{ duration: 0.24 }}
                  className="group flex gap-4 border border-border rounded-2xl p-4 bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md"
                >
                  {/* Product image */}
                  <Link href={`/productos/${item.product.id}`} className="shrink-0">
                    <div
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden"
                      style={{ background: "linear-gradient(145deg, #0f172a, #1e293b)" }}
                    >
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-slate-600 opacity-40" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <Link
                        href={`/productos/${item.product.id}`}
                        className="font-semibold text-sm sm:text-base hover:text-primary transition-colors line-clamp-2 leading-snug"
                      >
                        {item.product.name}
                      </Link>
                      <motion.button
                        onClick={() => handleRemove(item.id)}
                        className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all"
                        whileTap={{ scale: 0.85 }}
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>

                    {/* Price per unit + compare */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-primary">{formatCLP(item.price)}</span>
                      {item.product.comparePrice && item.product.comparePrice > item.price && (
                        <span className="text-xs text-muted-foreground line-through">{formatCLP(item.product.comparePrice)}</span>
                      )}
                      <span className="text-xs text-muted-foreground">por unidad</span>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Qty controls */}
                      <div className="flex items-center gap-1 bg-muted rounded-xl border border-border/60 overflow-hidden">
                        <motion.button
                          className="w-8 h-8 flex items-center justify-center hover:bg-background disabled:opacity-40 transition-colors"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updateItem.isPending}
                          whileTap={{ scale: 0.85 }}
                          aria-label="Reducir"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </motion.button>
                        <span className="w-9 text-center text-sm font-bold">{item.quantity}</span>
                        <motion.button
                          className="w-8 h-8 flex items-center justify-center hover:bg-background disabled:opacity-40 transition-colors"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={!item.product.stock || item.quantity >= item.product.stock || updateItem.isPending}
                          whileTap={{ scale: 0.85 }}
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </motion.button>
                      </div>

                      {/* Item total */}
                      <div className="text-right">
                        <p className="font-bold text-base">{formatCLP(item.price * item.quantity)}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted-foreground">{item.quantity} unid.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="pt-2">
              <Link href="/productos"
                className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline">
                ← Seguir comprando
              </Link>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="rounded-3xl overflow-hidden border border-border shadow-lg sticky top-24">
              {/* Header */}
              <div className="px-6 py-5 border-b border-border"
                style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))" }}>
                <h2 className="text-lg font-bold">Resumen del pedido</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{cart.itemCount} producto{cart.itemCount !== 1 ? "s" : ""}</p>
              </div>

              <div className="px-6 py-5 space-y-4 bg-card">
                {/* Free shipping banner */}
                <div className="flex items-center gap-3 p-3 rounded-2xl border border-emerald-200 bg-emerald-50">
                  <div className="p-2 rounded-xl bg-emerald-100">
                    <Truck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-700">¡Envío GRATIS incluido!</p>
                    <p className="text-xs text-emerald-600">A todo Chile, sin mínimo de compra</p>
                  </div>
                </div>

                {/* Coupon placeholder */}
                <button className="w-full flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                  <Tag className="h-4 w-4 shrink-0" />
                  <span>¿Tienes un cupón de descuento?</span>
                </button>

                {/* Price breakdown */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">{formatCLP(cart.total)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span className="font-medium">Descuento</span>
                      <span className="font-bold">-{formatCLP(totalSavings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Envío</span>
                    <span>¡Gratis!</span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-base">Total a pagar</span>
                    <span
                      className="text-2xl font-black"
                      style={{
                        background: "linear-gradient(135deg, hsl(217 91% 50%), hsl(262 83% 58%))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {formatCLP(cart.total)}
                    </span>
                  </div>
                  {totalSavings > 0 && (
                    <p className="text-xs text-emerald-600 font-semibold">
                      Ahorras {formatCLP(totalSavings)} en este pedido
                    </p>
                  )}
                </div>

                {/* CTA */}
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild size="lg"
                    className="w-full h-13 rounded-2xl font-bold text-base"
                    style={{ boxShadow: "0 6px 20px hsl(217 91% 60% / 0.38)" }}
                    data-testid="button-checkout">
                    <Link href="/checkout">
                      Proceder al pago <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Lock,      label: "Pago seguro",   color: "#3b82f6", bg: "rgba(59,130,246,0.08)"  },
                    { icon: Truck,     label: "Envío gratis",  color: "#10b981", bg: "rgba(16,185,129,0.08)"  },
                    { icon: RotateCcw, label: "Devoluciones",  color: "#8b5cf6", bg: "rgba(139,92,246,0.08)"  },
                  ].map(({ icon: Icon, label, color, bg }) => (
                    <div key={label} className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-center"
                      style={{ background: bg }}>
                      <Icon className="h-4 w-4" style={{ color }} />
                      <p className="text-[10px] font-semibold leading-tight" style={{ color }}>{label}</p>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-center text-muted-foreground">
                  Datos protegidos con cifrado SSL de 256 bits
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
