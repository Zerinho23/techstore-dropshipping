import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCartSession } from "@/hooks/use-cart-session";
import { useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featuredProducts, isLoading: loadingProducts } = useListProducts({ featured: "true", limit: 4 });
  const { data: categories } = useListCategories();
  
  const { toast } = useToast();
  const sessionId = useCartSession();
  const queryClient = useQueryClient();
  const addCartItem = useAddCartItem();

  const handleAddToCart = (productId: number) => {
    addCartItem.mutate({ data: { productId, quantity: 1, sessionId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
        toast({
          title: "Añadido al carrito",
          description: "El producto se ha añadido correctamente.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo añadir el producto al carrito.",
        });
      }
    });
  };

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-50">
          <img 
            src="/hero-banner.png" 
            alt="TechStore Banner" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-24 md:py-32 flex flex-col items-start max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6 tracking-tight">
            La mejor tecnología<br/>al alcance de tu mano
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
            Descubre los últimos gadgets, periféricos y accesorios con envíos a todo Chile. Calidad premium y precios imbatibles.
          </p>
          <div className="flex gap-4">
            <Button size="lg" asChild className="text-md px-8 rounded-full h-12">
              <Link href="/productos" data-testid="button-shop-now">Ver Catálogo</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-md px-8 rounded-full h-12 bg-black/20 border-white/20 hover:bg-white/10 hover:text-white">
              <Link href="/productos?category=ofertas">Ofertas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="flex items-center gap-4 p-4 md:justify-center">
              <Truck className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Envíos a todo Chile</h3>
                <p className="text-sm text-muted-foreground">Rápido y seguro</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 md:justify-center">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Garantía Asegurada</h3>
                <p className="text-sm text-muted-foreground">Compra con confianza</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 md:justify-center">
              <Zap className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Última Tecnología</h3>
                <p className="text-sm text-muted-foreground">Innovación constante</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-display font-bold">Productos Destacados</h2>
          <Button variant="ghost" asChild className="hidden sm:flex gap-2">
            <Link href="/productos">Ver todos <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : featuredProducts && featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No hay productos destacados por el momento.
          </div>
        )}
        
        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" asChild className="w-full gap-2">
            <Link href="/productos">Ver todos los productos <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold mb-10 text-center">Categorías</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(category => (
                <Link 
                  key={category.id} 
                  href={`/productos?category=${category.slug}`}
                  className="group relative rounded-xl overflow-hidden aspect-video bg-card hover:shadow-lg transition-all duration-300 border border-border flex flex-col items-center justify-center p-6 text-center"
                >
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{category.productCount || 0} productos</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </AppLayout>
  );
}
