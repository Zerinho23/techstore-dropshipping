import { AppLayout } from "@/components/layout/AppLayout";
import { formatCLP } from "@/lib/currency";
import { useGetCart, useUpdateCartItem, useRemoveCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartSession } from "@/hooks/use-cart-session";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart() {
  const sessionId = useCartSession();
  const { data: cart, isLoading } = useGetCart({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } });
  
  const queryClient = useQueryClient();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItem.mutate({ id: itemId, data: { quantity: newQuantity } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
      }
    });
  };

  const handleRemove = (itemId: number) => {
    removeItem.mutate({ id: itemId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
      }
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-display font-bold mb-8">Tu Carrito</h1>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
            <div className="w-full lg:w-96">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-4">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-8">Parece que aún no has añadido ningún producto. ¡Descubre nuestras ofertas!</p>
          <Button asChild size="lg" className="w-full">
            <Link href="/productos">Ir de compras</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-8">Tu Carrito</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 border border-border rounded-xl p-4 bg-card">
                <div className="w-24 h-24 bg-muted rounded-md overflow-hidden shrink-0">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Sin imagen</div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <Link href={`/productos/${item.product.id}`} className="font-medium hover:text-primary transition-colors line-clamp-2 pr-4">
                      {item.product.name}
                    </Link>
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-border rounded-md h-8">
                      <button 
                        className="px-2 h-full hover:bg-muted disabled:opacity-50"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updateItem.isPending}
                      >-</button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        className="px-2 h-full hover:bg-muted disabled:opacity-50"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={!item.product.stock || item.quantity >= item.product.stock || updateItem.isPending}
                      >+</button>
                    </div>
                    <div className="font-bold">
                      {formatCLP(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Resumen del pedido</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cart.itemCount} productos)</span>
                  <span>{formatCLP(cart.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-primary font-medium">Gratis</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCLP(cart.total)}</span>
                </div>
              </div>
              
              <Button asChild size="lg" className="w-full group" data-testid="button-checkout">
                <Link href="/checkout">
                  Proceder al pago 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                Impuestos incluidos. El pago se procesará de forma segura.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
