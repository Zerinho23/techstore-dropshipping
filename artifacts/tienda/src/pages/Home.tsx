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

const CATEGORY_GRADIENTS: Record<string, string> = {
  electronica: "from-cyan-500/10 to-blue-500/10 border-cyan-200/50 hover:border-cyan-300",
  smartphones: "from-violet-500/10 to-purple-500/10 border-violet-200/50 hover:border-violet-300",
  audio: "from-pink-500/10 to-rose-500/10 border-pink-200/50 hover:border-pink-300",
  computacion: "from-blue-500/10 to-indigo-500/10 border-blue-200/50 hover:border-blue-300",
  hogar: "from-emerald-500/10 to-green-500/10 border-emerald-200/50 hover:border-emerald-300",
  gaming: "from-orange-500/10 to-red-500/10 border-orange-200/50 hover:border-orange-300",
};

const CATEGORY_ICON_COLORS: Record<string, string> = {
  electronica: "text-cyan-600 bg-cyan-100",
  smartphones: "text-violet-600 bg-violet-100",
  audio: "text-pink-600 bg-pink-100",
  computacion: "text-blue-600 bg-blue-100",
  hogar: "text-emerald-600 bg-emerald-100",
  gaming: "text-orange-600 bg-orange-100",
};

const features = [
  {
    icon: Truck,
    title: "Envíos a todo Chile",
    desc: "Despacho rápido y seguro a cualquier región",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Shield,
    title: "Compra 100% Segura",
    desc: "Tus datos y pagos protegidos",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: Headphones,
    title: "Soporte dedicado",
    desc: "Atención al cliente todos los días",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: Zap,
    title: "Última Tecnología",
    desc: "Los mejores gadgets del mercado",
    color: "text-orange-600 bg-orange-50",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function HomePage() {
  const { data: featuredProducts, isLoading: loadingProducts } = useListProducts({
    featured: "true",
    limit: 8,
  });
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
          toast({ title: "Añadido al carrito", description: "Producto agregado correctamente." });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "No se pudo agregar el producto." });
        },
      }
    );
  };

  return (
    <AppLayout>
      {/* ─── Hero ─── */}
      <section className="relative bg-[#0a0f1e] text-white overflow-hidden min-h-[580px] flex items-center">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&h=700&fit=crop"
            alt="Tech background"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e] via-[#0a0f1e]/80 to-transparent" />
        </div>

        {/* Decorative glow */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="container relative z-10 mx-auto px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              <Zap className="h-3.5 w-3.5" />
              Tecnología premium desde AliExpress
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold leading-tight mb-6 tracking-tight">
              La mejor tecnología
              <br />
              <span className="text-primary">al mejor precio</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Gadgets, periféricos y accesorios tech con envío a todo Chile.
              Calidad garantizada y precios imbatibles.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                asChild
                className="h-12 px-8 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                data-testid="button-shop-now"
              >
                <Link href="/productos">
                  Ver catálogo completo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 px-8 rounded-xl font-semibold bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/30"
              >
                <Link href="/productos?featured=true">
                  <Tag className="mr-2 h-4 w-4" />
                  Ofertas
                </Link>
              </Button>
            </div>
            {/* Trust signals */}
            <div className="flex items-center gap-6 mt-8 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span>4.8/5 en reseñas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-green-400" />
                <span>Compra segura</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-blue-400" />
                <span>Envío a todo Chile</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features Bar ─── */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-center gap-4 p-5 md:p-6">
                  <div className={`p-2.5 rounded-xl shrink-0 ${f.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm leading-snug">{f.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      {categories && categories.length > 0 && (
        <section className="py-16 container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold">Categorías</h2>
              <p className="text-muted-foreground text-sm mt-1">Explora por tipo de producto</p>
            </div>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-3 md:grid-cols-6 gap-3"
          >
            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[category.slug] ?? Cpu;
              const gradient = CATEGORY_GRADIENTS[category.slug] ?? "from-slate-500/10 to-gray-500/10 border-slate-200/50";
              const iconColor = CATEGORY_ICON_COLORS[category.slug] ?? "text-slate-600 bg-slate-100";
              return (
                <motion.div key={category.id} variants={itemVariants}>
                  <Link
                    href={`/productos?category=${category.slug}`}
                    className={`group flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-gradient-to-br ${gradient} border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
                    data-testid={`link-category-${category.slug}`}
                  >
                    <div className={`p-3 rounded-xl ${iconColor} transition-transform group-hover:scale-110 duration-200`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold leading-tight">{category.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{category.productCount} productos</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      )}

      {/* ─── Featured Products ─── */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold">Productos Destacados</h2>
              <p className="text-muted-foreground text-sm mt-1">Los más populares de nuestra tienda</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex items-center gap-2 font-semibold">
              <Link href="/productos">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {featuredProducts.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              No hay productos destacados por el momento.
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/productos">Ver todos los productos <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Promo Banner ─── */}
      <section className="py-16 container mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-violet-600 text-white p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold mb-3">
                <Zap className="h-3 w-3" /> Oferta especial
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
                Descuentos de hasta 40%
              </h2>
              <p className="text-white/80 text-sm md:text-base">
                En productos seleccionados de tecnología y gadgets. Solo por tiempo limitado.
              </p>
            </div>
            <Button
              size="lg"
              asChild
              className="shrink-0 bg-white text-primary hover:bg-white/90 font-semibold rounded-xl px-8 shadow-xl"
            >
              <Link href="/productos">
                Ver Ofertas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── All Products Preview ─── */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold">Nuevos Productos</h2>
              <p className="text-muted-foreground text-sm mt-1">Los últimos agregados al catálogo</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex items-center gap-2 font-semibold">
              <Link href="/productos">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {loadingAll ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : allProducts && allProducts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {allProducts.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </div>
      </section>
    </AppLayout>
  );
}
