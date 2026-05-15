import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Zap, Shield, Truck, Headphones,
  Monitor, Smartphone, Volume2, Cpu, Home,
  Gamepad2, Star, Tag, ChevronRight, BadgePercent, Package,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCartSession } from "@/hooks/use-cart-session";
import { useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

/* ── Counter hook ── */
function CountUp({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = Date.now();
    const dur = 1600;
    const tick = () => {
      const t = Math.min((Date.now() - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const cur = ease * to;
      setVal(decimals > 0 ? Math.round(cur * 10) / 10 : Math.floor(cur));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setVal(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, decimals]);

  return (
    <span ref={ref}>
      {decimals > 0 ? val.toFixed(decimals) : val.toLocaleString("es-CL")}
      {suffix}
    </span>
  );
}

/* ── Constants ── */
const CATEGORY_ICONS: Record<string, typeof Headphones> = {
  electronica: Cpu, smartphones: Smartphone, audio: Volume2,
  computacion: Monitor, hogar: Home, gaming: Gamepad2,
};

const CATEGORY_STYLES: Record<string, { gradient: string; iconBg: string; border: string }> = {
  electronica: { gradient: "from-cyan-500/15 to-cyan-600/5",    iconBg: "bg-cyan-500",    border: "border-cyan-200/60 hover:border-cyan-400" },
  smartphones: { gradient: "from-violet-500/15 to-violet-600/5", iconBg: "bg-violet-500",  border: "border-violet-200/60 hover:border-violet-400" },
  audio:       { gradient: "from-pink-500/15 to-pink-600/5",     iconBg: "bg-pink-500",    border: "border-pink-200/60 hover:border-pink-400" },
  computacion: { gradient: "from-blue-500/15 to-blue-600/5",     iconBg: "bg-blue-500",    border: "border-blue-200/60 hover:border-blue-400" },
  hogar:       { gradient: "from-emerald-500/15 to-emerald-600/5",iconBg: "bg-emerald-500", border: "border-emerald-200/60 hover:border-emerald-400" },
  gaming:      { gradient: "from-orange-500/15 to-orange-600/5", iconBg: "bg-orange-500",  border: "border-orange-200/60 hover:border-orange-400" },
};

const features = [
  { icon: Truck,        title: "Envío a todo Chile", desc: "Despacho rápido a cualquier región", gradient: "from-blue-500 to-blue-600",     glow: "rgba(59,130,246,0.25)" },
  { icon: Shield,       title: "Compra segura",      desc: "Tus datos siempre protegidos",       gradient: "from-emerald-500 to-emerald-600", glow: "rgba(16,185,129,0.25)" },
  { icon: Headphones,   title: "Soporte 7/7",        desc: "Atención al cliente todos los días",  gradient: "from-purple-500 to-purple-600",  glow: "rgba(168,85,247,0.25)" },
  { icon: BadgePercent, title: "Precios únicos",     desc: "Directo desde AliExpress",            gradient: "from-orange-500 to-orange-600",  glow: "rgba(249,115,22,0.25)" },
];

const stats = [
  { label: "Productos disponibles", to: 500,  suffix: "+",   decimals: 0 },
  { label: "Clientes satisfechos",  to: 1000, suffix: "+",   decimals: 0 },
  { label: "Valoración promedio",   to: 4.8,  suffix: "★",   decimals: 1 },
  { label: "Horas de entrega",      to: 48,   suffix: "h",   decimals: 0 },
];

const stagger  = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp   = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.38 } } };

/* ── Floating orb ── */
function Orb({ size, top, left, color, delay }: { size: number; top: string; left: string; color: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, top, left, background: color }}
      animate={{ y: [0, -18, 0], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

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
      <section
        className="relative overflow-hidden min-h-[92vh] flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #060b17 0%, #0c1830 40%, #0f1c40 65%, #110b2d 100%)" }}
      >
        {/* Static glows */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.16) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)" }} />

        {/* Floating orbs (desktop only) */}
        <div className="hidden lg:block">
          <Orb size={8}  top="20%" left="12%"  color="rgba(96,165,250,0.7)"  delay={0} />
          <Orb size={5}  top="60%" left="8%"   color="rgba(167,139,250,0.6)" delay={1.2} />
          <Orb size={10} top="35%" left="88%"  color="rgba(59,130,246,0.65)" delay={0.6} />
          <Orb size={6}  top="70%" left="82%"  color="rgba(139,92,246,0.6)"  delay={2} />
          <Orb size={4}  top="15%" left="75%"  color="rgba(96,165,250,0.5)"  delay={1.7} />
          <Orb size={7}  top="80%" left="50%"  color="rgba(129,140,248,0.4)" delay={0.9} />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />

        <div className="container relative z-10 mx-auto px-6 py-24 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-8 text-blue-300"
            style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}
          >
            <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2.5, delay: 1 }}>
              <Zap className="h-3.5 w-3.5" />
            </motion.span>
            Tecnología premium · Envío a todo Chile
          </motion.div>

          {/* Headline — line by line */}
          <div className="max-w-3xl mx-auto">
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.08] tracking-tight mb-6 text-white"
            >
              {["La mejor tech"].map((line, i) => (
                <motion.span
                  key={i}
                  className="block"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.1 + i * 0.12, ease: "easeOut" }}
                >
                  {line}
                </motion.span>
              ))}
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.22, ease: "easeOut" }}
                style={{
                  background: "linear-gradient(90deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                al mejor precio
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl mx-auto"
            >
              Gadgets, periféricos y accesorios seleccionados con envío rápido y precios imbatibles.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-14"
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" asChild className="h-13 px-9 rounded-2xl font-bold text-base"
                  style={{ boxShadow: "0 8px 28px rgba(59,130,246,0.45)" }}
                  data-testid="button-shop-now">
                  <Link href="/productos">
                    Ver catálogo <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" variant="outline" asChild
                  className="h-13 px-9 rounded-2xl font-bold text-base text-white hover:text-white"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <Link href="/productos">
                    <Tag className="mr-2 h-4 w-4" />
                    Ver ofertas
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats counter row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
            >
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.08 }}
                  className="text-center"
                >
                  <div
                    className="text-2xl sm:text-3xl font-black mb-0.5"
                    style={{
                      background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    <CountUp to={s.to} suffix={s.suffix} decimals={s.decimals} />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.9, ease: "easeInOut" }}
        >
          <div className="w-6 h-9 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-white/50" />
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES BAR ── */}
      <section className="bg-white border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.015)", transition: { duration: 0.15 } }}
                  className="flex items-center gap-4 px-6 py-5 cursor-default"
                >
                  <motion.div
                    className={`p-2.5 rounded-xl shrink-0 bg-gradient-to-br ${f.gradient} shadow-sm`}
                    whileHover={{ scale: 1.12, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    style={{ boxShadow: `0 4px 12px ${f.glow}` }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </motion.div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">{f.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      {categories && categories.length > 0 && (
        <section className="py-20 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Explorar</p>
            <h2 className="text-3xl font-bold tracking-tight">Compra por categoría</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">
              Encuentra exactamente lo que buscas navegando por nuestras categorías
            </p>
          </motion.div>
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
                gradient: "from-slate-500/15 to-slate-600/5",
                iconBg: "bg-slate-500",
                border: "border-slate-200/60 hover:border-slate-400",
              };
              return (
                <motion.div key={category.id} variants={fadeUp} whileHover={{ y: -5, transition: { type: "spring", stiffness: 400, damping: 18 } }}>
                  <Link
                    href={`/productos?category=${category.slug}`}
                    className={`group flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${style.gradient} border ${style.border} transition-all duration-200 hover:shadow-lg`}
                    data-testid={`link-category-${category.slug}`}
                  >
                    <motion.div
                      className={`p-3.5 rounded-2xl ${style.iconBg} shadow-md`}
                      whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </motion.div>
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
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Lo más popular</p>
              <h2 className="text-3xl font-bold tracking-tight">Productos Destacados</h2>
              <p className="text-muted-foreground text-sm mt-1.5">Los favoritos de nuestros clientes</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex items-center gap-1.5 font-bold text-sm rounded-xl">
              <Link href="/productos">Ver todos <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </motion.div>

          {loadingFeatured ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            >
              {featuredProducts.map((product) => (
                <motion.div key={product.id} variants={fadeUp} className="h-full">
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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl text-white"
          style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)" }}
        >
          {/* Animated circle */}
          <motion.div
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,0.07)" }}
            animate={{ scale: [1, 1.08, 1], rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,0.05)" }}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }}
          />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-10 py-12">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold mb-4"
                style={{ background: "rgba(255,255,255,0.2)" }}>
                <Zap className="h-3 w-3" /> Oferta especial
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                Descuentos de hasta 40%
              </h2>
              <p className="text-white/75 text-base max-w-md">
                En productos seleccionados de tecnología y gadgets. Solo por tiempo limitado.
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" asChild
                className="shrink-0 font-bold rounded-2xl px-10 h-13 text-base text-primary"
                style={{ background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                <Link href="/productos">Ver ofertas <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── NEW PRODUCTS ── */}
      {allProducts && allProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Recién llegados</p>
                <h2 className="text-3xl font-bold tracking-tight">Nuevos Productos</h2>
                <p className="text-muted-foreground text-sm mt-1.5">Los últimos incorporados al catálogo</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex items-center gap-1.5 font-bold text-sm rounded-xl">
                <Link href="/productos">Ver todos <ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </motion.div>
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
                  <motion.div key={product.id} variants={fadeUp} className="h-full">
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
