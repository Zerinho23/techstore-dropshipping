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
import { Button } from "@/components/ui/button";

const stagger   = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeScale = { hidden: { opacity: 0, scale: 0.95, y: 12 }, show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.26 } } };

export default function Products() {
  const searchParams = new URLSearchParams(window.location.search);
  const categoryParam = searchParams.get("category") || undefined;

  const [search, setSearch]               = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory]           = useState<string | undefined>(categoryParam);

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
      <div className="relative overflow-hidden border-b border-border"
        style={{ background: "linear-gradient(160deg, hsl(var(--primary)/0.05) 0%, transparent 60%)" }}>
        {/* Subtle animated gradient blob */}
        <motion.div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, hsl(var(--primary)/0.08) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        />
        <div className="container mx-auto px-6 py-14 text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-xs font-bold uppercase tracking-widest text-primary mb-2"
          >
            TechStore
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.07 }}
            className="text-4xl font-bold tracking-tight mb-2"
          >
            {activeCategoryName ?? "Catálogo de Productos"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.35 }}
            className="text-muted-foreground text-sm"
          >
            {isLoading
              ? "Cargando productos..."
              : products
              ? `${products.length} producto${products.length !== 1 ? "s" : ""} disponible${products.length !== 1 ? "s" : ""}`
              : "Explora toda nuestra selección de tecnología"}
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col gap-7">

          {/* ── Search ── */}
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto w-full"
          >
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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
              <Button type="submit" className="h-12 px-6 rounded-2xl font-bold shrink-0 shadow-sm">
                Buscar
              </Button>
            </div>
          </motion.form>

          {/* ── Category chips — horizontal scroll, sliding pill ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18 }}
            className="flex items-center gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* "Filtrar:" label */}
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0 mr-1 pl-1">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filtrar:
            </span>

            {/* "Todos" chip */}
            <motion.button
              onClick={() => setCategory(undefined)}
              className="relative shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-150 overflow-hidden"
              style={{
                color: !category ? "white" : undefined,
                border: !category ? "1.5px solid transparent" : "1.5px solid hsl(var(--border))",
              }}
              whileTap={{ scale: 0.93 }}
              data-testid="filter-all"
            >
              {!category && (
                <motion.div
                  layoutId="active-cat-pill"
                  className="absolute inset-0 bg-primary"
                  style={{ borderRadius: 9999 }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <span className="relative z-10">Todos</span>
            </motion.button>

            {categories?.map((cat) => {
              const isActive = category === cat.slug;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setCategory(isActive ? undefined : cat.slug)}
                  className="relative shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-150 overflow-hidden"
                  style={{
                    color: isActive ? "white" : undefined,
                    border: isActive ? "1.5px solid transparent" : "1.5px solid hsl(var(--border))",
                  }}
                  whileTap={{ scale: 0.93 }}
                  data-testid={`filter-category-${cat.slug}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-cat-pill"
                      className="absolute inset-0 bg-primary"
                      style={{ borderRadius: 9999 }}
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">
                    {cat.name}
                    <span className="ml-1.5 text-[11px] opacity-70">({cat.productCount})</span>
                  </span>
                </motion.button>
              );
            })}

            <AnimatePresence>
              {hasFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={clearFilters}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                  data-testid="button-clear-filters"
                >
                  <X className="h-3.5 w-3.5" />
                  Limpiar
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Active filter indicator ── */}
          <AnimatePresence>
            {hasFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground overflow-hidden"
              >
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Product Grid ── */}
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="space-y-3"
                >
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </motion.div>
              ))}
            </motion.div>
          ) : !products || products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-28 text-center gap-4"
            >
              <motion.div
                className="p-5 rounded-2xl bg-muted"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <Package className="h-10 w-10 text-muted-foreground opacity-50" />
              </motion.div>
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
            <AnimatePresence mode="wait">
              <motion.div
                key={`${category ?? "all"}-${debouncedSearch}`}
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
              >
                {products.map((product) => (
                  <motion.div key={product.id} variants={fadeScale} className="h-full">
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
