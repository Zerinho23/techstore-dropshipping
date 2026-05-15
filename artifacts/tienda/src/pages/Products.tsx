import { AppLayout } from "@/components/layout/AppLayout";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, X, Package, SlidersHorizontal } from "lucide-react";
import { useCartSession } from "@/hooks/use-cart-session";
import { useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeScale = { hidden: { opacity: 0, scale: 0.96, y: 10 }, show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.28 } } };

const CATEGORY_COLORS: Record<string, string> = {
  electronica:  "data-[active=true]:bg-cyan-500    data-[active=true]:text-white data-[active=true]:border-cyan-500",
  smartphones:  "data-[active=true]:bg-violet-500  data-[active=true]:text-white data-[active=true]:border-violet-500",
  audio:        "data-[active=true]:bg-pink-500    data-[active=true]:text-white data-[active=true]:border-pink-500",
  computacion:  "data-[active=true]:bg-blue-500    data-[active=true]:text-white data-[active=true]:border-blue-500",
  hogar:        "data-[active=true]:bg-emerald-500 data-[active=true]:text-white data-[active=true]:border-emerald-500",
  gaming:       "data-[active=true]:bg-orange-500  data-[active=true]:text-white data-[active=true]:border-orange-500",
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
          toast({ title: "¡Listo!", description: "Producto añadido al carrito." });
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
  const activeCategoryName = categories?.find((c) => c.slug === category)?.name;

  return (
    <AppLayout>
      {/* ── Page Header ── */}
      <div className="relative bg-gradient-to-b from-muted/60 to-background border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.06),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-6 py-14 text-center relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">TechStore</p>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            {activeCategoryName ? activeCategoryName : "Catálogo de Productos"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isLoading
              ? "Cargando productos..."
              : products
              ? `${products.length} producto${products.length !== 1 ? "s" : ""} disponible${products.length !== 1 ? "s" : ""}`
              : "Explora toda nuestra selección de tecnología"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col gap-7">

          {/* ── Search ── */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto w-full">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Buscar productos por nombre o categoría..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (e.target.value === "") setDebouncedSearch("");
                  }}
                  className="pl-11 pr-4 h-12 rounded-2xl border-border/70 bg-card shadow-sm text-sm focus-visible:ring-primary/30"
                  data-testid="input-search"
                />
              </div>
              <Button
                type="submit"
                className="h-12 px-6 rounded-2xl font-bold shrink-0 shadow-sm"
              >
                Buscar
              </Button>
            </div>
          </form>

          {/* ── Category chips ── */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filtrar:
            </span>

            <button
              onClick={() => setCategory(undefined)}
              data-active={!category}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150",
                !category
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/25 hover:bg-muted/60"
              )}
              data-testid="filter-all"
            >
              Todos
            </button>

            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.slug === category ? undefined : cat.slug)}
                data-active={category === cat.slug}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150",
                  CATEGORY_COLORS[cat.slug] ?? "",
                  category === cat.slug
                    ? "shadow-md"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/25 hover:bg-muted/60"
                )}
                data-testid={`filter-category-${cat.slug}`}
              >
                {cat.name}
                <span className={cn("ml-1.5 text-[11px] font-normal opacity-70")}>
                  ({cat.productCount})
                </span>
              </button>
            ))}

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                data-testid="button-clear-filters"
              >
                <X className="h-3.5 w-3.5" />
                Limpiar
              </button>
            )}
          </div>

          {/* ── Active filter indicator ── */}
          {hasFilters && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Mostrando resultados para:</span>
              {debouncedSearch && (
                <span className="font-semibold text-foreground bg-muted px-2.5 py-0.5 rounded-full">
                  "{debouncedSearch}"
                </span>
              )}
              {activeCategoryName && (
                <span className="font-semibold text-foreground bg-muted px-2.5 py-0.5 rounded-full">
                  {activeCategoryName}
                </span>
              )}
            </div>
          )}

          {/* ── Product Grid ── */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : !products || products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-28 text-center gap-4"
            >
              <div className="p-5 rounded-2xl bg-muted">
                <Package className="h-10 w-10 text-muted-foreground opacity-50" />
              </div>
              <div>
                <p className="font-bold text-lg">Sin resultados</p>
                <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">
                  No encontramos productos con esos criterios. Prueba con otro término.
                </p>
              </div>
              <Button variant="outline" onClick={clearFilters} className="rounded-xl mt-2 font-semibold">
                Ver todos los productos
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence>
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
              >
                {products.map((product) => (
                  <motion.div key={product.id} variants={fadeScale}>
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
