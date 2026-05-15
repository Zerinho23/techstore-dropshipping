import { AppLayout } from "@/components/layout/AppLayout";
import { formatCLP } from "@/lib/currency";
import { useGetProduct, useListProducts, getGetCartQueryKey, useAddCartItem } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCartSession } from "@/hooks/use-cart-session";
import { ShoppingCart, ShieldCheck, Truck, ChevronLeft, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ProductCard } from "@/components/ProductCard";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id, 10);
  const { data: product, isLoading } = useGetProduct(productId);
  const { data: relatedProducts } = useListProducts({ category: product?.categoryId ? product.category?.slug : undefined, limit: 4 });
  
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const sessionId = useCartSession();
  const queryClient = useQueryClient();
  const addCartItem = useAddCartItem();
  const [, setLocation] = useLocation();

  const handleAddToCart = () => {
    if (!product) return;
    addCartItem.mutate({ data: { productId: product.id, quantity, sessionId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
        toast({
          title: "Añadido al carrito",
          description: `${quantity}x ${product.name} se ha añadido a tu carrito.`,
        });
      }
    });
  };

  const discount = product?.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
          <Button asChild><Link href="/productos">Volver al catálogo</Link></Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/productos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>
        
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
            {discount > 0 && (
              <Badge className="absolute top-4 right-4 z-10 text-lg py-1 px-3 bg-destructive text-destructive-foreground">
                -{discount}%
              </Badge>
            )}
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Sin imagen
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-2 text-sm text-primary font-medium">
              {product.category?.name || "Categoría"}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-bold">{formatCLP(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-lg text-muted-foreground line-through mb-1">
                  {formatCLP(product.comparePrice)}
                </span>
              )}
            </div>
            
            <div className="prose prose-sm dark:prose-invert mb-8">
              <p className="text-muted-foreground text-base leading-relaxed">
                {product.description || "Sin descripción detallada."}
              </p>
            </div>
            
            <div className="space-y-4 py-6 border-y border-border mb-8">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-24">Cantidad</span>
                <div className="flex items-center border border-border rounded-md">
                  <button 
                    className="px-3 py-1 hover:bg-muted disabled:opacity-50"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button 
                    className="px-3 py-1 hover:bg-muted disabled:opacity-50"
                    onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
                    disabled={!product.stock || quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">
                  {product.stock ? `${product.stock} disponibles` : "Agotado"}
                </span>
              </div>
            </div>
            
            <div className="flex gap-4 mt-auto">
              <Button 
                size="lg" 
                className="flex-1 text-base h-14" 
                onClick={handleAddToCart}
                disabled={!product.stock || product.stock <= 0}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock && product.stock > 0 ? "Añadir al carrito" : "Agotado"}
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                className="flex-1 text-base h-14"
                disabled={!product.stock || product.stock <= 0}
                onClick={() => {
                  handleAddToCart();
                  setLocation('/checkout');
                }}
              >
                Comprar ahora
              </Button>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5" /> Envío a todo Chile
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Compra segura
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts && relatedProducts.filter(p => p.id !== product.id).length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-display font-bold mb-8">También te podría interesar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.filter(p => p.id !== product.id).slice(0, 4).map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onAddToCart={(id) => {
                    addCartItem.mutate({ data: { productId: id, quantity: 1, sessionId } }, {
                      onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
                        toast({ title: "Añadido al carrito" });
                      }
                    });
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
