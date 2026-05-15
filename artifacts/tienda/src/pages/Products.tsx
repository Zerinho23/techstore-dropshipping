import { AppLayout } from "@/components/layout/AppLayout";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCartSession } from "@/hooks/use-cart-session";
import { useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function Products() {
  const searchParams = new URLSearchParams(window.location.search);
  const categoryParam = searchParams.get("category") || undefined;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(categoryParam);

  const { data: categories } = useListCategories();
  const { data: products, isLoading } = useListProducts({
    search: debouncedSearch || undefined,
    category: category && category !== "all" ? category : undefined,
  });

  const { toast } = useToast();
  const sessionId = useCartSession();
  const queryClient = useQueryClient();
  const addCartItem = useAddCartItem();

  const handleAddToCart = (productId: number) => {
    addCartItem.mutate(
      { data: { productId, quantity: 1, sessionId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
          toast({ title: "Añadido al carrito", description: "Producto agregado correctamente." });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "No se pudo agregar el producto." });
        },
      }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory(undefined);
  };

  const hasFilters = !!debouncedSearch || !!category;

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-display font-bold">Catálogo de Productos</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {products ? `${products.length} productos disponibles` : "Cargando productos..."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-6">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-28 h-11 rounded-xl"
              data-testid="input-search"
            />
            <Button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 rounded-lg text-xs"
            >
              Buscar
            </Button>
          </form>

          {/* Category chips */}
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            <button
              onClick={() => setCategory(undefined)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
                !category
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              )}
              data-testid="filter-all"
            >
              Todos
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.slug === category ? undefined : cat.slug)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
                  category === cat.slug
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                )}
                data-testid={`filter-category-${cat.slug}`}
              >
                {cat.name}
                <span className="ml-1.5 text-xs opacity-60">({cat.productCount})</span>
              </button>
            ))}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/5 transition-colors"
                data-testid="button-clear-filters"
              >
                <X className="h-3.5 w-3.5" />
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg">No se encontraron productos</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Intenta con otras palabras clave o cambia los filtros.
                </p>
              </div>
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              >
                {products.map((product) => (
                  <motion.div key={product.id} variants={itemVariants} layout>
                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
