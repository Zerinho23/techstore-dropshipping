import { useLocation, Link } from "wouter";
import {
  ShoppingCart, Search, Menu, X, Zap, ChevronDown,
  LayoutDashboard, ArrowRight, Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartSession } from "@/hooks/use-cart-session";
import { useGetCart, useListCategories } from "@workspace/api-client-react";
import { getGetCartQueryKey } from "@workspace/api-client-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const mobileNavItem = {
  hidden: { opacity: 0, x: -12 },
  show:   { opacity: 1, x:   0, transition: { duration: 0.2 } },
};
const mobileNavList = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.055 } },
};

export function Navbar() {
  const [location, setLocation] = useLocation();
  const sessionId = useCartSession();
  const { data: cart } = useGetCart(
    { sessionId },
    { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } }
  );
  const { data: categories } = useListCategories();
  const { isAdmin } = useAdminAuth();

  const [mobileOpen, setMobileOpen]   = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled]       = useState(false);
  const [announced, setAnnounced]     = useState(() => {
    try { return localStorage.getItem("ann_v2") !== "1"; } catch { return true; }
  });
  const [cartBump, setCartBump]       = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const prevCount = useRef(cart?.itemCount ?? 0);

  const itemCount = cart?.itemCount ?? 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCatalogOpen(false);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 80);
    else setSearchQuery("");
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setCartBump(true);
      setTimeout(() => setCartBump(false), 450);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  const dismissAnnouncement = () => {
    try { localStorage.setItem("ann_v2", "1"); } catch {}
    setAnnounced(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      {/* ── Announcement bar ── */}
      <AnimatePresence>
        {announced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden sticky top-0 z-[60]"
          >
            <div
              className="relative flex items-center justify-center py-2 px-10 text-white text-xs font-semibold"
              style={{ background: "linear-gradient(90deg, #1d4ed8 0%, #4f46e5 50%, #7c3aed 100%)" }}
            >
              <Truck className="h-3.5 w-3.5 mr-2 shrink-0" />
              <span className="text-center leading-tight">
                ⚡ <strong>Envío GRATIS</strong> a todo Chile en todos los pedidos&nbsp;·&nbsp;Descuentos de hasta <strong>43%</strong>&nbsp;·&nbsp;+1.000 clientes satisfechos
              </span>
              <button
                onClick={dismissAnnouncement}
                className="absolute right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b transition-all duration-300",
          scrolled
            ? "bg-background/96 backdrop-blur-md border-border/60 shadow-sm"
            : "bg-background/96 backdrop-blur-md border-border/40"
        )}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group" data-testid="link-home">
            <motion.div
              className="bg-primary text-primary-foreground p-1.5 rounded-lg"
              whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
            >
              <Zap className="h-5 w-5" />
            </motion.div>
            <span className="font-display font-bold text-xl tracking-tight">TechStore</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/"
              className={cn(
                "relative px-4 py-2 rounded-lg transition-colors",
                location === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {location === "/" && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/8 rounded-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">Inicio</span>
            </Link>

            <div className="relative" onMouseLeave={() => setCatalogOpen(false)}>
              <button
                onMouseEnter={() => setCatalogOpen(true)}
                onClick={() => setLocation("/productos")}
                className={cn(
                  "relative flex items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                  location.startsWith("/productos")
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                data-testid="link-products"
              >
                {location.startsWith("/productos") && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-primary/8 rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  Catálogo
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", catalogOpen && "rotate-180")} />
                </span>
              </button>

              <AnimatePresence>
                {catalogOpen && categories && categories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute left-0 top-full mt-2 w-60 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                    onMouseEnter={() => setCatalogOpen(true)}
                  >
                    <div className="p-2">
                      <Link href="/productos"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                        Todos los productos
                      </Link>
                      <div className="h-px bg-border my-1.5" />
                      {categories.map((cat, i) => (
                        <motion.div
                          key={cat.id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.15 }}
                        >
                          <Link
                            href={`/productos?category=${cat.slug}`}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <span>{cat.name}</span>
                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full font-medium">{cat.productCount}</span>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-muted-foreground hover:text-foreground"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Buscar"
            >
              <AnimatePresence mode="wait">
                {searchOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <motion.span key="s" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Search className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {isAdmin ? (
              <Link href="/admin"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                data-testid="link-admin">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Admin
              </Link>
            ) : (
              <Link href="/admin/login"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-admin-login">
                Admin
              </Link>
            )}

            {/* Cart */}
            <motion.button
              className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              onClick={() => setLocation("/carrito")}
              animate={cartBump ? { scale: [1, 1.28, 0.9, 1.1, 1] } : {}}
              transition={{ duration: 0.4 }}
              data-testid="button-cart"
              aria-label="Carrito"
            >
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full shadow"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menú"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-border bg-background/98 backdrop-blur"
            >
              <form onSubmit={handleSearchSubmit} className="container mx-auto px-4 py-3 flex items-center gap-3">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos, marcas, categorías..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      type="submit"
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Buscar <ArrowRight className="h-3.5 w-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
                <button type="button" onClick={() => setSearchOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden fixed top-16 left-0 right-0 z-40 bg-background border-b border-border shadow-xl overflow-hidden"
          >
            <motion.nav
              variants={mobileNavList}
              initial="hidden"
              animate="show"
              className="container mx-auto px-4 py-4 flex flex-col gap-1"
            >
              <motion.form
                variants={mobileNavItem}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) setLocation(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
                }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted mb-1"
              >
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </motion.form>

              {[
                { href: "/", label: "Inicio" },
                { href: "/productos", label: "Todos los productos" },
              ].map((item) => (
                <motion.div key={item.href} variants={mobileNavItem}>
                  <Link href={item.href} className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-muted transition-colors font-medium">
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {categories?.map((cat) => (
                <motion.div key={cat.id} variants={mobileNavItem}>
                  <Link
                    href={`/productos?category=${cat.slug}`}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm text-muted-foreground"
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{cat.productCount}</span>
                  </Link>
                </motion.div>
              ))}

              <motion.div variants={mobileNavItem} className="h-px bg-border my-2" />

              {[
                { href: "/seguimiento", label: "Rastrear pedido" },
                { href: "/faq", label: "Preguntas frecuentes" },
              ].map((item) => (
                <motion.div key={item.href} variants={mobileNavItem}>
                  <Link href={item.href} className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm text-muted-foreground">
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div variants={mobileNavItem} className="h-px bg-border my-2" />

              <motion.div variants={mobileNavItem}>
                <Link
                  href={isAdmin ? "/admin" : "/admin/login"}
                  className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-muted transition-colors text-sm font-medium text-muted-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {isAdmin ? "Panel de administración" : "Acceso Admin"}
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
