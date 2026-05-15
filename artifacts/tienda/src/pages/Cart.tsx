import { AppLayout } from "@/components/layout/AppLayout";
import { formatCLP } from "@/lib/currency";
import { useGetCart, useUpdateCartItem, useRemoveCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartSession } from "@/hooks/use-cart-session";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Truck, ShieldCheck, RotateCcw, Lock, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const sessionId = useCartSession();
  const { data: cart, isLoading } = useGetCart(
    { sessionId },
    { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } }
  );

  const queryClient = useQueryClient();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItem.mutate({ id: itemId, data: { quantity: newQuantity } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
      },
    });
  };

  const handleRemove = (itemId: number) => {
    removeItem.mutate({ id: itemId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
      },
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-10">
          <Skeleton className="h-9 w-40 mb-8" />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)}
            </div>
            <div className="w-full lg:w-96">
              <Skeleton className="h-80 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center max-w-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="relative mx-auto w-28 h-28 mb-8">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-primary/40" />
              </div>
            </div>
            <h1 className="text-2xl font-display font-bold mb-3">Tu carrito está vacío</h1>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
              Explora nuestro catálogo y añade los productos que te interesen.
            </p>
            <Button asChild size="lg" className="w-full rounded-2xl font-bold h-12">
              <Link href="/productos">
                Explorar productos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Tu Carrito</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {cart.itemCount} producto{cart.itemCount !== 1 ? "s" : ""} en tu carrito
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Cart Items */}
          <div className="flex-1 space-y-3">
            <AnimatePresence initial={false}>
              {cart.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.22 }}
                  className="flex gap-4 border border-border rounded-2xl p-4 bg-card hover:border-border/80 hover:shadow-sm transition-all"
                >
                  {/* Image */}
                  <Link href={`/productos/${item.product.id}`} className="shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-muted border border-border/50">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          <ShoppingBag className="h-6 w-6 opacity-30" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        href={`/productos/${item.product.id}`}
                        className="font-semibold text-sm sm:text-base hover:text-primary transition-colors line-clamp-2 leading-snug"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCLP(item.price)} por unidad
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      {/* Qty controls */}
                      <div className="flex items-center bg-muted rounded-xl overflow-hidden border border-border/50">
                        <button
                          className="w-8 h-8 flex items-center justify-center hover:bg-background disabled:opacity-40 transition-colors"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updateItem.isPending}
                          aria-label="Reducir cantidad"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          className="w-8 h-8 flex items-center justify-center hover:bg-background disabled:opacity-40 transition-colors"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={!item.product.stock || item.quantity >= item.product.stock || updateItem.isPending}
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Item total */}
                      <p className="font-bold text-base">{formatCLP(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue shopping */}
            <div className="pt-2">
              <Link href="/productos" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1.5">
                ← Seguir comprando
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-24">
              {/* Summary header */}
              <div className="bg-gradient-to-r from-primary/5 to-violet-500/5 border-b border-border px-6 py-4">
                <h2 className="text-lg font-bold">Resumen del pedido</h2>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Coupon */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-dashed border-border text-sm text-muted-foreground">
                  <Tag className="h-4 w-4 shrink-0" />
                  <span>¿Tienes un cupón de descuento?</span>
                </div>

                {/* Breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal ({cart.itemCount} producto{cart.itemCount !== 1 ? "s" : ""})
                    </span>
                    <span className="font-medium">{formatCLP(cart.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="text-emerald-600 font-semibold">¡Gratis!</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex justify-between items-center">
                  <span className="font-bold text-base">Total a pagar</span>
                  <span className="text-2xl font-bold text-primary">{formatCLP(cart.total)}</span>
                </div>

                <Button asChild size="lg" className="w-full h-13 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" data-testid="button-checkout">
                  <Link href="/checkout">
                    Proceder al pago <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { icon: Lock, label: "Pago seguro" },
                    { icon: Truck, label: "Envío gratis" },
                    { icon: RotateCcw, label: "Devoluciones" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-muted/40 text-center">
                      <Icon className="h-4 w-4 text-primary" />
                      <p className="text-[10px] text-muted-foreground font-medium leading-tight">{label}</p>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
                  Impuestos y envío incluidos. Tus datos están protegidos con cifrado SSL.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
