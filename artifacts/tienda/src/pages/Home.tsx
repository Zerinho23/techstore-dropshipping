import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Zap,
  Shield,
  Truck,
  Headphones,
  Monitor,
  Smartphone,
  Volume2,
  Cpu,
  Home,
  Gamepad2,
  Star,
  Tag,
  ChevronRight,
  BadgePercent,
  Package,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCartSession } from "@/hooks/use-cart-session";
import { useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const CATEGORY_ICONS: Record<string, typeof Headphones> = {
  electronica: Cpu,
  smartphones: Smartphone,
  audio: Volume2,
  computacion: Monitor,
  hogar: Home,
  gaming: Gamepad2,
};

const CATEGORY_STYLES: Record<string, { bg: string; icon: string; ring: string }> = {
  electronica: { bg: "bg-cyan-50 hover:bg-cyan-100", icon: "bg-cyan-500 text-white", ring: "hover:ring-cyan-200" },
  smartphones: { bg: "bg-violet-50 hover:bg-violet-100", icon: "bg-violet-500 text-white", ring: "hover:ring-violet-200" },
  audio: { bg: "bg-pink-50 hover:bg-pink-100", icon: "bg-pink-500 text-white", ring: "hover:ring-pink-200" },
  computacion: { bg: "bg-blue-50 hover:bg-blue-100", icon: "bg-blue-500 text-white", ring: "hover:ring-blue-200" },
  hogar: { bg: "bg-emerald-50 hover:bg-emerald-100", icon: "bg-emerald-500 text-white", ring: "hover:ring-emerald-200" },
  gaming: { bg: "bg-orange-50 hover:bg-orange-100", icon: "bg-orange-500 text-white", ring: "hover:ring-orange-200" },
};

const features = [
  { icon: Truck, title: "Envío a todo Chile", desc: "Despacho rápido a cualquier región", color: "text-blue-600", bg: "bg-blue-100" },
  { icon: Shield, title: "Compra segura", desc: "Tus datos siempre protegidos", color: "text-emerald-600", bg: "bg-emerald-100" },
  { icon: Headphones, title: "Soporte 7/7", desc: "Atención al cliente todos los días", color: "text-purple-600", bg: "bg-purple-100" },
  { icon: BadgePercent, title: "Precios únicos", desc: "Directo desde AliExpress", color: "text-orange-600", bg: "bg-orange-100" },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.38 } } };

export default function HomePage() {
  const { data: featuredProducts, isLoading: loadingFeatured } = useListProducts({ featured: "true", limit: 8 });
  const { data: allProducts, isLoading: loadingAll } = useListProducts({ limit: 4 });
  const { data: categories } = useListCategories();

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

  return (
    <AppLayout>
      {/* ── HERO ── */}
      <section className="relative bg-[#080d1a] text-white overflow-hidden min-h-[92vh] flex items-center justify-center">
        {/* BG image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop&q=80"
            alt="Tecnología"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080d1a]/60 via-[#080d1a]/40 to-[#080d1a]" />
        </div>

        {/* Decorative glows */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative z-10 mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="max-w-3xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-8">
              <Zap className="h-3.5 w-3.5" />
              Tecnología premium · Envío a todo Chile
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.08] tracking-tight mb-6">
              La mejor tech
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-400 to-violet-400 bg-clip-text text-transparent">
                al mejor precio
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl mx-auto">
              Gadgets, periféricos y accesorios seleccionados con envío rápido y precios imbatibles.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <Button
                size="lg"
                asChild
                className="h-13 px-9 rounded-2xl font-bold text-base shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-200"
                data-testid="button-shop-now"
              >
                <Link href="/productos">
                  Ver catálogo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-13 px-9 rounded-2xl font-bold text-base bg-white/5 border-white/20 text-white hover:bg-white/12 hover:text-white hover:border-white/35 hover:scale-105 transition-all duration-200"
              >
                <Link href="/productos?featured=true">
                  <Tag className="mr-2 h-4 w-4" />
                  Ver ofertas
                </Link>
              </Button>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span>4.8/5 valoraciones</span>
              </div>
              <span className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-green-400" />
                <span>Compra segura</span>
              </div>
              <span className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-blue-400" />
                <span>Envío a todo Chile</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <div className="w-6 h-9 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-white/50" />
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES BAR ── */}
      <section className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-center gap-4 px-6 py-5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${f.bg}`}>
                    <Icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{f.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      {categories && categories.length > 0 && (
        <section className="py-20 container mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Explorar</p>
            <h2 className="text-3xl font-bold tracking-tight">Compra por categoría</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">
              Encuentra exactamente lo que buscas navegando por nuestras categorías
            </p>
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-3 sm:grid-cols-6 gap-3"
          >
            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[category.slug] ?? Cpu;
              const style = CATEGORY_STYLES[category.slug] ?? {
                bg: "bg-slate-50 hover:bg-slate-100",
                icon: "bg-slate-500 text-white",
                ring: "hover:ring-slate-200",
              };
              return (
                <motion.div key={category.id} variants={fadeUp}>
                  <Link
                    href={`/productos?category=${category.slug}`}
                    className={`group flex flex-col items-center gap-3 p-5 rounded-2xl ${style.bg} ring-2 ring-transparent ${style.ring} transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
                    data-testid={`link-category-${category.slug}`}
                  >
                    <div className={`p-3.5 rounded-2xl ${style.icon} shadow-md group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold leading-tight text-foreground">{category.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{category.productCount} productos</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-20 bg-gradient-to-b from-muted/40 to-background border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Lo más popular</p>
              <h2 className="text-3xl font-bold tracking-tight">Productos Destacados</h2>
              <p className="text-muted-foreground text-sm mt-1.5">Los favoritos de nuestros clientes</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex items-center gap-1.5 font-bold text-sm rounded-xl">
              <Link href="/productos">
                Ver todos <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
            >
              {featuredProducts.map((product) => (
                <motion.div key={product.id} variants={fadeUp}>
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No hay productos destacados por el momento.</p>
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Button variant="outline" asChild className="rounded-xl w-full font-bold">
              <Link href="/productos">Ver todos los productos <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="py-10 container mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-blue-600 to-violet-600 text-white">
          {/* decorative circles */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-10 py-12">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold mb-4">
                <Zap className="h-3 w-3" /> Oferta especial
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                Descuentos de hasta 40%
              </h2>
              <p className="text-white/75 text-base max-w-md">
                En productos seleccionados de tecnología y gadgets. Solo por tiempo limitado.
              </p>
            </div>
            <Button
              size="lg"
              asChild
              className="shrink-0 bg-white text-primary hover:bg-white/90 font-bold rounded-2xl px-10 h-13 shadow-2xl hover:scale-105 transition-all duration-200 text-base"
            >
              <Link href="/productos">Ver ofertas <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── NEW PRODUCTS ── */}
      {allProducts && allProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-muted/40 to-background border-t border-border">
          <div className="container mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Recién llegados</p>
                <h2 className="text-3xl font-bold tracking-tight">Nuevos Productos</h2>
                <p className="text-muted-foreground text-sm mt-1.5">Los últimos incorporados al catálogo</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex items-center gap-1.5 font-bold text-sm rounded-xl">
                <Link href="/productos">
                  Ver todos <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            {loadingAll ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-5"
              >
                {allProducts.map((product) => (
                  <motion.div key={product.id} variants={fadeUp}>
                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      )}
    </AppLayout>
  );
}
